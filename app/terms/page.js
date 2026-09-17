import Link from 'next/link'
import LegalPage from '../_components/LegalPage'
import { CONTACT_EMAIL } from '@/lib/plans'

export const metadata = {
  title: 'Terms of service — Pageviz',
  description: 'Terms of Service for Pageviz.',
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      intro="A friendly agreement about using Pageviz. Be kind, don’t abuse the service, and we’ll take good care of your data."
      updated="August 26, 2026"
    >
      <p>These Terms of Service (&quot;Terms&quot;) govern your access to and use of Pageviz (&quot;Pageviz&quot;, &quot;we&quot;, &quot;us&quot;), a privacy-first website analytics service. By creating an account or using Pageviz, you agree to these Terms. If you don&apos;t agree, please don&apos;t use the service.</p>

      <h2>1. The Service</h2>
      <p>Pageviz lets you add a lightweight tracking script to your website and view visitor analytics — pageviews, referrers, top pages, and device breakdowns — in a dashboard. Pageviz is designed not to use cookies or collect personal identifiers from your site&apos;s visitors; see our <Link href="/privacy">Privacy Policy</Link> for exactly what is and isn&apos;t collected.</p>

      <h2>2. Your Account</h2>
      <p>You need an account to use Pageviz. You&apos;re responsible for keeping your login credentials secure and for all activity that happens under your account. Let us know right away if you suspect unauthorized access.</p>

      <h2>3. Plans, Billing &amp; Payments</h2>
      <p>Pageviz is offered on a Free plan and paid subscription plans (currently Pro and Max), billed monthly. Paid plans renew automatically until cancelled. You can cancel anytime from your account settings; you&apos;ll keep access until the end of the billing period you&apos;ve already paid for.</p>
      <p>Our order process is conducted by our online reseller, Paddle.com. Paddle.com Market Limited is the Merchant of Record for all orders placed through Pageviz and handles payment collection, taxes, invoicing, and order-related customer support, including refunds under our <Link href="/refund">Refund Policy</Link>. Your purchase is also subject to Paddle&apos;s buyer terms, shown at checkout.</p>
      <p>We may change plan pricing or features going forward. If a change affects your existing subscription, we&apos;ll give you reasonable notice before it takes effect.</p>

      <h2>4. Acceptable Use</h2>
      <p>You agree not to use Pageviz to track a website you don&apos;t own or have permission to monitor, to attempt to identify individual visitors from aggregate analytics, to interfere with or reverse-engineer the tracking script or dashboard, or to use the service for any unlawful purpose.</p>

      <h2>5. Your Website Data</h2>
      <p>You own the analytics data generated from your website. We only use it to provide the dashboard to you and to keep the service running — see our <Link href="/privacy">Privacy Policy</Link> for details on storage, retention, and third parties involved.</p>

      <h2>6. Service Availability</h2>
      <p>We work to keep Pageviz reliably available but don&apos;t guarantee uninterrupted, error-free operation. Planned maintenance or unplanned downtime may occur from time to time.</p>

      <h2>7. Intellectual Property</h2>
      <p>The Pageviz name, dashboard, tracking script, and underlying code are owned by us. Nothing in these Terms transfers that ownership to you — you&apos;re simply granted the right to use the service under these Terms.</p>

      <h2>8. Termination</h2>
      <p>You may stop using Pageviz and delete your account at any time. We may suspend or terminate accounts that violate these Terms. If your account is deleted, your website data is removed from our systems within 30 days.</p>

      <h2>9. Disclaimer &amp; Limitation of Liability</h2>
      <p>Pageviz is provided &quot;as is&quot; without warranties of any kind. To the extent permitted by law, our total liability to you for any claim arising from your use of Pageviz is limited to the amount you paid us in the three months before the claim arose.</p>

      <h2>10. Changes to These Terms</h2>
      <p>We may update these Terms occasionally. If we make material changes, we&apos;ll let you know by email or through the dashboard before they take effect.</p>

      <h2>11. Governing Law</h2>
      <p>These Terms are governed by the laws of <strong>India</strong>, without regard to conflict-of-law principles.</p>

      <h2>12. Contact</h2>
      <p>Questions about these Terms? Reach us at <strong>{CONTACT_EMAIL}</strong>.</p>
    </LegalPage>
  )
}
