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

  // Going back or forward can restore a whole page from the browser's own cache
  // without re-running this script, so the view above never fires. The reader did
  // leave and come back, so clear lastPath and count that return as a pageview.
  window.addEventListener('pageshow', function(event) {
    if (!event.persisted) return;
    lastPath = null;
    trackPageview(null);
  });

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

  // Real-time counter: a random ref for this page load, pinged every 60s so the
  // dashboard can count "active in the last 5 minutes." The ref stays in memory --
  // nothing is written to the reader's device -- and the pings stop while the tab is
  // hidden and after 30 minutes, so a tab left open all day stops calling us.
  try {
    if (localStorage.getItem('pv_excluded') !== '1') {
      const visitorRef = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const beat = function() {
        if (document.visibilityState === 'hidden') return;
        fetch(origin + '/api/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ site_id: siteId, visitor_ref: visitorRef }),
          keepalive: true,
        });
      };
      beat();
      const timer = setInterval(beat, 60000);
      setTimeout(function() { clearInterval(timer); }, 30 * 60 * 1000);
    }
  } catch (e) {}
})();