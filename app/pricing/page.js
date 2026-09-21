import Link from 'next/link'
import CheckoutButton from './CheckoutButton'
import MarketingHeader from '../_components/MarketingHeader'
import Footer from '../_components/Footer'
import Icon from '../_components/Icon'
import { PLANS, PLAN_ORDER, CONTACT_EMAIL } from '@/lib/plans'

// Ported from the reference build: src/pages/marketing.js → pricingPage().
// Paid CTAs are the app's existing Paddle CheckoutButton (the reference only links to its demo).

export const metadata = {
  title: 'Pricing — Pageviz',
  description: 'Simple, honest pricing for Pageviz — privacy-first website analytics.',
}

// Founding-member offer: edit or remove FOUNDING_OFFER_END to end it.
// You still need to create this exact discount code in the LIVE Paddle
// dashboard yourself: Catalog -> Discounts -> New discount -> code "FOUNDER20"
// -> percentage off, set your %, set an expiry there too if you want a hard
// stop even if someone has this page cached.
const FOUNDING_OFFER_END = '2025-01-01'
const FOUNDING_OFFER_CODE = 'FOUNDER20'
const foundingOfferActive = new Date() < new Date(FOUNDING_OFFER_END)

const FAQS = [
  ['Is the free plan really free?', 'Yes, genuinely. One website, seven days of history, and all the essentials, at no cost and with no card required.'],
  ['What counts as a website?', 'Any single domain you add to your workspace. The Pro plan holds up to ten, and Max stretches to thirty.'],
  ['Do you use cookies?', 'Never. Pageviz is cookieless and saves nothing on the device, so there is far less to disclose — though your own legal requirements still apply.'],
  ['Can I export my data?', 'On Pro and Max you can export clean CSV files whenever you like. Your data always belongs to you.'],
]

export default async function PricingPage({ searchParams }) {
  const { from } = await searchParams
  const back = from === 'demo' ? ['/demo', 'Back to the demo'] : from === 'workspace' ? ['/dashboard', 'Back to your sites'] : null

  return (
    <>
      <MarketingHeader active="pricing" />
      <main id="main-content">
        <section className="page-hero">
          <div className="container">
            {back && <Link className="back-link" href={back[0]}><Icon name="arrow-left" />{back[1]}</Link>}
            <span className="eyebrow">Simple pricing</span>
            <h1 className="section-heading">Pick a plot that<br /><em>fits what you&apos;re growing.</em></h1>
            <p className="section-intro center-intro">Start free and stay free for as long as you like. Move up whenever your garden needs a little more room. Cancel any time.</p>
          </div>
        </section>

        <section className="section section-top-tight">
          <div className="container">
            {foundingOfferActive && (
              <p className="price-offer"><Icon name="sparkles" />Founding member offer — use code <code>{FOUNDING_OFFER_CODE}</code> at checkout for early-adopter pricing.</p>
            )}
            <div className="price-grid">
              {PLAN_ORDER.map((key) => {
                const plan = PLANS[key]
                const featured = key === 'pro'
                const buttonClass = `button ${featured ? 'button-primary' : 'button-secondary'} full-width`
                return (
                  <article key={key} className={`price-card ${featured ? 'price-card-featured' : ''}`}>
                    {featured && <span className="price-flag">Most planted</span>}
                    <div className="price-head"><h2>{plan.name}</h2><p>{plan.description}</p></div>
                    <div className="price-amount"><strong>${plan.price}</strong><span>/ month</span></div>
                    {key === 'free' ? (
                      <Link href="/signup" className={buttonClass}>Start for free<Icon name="arrow-right" /></Link>
                    ) : (
                      <CheckoutButton plan={key} discountCode={foundingOfferActive ? FOUNDING_OFFER_CODE : undefined} className={buttonClass}>
                        Upgrade to {plan.name}<Icon name={featured ? 'arrow-up-right' : 'arrow-right'} />
                      </CheckoutButton>
                    )}
                    <ul className="price-features">
                      {plan.features.map((feature) => <li key={feature}><Icon name="check" />{feature}</li>)}
                    </ul>
                  </article>
                )
              })}
            </div>
            <div className="price-custom">
              <div>
                <h2>Need something custom for your team?</h2>
                <p>More than 30 sites, custom retention, or a company-wide plan — let&apos;s talk.</p>
              </div>
              <a href={`mailto:${CONTACT_EMAIL}?subject=Custom%20team%20plan`} className="button button-secondary">Contact us <Icon name="arrow-up-right" /></a>
            </div>
            <p className="price-note"><Icon name="shield-check" /> Every plan is cookie-free and privacy-first. Payments are handled by Paddle.</p>
            <p className="price-note">Questions about billing? <Link className="text-link" href="/refund">Refund policy</Link><Link className="text-link" href="/terms">Terms of service</Link></p>
          </div>
        </section>

        <section className="section section-soft">
          <div className="container">
            <div className="section-head center">
              <span className="eyebrow">Good to know</span>
              <h2 className="section-heading">A few honest answers.</h2>
            </div>
            <div className="faq-grid">
              {FAQS.map(([question, answer]) => (
                <div key={question} className="faq-item"><h3>{question}</h3><p>{answer}</p></div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
