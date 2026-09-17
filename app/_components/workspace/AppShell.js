'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Brand from '../Brand'
import Icon from '../Icon'
import ThemeButton from '../ThemeButton'
import { SiteAvatar, SoonBadge } from '../ui'
import { useWorkspace } from './context'
import { WorkspaceDialog, useAddSite } from './dialogs'

// The reference's appShell() from src/ui.js.
export default function AppShell({ active = 'sites', crumb = 'Your sites', children }) {
  const ws = useWorkspace()
  const addSite = useAddSite()
  const pathname = usePathname()
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNavOpen(false)
  }, [pathname])
  useEffect(() => {
    document.body.classList.toggle('nav-open', navOpen)
    return () => document.body.classList.remove('nav-open')
  }, [navOpen])

  if (!ws.ready) {
    return <main id="main-content" className="app-loading"><Icon name="sprout" />Loading…</main>
  }

  const { paths, plan, sites } = ws
  const navItem = (href, icon, label, itemKey, extra = null) => (
    <Link href={href} className={`sidebar-link ${active === itemKey ? 'active' : ''}`} aria-current={active === itemKey ? 'page' : undefined}>
      <Icon name={icon} /><span>{label}</span>{extra}
    </Link>
  )

  return (
    <div className="app-layout">
      <button type="button" className="sidebar-scrim" onClick={() => setNavOpen(false)} aria-label="Close navigation"></button>
      <aside className="app-sidebar" aria-label="Workspace navigation">
        <div className="sidebar-brand">
          <Brand href={paths.home} />
          <button type="button" className="icon-button mobile-only" onClick={() => setNavOpen(false)} aria-label="Close navigation"><Icon name="x" /></button>
        </div>
        <button type="button" className="workspace-switcher" onClick={() => ws.openDialog(<WorkspaceDialog />)}>
          <span className="workspace-avatar">{ws.user.initial}</span>
          <span><strong>Your workspace</strong><small>Personal workspace</small></span>
          <Icon name="chevrons-up-down" />
        </button>

        <div className="sidebar-label">OVERVIEW</div>
        <nav className="sidebar-nav">
          {navItem(paths.home, 'layout-grid', 'Your sites', 'sites', <span className="nav-count">{sites.length}</span>)}
          {navItem(paths.overview, 'layers', 'All sites together', 'overview', <span className="badge badge-max">Max</span>)}
        </nav>

        <div className="sidebar-label sidebar-label-sites">
          YOUR WEBSITES
          <button type="button" className="icon-button icon-button-tiny" onClick={addSite} aria-label="Add a website"><Icon name="plus" /></button>
        </div>
        <nav className="sidebar-sites">
          {sites.slice(0, 6).map((site) => (
            <Link key={site.id} href={paths.site(site.id)} className={`sidebar-site ${active === site.id ? 'active' : ''}`}>
              <SiteAvatar site={site} size="avatar-tiny" />
              <span>{site.name}</span>
              {site.tracking === false && <span className="waiting-dot" title="Awaiting first visitor"></span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="sidebar-nav">
          {navItem(paths.team, 'users', 'Team members', 'team', <SoonBadge />)}
          {navItem(paths.settings, 'settings', 'Settings', 'settings')}
        </nav>

        <div className="sidebar-bottom">
          <div className="plan-usage">
            <div><strong>{plan.name} plan</strong><Link href={paths.billing}>Manage <Icon name="arrow-up-right" /></Link></div>
            <div className="progress-track"><span style={{ width: `${Math.min(100, sites.length / plan.sites * 100)}%` }}></span></div>
            <p>{sites.length} of {plan.sites} sites in use</p>
            {ws.planKey !== 'business' && <Link href={paths.pricing} className="button button-soft button-small full-width">A little more room? <Icon name="arrow-up-right" /></Link>}
          </div>
          <Link href="/guide" className="sidebar-link help-link"><Icon name="circle-help" /><span>A helping hand</span><Icon name="arrow-up-right" /></Link>
          <div className="sidebar-profile">
            <span className="user-avatar">{ws.user.initial}</span>
            <span><strong>{ws.user.name}</strong><small>{ws.user.email}</small></span>
            <Link href={paths.account} className="icon-button" aria-label="Account settings"><Icon name="chevron-right" /></Link>
          </div>
        </div>
      </aside>

      <div className="app-main workspace-main">
        <header className="app-topbar">
          <div className="breadcrumbs">
            <button type="button" className="icon-button mobile-only" onClick={() => setNavOpen(true)} aria-label="Open workspace navigation" aria-expanded={navOpen}><Icon name="menu" /></button>
            <Link href={paths.home}>Workspace</Link>
            <span>/</span>
            <span>{crumb}</span>
          </div>
          <div className="topbar-actions">
            {ws.isDemo && <span className="demo-label"><span></span>Demo workspace</span>}
            <ThemeButton />
            <Link href="/" className="icon-button" aria-label="Go to marketing homepage" title="Visit Pageviz home"><Icon name="arrow-up-right" /></Link>
          </div>
        </header>
        <main id="main-content" className="app-content" tabIndex={-1}>
          {children}
          <div className="workspace-footnote">
            <Icon name="leaf" /> A little clarity, without the cookies.
            {ws.isDemo && <span>Sample data · Changes last for this visit only</span>}
          </div>
        </main>
      </div>
    </div>
  )
}
