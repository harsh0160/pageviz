# Pageviz — guide for AI coding agents (Codex, Claude, others)

Read this whole file before changing anything. `CLAUDE.md` holds the same core rules.
`SESSION_HANDOFF.md` (long history) exists only on the owner's machine — it is gitignored.

## What Pageviz is
Privacy-first, cookieless website analytics. Plans: **Free** (1 site, 10,000 pageviews/month, 7-day history),
**Pro $9/mo** (10 sites, 100,000/month, 1 year, live "reading now", custom events, CSV, password share links),
**Max $22/mo** (30 sites, 500,000/month, history forever, combined multi-site dashboard). Nothing is ever blocked
by the monthly allowance; the dashboard only shows a note from 80%.
Stack: Next.js 16 (App Router, plain JavaScript) + Supabase (Postgres, auth) + Paddle Billing, hosted on Netlify.
Live: **https://getpageviz.com** (primary). `https://pageviz.netlify.app` must keep serving forever (see Domains).

## The owner
Beginner, solo founder in India, little time. Talk in short, simple Hinglish, in business language (what the
customer sees, what it costs), never in code jargon. **Every decision is the owner's**: recommend, then ask.
Never commit, push, or open a PR without the owner's explicit OK for that change. No `Co-Authored-By` lines.

## Rules that must never break
- **Never show a "visitors" / "unique visitors" metric** anywhere. Pageviz counts pageviews only.
- **Plan keys are `free` / `pro` / `business`** in the database, Paddle mapping (`lib/paddle-prices.js`) and code.
  `business` is only *displayed* as "Max". Never rename the key.
- Brand is always **Pageviz** (only the P capitalised).
- **Never open, read, or modify `.env` or `.env.local`.** Never paste or print keys.
- Never claim something works without checking it (live site, build, or a test). Say plainly what was not tested.
- Never copy secrets into the browser bundle: server keys have no `NEXT_PUBLIC_` prefix and are only read in
  route files (`app/api/**`) or server-only libs (`lib/ingest.js`, `lib/paddle-api.js`, `lib/alert.js`).

## Build and check
- `npm run lint`
- `SUPABASE_SERVICE_ROLE_KEY=x RESEND_API_KEY=x npm run build` — the placeholders are needed on a dev machine;
  without them the build fails at service-role routes ("supabaseKey is required"), which is expected. Any other
  error is real.
- Live checks: use a browser User-Agent with curl (the ingest bot filter drops `curl/…`), and open live pages with
  `?pv_exclude=1` first so test visits are not counted.

## Where things are
- Design tokens: `app/globals.css` (`:root` light, `:root[data-theme='dark']` dark); `app/styles/marketing.css`,
  `app/styles/app.css`. No hardcoded colours in components. Fonts: DM Sans + Instrument Serif (`app/layout.js`).
- Icons: vendored lucide in `lib/icons.js` (generated; add names to the generator list, do not hand-edit).
- Workspace: `app/_components/workspace/` — one `WorkspaceContext`, two providers: `RealWorkspace.js` (signed-in,
  Supabase) and `DemoWorkspace.js` (sample data from `lib/demo-store.js`). Screens are shared; never mix real and
  demo data.
- `lib/analytics.js`: pure helpers (ranges, buckets, growth, referrer names). `lib/workspace-queries.js`: all
  workspace reads, incl. `pageviewStats()`.
- Plans and limits: `lib/plans.js` (also `PUBLIC_ORIGIN`, `CONTACT_EMAIL`).

## How the important parts work
- **Tracking script `public/track.js`** (keep it under ~2 KB on the wire; the site promises "about 2 KB"):
  one pageview per page shown; counts single-page-app moves; ignores localhost/127.0.0.1/file:, automated
  browsers, browsers marked with `?pv_exclude=1`, same-site referrers, and prerendered pages until shown.
  Opt-ins: `data-hash="1"` (count `#/route` changes), `data-exclude="/a,/b"` (never count those paths; Pageviz's
  own site uses it for `/dashboard,/settings,/share,/demo`). `pageviz('event')` always exists, even when nothing
  is counted. Live count = heartbeat each minute while visible, max 30 minutes, id kept in memory only.
- **Ingest** `/api/track`, `/api/track-event`, `/api/heartbeat` write with the service-role key (`lib/ingest.js`).
  The public anon key cannot write any table (database policies were removed on purpose). Bot filter + rate limit
  in `lib/ingest.js` / `lib/rate-limit.js` (stored keys are HMACs — **never store an IP**; the site promises it).
- **Stats** come from the Postgres function `pageview_stats` (security invoker, so table policies apply) via
  `pageviewStats()`. It falls back to downloading rows if the function fails; once the owner confirms the
  dashboard works, that fallback can be removed.
- **Downgrade lock**: `sites.within_plan` (kept by database triggers from the owner's plan; newest sites past the
  limit are locked). Locked sites keep counting but their pageviews/events are hidden by policy. Service-role
  routes (`share-auth`, `active-count`) check `within_plan` themselves.
- **Payments (Paddle Billing, merchant of record)**: prices in `lib/paddle-prices.js` (live: Pro $9, Max $22).
  `/api/webhook/paddle` is the **only** place that writes `profiles.plan` (a plan is active only while the
  subscription is `active`/`trialing`; `past_due` → free, the owner's rule). `/api/billing/change-plan` moves a
  subscriber between Pro and Max on the same subscription (prorated; moving down only once the lock exists).
  `/api/billing/portal` opens Paddle's customer portal. `/pricing` sends an already-paying user to billing
  settings instead of a second checkout. `PADDLE_API_KEY` (Netlify, server only) **expires 2026-12-22**.
- **Feedback** (sidebar) emails the owner via Resend (`lib/alert.js`, `emailOwner`), Reply-To = customer.

## Domains
- `getpageviz.com` is primary (HTTPS, `www` redirects to it). `PUBLIC_ORIGIN` defaults to it.
- Netlify does **not** redirect `pageviz.netlify.app`. Keep it that way, or at least never redirect `/api/*` or
  `/track.js` on it: installed snippets and Paddle's webhook use that address, and a redirected POST loses its body.

## Open items (owner decides)
- Owner checks while signed in: open a checkout and close it unpaid, one test feedback, remove a test site,
  look at the dashboard. Paddle must approve `getpageviz.com` as a website before checkout works there.
- Ideas not started: founding lifetime deal ($49 one-time, would need a one-time Paddle price + webhook handling
  of `transaction.completed`), agency pilot offer, UTM/country reports, weekly email digest (needs a sending domain
  in Resend), annual plans.
