/** @type {import('next').NextConfig} */

// These live here and NOT in netlify.toml. Netlify applies netlify.toml headers
// only to files it serves from its CDN: /track.js got them, every actual page did
// not, because pages come from the Next.js runtime. Verified on live before moving
// them. Next sets them on its own responses, which is every page.
const baseHeaders = [
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Payment is deliberately NOT restricted: Paddle's checkout iframe needs it for
  // Apple Pay and Google Pay, and locking it would break paying customers.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

// Clickjacking cover for the signed-in app only. A shared stats page is public on
// purpose and someone may want to embed it, so /share/* stays frameable.
const frameGuard = [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }]

const nextConfig = {
  async headers() {
    return [
      { source: '/:path*', headers: baseHeaders },
      { source: '/dashboard/:path*', headers: frameGuard },
      { source: '/settings/:path*', headers: frameGuard },
      { source: '/login', headers: frameGuard },
      { source: '/signup', headers: frameGuard },
    ]
  },
}

export default nextConfig
