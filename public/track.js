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

  // Some sites change pages with the hash (#/about) instead of the path. Counting the
  // hash everywhere would turn a plain anchor link (#pricing) into a page of its own and
  // dirty every site's data, so this is opt-in: add data-hash="1" to the script tag.
  const useHash = script.getAttribute('data-hash') === '1';

  let lastPath = null;
  function trackPageview(referrer) {
    const path = window.location.pathname + (useHash ? window.location.hash : '');
    if (path === lastPath) return; // same page again (only ?query, or a #hash we ignore, changed)
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

  // A hash-routed site usually writes location.hash directly, which fires hashchange and
  // no popstate, so that move would be missed. When a back/forward fires both, the second
  // call sees the path the first one already recorded and is dropped.
  if (useHash) {
    window.addEventListener('hashchange', function() { trackPageview(null); });
  }

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
      let lastBeat = 0;
      const beat = function() {
        if (document.visibilityState === 'hidden') return;
        // Switching tabs quickly should not turn into a burst of pings.
        if (Date.now() - lastBeat < 10000) return;
        lastBeat = Date.now();
        fetch(origin + '/api/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ site_id: siteId, visitor_ref: visitorRef }),
          keepalive: true,
        });
      };
      beat();
      // A page opened in a background tab is not being read yet, so the beat above
      // is skipped. Without this the reader stays uncounted for up to a minute after
      // they finally switch to that tab, which is exactly when "reading now" matters.
      const onVisible = function() {
        if (document.visibilityState === 'visible') beat();
      };
      document.addEventListener('visibilitychange', onVisible);
      const timer = setInterval(beat, 60000);
      setTimeout(function() {
        clearInterval(timer);
        // Stop listening as well. Without this, a tab left open all day would keep
        // pinging every time the reader came back to it, which is exactly what this
        // 30-minute cut-off exists to prevent.
        document.removeEventListener('visibilitychange', onVisible);
      }, 30 * 60 * 1000);
    }
  } catch (e) {}
})();