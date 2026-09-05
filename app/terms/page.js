import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — Pageviz',
  description: 'Terms of Service for Pageviz.',
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
          Pageviz
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/privacy" className="text-[#5C6E65] hover:text-[#13221D] transition-colors">Privacy</Link>
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
      <Link href="/privacy" className="hover:text-[#13221D] transition-colors">Privacy Policy</Link>
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

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7]" style={{ fontFamily: 'var(--font-body)' }}>
      <LegalNav />
      <main className="max-w-3xl mx-auto px-7 pt-16 pb-6">
        <p className="text-xs tracking-wide text-[#5C6E65] mb-3" style={monoFont}>LAST UPDATED: AUGUST 26, 2026</p>
        <h1 className="text-4xl font-bold text-[#13221D] mb-8" style={displayFont}>Terms of Service</h1>

        <P>These Terms of Service (&quot;Terms&quot;) govern your access to and use of Pageviz (&quot;Pageviz&quot;, &quot;we&quot;, &quot;us&quot;), a privacy-first website analytics service. By creating an account or using Pageviz, you agree to these Terms. If you don&apos;t agree, please don&apos;t use the service.</P>

        <H2>1. The Service</H2>
        <P>Pageviz lets you add a lightweight tracking script to your website and view visitor analytics — pageviews, referrers, top pages, and device breakdowns — in a dashboard. Pageviz is designed not to use cookies or collect personal identifiers from your site&apos;s visitors; see our <Link href="/privacy" className="text-[#1F4A3D] font-medium underline">Privacy Policy</Link> for exactly what is and isn&apos;t collected.</P>

        <H2>2. Your Account</H2>
        <P>You need an account to use Pageviz. You&apos;re responsible for keeping your login credentials secure and for all activity that happens under your account. Let us know right away if you suspect unauthorized access.</P>

        <H2>3. Plans, Billing &amp; Payments</H2>
        <P>Pageviz is offered on a Free plan and paid subscription plans (currently Pro and Max), billed monthly. Paid plans renew automatically until cancelled. You can cancel anytime from your account settings; you&apos;ll keep access until the end of the billing period you&apos;ve already paid for.</P>
        <P>Our order process is conducted by our online reseller, Paddle.com. Paddle.com Market Limited is the Merchant of Record for all orders placed through Pageviz and handles payment collection, taxes, invoicing, and order-related customer support, including refunds under our <Link href="/refund" className="text-[#1F4A3D] font-medium underline">Refund Policy</Link>. Your purchase is also subject to Paddle&apos;s buyer terms, shown at checkout.</P>
        <P>We may change plan pricing or features going forward. If a change affects your existing subscription, we&apos;ll give you reasonable notice before it takes effect.</P>

        <H2>4. Acceptable Use</H2>
        <P>You agree not to use Pageviz to track a website you don&apos;t own or have permission to monitor, to attempt to identify individual visitors from aggregate analytics, to interfere with or reverse-engineer the tracking script or dashboard, or to use the service for any unlawful purpose.</P>

        <H2>5. Your Website Data</H2>
        <P>You own the analytics data generated from your website. We only use it to provide the dashboard to you and to keep the service running — see our <Link href="/privacy" className="text-[#1F4A3D] font-medium underline">Privacy Policy</Link> for details on storage, retention, and third parties involved.</P>

        <H2>6. Service Availability</H2>
        <P>We work to keep Pageviz reliably available but don&apos;t guarantee uninterrupted, error-free operation. Planned maintenance or unplanned downtime may occur from time to time.</P>

        <H2>7. Intellectual Property</H2>
        <P>The Pageviz name, dashboard, tracking script, and underlying code are owned by us. Nothing in these Terms transfers that ownership to you — you&apos;re simply granted the right to use the service under these Terms.</P>

        <H2>8. Termination</H2>
        <P>You may stop using Pageviz and delete your account at any time. We may suspend or terminate accounts that violate these Terms. If your account is deleted, your website data is removed from our systems within 30 days.</P>

        <H2>9. Disclaimer &amp; Limitation of Liability</H2>
        <P>Pageviz is provided &quot;as is&quot; without warranties of any kind. To the extent permitted by law, our total liability to you for any claim arising from your use of Pageviz is limited to the amount you paid us in the three months before the claim arose.</P>

        <H2>10. Changes to These Terms</H2>
        <P>We may update these Terms occasionally. If we make material changes, we&apos;ll let you know by email or through the dashboard before they take effect.</P>

        <H2>11. Governing Law</H2>
        <P>These Terms are governed by the laws of <strong>India</strong>, without regard to conflict-of-law principles.</P>

        <H2>12. Contact</H2>
        <P>Questions about these Terms? Reach us at <strong>pagevizofficial@gmail.com</strong>.</P>
      </main>
      <LegalFooter />
    </div>
  )
}