(function() {
  const script = document.currentScript;
  const siteId = (script.getAttribute('data-site-id') || '').replace(/\s+/g, '');
  if (!siteId) return;

  // Special link se aaye ho to is browser ko exclude kar do
  if (window.location.search.includes('pv_exclude=1')) {
    try { localStorage.setItem('pv_excluded', '1'); } catch (e) {}
  }

  // Agar ye browser exclude hai, to kuch bhi track mat karo
  try {
    if (localStorage.getItem('pv_excluded') === '1') return;
  } catch (e) {}

  const origin = new URL(script.src).origin;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  fetch(origin + '/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      site_id: siteId,
      page_url: window.location.pathname,
      referrer: document.referrer || null,
      device_type: isMobile ? 'Mobile' : 'Desktop',
    }),
    keepalive: true,
  });
})();