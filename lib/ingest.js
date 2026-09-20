// Shared by the public tracking endpoints (/api/track, /api/track-event, /api/heartbeat).
// The tracking script runs on other people's sites, so every reply needs CORS headers.

import { tooMany, clientIp } from './rate-limit'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Crawlers and preview fetchers that run JavaScript are not real readers.
const BOT_PATTERN = /bot|crawl|spider|slurp|headless|lighthouse|python|curl|wget/i

// At most 60 calls a minute per IP per site per endpoint.
const MAX_PER_WINDOW = 60

// True when the call should get a normal-looking reply but store nothing:
// a bot, or an IP over the limit. `kind` keeps each endpoint's counter separate.
export function shouldIgnore(request, kind, siteId) {
  const userAgent = request.headers.get('user-agent') || ''
  const ip = clientIp(request)
  return BOT_PATTERN.test(userAgent) || Boolean(ip && tooMany(`${kind}:${ip}:${siteId}`, MAX_PER_WINDOW))
}

// Every site id is a Postgres uuid. Checking the shape here means junk never
// reaches the database, and a rejected row never comes back as a raw Postgres
// error for a stranger to read.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isSiteId = (value) => typeof value === 'string' && UUID.test(value)

// The tracking script runs on sites we do not control, so a body can be missing,
// truncated or not JSON at all. Callers treat null as "nothing usable was sent".
export async function readJson(request) {
  try {
    return await request.json()
  } catch (err) {
    return null
  }
}

export function preflight() {
  return new Response(null, { headers: corsHeaders })
}
