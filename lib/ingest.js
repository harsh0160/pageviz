// Shared by the public tracking endpoints (/api/track, /api/track-event, /api/heartbeat).
// The tracking script runs on other people's sites, so every reply needs CORS headers.

import { createClient } from '@supabase/supabase-js'
import { tooManyShared, clientIp } from './rate-limit'

// SERVER ONLY. This module is imported by route handlers and nothing else, and the key
// it reads has no NEXT_PUBLIC_ prefix, so Next never puts it in a browser bundle.
// Never import this file from a component.
//
// These three routes used to write with the public anon key, which forced the database
// to keep "anyone may insert" policies on pageviews, events and heartbeats -- and those
// policies let a stranger write rows straight to the table, walking past the bot filter
// and the rate limit that live in these routes. Writing as the service role instead
// means those policies can be dropped and this is the only way in.
//
// Built on first use, never at import time: a missing key must not break the build.
let db
export function ingestDb() {
  if (db !== undefined) return db
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Ingest is not configured: SUPABASE_SERVICE_ROLE_KEY is missing')
    db = null
    return db
  }
  db = createClient(url, key, { auth: { persistSession: false } })
  return db
}

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
export async function shouldIgnore(request, kind, siteId) {
  const userAgent = request.headers.get('user-agent') || ''
  if (BOT_PATTERN.test(userAgent)) return true
  const ip = clientIp(request)
  if (!ip) return false
  return await tooManyShared(`${kind}:${ip}:${siteId}`, MAX_PER_WINDOW)
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
