'use client'

import { useParams } from 'next/navigation'
import ShareView from '../../../_components/ShareView'
import { useWorkspace, usePageTitle } from '../../../_components/workspace/context'
import { useDemoState, demoActions, getSharedSite, siteStats, chartData, activeNow, demoDateLabel } from '@/lib/demo-store'

// Demo public page — the reference's sharePage() with sample data and its password hint.
export default function DemoShare() {
  const { siteId } = useParams()
  const state = useDemoState()
  const ws = useWorkspace()
  const site = getSharedSite(state, siteId)

  usePageTitle(site && site.shared ? `${site.name} — Shared stats` : 'Not shared — Pageviz')

  if (!site || !site.shared) return <ShareView status="not-shared" />
  if (site.passwordEnabled && !state.shareUnlocked.includes(site.id)) {
    return (
      <ShareView
        status="locked"
        site={site}
        hint={site.demoPassword}
        onUnlock={async (password) => { if (password !== site.demoPassword) return false; demoActions.unlockShare(site.id); return true }}
      />
    )
  }

  const stats = siteStats(site, '30')
  return (
    <ShareView
      status="ready"
      site={site}
      stats={{
        views: stats.views,
        growth: site.growth,
        topPage: stats.pages[0] ? { name: stats.pages[0].name, share: stats.pages[0].count / stats.views * 100 } : null,
        pages: stats.pages,
        referrers: stats.referrers,
        chart: chartData(site, '30'),
      }}
      live={ws.isPaid ? activeNow(state, site) : null}
      rangeText={`Last 30 days · ${demoDateLabel('30')}`}
      chartNote={`Sample data · ${ws.plan.history.toLowerCase()} history`}
    />
  )
}
