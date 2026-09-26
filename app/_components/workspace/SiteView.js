'use client'

import Link from 'next/link'
import Icon from '../Icon'
import NotFoundContent from '../NotFoundContent'
import { BackLink, ChartCard, EmptyIcon, GrowthBadge, LiveBadge, MetricCard, RangePicker, SiteAvatar, StatList } from '../ui'
import { formatNumber } from '@/lib/analytics'
import AppShell from './AppShell'
import { useWorkspace, usePageTitle } from './context'
import { EventsDialog, RemoveSiteDialog, SetupDialog, ShareDialog, SiteMenuDialog } from './dialogs'
import { useSoon } from '../Toast'

// The reference's sitePage() + setupContent() from src/pages/app.js.
export default function SiteView({ siteId }) {
  const ws = useWorkspace()
  const site = ws.ready ? ws.getSite(siteId) : null
  const stats = ws.hooks.useSiteStats(ws, siteId)
  usePageTitle(site ? `${site.name} — Pageviz` : null)

  if (!ws.ready) return <AppShell />
  if (!site) {
    return <AppShell active="" crumb="Not found"><NotFoundContent demoHref="/demo" /></AppShell>
  }
  // Past the plan's site limit after a downgrade: its rows are hidden by the database,
  // so without this the page would look like a site that simply has no data.
  if (site.locked) {
    const { plan } = ws
    return (
      <AppShell active={site.id} crumb={site.name}>
        <BackLink href={ws.paths.home}>All your sites</BackLink>
        <div className="setup-hero">
          <EmptyIcon name="lock" />
          <h1 className="page-title">{site.name} is locked</h1>
          <p className="page-sub">Your {plan.name} plan covers {plan.sites} {plan.sites === 1 ? 'site' : 'sites'}, and this one is past that. Pageviz is still counting it: move up a plan and every number comes back.</p>
          <div className="page-head-actions">
            <Link className="button button-primary" href={ws.paths.billing}>See plans <Icon name="arrow-right" /></Link>
            <button type="button" className="button button-secondary" onClick={() => ws.openDialog(<RemoveSiteDialog siteId={site.id} />)}>Remove this site</button>
          </div>
        </div>
      </AppShell>
    )
  }
  if (site.tracking === false) {
    return <AppShell active={site.id} crumb={site.name}><SetupContent site={site} /></AppShell>
  }

  const { paths } = ws
  const live = ws.liveFor(site.id)
  const exportCsv = () => ws.actions.exportCsv(site, stats.rows, ws.range)
  const loading = stats.loading
  const chartNote = `${ws.isDemo ? 'Sample data · ' : ''}${ws.plan.history.toLowerCase()} history`

  return (
    <AppShell active={site.id} crumb={site.name}>
      <BackLink href={paths.home}>All your sites</BackLink>
      <div className="page-head site-page-head">
        <div className="site-page-title">
          <SiteAvatar site={site} size="avatar-large" />
          <div>
            <h1 className="page-title">{site.name}</h1>
            {site.domain.endsWith('.example')
              // Reserved for examples (the demo's sample sites): never a real site, so no link.
              ? <span className="site-domain"><Icon name="globe" />{site.domain}</span>
              : <a className="site-domain" href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer"><Icon name="globe" />{site.domain}<Icon name="external-link" /></a>}
          </div>
        </div>
        <div className="page-head-actions">
          {live !== null && <LiveBadge count={live} />}
          <RangePicker range={ws.range} onChange={ws.setRange} planKey={ws.planKey} />
          <button type="button" className="icon-button icon-button-bordered" onClick={() => ws.openDialog(<SiteMenuDialog siteId={site.id} onExport={exportCsv} />)} aria-label="Site options"><Icon name="more-horizontal" /></button>
        </div>
      </div>

      <div className="site-subbar">
        <div className="subbar-toggles">
          <button type="button" className={`chip ${ws.compare ? 'chip-active' : ''}`} onClick={() => { ws.setCompare(!ws.compare); ws.toast(!ws.compare ? 'Comparison on' : 'Comparison off', { icon: 'trending-up' }) }} aria-pressed={ws.compare}>
            <Icon name="trending-up" />Compare to previous
          </button>
          {site.shared && <a className="chip" href={paths.share(site.id)} target="_blank" rel="noopener noreferrer"><Icon name="link" />View public page</a>}
        </div>
        <div className="subbar-actions">
          <button type="button" className="button button-secondary button-small" onClick={exportCsv}><Icon name="download" />Export CSV</button>
          <button type="button" className="button button-secondary button-small" onClick={() => ws.openDialog(<ShareDialog siteId={site.id} />)}><Icon name="link" />Share</button>
        </div>
      </div>

      <div className="metric-grid metric-grid-four">
        <MetricCard label="Pageviews" icon="bar-chart-3" value={loading ? '—' : formatNumber(stats.views)} extra={<><GrowthBadge growth={loading ? null : stats.growth} /><span>vs. previous</span></>} />
        {/* Reference shows "Visitors" here. Pageviz never reports visitors, so this card shows the top page instead. */}
        <MetricCard label="Top page" icon="file" small truncate title={stats.topPage?.name} value={loading || !stats.topPage ? '—' : stats.topPage.name} extra={stats.topPage ? <span>{stats.topPage.share.toFixed(1)}% of pageviews</span> : <span>No page views yet</span>} />
        <MetricCard label="Views per day" icon="activity" small value={loading ? '—' : formatNumber(stats.perDay)} extra={<span>Averaged across the range</span>} />
        {/* The real workspace only polls live counts on paid plans; a paid plan whose poll failed shows 0, never the upsell. */}
        {!ws.isPaid && live === null
          ? <MetricCard label="Reading now" icon="circle-dot" small value="—" extra={<Link className="text-link" href={paths.pricing}>Available on Pro <Icon name="arrow-right" /></Link>} />
          : <MetricCard label="Reading now" icon="circle-dot" small value={formatNumber(live ?? 0)} extra={<><span className="live-dot"></span>Live right now</>} />}
      </div>

      <ChartCard chart={stats.chart} compare={ws.compare} footerNote={chartNote} label={`${site.name} pageviews over time`} />

      <div className="stat-columns">
        <StatList title="Top pages" subtitle="Where your pageviews land" rows={stats.pages} icon="file" link={(row) => `https://${site.domain}${row.name}`} empty="No page views yet." />
        <StatList title="Where they came from" subtitle="Referrers sending you pageviews" rows={stats.referrers} icon="move-up-right" />
      </div>
      <div className="stat-columns">
        <StatList title="Devices" subtitle="What they are browsing on" rows={stats.devices} icon="monitor" />
        <EventsCard site={site} stats={stats} />
      </div>
    </AppShell>
  )
}

function EventsCard({ site, stats }) {
  const ws = useWorkspace()
  // Real paid workspaces always count events (pageviz('name') needs no switch); the demo keeps the reference's per-site toggle.
  const enabled = ws.isPaid && (ws.isDemo ? ws.allSites.find((item) => item.id === site.id)?.eventsEnabled : true)

  if (enabled) {
    return (
      <StatList
        title="Events"
        subtitle="The moments that matter"
        rows={stats.events}
        icon="mouse-pointer-2"
        empty="No events recorded yet."
        action={<button type="button" className="button button-secondary button-small" onClick={() => ws.openDialog(<EventsDialog names={stats.events.map((event) => event.name)} />)}>Manage <Icon name="arrow-right" /></button>}
      />
    )
  }

  return (
    <section className="card stat-card stat-card-locked">
      <div className="card-header"><div><h2>Events</h2><p>Track signups, clicks, and goals</p></div></div>
      <div className="locked-body">
        <Icon name="mouse-pointer-2" />
        <p>Custom events let you count the moments that matter, like a newsletter signup or a contact click.</p>
        {ws.isPaid
          ? <button type="button" className="button button-soft button-small" onClick={() => ws.actions.enableEvents(site.id)}>Turn on events <Icon name="arrow-right" /></button>
          : <Link className="button button-soft button-small" href={ws.paths.pricing}>Available on Pro <Icon name="arrow-up-right" /></Link>}
      </div>
    </section>
  )
}

function SetupContent({ site }) {
  const ws = useWorkspace()
  const soon = useSoon()
  return (
    <>
      <BackLink href={ws.paths.home}>All your sites</BackLink>
      <div className="setup-hero">
        <SiteAvatar site={site} size="avatar-large" />
        <h1 className="page-title">{site.name} is ready to grow</h1>
        <p className="page-sub">Add one small snippet to {site.domain} and Pageviz will start counting pageviews, gently and cookie-free.</p>
        <button type="button" className="button button-primary" onClick={() => ws.openDialog(<SetupDialog siteId={site.id} />)}><Icon name="code-xml" />Show me the snippet</button>
      </div>
      <div className="setup-waiting">
        <div className="waiting-pulse"><Icon name="activity" /></div>
        <div>
          <strong>Listening for your first pageview&hellip;</strong>
          <p>This page will bloom with data the moment someone lands on your site.</p>
        </div>
      </div>
      <p style={{ textAlign: 'center' }}>
        <button type="button" className="text-link" onClick={ws.isDemo ? soon : () => ws.openDialog(<RemoveSiteDialog siteId={site.id} />)}>Remove this site</button>
      </p>
    </>
  )
}
