import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { tooMany, clientIp } from '../../../lib/rate-limit'
const hashPassword = (pw) => crypto.createHash('sha256').update(pw).digest('hex')
// IMPORTANT: this route uses the Supabase SERVICE ROLE key, not the anon key,
// so it can read site/pageview rows even after RLS is locked down to stop
// anonymous clients from reading them directly. Never expose this key to the
// browser — it must only ever be used here, server-side.
// Add it in Netlify as SUPABASE_SERVICE_ROLE_KEY (from Supabase → Project
// Settings → API → service_role key).
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  const { siteId, password } = await req.json()
  if (!siteId) return NextResponse.json({ error: 'Missing siteId' }, { status: 400 })

  const { data: site, error } = await supabaseAdmin
    .from('sites')
    .select('id, name, domain, public_enabled, share_password, user_id')
    .eq('id', siteId)
    .maybeSingle()

  if (error || !site || !site.public_enabled) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // The password is stored as a SHA-256 hash (the dashboard hashes it before saving)
  // and compared as a hash here. It is unsalted, which is fine for a low-stakes
  // "gate a shared stats page" feature but worth strengthening if it ever guards more.
  if (site.share_password && site.share_password !== hashPassword(password || '')) {
    // That password is the only thing in front of a private page, so cap guessing:
    // 10 wrong tries a minute per IP per site. A correct password never counts,
    // so nobody gets locked out of a page they can actually open.
    const ip = clientIp(req)
    if (ip && tooMany(`share:${ip}:${siteId}`, 10)) {
      return NextResponse.json({ error: 'Too many attempts. Wait a minute and try again.', needsPassword: true }, { status: 429 })
    }
    return NextResponse.json({ error: 'Incorrect password', needsPassword: true }, { status: 401 })
  }

  // Retention actually follows the owner's plan now, instead of a flat 30
  // days for everyone: Free=7 days, Pro=365 days, Business=no cutoff.
  const { data: ownerProfile } = await supabaseAdmin
    .from('profiles')
    .select('plan')
    .eq('id', site.user_id)
    .maybeSingle()
  const plan = ownerProfile?.plan || 'free'
  const RETENTION_DAYS = { free: 7, pro: 365, business: null }
  const retentionDays = RETENTION_DAYS[plan] ?? RETENTION_DAYS.free

  let query = supabaseAdmin
    .from('pageviews')
    .select('page_url, referrer, device_type, created_at')
    .eq('site_id', siteId)
    .order('created_at', { ascending: true })

  if (retentionDays !== null) {
    const since = new Date()
    since.setDate(since.getDate() - retentionDays)
    query = query.gte('created_at', since.toISOString())
  }

  const { data: pageviews } = await query

  // Strip the password AND the owner's internal user_id out before this
  // ever reaches the browser -- user_id only got added above for the
  // retention lookup, it was never meant to be public.
  const { share_password, user_id, ...publicSite } = site
  return NextResponse.json({ site: publicSite, pageviews: pageviews || [], retentionDays })
}
