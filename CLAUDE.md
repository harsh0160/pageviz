# Pageviz — project rules

Privacy-first, cookieless website analytics. Next.js 16 (App Router) +
Supabase + Paddle billing, hosted on Netlify.

## Product rules (never break)

- **Never show a "visitors" or "unique visitors" metric anywhere in the UI
  or copy.** Pageviz does not track individual visitors — only pageviews.
  Use "pageviews" wording throughout (e.g. "Pageviews this week", not
  "Visitors this week"; "No cookies, no visitor IDs", not "no creep").
- **Database plan keys are `free` / `pro` / `business` — never rename
  them.** `business` is *displayed* to users as **"Max"**; the DB/API key
  stays `business` everywhere (`profiles.plan`, the Paddle webhook mapping
  in `lib/paddle-prices.js`, `share-auth` retention logic).
- **Brand name is always "Pageviz"** — only the first letter capitalized.
  Never "PageViz", "pageViz", etc.
- **Never open, read, or modify `.env` or `.env.local`.**

## Git discipline

- Never commit, stage, or push without explicit user approval for that
  specific change. Never open a pull request without being asked.

## Known build quirk

- `npm run build` fails locally at `/api/webhook/paddle` (and any other
  service-role route) with `supabaseKey is required` when
  `SUPABASE_SERVICE_ROLE_KEY` isn't set in the environment — expected on a
  dev machine without the full env file, not a real bug. Verify a build is
  otherwise clean with placeholder values:
  `SUPABASE_SERVICE_ROLE_KEY=x RESEND_API_KEY=x npm run build`. Any *other*
  compile/import/syntax error is real and must be fixed.

## Design system

- Design tokens live in `app/globals.css` (`:root` = light,
  `:root[data-theme='dark']` = dark). Section-specific styles:
  `app/styles/marketing.css`, `app/styles/app.css`. Every page resolves
  color through these CSS custom properties — no hardcoded hex in page or
  component files.
- Fonts: DM Sans (body) + Instrument Serif (display), loaded via
  `next/font/google` in `app/layout.js` as `--font-dm-sans` /
  `--font-instrument-serif`.
- Icons: lucide, vendored (not an npm dependency) in `lib/icons.js`,
  rendered via `app/_components/Icon.js`. To add an icon, add its
  kebab-case name to the generator list described at the top of
  `lib/icons.js` and regenerate (see comment in that file).
- A reference design mockup (Vite + vanilla JS) was used to port the
  current UI. If it's ever re-added locally it must live under
  `/_design-ref/` (already gitignored) and must never be committed.

## Architecture

- `app/_components/workspace/` implements one `WorkspaceContext` interface
  with two providers: `RealWorkspace.js` (signed-in user, live Supabase
  data) and `DemoWorkspace.js` (sample data from `lib/demo-store.js`,
  changes last one visit only). All workspace screens (`DashboardView`,
  `SiteView`, `OverviewView`, `SettingsViews`, `AppShell`, dialogs in
  `dialogs.js`) are shared between `/dashboard/*` (real) and `/demo/*`
  (demo) — never let real and demo data mix.
- `lib/analytics.js` — pure functions for range windows, chart bucketing,
  previous-period comparison, growth %, referrer/device grouping. No
  DOM/network dependency, unit-testable in isolation.
- `lib/workspace-queries.js` — all real Supabase reads for the workspace
  (paged via `fetchAllRows`, 1000-row chunks; no server-side aggregation
  yet — see the TODO comment there about a future Postgres RPC/view).
