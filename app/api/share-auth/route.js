import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { tooManyShared, clientIp } from '../../../lib/rate-limit'
const legacyHash = (pw) => crypto.createHash('sha256').update(pw).digest('hex')

// Compare without leaking, through timing, how much of the hash matched.
const sameHash = (a, b) => {
  const left = Buffer.from(String(a), 'utf8')
  const right = Buffer.from(String(b), 'utf8')
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

// Two formats live in the sites table: the current salted PBKDF2 one written by
// hashSharePassword(), and unsalted SHA-256 hex from before that. Both verify here,
// and a correct password against the old format rewrites it to the new one, so the
// weak hashes disappear on their own without anyone setting a password again.
const PBKDF2_ITERATIONS = 100000
const isLegacyFormat = (stored) => !String(stored).startsWith('pbkdf2$')

const passwordMatches = (stored, password) => {
  const supplied = password || ''
  if (isLegacyFormat(stored)) return sameHash(stored, legacyHash(supplied))
  const [, iterations, salt, hash] = String(stored).split('$')
  const rounds = Number(iterations)
  if (!rounds || !salt || !hash) return false
  const derived = crypto.pbkdf2Sync(supplied, Buffer.from(salt, 'hex'), rounds, 32, 'sha256').toString('hex')
  return sameHash(hash, derived)
}

const upgradeLegacyHash = (siteId, password) => {
  const salt = crypto.randomBytes(16)
  const derived = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 32, 'sha256').toString('hex')
  return supabaseAdmin
    .from('sites')
    .update({ share_password: `pbkdf2$${PBKDF2_ITERATIONS}$${salt.toString('hex')}$${derived}` })
    .eq('id', siteId)
}
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

  // '*' rather than a column list, so this keeps working whether or not the downgrade
  // lock's within_plan column exists yet. Only the fields below ever leave this route.
  const { data: row, error } = await supabaseAdmin
    .from('sites')
    .select('*')
    .eq('id', siteId)
    .maybeSingle()

  // A site locked by a downgrade is hidden from its owner, so its public page is too:
  // this key skips the database's lock, so the check has to live here.
  if (error || !row || !row.public_enabled || row.within_plan === false) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const site = { id: row.id, name: row.name, domain: row.domain, public_enabled: row.public_enabled, share_password: row.share_password, user_id: row.user_id }

  if (site.share_password && !passwordMatches(site.share_password, password)) {
    // That password is the only thing in front of a private page, so cap guessing:
    // 10 wrong tries a minute per IP per site. Only a real guess counts -- opening the
    // page sends no password at all, which is the page finding out it is locked, not
    // somebody trying to break in. A correct password never counts either, so nobody
    // is ever locked out of a page they can actually open.
    const ip = clientIp(req)
    if (password && ip && await tooManyShared(`share:${ip}:${siteId}`, 10)) {
      return NextResponse.json({ error: 'Too many attempts. Wait a minute and try again.', needsPassword: true }, { status: 429 })
    }
    return NextResponse.json({ error: 'Incorrect password', needsPassword: true }, { status: 401 })
  }

  // The password was right. If it is still stored the old unsalted way, quietly
  // re-store it salted now -- this is the only moment the plain password is known.
  // Never block the page on it: a failed rewrite just means we try again next time.
  if (site.share_password && isLegacyFormat(site.share_password)) {
    upgradeLegacyHash(siteId, password).then(({ error: rehashError }) => {
      if (rehashError) console.error('share password rehash failed', rehashError.message)
    })
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
  // Business means "no cutoff", which this table spells as null -- and `??` treats null as
  // missing, so `RETENTION_DAYS[plan] ?? RETENTION_DAYS.free` quietly handed Max owners the
  // free plan's 7 days. Ask whether the plan is known instead, so a known plan's value is
  // used exactly as written and only an unrecognised plan falls back.
  const retentionDays = Object.prototype.hasOwnProperty.call(RETENTION_DAYS, plan)
    ? RETENTION_DAYS[plan]
    : RETENTION_DAYS.free

  // Newest-first, then paged. Ordered the other way round, PostgREST's 1,000-row
  // default silently handed back the OLDEST thousand rows, so a busy shared page
  // showed numbers from weeks ago. A plain .limit(50000) does not fix that on its
  // own either: Supabase caps every single response at its project-wide "Max rows"
  // (1,000 by default), so one request could never return more than that however
  // high the limit was set. Page through it the way the dashboard does instead.
  // The rows are flipped back to oldest-first below because the page charts them
  // that way.
  const SHARE_ROW_CAP = 50000
  const PAGE_SIZE = 1000

  // The page shows the last 30 days next to the 30 before them, so nothing older is ever
  // read. Fetching a Max site's whole history here only made the page slow and, past the
  // row cap, cut off data the page actually shows.
  const SHOWN_DAYS = 61 // 60 shown, plus a day of slack for the viewer's time zone
  const since = new Date()
  since.setDate(since.getDate() - (retentionDays === null ? SHOWN_DAYS : Math.min(retentionDays, SHOWN_DAYS)))

  const buildQuery = () => {
    const query = supabaseAdmin
      .from('pageviews')
      .select('page_url, referrer, device_type, created_at')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
    return query.gte('created_at', since.toISOString())
  }

  // Walk by however many rows actually came back, not by how many were asked for.
  // Supabase's "Max rows" setting can be lower than PAGE_SIZE, and a loop that
  // treated a short page as "that was the end" would then quietly stop early --
  // exactly the bug this paging is here to fix. An empty page is the real end.
  const newestFirst = []
  let from = 0
  while (from < SHARE_ROW_CAP) {
    const { data: page, error: pageError } = await buildQuery().range(from, from + PAGE_SIZE - 1)
    // A failed page stops the loop rather than the request: a shared page showing
    // the rows we did get beats showing an error over a partial network blip.
    if (pageError) { console.error('share page read failed', pageError.message); break }
    if (!page || page.length === 0) break
    newestFirst.push(...page)
    from += page.length
  }
  const pageviews = newestFirst.reverse()

  // Strip the password AND the owner's internal user_id out before this
  // ever reaches the browser -- user_id only got added above for the
  // retention lookup, it was never meant to be public.
  const { share_password, user_id, ...publicSite } = site
  return NextResponse.json({ site: publicSite, pageviews, retentionDays })
}
