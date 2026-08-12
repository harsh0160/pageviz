(function() {
  const script = document.currentScript;
  const siteId = (script.getAttribute('data-site-id') || '').replace(/\s+/g, '');
  if (!siteId) return;

  const origin = new URL(script.src).origin;

  fetch(origin + '/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      site_id: siteId,
      page_url: window.location.pathname,
      referrer: document.referrer || null,
    }),
    keepalive: true,
  });
})();