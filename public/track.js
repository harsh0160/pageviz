(function() {
  // pageviz('event') must always exist, even where nothing is counted (excluded browser,
  // test tool, localhost), or a site's own button calling it would throw.
  window.pageviz = function() {};

  const script = document.currentScript;
  const siteId = (script.getAttribute('data-site-id') || '').replace(/\s+/g, '');
  if (!siteId) return;

  // ?pv_exclude=1 marks this browser (the site owner's) as never counted.
  if (window.location.search.includes('pv_exclude=1')) {
    try { localStorage.setItem('pv_excluded', '1'); } catch (e) {}
  }
  try {
    if (localStorage.getItem('pv_excluded') === '1') return;
  } catch (e) {}

  // Not real readers: automated browsers, a developer's own machine, a file on disk.
  if (navigator.webdriver) return;
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:') return;

  const origin = new URL(script.src).origin;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const send = function(endpoint, body) {
    fetch(origin + '/api/' + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    });
  };

  // Opt-in data-hash="1": #/about style routes count as pages. Off by default, so a
  // plain #section link never becomes a page of its own.
  const useHash = script.getAttribute('data-hash') === '1';

  // Opt-in data-exclude="/dashboard,/admin": those paths and everything under them are
  // never counted, for apps that move from public pages into a private area.
  const excluded = (script.getAttribute('data-exclude') || '').split(',')
    .map(function(prefix) { return prefix.trim().replace(/\/+$/, ''); }).filter(Boolean);
  function isExcluded() {
    const path = window.location.pathname;
    return excluded.some(function(prefix) { return path === prefix || path.indexOf(prefix + '/') === 0; });
  }

  let lastPath = null;
  function trackPageview(referrer) {
    const path = window.location.pathname + (useHash ? window.location.hash : '');
    if (path === lastPath) return; // only ?query or an ignored #hash changed
    lastPath = path;
    if (isExcluded()) return;
    send('track', { site_id: siteId, page_url: path, referrer: referrer, device_type: isMobile ? 'Mobile' : 'Desktop' });
  }

  // Another page of the same site is not a source.
  function outsideReferrer() {
    const ref = document.referrer;
    if (!ref) return null;
    try {
      const host = function(name) { return name.replace(/^www\./, ''); };
      if (host(new URL(ref).hostname) === host(location.hostname)) return null;
    } catch (e) {}
    return ref;
  }

  // A prerendered page is counted only once it is actually shown.
  if (document.prerendering) {
    document.addEventListener('prerenderingchange', function() { trackPageview(outsideReferrer()); }, { once: true });
  } else {
    trackPageview(outsideReferrer());
  }

  // Single-page apps change the URL without a reload; count those moves too.
  ['pushState', 'replaceState'].forEach(function(method) {
    const original = history[method];
    history[method] = function() {
      const result = original.apply(this, arguments);
      trackPageview(null);
      return result;
    };
  });
  window.addEventListener('popstate', function() { trackPageview(null); });
  if (useHash) window.addEventListener('hashchange', function() { trackPageview(null); });

  // Back/forward can restore a page from the browser cache without re-running this
  // script. The reader did come back, so count it.
  window.addEventListener('pageshow', function(event) {
    if (!event.persisted) return;
    lastPath = null;
    trackPageview(null);
  });

  // Custom events: <button onclick="pageviz('signup')">Sign up</button>
  window.pageviz = function(eventName) {
    if (eventName) send('track-event', { site_id: siteId, event_name: String(eventName) });
  };

  // "Reading now": a random id kept in memory only (nothing on the reader's device),
  // pinged each minute while the tab is visible, for at most 30 minutes.
  const visitorRef = Math.random().toString(36).slice(2) + Date.now().toString(36);
  let lastBeat = 0;
  const beat = function() {
    if (document.visibilityState === 'hidden' || isExcluded()) return;
    if (Date.now() - lastBeat < 10000) return; // no burst when flipping tabs
    lastBeat = Date.now();
    send('heartbeat', { site_id: siteId, visitor_ref: visitorRef });
  };
  beat();
  // A background tab beats as soon as it is looked at.
  const onVisible = function() { if (document.visibilityState === 'visible') beat(); };
  document.addEventListener('visibilitychange', onVisible);
  const timer = setInterval(beat, 60000);
  setTimeout(function() {
    clearInterval(timer);
    document.removeEventListener('visibilitychange', onVisible);
  }, 30 * 60 * 1000);
})();
