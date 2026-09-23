// Rate limit for the public endpoints, in two layers.
//
// Layer 1 is a counter in this server instance's memory: free, instant, and it catches
// the ordinary case where the same caller keeps hitting the same warm instance.
// Netlify runs many instances though, so a flood spread across them slips past it.
//
// Layer 2 is a counter in Postgres that every instance shares. Asking Postgres on every
// pageview would double our database calls for no reason, so it is only asked once a key
// has already been noisy in memory. A normal reader never gets that far and never costs
// a database call. If that shared counter is missing or errors, the answer falls back to
// layer 1: a broken rate limiter must never stop us recording a pageview.

import { createHmac } from 'crypto'
import { createClient } from '@supabase/supabase-js'

const WINDOW_MS = 60_000
const buckets = new Map()

// True once `key` has been seen more than `max` times inside the window.
export function tooMany(key, max, windowMs = WINDOW_MS) {
  const now = Date.now()
  if (buckets.size > 5000) buckets.clear()
  const entry = buckets.get(key)
  if (!entry || now - entry.start > windowMs) {
    buckets.set(key, { start: now, count: 1 })
    return false
  }
  entry.count += 1
  return entry.count > max
}

export function clientIp(request) {
  return (request.headers.get('x-forwarded-for') || '').split(',')[0].trim()
}

// Built on first use, never at import time: a missing env var must not break the build
// or take a route down with it.
let shared
function sharedClient() {
  if (shared !== undefined) return shared
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  shared = url && key ? createClient(url, key) : null
  return shared
}

// Keys are built from the caller's IP, and the homepage promises we never store IP
// addresses. The in-memory counter never leaves this process, but the shared one is a
// database row, so it gets a keyed hash instead of the key itself: the same caller still
// lands on the same row from every instance, and without the server secret nobody --
// including us, reading the table -- can turn it back into an IP. No secret, no shared
// layer: the in-memory answer is used, exactly like any other failure here.
function storedKey(key) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) return null
  return createHmac('sha256', secret).update(key).digest('hex').slice(0, 32)
}

// How much noise on one instance is worth a shared lookup. A reader loading pages by hand
// never reaches this, so they never cost a database call; a script does, immediately.
const sharedGate = (max) => Math.max(3, Math.floor(max / 6))

// Same answer as tooMany, but a key that is already noisy here is also weighed against
// every other instance. Any failure answers "not over the limit" so tracking keeps working.
export async function tooManyShared(key, max, windowMs = WINDOW_MS) {
  if (tooMany(key, max, windowMs)) return true
  const entry = buckets.get(key)
  if (!entry || entry.count < sharedGate(max)) return false
  const client = sharedClient()
  const bucketKey = storedKey(key)
  if (!client || !bucketKey) return false
  try {
    // The first shared call for a window carries everything this instance has already
    // seen, so the shared total stays close to the real one instead of starting at zero.
    const { data, error } = await client.rpc('bump_rate_limit', {
      bucket_key: bucketKey,
      amount: entry.shared ? 1 : entry.count,
      window_seconds: Math.round(windowMs / 1000),
    })
    if (error || typeof data !== 'number') return false
    entry.shared = true
    return data > max
  } catch (err) {
    return false
  }
}
