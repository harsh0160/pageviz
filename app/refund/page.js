import LegalPage from '../_components/LegalPage'
import { CONTACT_EMAIL } from '@/lib/plans'

// Not in the reference build — kept (Paddle requires a refund policy reachable from
// site navigation) and restyled with the reference's legal-page layout and tokens.
// Deliberately states the policy without walking anyone through how to claim one.

export const metadata = {
  title: 'Refund policy — Pageviz',
  description: 'Refund Policy for Pageviz.',
}

export default function RefundPage() {
  return (
    <LegalPage
      title="Refund policy"
      intro="Pageviz subscriptions are non-refundable. You can cancel at any time and keep what you have already paid for. This page explains that, and the narrow cases where a refund still applies."
      updated="September 20, 2026"
    >
      <h2>1. No Refunds, Cancel Anytime</h2>
      <p>We don&apos;t offer refunds for subscription charges. Instead, you can cancel at any time and keep access until the end of the billing period you&apos;ve already paid for — you just won&apos;t be charged again. There is no long contract and no cancellation fee.</p>
      <p>Every plan can be tried before you pay. The free plan runs for as long as you like, and the full dashboard is open in our demo, so you can see exactly what you are buying first.</p>

      <h2>2. Who Processes Payments</h2>
      <p>Our order process is conducted by our online reseller, Paddle.com. Paddle.com Market Limited is the Merchant of Record for all orders placed through Pageviz and handles the processing of any approved refund back to your original payment method.</p>

      <h2>3. Narrow Exceptions</h2>
      <p>We will correct a genuine billing error: a duplicate or accidental charge, a charge that wasn&apos;t authorized by the account holder, or a payment covering a period where a fault on our end genuinely prevented you from using the service.</p>
      <p>Consumers in the EU and UK have a statutory 14-day right to withdraw from a first purchase under local law. That right does not apply once the service has been used, and it does not apply to subsequent renewals of a subscription.</p>

      <h2>4. Contact</h2>
      <p>Questions about this policy? Reach us at <strong>{CONTACT_EMAIL}</strong>.</p>
    </LegalPage>
  )
}
