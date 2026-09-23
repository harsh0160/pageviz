import Link from 'next/link'
import MarketingHeader from './_components/MarketingHeader'
import Footer from './_components/Footer'
import Icon from './_components/Icon'
import SignedInRedirect from './_components/SignedInRedirect'
import { ChartCard } from './_components/ui'
import { HERO_PREVIEW } from '@/lib/demo-store'

// Ported from the reference build: src/pages/marketing.js → homePage().

export const metadata = {
  title: 'Pageviz — Less noise. More insight.',
}

const FEATURES = [
  ['sparkles', 'The gist, at a glance', 'Open your dashboard and see how your site is doing in about three seconds. No setup rabbit holes, no dashboards you need a manual to read.'],
  ['cookie', 'No cookies, nothing stored', 'Pageviz sets no cookies and saves nothing on the device, so there is far less to disclose in a consent banner.'],
  ['leaf', 'A lighter footprint', 'Our script is about 2 KB and our servers run lean. Analytics that measure your growth without weighing down the planet.'],
  ['activity', 'Live, when it matters', 'Watch pageviews arrive in real time during a launch, then let it fade into the background the rest of the week.'],
  ['mouse-pointer-2', 'Events worth counting', 'Track the moments that mean something, like a signup or a contact click, without turning your site into a surveillance machine.'],
  ['link', 'Made to be shared', 'Send a clean, password-protected link to a client or a collaborator. They see the numbers, not your login.'],
]

const STEPS = [
  ['Plant one line', 'Drop a single lightweight script into your site. That is the whole setup. Really.'],
  ['Let it grow', 'Pageviz starts counting visits gently in the background, cookie-free and kind to your visitors.'],
  ['Watch it bloom', 'Come back whenever you like to a calm, readable picture of how your corner of the web is doing.'],
]

function HeroPanel() {
  return (
    <div className="hero-panel">
      <div className="hero-panel-top">
        <div>
          <span className="hero-panel-site"><span className="site-avatar forest avatar-tiny">N</span>studionorth.example</span>
          <span className="live-badge"><span className="live-dot"></span>12 reading right now</span>
        </div>
        <span className="badge badge-green"><Icon name="arrow-up-right" />18.6%</span>
      </div>
      <div className="hero-panel-metric"><span>Pageviews this week</span><strong>18,492</strong></div>
      <div className="hero-panel-chart">
        <ChartCard preview chart={HERO_PREVIEW} label="Sample website pageviews over time" />
      </div>
      <div className="hero-panel-foot"><Icon name="shield-check" /> Counted kindly. No cookies, no visitor IDs.</div>
    </div>
  )
}

export default function Home() {
  return (
    <>
      <SignedInRedirect />
      <MarketingHeader active="product" />
      <main id="main-content">
        <section className="hero">
          <div className="container hero-inner">
            <div className="hero-copy">
              <span className="eyebrow">Simple, privacy-first analytics</span>
              <h1 className="hero-title">Know your <em>corner of the web</em>, without the weeds.</h1>
              <p className="hero-lede">Pageviz is website analytics for people who make things. Get the big picture in a glance, keep your visitors&apos; privacy intact, and leave the sprawling dashboards behind.</p>
              <div className="hero-actions">
                <Link href="/signup" className="button button-primary button-large">Start for free <Icon name="arrow-up-right" /></Link>
                <Link href="/demo" className="button button-secondary button-large"><Icon name="circle-play" />Explore the live demo</Link>
              </div>
              <ul className="hero-points">
                <li><Icon name="check" />Free forever plan</li>
                <li><Icon name="check" />No credit card</li>
                <li><Icon name="check" />Set up in one minute</li>
              </ul>
            </div>
            <div className="hero-visual">
              <HeroPanel />
              <span className="hero-leaf hero-leaf-1"><Icon name="leaf" /></span>
              <span className="hero-leaf hero-leaf-2"><Icon name="sprout" /></span>
            </div>
          </div>
        </section>

        <section className="section" id="product">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">What you get</span>
              <h2 className="section-heading">Everything you need.<br /><em>Nothing you don&apos;t.</em></h2>
              <p className="section-intro">Most analytics tools bury the signal under a hundred settings. Pageviz keeps the essentials close and lets the rest fall away.</p>
            </div>
            <div className="feature-grid">
              {FEATURES.map(([symbol, title, body]) => (
                <article key={title} className="feature-card">
                  <span className="feature-icon"><Icon name={symbol} /></span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-soft" id="how">
          <div className="container">
            <div className="section-head center">
              <span className="eyebrow">How it grows</span>
              <h2 className="section-heading">Three small steps<br /><em>and you&apos;re rooted in.</em></h2>
            </div>
            <div className="steps-grid">
              {STEPS.map(([title, body], index) => (
                <article key={title} className="step-card">
                  <span className="step-number">{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="why-pageviz">
          <div className="container">
            <div className="why-layout">
              <div className="why-copy">
                <span className="eyebrow">Why Pageviz?</span>
                <h2 className="section-heading">Analytics that feel like a <em>deep breath.</em></h2>
                <p className="section-intro">We built Pageviz because we missed knowing how our own little websites were doing without feeling watched, upsold, or overwhelmed. It is calm on purpose.</p>
                <ul className="why-list">
                  <li><Icon name="circle-check" /><div><strong>Privacy is the default, not a setting.</strong>We never store IP addresses and never build profiles of the people reading your site.</div></li>
                  <li><Icon name="circle-check" /><div><strong>Readable by a human being.</strong>Numbers presented like a good story, not a spreadsheet.</div></li>
                  <li><Icon name="circle-check" /><div><strong>Kind to the planet.</strong>A tiny script and lean servers mean a lighter footprint.</div></li>
                </ul>
              </div>
              <div className="why-stats">
                <div className="stat-tile"><strong>~2 KB</strong><span>Script size, so pages stay quick.</span></div>
                <div className="stat-tile"><strong>0</strong><span>Cookies set, banners needed, or dark patterns.</span></div>
                <div className="stat-tile"><strong>1 min</strong><span>To go from sign up to your first pageview.</span></div>
                <div className="stat-tile stat-tile-accent"><strong>100%</strong><span>Yours. Export your data whenever you like.</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="cta-panel">
              <span className="cta-leaf"><Icon name="sprout" /></span>
              <h2>Ready to see your site<br />in a whole new light?</h2>
              <p>Start for free in under a minute. Explore the full demo first if you like &mdash; no account needed.</p>
              <div className="hero-actions">
                <Link href="/signup" className="button button-lime button-large">Plant your first site <Icon name="arrow-up-right" /></Link>
                <Link href="/demo" className="button button-ghost button-large cta-ghost">Wander the demo <Icon name="arrow-right" /></Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
