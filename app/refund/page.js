import Link from 'next/link'

export const metadata = {
  title: 'Refund Policy — PageViz',
  description: 'Refund Policy for PageViz.',
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
          <Link href="/privacy" className="text-[#5C6E65] hover:text-[#13221D] transition-colors">Privacy</Link>
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
      <Link href="/privacy" className="hover:text-[#13221D] transition-colors">Privacy Policy</Link>
    </footer>
  )
}

function H2({ children }) {
  return <h2 className="text-xl font-bold text-[#13221D] mt-10 mb-3" style={displayFont}>{children}</h2>
}
function P({ children }) {
  return <p className="text-[#3E4B45] leading-relaxed mb-4">{children}</p>
}

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7]" style={{ fontFamily: 'var(--font-body)' }}>
      <LegalNav />
      <main className="max-w-3xl mx-auto px-7 pt-16 pb-6">
        <p className="text-xs tracking-wide text-[#5C6E65] mb-3" style={monoFont}>LAST UPDATED: AUGUST 26, 2026</p>
        <h1 className="text-4xl font-bold text-[#13221D] mb-8" style={displayFont}>Refund Policy</h1>

        <P>We want you to feel confident subscribing to PageViz. This policy explains when we&apos;ll issue a refund for a paid plan.</P>

        <H2>1. Who Processes Refunds</H2>
        <P>Our order process is conducted by our online reseller, Paddle.com. Paddle.com Market Limited is the Merchant of Record for all orders placed through PageViz and handles the actual processing of any approved refund back to your original payment method.</P>

        <H2>2. 14-Day Money-Back Guarantee</H2>
        <P>If you&apos;re on your first paid subscription to PageViz and it&apos;s not for you, let us know within 14 days of your initial payment and we&apos;ll issue a full refund — no questions asked.</P>

        <H2>3. Renewal Charges</H2>
        <P>Once your subscription has renewed for a new billing period, that charge is generally non-refundable, since you&apos;ve had continued access to the service. If you meant to cancel before renewal and missed it by a short window, reach out — we review these on a case-by-case basis.</P>

        <H2>4. Exceptions</H2>
        <P>Regardless of the above, we&apos;ll always refund a duplicate or accidental charge, a charge that wasn&apos;t authorized by the account holder, or a payment for a period where a technical fault on our end genuinely prevented you from using the service.</P>

        <H2>5. How to Request a Refund</H2>
        <P>Email us at <strong>[YOUR SUPPORT EMAIL]</strong> with the email address on your account and the reason for your request. You can also raise a request directly from the receipt/invoice email Paddle sends you at checkout.</P>

        <H2>6. Processing Time</H2>
        <P>Once a refund is approved, Paddle typically processes it within a few business days; it may take a little longer to appear on your bank or card statement, depending on your bank.</P>

        <H2>7. Contact</H2>
        <P>Questions about this policy? Reach us at <strong>[YOUR SUPPORT EMAIL]</strong>.</P>
      </main>
      <LegalFooter />
    </div>
  )
}