import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { PLAN_TO_PRICE } from '@/lib/paddle-prices'
import { PLAN_ORDER, isPaidPlan } from '@/lib/plans'
import { alertOwner } from '@/lib/alert'
import { paddleApi } from '@/lib/paddle-api'

// Moves an existing subscriber between paid plans (Pro <-> Max) on the SAME Paddle
// subscription. Opening a new checkout instead would start a second subscription,
// and the customer would be billed for both.
//
// POST { plan, preview }
//   preview: true  -> asks Paddle what today's charge (or credit) would be; nothing changes.
//   preview: false -> makes the change, prorated: moving up charges the difference for the
//                     rest of this period straight away (if that payment fails, Paddle
//                     keeps the old plan); moving down leaves the unused part as credit.
// The plan in our database is NOT written here. Paddle sends subscription.updated to
// /api/webhook/paddle, which stays the only place a plan is granted.
//
// Needs PADDLE_API_KEY in Netlify (server only), see lib/paddle-api.js.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  if (!process.env.PADDLE_API_KEY) return NextResponse.json({ error: 'Plan changes are not set up yet.' }, { status: 503 })

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  const target = body?.plan
  const preview = body?.preview !== false
  if (!PLAN_TO_PRICE[target]) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  const token = (req.headers.get('authorization') || '').replace(/^Bearer /, '')
  const { data: auth } = token ? await supabaseAdmin.auth.getUser(token) : { data: null }
  if (!auth?.user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan, paddle_subscription_id')
    .eq('id', auth.user.id)
    .maybeSingle()

  // Only moves between paid plans come through here. Free -> paid is a normal checkout,
  // and paid -> Free is cancelling, on Paddle's own page.
  const current = profile?.plan || 'free'
  if (!isPaidPlan(current) || !profile?.paddle_subscription_id) {
    return NextResponse.json({ error: 'No active subscription to change.' }, { status: 409 })
  }
  if (target === current) return NextResponse.json({ error: 'You are already on that plan.' }, { status: 409 })

  // Moving down is only offered once the database's downgrade lock exists (the
  // sites.within_plan column): without it, the sites past the smaller plan's limit would
  // stay fully visible on the cheaper plan.
  const down = PLAN_ORDER.indexOf(target) < PLAN_ORDER.indexOf(current)
  if (down) {
    const { data: someSite } = await supabaseAdmin.from('sites').select('*').eq('user_id', auth.user.id).limit(1).maybeSingle()
    if (someSite && !Object.prototype.hasOwnProperty.call(someSite, 'within_plan')) {
      return NextResponse.json({ error: 'Moving down a plan is not available yet.' }, { status: 409 })
    }
  }

  const subscriptionId = profile.paddle_subscription_id
  const result = await paddleApi(`/subscriptions/${encodeURIComponent(subscriptionId)}${preview ? '/preview' : ''}`, {
    method: 'PATCH',
    body: {
      items: [{ price_id: PLAN_TO_PRICE[target], quantity: 1 }],
      proration_billing_mode: 'prorated_immediately',
      on_payment_failure: 'prevent_change',
    },
  })

  if (!result.ok) {
    const paddleError = result.error
    console.error('Paddle plan change failed', result.status, paddleError)
    // A plan change a customer asked for did not happen -- the owner should hear about it.
    if (!preview) {
      await alertOwner(down ? 'a plan downgrade did not go through' : 'an upgrade did not go through', {
        user_id: auth.user.id,
        subscription_id: subscriptionId,
        target,
        status: result.status || 'no response',
        paddle_code: paddleError?.code,
        paddle_detail: paddleError?.detail,
      })
    }
    return NextResponse.json({ error: 'Paddle could not change the plan right now.' }, { status: 502 })
  }

  if (!preview) return NextResponse.json({ ok: true })

  // Today's effect: the rest of this period on the new plan against what is left of the
  // old one. Moving up that is a charge (the immediate transaction, tax included); moving
  // down it is a credit (update_summary). Amounts are strings in the smallest unit.
  const totals = result.data?.immediate_transaction?.details?.totals
  const summary = result.data?.update_summary?.result
  const credit = down || summary?.action === 'credit'
  return NextResponse.json({
    action: credit ? 'credit' : 'charge',
    amount: credit ? (summary?.amount ?? null) : (totals?.total ?? summary?.amount ?? null),
    currency: (credit ? summary?.currency_code : totals?.currency_code) || result.data?.currency_code || null,
    nextBilledAt: result.data?.next_billed_at || null,
  })
}
