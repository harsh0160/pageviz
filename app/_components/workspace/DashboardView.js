'use client'

import { useState } from 'react'
import Link from 'next/link'
import Icon from '../Icon'
import { EmptyIcon, GrowthBadge, LiveBadge, MetricCard, RangePicker, SiteAvatar } from '../ui'
import { formatNumber, rangeCaption, dateLabel } from '@/lib/analytics'
import { demoDateLabel } from '@/lib/demo-store'
import AppShell from './AppShell'
import { useWorkspace } from './context'
import { useAddSite } from './dialogs'

// The reference's dashboardPage() from src/pages/app.js.
export default function DashboardView() {
  const ws = useWorkspace()
  const stats = ws.hooks.useDashboardStats(ws)
  const addSite = useAddSite()
  const [search, setSearch] = useState('')

  if (!ws.ready) return <AppShell />

  const { sites, plan, paths } = ws
  const canAdd = sites.length < plan.sites
  const term = search.trim().toLowerCase()
  const filtered = sites.filter((site) => !term || site.name.toLowerCase().includes(term) || site.domain.toLowerCase().includes(term))
  const liveTotal = ws.totalLive
  const spotsLeft = plan.sites - sites.length

  return (
    <AppShell active="sites" crumb="Your sites">
      <div className="page-head">
        <div>
          <span className="eyebrow">Your workspace</span>
          <h1 className="page-title">Your sites</h1>
          <p className="page-sub">{sites.length} {sites.length === 1 ? 'website' : 'websites'} growing quietly. {ws.isDemo ? demoDateLabel(ws.range) : dateLabel(ws.range)}.</p>
        </div>
        <div className="page-head-actions">
          <RangePicker range={ws.range} onChange={ws.setRange} planKey={ws.planKey} />
          <button type="button" className="button button-primary" onClick={addSite} disabled={!canAdd} title={canAdd ? undefined : 'You have reached your plan’s site limit'}>
            <Icon name="plus" />Add a website
          </button>
        </div>
      </div>

      <div className="metric-grid metric-grid-four dashboard-metrics">
        <MetricCard label="Total views" icon="bar-chart-3" value={stats.loading ? '—' : formatNumber(stats.totals.views)} extra={<><GrowthBadge growth={stats.loading ? null : stats.totals.growth} /><span>vs. previous period</span></>} />
        {liveTotal === null
          ? <MetricCard label="Reading right now" icon="activity" value="—" extra={<Link className="text-link" href={paths.pricing}>Available on Pro <Icon name="arrow-right" /></Link>} />
          : <MetricCard label="Reading right now" icon="activity" value={formatNumber(liveTotal)} extra={<><span className="live-dot"></span>Across all your sites</>} />}
        <MetricCard label="Websites" icon="layout-grid" small value={<>{sites.length}<span className="metric-denominator">/ {plan.sites}</span></>} extra={<Link className="text-link" href={paths.billing}>On the {plan.name} plan <Icon name="arrow-right" /></Link>} />
        <MetricCard label="Data history" icon="clock" small value={plan.history} extra={ws.isPaid ? 'Your numbers, kept safe' : <Link className="text-link" href={paths.pricing}>Keep more history <Icon name="arrow-right" /></Link>} />
      </div>

      <div className="sites-toolbar">
        <div className="input-with-icon search-field">
          <Icon name="search" />
          <input className="input" type="search" placeholder="Search your sites" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search your sites" />
        </div>
        <Link className="text-link" href={paths.overview}>See all sites together <Icon name="arrow-right" /></Link>
      </div>

      <div className="site-grid">
        {filtered.length ? filtered.map((site) => <SiteCard key={site.id} site={site} stats={stats.perSite[site.id]} loading={stats.loading} />) : sites.length ? (
          <div className="site-grid-empty">
            <EmptyIcon name="search" />
            <h3>No sites match &ldquo;{search}&rdquo;</h3>
            <p>Try a different name, or clear your search to see everything.</p>
            <button type="button" className="button button-secondary" onClick={() => setSearch('')}>Clear search</button>
          </div>
        ) : null}
      </div>

      {sites.length < 4 && canAdd && (
        <button type="button" className="add-site-tile" onClick={addSite}>
          <span className="add-site-icon"><Icon name="plus" /></span>
          <strong>{sites.length ? 'Plant another site' : 'Plant your first site'}</strong>
          <span>{spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left on your {plan.name} plan</span>
        </button>
      )}
    </AppShell>
  )
}

function SiteCard({ site, stats, loading }) {
  const ws = useWorkspace()
  const href = ws.paths.site(site.id)

  if (site.tracking === false) {
    return (
      <Link href={href} className="site-card site-card-waiting">
        <div className="site-card-head"><SiteAvatar site={site} size="avatar-large" /><span className="badge badge-soft">Awaiting first visit</span></div>
        <h3>{site.name}</h3>
        <span className="site-domain"><Icon name="globe" />{site.domain}</span>
        <div className="site-card-waiting-body"><Icon name="sprout" /><p>Add the snippet to start growing your data.</p></div>
        <span className="site-card-cta">Finish setup <Icon name="arrow-right" /></span>
      </Link>
    )
  }

  const series = stats?.series || []
  const max = Math.max(0, ...series)
  const live = ws.liveFor(site.id)

  return (
    <Link href={href} className="site-card">
      <div className="site-card-head"><SiteAvatar site={site} size="avatar-large" />{live !== null && <LiveBadge count={live} />}</div>
      <h3>{site.name}</h3>
      <span className="site-domain"><Icon name="globe" />{site.domain}</span>
      <div className="site-card-metric">
        <div><strong>{loading || !stats ? '—' : formatNumber(stats.views)}</strong><span>views · {rangeCaption(ws.range)}</span></div>
        <GrowthBadge growth={stats?.growth ?? null} />
      </div>
      <div className="site-spark" aria-hidden="true">
        {series.map((value, index) => <span key={index} style={{ height: `${max ? 6 + (value / max) * 30 : 6}px` }}></span>)}
      </div>
      <span className="site-card-cta">Open dashboard <Icon name="arrow-right" /></span>
    </Link>
  )
}
