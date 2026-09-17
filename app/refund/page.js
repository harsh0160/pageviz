import LegalPage from '../_components/LegalPage'
import { CONTACT_EMAIL } from '@/lib/plans'

// Not in the reference build — kept (Paddle requires it) and restyled with the
// reference's legal-page layout and tokens.

export const metadata = {
  title: 'Refund policy — Pageviz',
  description: 'Refund Policy for Pageviz.',
}

export default function RefundPage() {
  return (
    <LegalPage
      title="Refund policy"
      intro="We want you to feel free to try Pageviz without worrying about being locked in. This policy explains our refund stance and the exceptions where we (or Paddle) will still refund a charge."
      updated="September 17, 2026"
    >
      <h2>1. Who Processes Refunds</h2>
      <p>Our order process is conducted by our online reseller, Paddle.com. Paddle.com Market Limited is the Merchant of Record for all orders placed through Pageviz and handles the actual processing of any approved refund back to your original payment method.</p>

      <h2>2. No Refunds, Cancel Anytime</h2>
      <p>We don&apos;t offer refunds for subscription charges. Instead, you can cancel anytime and keep access until the end of the billing period you&apos;ve already paid for — you just won&apos;t be charged again. See the exceptions below for cases where a refund still applies.</p>

      <h2>3. Exceptions</h2>
      <p>We&apos;ll always refund a duplicate or accidental charge, a charge that wasn&apos;t authorized by the account holder, or a payment for a period where a technical fault on our end genuinely prevented you from using the service.</p>
      <p>If you&apos;re a consumer in the EU or UK, you may have a statutory 14-day right to cancel and be refunded for a first purchase under local law, unless you asked us to start the service immediately and acknowledged that this waives the right. Separately, Paddle&apos;s own buyer terms let Paddle refund a purchase at its sole discretion within 14 days of payment, regardless of our policy above.</p>

      <h2>4. How to Request a Refund</h2>
      <p>Email us at <strong>{CONTACT_EMAIL}</strong> with the email address on your account and the reason for your request. You can also raise a request directly from the receipt/invoice email Paddle sends you at checkout.</p>

      <h2>5. Processing Time</h2>
      <p>Once a refund is approved, Paddle typically processes it within a few business days; it may take a little longer to appear on your bank or card statement, depending on your bank.</p>

      <h2>6. Contact</h2>
      <p>Questions about this policy? Reach us at <strong>{CONTACT_EMAIL}</strong>.</p>
    </LegalPage>
  )
}
