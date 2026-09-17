import Link from 'next/link'
import MarketingHeader from './MarketingHeader'
import Footer from './Footer'
import Icon from './Icon'

// The reference's legalPage() layout from src/pages/content.js. The body copy
// is the app's real policy text, passed in as children.
export default function LegalPage({ title, intro, updated, children }) {
  return (
    <>
      <MarketingHeader />
      <main id="main-content">
        <section className="page-hero page-hero-tight">
          <div className="container narrow">
            <Link className="back-link" href="/"><Icon name="arrow-left" />Back home</Link>
            <span className="eyebrow">Good to know</span>
            <h1 className="section-heading">{title}</h1>
            <p className="section-intro">{intro}</p>
            <p className="legal-updated">Last tended: {updated}</p>
          </div>
        </section>
        <section className="section section-top-tight">
          <div className="container narrow">
            <article className="prose">{children}</article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
