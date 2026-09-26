'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Brand from './Brand'
import Icon from './Icon'
import ThemeButton from './ThemeButton'
import { supabase } from '@/lib/supabase'

export default function MarketingHeader({ active = '' }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close the mobile menu on navigation, and lock body scroll while it is open (body.nav-open).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false)
  }, [pathname])
  useEffect(() => {
    document.body.classList.toggle('nav-open', open)
    return () => document.body.classList.remove('nav-open')
  }, [open])

  // Someone already signed in gets "Dashboard" instead of Log in / Sign up. The session is
  // read from this browser's storage, so it costs no request.
  const [signedIn, setSignedIn] = useState(false)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session))
  }, [])

  const close = () => setOpen(false)

  return (
    <header className="marketing-header">
      <div className="container header-inner">
        <Brand />
        <nav className="marketing-nav" aria-label="Main navigation">
          <Link href="/#product" className={active === 'product' ? 'active' : ''}>The product</Link>
          <Link href="/pricing" className={active === 'pricing' ? 'active' : ''}>Pricing</Link>
          <Link href="/#why-pageviz">Why Pageviz?</Link>
        </nav>
        <div className="header-actions">
          <ThemeButton />
          {signedIn
            ? <Link href="/dashboard" className="button button-primary button-small">Dashboard<Icon name="arrow-up-right" /></Link>
            : <>
              <Link href="/login" className="login-link">Log in</Link>
              <Link href="/signup" className="button button-primary button-small"><span className="signup-long">Sign up free</span><span className="signup-short">Sign up</span><Icon name="arrow-up-right" /></Link>
            </>}
          <button type="button" className="icon-button mobile-menu-button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open}>
            <Icon name={open ? 'x' : 'menu'} />
          </button>
        </div>
      </div>
      {/* Next port: .container lines the links up with the logo; the reference's nav ran edge to edge. */}
      <nav className="marketing-mobile-nav container" aria-label="Mobile navigation" hidden={!open}>
        <Link href="/#product" onClick={close}>The product</Link>
        <Link href="/pricing" onClick={close}>Pricing</Link>
        <Link href="/#why-pageviz" onClick={close}>Why Pageviz?</Link>
        {signedIn ? <Link href="/dashboard" onClick={close}>Dashboard</Link> : <Link href="/login" onClick={close}>Log in</Link>}
        <Link href="/demo" onClick={close}>Explore the demo</Link>
        {/* Next port: on phones the theme toggle moves from the header into this menu, making room for Log in and Sign up. */}
        <div className="mobile-nav-theme"><span>Color theme</span><ThemeButton /></div>
      </nav>
    </header>
  )
}
