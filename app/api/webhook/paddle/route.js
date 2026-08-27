import { createHmac, timingSafeEqual } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { PRICE_TO_PLAN } from '@/lib/paddle-prices'

// Service-role client — bypasses Row Level Security. This is intentional:
// Paddle's server has no Supabase login, so the only way it can write a
// user's plan is through a key that skips the "auth.uid() = id" policy.
// NEVER import createClient with this key in a 'use client' file — it must
// only ever run here, server-side.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Paddle's own SDKs default to a 5-second replay-protection window, but that
// assumes near-instant delivery. A cold-started serverless function plus
// normal network delay can already eat a couple of seconds, so 5s risks
// rejecting genuine webhooks. 5 minutes still blocks a meaningfully "replayed"
// old request while giving real-world delivery all the room it needs.
const MAX_SIGNATURE_AGE_SECONDS = 300

const ACTIVE_STATUSES = ['active', 'trialing']

function isValidSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false

  const parts = Object.fromEntries(
    signatureHeader.split(';').map((part) => part.split('='))
  )
  const { ts, h1 } = parts
  if (!ts || !h1) return false

  const age = Math.abs(Date.now() / 1000 - Number(ts))
  if (!Number.isFinite(age) || age > MAX_SIGNATURE_AGE_SECONDS) return false

  const expectedHex = createHmac('sha256', secret)
    .update(`${ts}:${rawBody}`)
    .digest('hex')

  const expected = Buffer.from(expectedHex, 'hex')
  const received = Buffer.from(h1, 'hex')
  if (expected.length !== received.length) return false

  return timingSafeEqual(expected, received)
}

export async function POST(request) {
  try {
    // Must read the body as raw text — Paddle signs the exact bytes it sent,
    // and JSON.parse-then-restringify (or a framework auto-parsing it first)
    // produces different bytes, which silently breaks signature verification.
    const rawBody = await request.text()
    const signature = request.headers.get('paddle-signature')

    if (!isValidSignature(rawBody, signature, process.env.PADDLE_WEBHOOK_SECRET)) {
      console.error('Paddle webhook: signature check failed')
      return Response.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody)

    // We only care about subscription lifecycle events. Acknowledge anything
    // else with 200 so Paddle doesn't keep retrying a delivery we're deliberately ignoring.
    if (!event.event_type?.startsWith('subscription.')) {
      return Response.json({ received: true })
    }

    const data = event.data
    const userId = data.custom_data?.user_id

    if (!userId) {
      console.error('Paddle webhook: missing custom_data.user_id', event.event_id)
      return Response.json({ received: true })
    }

    // Paddle doesn't guarantee webhook delivery order. If an older event
    // arrives after a newer one already updated this profile, skip it.
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('paddle_synced_at')
      .eq('id', userId)
      .maybeSingle()

    if (existing?.paddle_synced_at && event.occurred_at <= existing.paddle_synced_at) {
      return Response.json({ received: true, skipped: 'stale event' })
    }

    let plan = 'free'
    if (ACTIVE_STATUSES.includes(data.status)) {
      const priceId = data.items?.[0]?.price?.id || data.items?.[0]?.price_id
      plan = PRICE_TO_PLAN[priceId] || 'free'
    }

    const { error } = await supabaseAdmin.from('profiles').upsert({
      id: userId,
      plan,
      paddle_customer_id: data.customer_id,
      paddle_subscription_id: data.id,
      paddle_synced_at: event.occurred_at,
    })

    if (error) {
      console.error('Paddle webhook: profile upsert failed', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ received: true, plan })
  } catch (err) {
    console.error('Paddle webhook crashed:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}