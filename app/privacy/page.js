import LegalPage from '../_components/LegalPage'
import { CONTACT_EMAIL } from '@/lib/plans'

export const metadata = {
  title: 'Privacy policy — Pageviz',
  description: 'Privacy Policy for Pageviz.',
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro="The short version: we don’t track your visitors as people, we don’t use cookies, and we never sell data. Here is the longer version, in plain language."
      updated="August 26, 2026"
    >
      <p>Pageviz was built to be a privacy-first alternative to invasive analytics tools. This policy explains exactly what we collect, from whom, and why — for both people who sign up for a Pageviz account, and visitors to websites that use Pageviz.</p>

      <h2>1. Information From Site Owners (You)</h2>
      <p>When you create a Pageviz account, we collect your email address and an authentication credential (handled securely through our authentication provider). If you subscribe to a paid plan, billing is handled entirely by Paddle, our payment processor — Pageviz never sees or stores your card details.</p>

      <h2>2. Information From Your Website&apos;s Visitors</h2>
      <p>The Pageviz tracking script does <strong>not</strong> use cookies, does not assign persistent identifiers, and does not build cross-site visitor profiles. For each page view, it sends us only:</p>
      <ul>
        <li>The page URL visited</li>
        <li>The referring URL, if any</li>
        <li>Device and browser type (e.g. &quot;mobile / Safari&quot;)</li>
        <li>Timestamp of the visit</li>
      </ul>
      <p>We do not collect names, email addresses, exact locations, or any other information that identifies an individual visitor.</p>

      <h2>3. Cookies</h2>
      <p>The tracking script placed on your website sets no cookies. Separately, if you (the site owner) log in to your own Pageviz dashboard, our authentication system may use a minimal session cookie or token to keep you signed in — this only applies to your own account login, never to your website&apos;s visitors.</p>

      <h2>4. How We Use This Information</h2>
      <p>We use the data above to generate your analytics dashboard, to operate and secure the service, to process billing, and to communicate important account or service updates to you. We do not sell data to advertisers or third parties.</p>

      <h2>5. Data Retention</h2>
      <p>Pageview data is kept for as long as your plan shows it: the Free plan shows the last 7 days, Pro the last year, and Max keeps the full history of a site. Removing a site deletes its pageview data with it. Account information is kept until you delete your account, after which associated data is removed within 30 days.</p>

      <h2>6. Who We Share Data With</h2>
      <p>We use a small number of trusted service providers to run Pageviz:</p>
      <ul>
        <li><strong>Supabase</strong> — hosts our database and handles account authentication</li>
        <li><strong>Netlify</strong> — hosts the Pageviz application</li>
        <li><strong>Paddle</strong> — processes payments and acts as Merchant of Record for subscriptions</li>
        <li><strong>UptimeRobot</strong> — periodically pings our service to monitor uptime; it does not receive visitor analytics data</li>
      </ul>
      <p>None of these providers are permitted to use your data for their own purposes.</p>

      <h2>7. Your Rights</h2>
      <p>Depending on where you&apos;re located (including under GDPR in the EU/UK, or CCPA in California), you may have the right to access, correct, export, or delete your personal information. To make a request, contact us at <strong>{CONTACT_EMAIL}</strong>.</p>

      <h2>8. Data Security</h2>
      <p>Data is encrypted in transit (HTTPS) and stored with our infrastructure providers, who maintain their own industry-standard security certifications. No method of transmission or storage is 100% secure, but we work to protect your information appropriately.</p>

      <h2>9. Children&apos;s Privacy</h2>
      <p>Pageviz is not directed at children, and we do not knowingly collect personal information from children under 13 (or the relevant age of digital consent in your region).</p>

      <h2>10. Changes to This Policy</h2>
      <p>If we make material changes to this policy, we&apos;ll notify you by email or through the dashboard before they take effect.</p>

      <h2>11. Contact</h2>
      <p>Pageviz is an independent service operated from India. It decides how the data described here is handled, and is the right place to send any request about it.</p>
      <p>Questions about this policy or your data? Reach us at <strong>{CONTACT_EMAIL}</strong>.</p>
    </LegalPage>
  )
}
