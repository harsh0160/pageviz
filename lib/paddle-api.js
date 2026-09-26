// SERVER ONLY. Calls Paddle's API with PADDLE_API_KEY, which lives in Netlify and must
// never reach a browser (no NEXT_PUBLIC_ prefix, and only route files import this).
// A key starting pdl_sdbx_ is a sandbox key, so it talks to Paddle's sandbox.
//
// Returns { ok, status, data, error }. It never throws: a Paddle outage becomes a
// normal failed result the route can explain, not a crash.
export async function paddleApi(path, { method = 'POST', body } = {}) {
  const key = process.env.PADDLE_API_KEY
  if (!key) return { ok: false, status: 503, data: null, error: { code: 'not_configured' } }
  const base = key.startsWith('pdl_sdbx_') ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com'
  try {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    const result = await response.json().catch(() => null)
    return { ok: response.ok, status: response.status, data: result?.data ?? null, error: result?.error ?? null }
  } catch {
    return { ok: false, status: 0, data: null, error: { code: 'no_response' } }
  }
}
