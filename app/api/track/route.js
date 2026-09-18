import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Crawlers and preview fetchers that run JavaScript are not real readers.
const BOT_PATTERN = /bot|crawl|spider|slurp|headless|lighthouse|python|curl|wget/i

// Best-effort rate limit: at most 60 pageviews a minute per IP per site. It lives in
// this server instance's memory, so it slows down abuse but is not a hard guarantee.
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 60
const hits = new Map()

function tooMany(key) {
  const now = Date.now()
  if (hits.size > 5000) hits.clear()
  const entry = hits.get(key)
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(key, { start: now, count: 1 })
    return false
  }
  entry.count += 1
  return entry.count > MAX_PER_WINDOW
}

export async function POST(request) {
  try {
    const { site_id, page_url, referrer, device_type } = await request.json()
    if (!site_id || !page_url) {
      return Response.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders })
    }
    // Bots and over-limit callers get a normal-looking reply but nothing is stored.
    const userAgent = request.headers.get('user-agent') || ''
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim()
    if (BOT_PATTERN.test(userAgent) || (ip && tooMany(`${ip}:${site_id}`))) {
      return Response.json({ success: true }, { headers: corsHeaders })
    }
    const { error } = await supabase.from('pageviews').insert({ site_id, page_url, referrer, device_type })
    if (error) {
      console.error('Insert failed:', error)
      return Response.json({ error: error.message }, { status: 500, headers: corsHeaders })
    }
    return Response.json({ success: true }, { headers: corsHeaders })
  } catch (err) {
    console.error('Route crashed:', err)
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders })
  }
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders })
}