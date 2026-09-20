'use client'

import Link from 'next/link'
import Icon from '../Icon'
import { BackLink, ChartCard, GrowthBadge, MetricCard, RangePicker, SiteAvatar } from '../ui'
import { formatNumber, dateLabel } from '@/lib/analytics'
import { demoDateLabel } from '@/lib/demo-store'
import AppShell from './AppShell'
import { useWorkspace } from './context'
import { PlanPreviewDialog } from './dialogs'

// The reference's overviewPage() + upgradeCard() from src/pages/app.js and src/ui.js.
export default function OverviewView() {
  const ws = useWorkspace()
  const stats = ws.hooks.useOverviewStats(ws)

  if (!ws.ready) return <AppShell />
  const { paths } = ws

  if (!ws.isMax) {
    return (
      <AppShell active="overview" crumb="All sites together">
        <BackLink href={paths.home}>Your sites</BackLink>
        <div className="upgrade-hero">
          <UpgradeCard
            feature="See all your sites in one calm view"
            description="The combined dashboard brings every website together, so you can watch your whole garden bloom at once. It is part of the Max plan."
          />
        </div>
      </AppShell>
    )
  }

  const sites = ws.sites
  const trackingCount = sites.filter((site) => site.tracking).length
  const best = stats.bestGrower
  const liveTotal = ws.totalLive

  return (
    <AppShell active="overview" crumb="All sites together">
      <div className="page-head">
        <div>
          <span className="eyebrow">Max plan</span>
          <h1 className="page-title">All sites together</h1>
          <p className="page-sub">Every website in one view. {ws.isDemo ? demoDateLabel(ws.range) : dateLabel(ws.range)}.</p>
        </div>
        <div className="page-head-actions">
          <RangePicker range={ws.range} onChange={ws.setRange} planKey={ws.planKey} />
          <button type="button" className="button button-secondary" onClick={() => ws.actions.exportAllCsv(ws.range)}><Icon name="download" />Export all</button>
        </div>
      </div>

      <div className="metric-grid metric-grid-four">
        <MetricCard label="Combined views" icon="layers" value={stats.loading ? '—' : formatNumber(stats.totals.views)} extra={<><GrowthBadge growth={stats.loading ? null : stats.totals.growth} /><span>vs. previous</span></>} />
        <MetricCard label="Reading now" icon="activity" value={formatNumber(liveTotal || 0)} extra={<><span className="live-dot"></span>Across every site</>} />
        <MetricCard label="Active sites" icon="globe" small value={<>{trackingCount}<span className="metric-denominator">/ {sites.length}</span></>} extra="Currently collecting data" />
        <MetricCard label="Best grower" icon="sprout" small truncate value={best ? best.site.name : '—'} extra={best ? <><GrowthBadge growth={best.growth} /><span>this period</span></> : null} />
      </div>

      <ChartCard combined series={stats.chart} footerNote={`${ws.isDemo ? 'Sample data · ' : ''}${ws.plan.history.toLowerCase()} history`} />

      <section className="card">
        <div className="card-header"><div><h2>Every site, side by side</h2><p>Sorted by pageviews this period</p></div></div>
        <div className="table-scroll">
          <table className="data-table">
            {/* Reference has a "Visitors" column; Pageviz never reports visitors, so it shows each site's share of pageviews. */}
            <thead><tr><th>Website</th><th>Views</th><th>Share of views</th><th>Growth</th><th>Reading now</th><th></th></tr></thead>
            <tbody>
              {stats.rows.map(({ site, views, growth, share }) => {
                const live = ws.liveFor(site.id)
                return (
                  <tr key={site.id}>
                    <td><Link className="table-site" href={paths.site(site.id)}><SiteAvatar site={site} size="avatar-tiny" /><span><strong>{site.name}</strong><small>{site.domain}</small></span></Link></td>
                    <td className="num">{formatNumber(views)}</td>
                    <td className="num">{share.toFixed(1)}%</td>
                    <td>{site.tracking ? <GrowthBadge growth={growth} /> : <span className="muted">&mdash;</span>}</td>
                    <td className="num">{site.tracking && live !== null ? <span className="live-inline"><span className="live-dot"></span><span>{live}</span></span> : <span className="muted">&mdash;</span>}</td>
                    <td><Link className="text-link" href={paths.site(site.id)}>Open <Icon name="arrow-right" /></Link></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  )
}

function UpgradeCard({ feature, description }) {
  const ws = useWorkspace()
  return (
    <div className="upgrade-feature">
      <span className="feature-icon"><Icon name="layers" /></span>
      <span className="eyebrow">A LITTLE ROOM TO GROW</span>
      <h2>{feature}</h2>
      <p>{description}</p>
      {ws.isDemo
        ? <button type="button" className="button button-primary" onClick={() => ws.openDialog(<PlanPreviewDialog plan="business" />)}>Explore the Max demo <Icon name="arrow-up-right" /></button>
        // Real workspace: the preview lives in the demo, so this opens it there.
        : <Link className="button button-primary" href="/demo/all">Explore the Max demo <Icon name="arrow-up-right" /></Link>}
      <Link className="text-link" href={ws.paths.pricing}>Compare all plans <Icon name="arrow-right" /></Link>
      <small>Preview only. No payment or subscription.</small>
    </div>
  )
}
