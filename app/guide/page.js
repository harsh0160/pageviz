import Link from 'next/link'
import MarketingHeader from '../_components/MarketingHeader'
import Footer from '../_components/Footer'
import Icon from '../_components/Icon'
import GuideSnippet from './GuideSnippet'

// Ported from the reference build: src/pages/content.js → guidePage().

export const metadata = {
  title: 'Getting started — Pageviz',
  description: 'Add Pageviz to your website in one step: copy one small script, paste it into your pages, and your first pageview shows up in seconds.',
}

const STEPS = [
  ['Create your free account', 'Sign up in about a minute. No credit card, no lengthy questionnaire.', 'user'],
  ['Add your first website', 'Give it a name and its domain. Pageviz makes a cozy little home for its data.', 'globe'],
  ['Plant the snippet', 'Copy one small script tag into your site’s HTML, just before the closing head tag.', 'code-xml'],
  ['Watch it bloom', 'Come back to a calm, readable dashboard. Your first pageview usually shows up within seconds.', 'sprout'],
]

export default function GuidePage() {
  return (
    <>
      <MarketingHeader />
      <main id="main-content">
        <section className="page-hero">
          <div className="container narrow">
            <Link className="back-link" href="/"><Icon name="arrow-left" />Back home</Link>
            <span className="eyebrow">Getting started</span>
            <h1 className="section-heading">From zero to insight<br /><em>in four small steps.</em></h1>
          </div>
        </section>
        <section className="section section-top-tight">
          <div className="container narrow">
            <ol className="guide-steps">
              {STEPS.map(([title, body, symbol], index) => (
                <li key={title} className="guide-step">
                  <span className="guide-step-icon"><Icon name={symbol} /></span>
                  <div>
                    <span className="guide-step-num">Step {index + 1}</span>
                    <h2>{title}</h2>
                    <p>{body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="guide-cta">
              <GuideSnippet />
              <div className="inline-note">
                <Icon name="info" />
                <span>Don&apos;t want your own pageviews counted? Open your site once with <code>?pv_exclude=1</code> at the end of the address, for example <code>yoursite.com/?pv_exclude=1</code>. That browser is ignored from then on.</span>
              </div>
              <div className="inline-note">
                <Icon name="info" />
                <span>Does your site change pages with a <code>#</code> in the address, like <code>yoursite.com/#/about</code>? Add <code>data-hash=&quot;1&quot;</code> to the script tag so those moves are counted too. Leave it off and plain <code>#section</code> links stay part of the page they are on.</span>
              </div>
              <Link className="button button-primary button-large" href="/signup">Start for free <Icon name="arrow-up-right" /></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
