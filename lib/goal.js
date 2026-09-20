// Pageviz measuring its own funnel with its own product: which visits turn into
// sign-ups, and which sign-ups open a checkout. track.js already exposes
// window.pageviz() for site owners, but it loads async and only on the marketing
// pages, so a click can easily beat it -- we post the event ourselves instead.
// The pv_excluded opt-out is honoured exactly as the script does it, so our own
// testing never lands in the real numbers.
export function trackGoal(eventName) {
  if (typeof window === 'undefined') return
  const siteId = process.env.NEXT_PUBLIC_PAGEVIZ_SITE_ID
  if (!siteId) return
  try {
    if (localStorage.getItem('pv_excluded') === '1') return
  } catch (e) {}
  try {
    fetch('/api/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_id: siteId, event_name: eventName }),
      keepalive: true,
    }).catch(() => {})
  } catch (e) {}
}
