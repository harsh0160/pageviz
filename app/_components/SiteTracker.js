'use client'

import { usePathname } from 'next/navigation'

// Dogfooding: Pageviz tracks its own marketing site with its own script.
// Only on the public marketing pages, never on the signed-in app itself
// (/dashboard, /settings, /share, /demo) -- otherwise our own testing and
// day-to-day app usage would pollute the real pageview count.
const EXCLUDED_PREFIXES = ['/dashboard', '/settings', '/share', '/demo']

export default function SiteTracker() {
  const pathname = usePathname()
  const siteId = process.env.NEXT_PUBLIC_PAGEVIZ_SITE_ID
  if (!siteId || EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null
  return <script src="/track.js" data-site-id={siteId} async />
}
