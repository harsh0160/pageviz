import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — PageViz',
  description: 'Privacy Policy for PageViz.',
}

const displayFont = { fontFamily: 'var(--font-display)' }
const monoFont = { fontFamily: 'var(--font-mono-data)' }

function LegalNav() {
  return (
    <nav className="border-b border-[#E4E7E1] sticky top-0 z-20 bg-[#FAFAF7]/95 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto px-7 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-[#13221D]" style={displayFont}>
          <svg width="26" height="18" viewBox="0 0 26 18" fill="none">
            <polyline points="1,13 7,13 9,4 12,15 14,9 16,9 18,3 20,13 25,13" stroke="#1F4A3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          PageViz
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/terms" className="text-[#5C6E65] hover:text-[#13221D] transition-colors">Terms</Link>
          <Link href="/refund" className="text-[#5C6E65] hover:text-[#13221D] transition-colors">Refunds</Link>
        </div>
      </div>
    </nav>
  )
}

function LegalFooter() {
  return (
    <footer className="max-w-3xl mx-auto px-7 py-14 border-t border-[#E4E7E1] mt-16 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#5C6E65]">
      <Link href="/" className="hover:text-[#13221D] transition-colors">Home</Link>
      <Link href="/terms" className="hover:text-[#13221D] transition-colors">Terms of Service</Link>
      <Link href="/refund" className="hover:text-[#13221D] transition-colors">Refund Policy</Link>
    </footer>
  )
}

function H2({ children }) {
  return <h2 className="text-xl font-bold text-[#13221D] mt-10 mb-3" style={displayFont}>{children}</h2>
}
function P({ children }) {
  return <p className="text-[#3E4B45] leading-relaxed mb-4">{children}</p>
}
function Li({ children }) {
  return <li className="text-[#3E4B45] leading-relaxed mb-2">{children}</li>
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7]" style={{ fontFamily: 'var(--font-body)' }}>
      <LegalNav />
      <main className="max-w-3xl mx-auto px-7 pt-16 pb-6">
        <p className="text-xs tracking-wide text-[#5C6E65] mb-3" style={monoFont}>LAST UPDATED: AUGUST 26, 2026</p>
        <h1 className="text-4xl font-bold text-[#13221D] mb-8" style={displayFont}>Privacy Policy</h1>

        <P>PageViz was built to be a privacy-first alternative to invasive analytics tools. This policy explains exactly what we collect, from whom, and why — for both people who sign up for a PageViz account, and visitors to websites that use PageViz.</P>

        <H2>1. Information From Site Owners (You)</H2>
        <P>When you create a PageViz account, we collect your email address and an authentication credential (handled securely through our authentication provider). If you subscribe to a paid plan, billing is handled entirely by Paddle, our payment processor — PageViz never sees or stores your card details.</P>

        <H2>2. Information From Your Website&apos;s Visitors</H2>
        <P>The PageViz tracking script does <strong>not</strong> use cookies, does not assign persistent identifiers, and does not build cross-site visitor profiles. For each page view, it sends us only:</P>
        <ul className="list-disc pl-6 mb-4">
          <Li>The page URL visited</Li>
          <Li>The referring URL, if any</Li>
          <Li>Device and browser type (e.g. &quot;mobile / Safari&quot;)</Li>
          <Li>An approximate country, derived from IP address at the time of the request — the IP address itself is not stored</Li>
          <Li>Timestamp of the visit</Li>
        </ul>
        <P>We do not collect names, email addresses, exact locations, or any other information that identifies an individual visitor.</P>

        <H2>3. Cookies</H2>
        <P>The tracking script placed on your website sets no cookies. Separately, if you (the site owner) log in to your own PageViz dashboard, our authentication system may use a minimal session cookie or token to keep you signed in — this only applies to your own account login, never to your website&apos;s visitors.</P>

        <H2>4. How We Use This Information</H2>
        <P>We use the data above to generate your analytics dashboard, to operate and secure the service, to process billing, and to communicate important account or service updates to you. We do not sell data to advertisers or third parties.</P>

        <H2>5. Data Retention</H2>
        <P>On the Free plan, pageview data is retained for 7 days. On paid plans, it&apos;s retained for up to 1 year. Account information is kept until you delete your account, after which associated data is removed within 30 days.</P>

        <H2>6. Who We Share Data With</H2>
        <P>We use a small number of trusted service providers to run PageViz:</P>
        <ul className="list-disc pl-6 mb-4">
          <Li><strong>Supabase</strong> — hosts our database and handles account authentication</Li>
          <Li><strong>Netlify</strong> — hosts the PageViz application</Li>
          <Li><strong>Paddle</strong> — processes payments and acts as Merchant of Record for subscriptions</Li>
          <Li><strong>UptimeRobot</strong> — periodically pings our service to monitor uptime; it does not receive visitor analytics data</Li>
        </ul>
        <P>None of these providers are permitted to use your data for their own purposes.</P>

        <H2>7. Your Rights</H2>
        <P>Depending on where you&apos;re located (including under GDPR in the EU/UK, or CCPA in California), you may have the right to access, correct, export, or delete your personal information. To make a request, contact us at <strong>pagevizofficial@gmail.com</strong>.</P>

        <H2>8. Data Security</H2>
        <P>Data is encrypted in transit (HTTPS) and stored with our infrastructure providers, who maintain their own industry-standard security certifications. No method of transmission or storage is 100% secure, but we work to protect your information appropriately.</P>

        <H2>9. Children&apos;s Privacy</H2>
        <P>PageViz is not directed at children, and we do not knowingly collect personal information from children under 13 (or the relevant age of digital consent in your region).</P>

        <H2>10. Changes to This Policy</H2>
        <P>If we make material changes to this policy, we&apos;ll notify you by email or through the dashboard before they take effect.</P>

        <H2>11. Contact</H2>
        <P>Questions about this policy or your data? Reach us at <strong>pagevizofficial@gmail.com</strong>.</P>
      </main>
      <LegalFooter />
    </div>
  )
}