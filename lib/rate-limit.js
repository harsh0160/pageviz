// Best-effort rate limit for the public endpoints. The counters live in this server
// instance's memory, so they slow abuse down but are not a hard guarantee: Netlify
// runs many instances. A real limit belongs in Postgres or at the edge later.

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
