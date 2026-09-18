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

  // Automated browsers (headless Chrome, test tools) are not real readers
  if (navigator.webdriver) return;

  const origin = new URL(script.src).origin;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  let lastPath = null;
  function trackPageview(referrer) {
    const path = window.location.pathname;
    if (path === lastPath) return; // same page again (only #hash or ?query changed)
    lastPath = path;
    fetch(origin + '/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site_id: siteId,
        page_url: path,
        referrer: referrer,
        device_type: isMobile ? 'Mobile' : 'Desktop',
      }),
      keepalive: true,
    });
  }
  trackPageview(document.referrer || null);

  // Single-page apps (React, Vue, Next.js...) change the URL without reloading the
  // page, so also count those moves. In-app moves have no outside referrer.
  ['pushState', 'replaceState'].forEach(function(method) {
    const original = history[method];
    history[method] = function() {
      const result = original.apply(this, arguments);
      trackPageview(null);
      return result;
    };
  });
  window.addEventListener('popstate', function() { trackPageview(null); });

  // Custom events: site owners call window.pageviz('signup') from their own
  // buttons/forms to track a named goal, e.g.:
  //   <button onclick="pageviz('signup')">Sign up</button>
  window.pageviz = function(eventName) {
    try {
      if (localStorage.getItem('pv_excluded') === '1') return;
    } catch (e) {}
    if (!eventName) return;
    fetch(origin + '/api/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_id: siteId, event_name: String(eventName) }),
      keepalive: true,
    });
  };

  // Real-time visitor counter: a stable-per-tab ref, pinged every 60s so the
  // dashboard can count "active in the last 5 minutes." Not a persistent
  // cross-visit identifier -- sessionStorage clears when the tab closes.
  try {
    if (localStorage.getItem('pv_excluded') !== '1') {
      let visitorRef = sessionStorage.getItem('pv_ref');
      if (!visitorRef) {
        visitorRef = Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem('pv_ref', visitorRef);
      }
      const beat = function() {
        fetch(origin + '/api/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ site_id: siteId, visitor_ref: visitorRef }),
          keepalive: true,
        });
      };
      beat();
      setInterval(beat, 60000);
    }
  } catch (e) {}
})();