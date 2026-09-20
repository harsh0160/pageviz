import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Uses the SERVICE ROLE key (like share-auth) so it can read heartbeats
// even with RLS locked down — no anon SELECT policy needed on this table.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req) {
  const siteId = new URL(req.url).searchParams.get('site_id')
  if (!siteId) return NextResponse.json({ error: 'Missing site_id' }, { status: 400 })

  // How many people are reading a site right now is that owner's business. The site id
  // is not a secret -- it sits in the tracking snippet on every page -- so it cannot be
  // the thing that grants access. Either the owner deliberately shared the site, or the
  // caller has to prove they are the owner. Both misses answer 404 rather than 403, so
  // this cannot be used to find out which site ids exist.
  const { data: site } = await supabaseAdmin
    .from('sites')
    .select('user_id, public_enabled')
    .eq('id', siteId)
    .maybeSingle()

  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!site.public_enabled) {
    const token = (req.headers.get('authorization') || '').replace(/^Bearer /, '')
    const { data: auth } = token ? await supabaseAdmin.auth.getUser(token) : { data: null }
    if (!auth?.user || auth.user.id !== site.user_id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const { count, error } = await supabaseAdmin
    .from('heartbeats')
    .select('visitor_ref', { count: 'exact', head: true })
    .eq('site_id', siteId)
    .gte('last_seen_at', fiveMinAgo)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Every page load invents a fresh visitor_ref, so the heartbeats table grows as
  // fast as pageviews do while only the last five minutes are ever read -- on a free
  // Supabase project that dead weight eventually fills the database. Sweep it here,
  // where the service-role key already is, on roughly one call in fifty: often enough
  // to keep the table small, rare enough to cost nothing, and no extra cron to forget.
  if (Math.random() < 0.02) {
    const anHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { error: sweepError } = await supabaseAdmin.from('heartbeats').delete().lt('last_seen_at', anHourAgo)
    if (sweepError) console.error('Heartbeat sweep failed:', sweepError.message)
  }

  return NextResponse.json({ active: count || 0 })
}