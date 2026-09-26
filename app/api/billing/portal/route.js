import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { paddleApi } from '@/lib/paddle-api'

// "Invoices & billing" in Settings > Plan & billing. Opens Paddle's customer portal for
// the signed-in customer: every invoice and receipt, the card on file, and cancelling.
// Paddle's links carry a short-lived token, so a fresh one is made on every click and
// nothing is stored.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer /, '')
  const { data: auth } = token ? await supabaseAdmin.auth.getUser(token) : { data: null }
  if (!auth?.user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('paddle_customer_id, paddle_subscription_id')
    .eq('id', auth.user.id)
    .maybeSingle()
  if (!profile?.paddle_customer_id) {
    return NextResponse.json({ error: 'There is no billing account yet. It appears after your first payment.' }, { status: 409 })
  }

  const result = await paddleApi(`/customers/${encodeURIComponent(profile.paddle_customer_id)}/portal-sessions`, {
    body: profile.paddle_subscription_id ? { subscription_ids: [profile.paddle_subscription_id] } : {},
  })
  const url = result.data?.urls?.general?.overview
  if (!result.ok || !url) {
    console.error('Paddle portal session failed', result.status, result.error)
    return NextResponse.json({ error: 'Paddle could not open your billing page right now.' }, { status: 502 })
  }
  return NextResponse.json({ url })
}
