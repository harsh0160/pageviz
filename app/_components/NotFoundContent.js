import Link from 'next/link'
import Icon from './Icon'

// The reference's notFoundPage() body.
export default function NotFoundContent({ demoHref = '/demo' }) {
  return (
    <section className="page-hero not-found">
      <div className="container narrow">
        <span className="empty-icon"><Icon name="sprout" /></span>
        <h1 className="section-heading">Nothing&apos;s growing here yet.</h1>
        <p className="section-intro center-intro">We couldn&apos;t find the page you were looking for. It may have moved, or perhaps it was never planted.</p>
        <div className="hero-actions center-actions">
          <Link href="/" className="button button-primary button-large">Back home <Icon name="arrow-right" /></Link>
          <Link href={demoHref} className="button button-secondary button-large">Explore the demo</Link>
        </div>
      </div>
    </section>
  )
}
