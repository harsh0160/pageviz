import { PUBLIC_ORIGIN } from '@/lib/plans'

// Only the public marketing pages. Sign-up and log-in are listed because people
// do search for them by name; the workspace and share pages are not.
const PAGES = ['', '/pricing', '/guide', '/demo', '/roadmap', '/privacy', '/terms', '/refund', '/login', '/signup']

export default function sitemap() {
  const lastModified = new Date()
  return PAGES.map((path) => ({
    url: `${PUBLIC_ORIGIN}${path}`,
    lastModified,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }))
}
