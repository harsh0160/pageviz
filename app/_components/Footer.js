import Link from 'next/link'
import Brand from './Brand'
import Icon from './Icon'
import { CONTACT_EMAIL } from '@/lib/plans'

export default function Footer() {
  return (
    <footer className="marketing-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Brand />
            <p>A little clarity. A lighter footprint.</p>
          </div>
          <div className="footer-links">
            <div>
              <span className="footer-label">PRODUCT</span>
              <Link href="/#product">Features</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/demo">Live demo</Link>
            </div>
            <div>
              <span className="footer-label">GOOD TO KNOW</span>
              <Link href="/privacy">Privacy policy</Link>
              <Link href="/terms">Terms of service</Link>
              {/* Not in the reference: the app's refund policy has to stay reachable for Paddle. */}
              <Link href="/refund">Refund policy</Link>
              <a href={`mailto:${CONTACT_EMAIL}`}>Get in touch <Icon name="arrow-up-right" /></a>
            </div>
            <div>
              <span className="footer-label">A WORK IN PROGRESS</span>
              <Link href="/roadmap">What’s growing</Link>
              <Link href="/guide">Getting started</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Pageviz. Made for a more thoughtful web.</span>
          <span><Icon name="leaf" /> No cookies. Just the good stuff.</span>
        </div>
      </div>
    </footer>
  )
}
