'use client'

import { useEffect, useMemo } from 'react'
import { planFor, isPaidPlan, isMaxPlan } from '@/lib/plans'
import {
  useDemoState, demoActions, getSites, activeNow, totalActive, siteStats, workspaceStats, chartData,
} from '@/lib/demo-store'
import { useToast } from '../Toast'
import { WorkspaceContext, buildPaths, useDialogHost } from './context'

// The demo workspace from the reference build: sample data, every change kept in
// memory for this visit only. Never reads or writes Supabase.
export default function DemoWorkspace({ children }) {
  const state = useDemoState()
  const toast = useToast()
  const { openDialog, closeDialog, host } = useDialogHost()

  // The reference's gentle "live" wobble (main.js startLiveUpdates, every 4.2s).
  useEffect(() => {
    const timer = setInterval(demoActions.tick, 4200)
    return () => clearInterval(timer)
  }, [])

  const value = useMemo(() => {
    const sites = getSites(state)
    const live = Object.fromEntries(sites.map((site) => [site.id, activeNow(state, site)]))
    // Live counts are a Pro feature (lib/plans.js, the pricing page), so previewing Free hides them
    // the same way the real workspace does. The reference showed them on every plan.
    const paid = isPaidPlan(state.user.plan)
    return {
      mode: 'demo',
      isDemo: true,
      ready: true,
      paths: buildPaths('demo'),
      user: { name: state.user.name.split(' ')[0], fullName: state.user.name, email: state.user.email, initial: state.user.name[0] },
      planKey: state.user.plan,
      plan: planFor(state.user.plan),
      isPaid: paid,
      isMax: isMaxPlan(state.user.plan),
      // Demo has no Paddle subscription behind it, so there are no real links to give.
      billing: { managementUrls: null, nextBilledAt: null },
      sites,
      allSites: state.sites,
      getSite: (id) => sites.find((site) => site.id === id),
      range: state.range,
      setRange: demoActions.setRange,
      compare: state.compare,
      setCompare: demoActions.setCompare,
      digest: state.digest,
      live: paid ? live : {},
      totalLive: paid ? totalActive(state) : null,
      liveFor: (id) => (paid ? (live[id] ?? 0) : null),
      openDialog, closeDialog, toast,
      actions: {
        addSite: async (input) => demoActions.addSite(input),
        verifyInstall: async (id) => { demoActions.verifyInstall(id); toast('Your first visits are in. Welcome aboard!', { celebration: true, icon: 'sprout' }) },
        setShared: async (id, shared) => { demoActions.setShared(id, shared); toast(shared ? 'Public page is live' : 'Public page turned off', { icon: 'link' }); return true },
        setPasswordEnabled: (id, enabled) => { demoActions.setPasswordEnabled(id, enabled); toast(enabled ? 'Password protection on' : 'Password protection off', { icon: 'lock' }) },
        enableEvents: (id) => { demoActions.enableEvents(id); toast('Events turned on', { icon: 'mouse-pointer-2' }) },
        exportCsv: () => toast('CSV export started (demo)', { icon: 'download' }),
        exportAllCsv: () => toast('CSV export started (demo)', { icon: 'download' }),
        setDigest: (digest) => { demoActions.setDigest(digest); toast(digest ? 'Weekly digest on' : 'Weekly digest off', { icon: 'mail' }) },
        setPlan: demoActions.setPlan,
        logout: async () => {},
      },
      hooks: { useDashboardStats, useSiteStats, useOverviewStats },
      demoState: state,
    }
  }, [state, openDialog, closeDialog, toast])

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
      {host}
    </WorkspaceContext.Provider>
  )
}

/* ---------- data hooks (synchronous, from data.js) ---------- */

function useDashboardStats(ws) {
  const state = ws.demoState
  const perSite = Object.fromEntries(ws.sites.map((site) => [site.id, { views: siteStats(site, state.range).views, growth: site.growth, series: site.series }]))
  const totals = workspaceStats(state)
  return { loading: false, perSite, totals: { views: totals.views, growth: totals.growth } }
}

function useSiteStats(ws, siteId) {
  const state = ws.demoState
  const site = ws.sites.find((item) => item.id === siteId)
  if (!site) return { loading: false, views: 0, growth: null, perDay: 0, topPage: null, pages: [], referrers: [], devices: [], events: [], eventTotal: 0, chart: { labels: [], values: [], previous: null }, rows: [] }
  const stats = siteStats(site, state.range)
  const perDay = state.range === '1' ? stats.views : Math.round(stats.views / (state.range === 'all' ? 790 : state.range === '365' ? 365 : Number(state.range)))
  return {
    loading: false,
    ...stats,
    growth: site.growth,
    perDay,
    topPage: stats.pages[0] ? { name: stats.pages[0].name, share: stats.views ? stats.pages[0].count / stats.views * 100 : 0 } : null,
    chart: chartData(site, state.range),
    rows: [],
  }
}

function useOverviewStats(ws) {
  const state = ws.demoState
  const totals = workspaceStats(state)
  const rows = ws.sites.map((site) => ({ site, views: siteStats(site, state.range).views, growth: site.tracking ? site.growth : null })).sort((a, b) => b.views - a.views)
  const combined = rows.reduce((sum, row) => sum + row.views, 0)
  rows.forEach((row) => { row.share = combined ? row.views / combined * 100 : 0 })
  const tracking = ws.sites.filter((site) => site.tracking)
  return {
    loading: false,
    rows,
    totals: { views: totals.views, growth: totals.growth },
    chart: {
      labels: tracking.length ? chartData(tracking[0], state.range).labels : [],
      series: tracking.map((site) => ({ id: site.id, name: site.name, values: chartData(site, state.range).values })),
    },
    bestGrower: rows[0] || null,
  }
}
