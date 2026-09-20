import { PUBLIC_ORIGIN } from '@/lib/plans'

// Crawlers get the marketing pages and nothing else. The workspace and the API
// are behind a login anyway, and a shared stats page belongs to whoever the owner
// sent the link to -- it should not turn up in a search result by accident.
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard', '/settings', '/share/'],
    },
    sitemap: `${PUBLIC_ORIGIN}/sitemap.xml`,
  }
}
