import Link from 'next/link'
import MarketingHeader from '../_components/MarketingHeader'
import Footer from '../_components/Footer'
import Icon from '../_components/Icon'
import RoadmapGrid from './RoadmapGrid'
import { CONTACT_EMAIL } from '@/lib/plans'

// Ported from the reference build: src/pages/content.js → roadmapPage().

export const metadata = {
  title: 'What’s growing — Pageviz',
  description: 'What is new in Pageviz and what is being built next.',
}

export default function RoadmapPage() {
  return (
    <>
      <MarketingHeader />
      <main id="main-content">
        <section className="page-hero">
          <div className="container">
            <Link className="back-link" href="/"><Icon name="arrow-left" />Back home</Link>
            <span className="eyebrow">A work in progress</span>
            <h1 className="section-heading">What&apos;s growing<br /><em>in the Pageviz garden.</em></h1>
            <p className="section-intro center-intro">We build slowly and thoughtfully. Here is what we are tending to now, and what we hope to plant next.</p>
          </div>
        </section>
        <section className="section section-top-tight">
          <div className="container">
            <RoadmapGrid />
            <p className="price-note"><Icon name="mail" /> Have something you&apos;d love to see grow? <a className="text-link" href={`mailto:${CONTACT_EMAIL}`}>Tell us about it <Icon name="arrow-right" /></a></p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
