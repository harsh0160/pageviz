'use client'

// Demo workspace — the reference build's src/data.js, ported as a tiny in-memory
// store. Sample data only: nothing here ever touches Supabase, and every change
// lasts for this visit only (a reload starts fresh).

import { useSyncExternalStore } from 'react'
import { PLANS } from './plans'
import { SITE_COLORS, monogramFor } from './analytics'

export const SAMPLE_TODAY = new Date('2026-09-08T12:00:00Z')

// Tiny sample chart for the homepage hero (charts.js PREVIEW).
export const HERO_PREVIEW = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  values: [1180, 1520, 1360, 1980, 1720, 1610, 2240],
}

const createInitialState = () => ({
  user: { name: 'Alex Rivera', email: 'alex@studionorth.example', plan: 'pro' },
  range: '7',
  compare: true,
  digest: false,
  heartbeat: 0,
  shareUnlocked: [],
  sites: [
    {
      id: 'studio-north', name: 'Studio North', domain: 'studionorth.example', monogram: 'N', color: 'forest',
      views: 18492, growth: 18.6, active: 12, tracking: true, eventsEnabled: true,
      shared: true, passwordEnabled: true, demoPassword: 'pageviz',
      series: [2050, 2410, 2180, 3120, 2742, 2690, 3300],
      pages: ['/', '/work', '/about', '/journal', '/contact'],
      pageShares: [0.4521, 0.2629, 0.1478, 0.0904, 0.0468],
      eventNames: ['contact_click', 'newsletter_signup', 'project_inquiry'],
      eventCounts: [148, 82, 34],
    },
    {
      id: 'bloom-journal', name: 'Bloom Journal', domain: 'bloomjournal.example', monogram: 'b', color: 'pink',
      views: 9824, growth: 12.4, active: 4, tracking: true, eventsEnabled: true,
      shared: false, passwordEnabled: false, demoPassword: '',
      series: [1120, 1280, 1090, 1494, 1650, 1390, 1800],
      pages: ['/', '/stories', '/stories/a-slower-sunday', '/about', '/subscribe'],
      pageShares: [0.34, 0.28, 0.2, 0.12, 0.06],
      eventNames: ['newsletter_signup', 'story_share', 'subscribe_click'],
      eventCounts: [96, 42, 28],
    },
    {
      id: 'fieldnotes', name: 'Fieldnotes', domain: 'fieldnotes.example', monogram: 'f.', color: 'sand',
      views: 4530, growth: 8.2, active: 1, tracking: true, eventsEnabled: false,
      shared: true, passwordEnabled: false, demoPassword: '',
      series: [440, 590, 510, 730, 660, 690, 910],
      pages: ['/', '/notes', '/notes/on-paying-attention', '/about', '/archive'],
      pageShares: [0.3, 0.29, 0.25, 0.1, 0.06], eventNames: [], eventCounts: [],
    },
    {
      id: 'little-sundays', name: 'Little Sundays', domain: 'littlesundays.example', monogram: 's', color: 'lavender',
      views: 0, growth: 0, active: 0, tracking: false, eventsEnabled: false,
      shared: false, passwordEnabled: false, demoPassword: '',
      series: [0, 0, 0, 0, 0, 0, 0], pages: ['/'], pageShares: [1], eventNames: [], eventCounts: [],
    },
  ],
})

let state = createInitialState()
const serverSnapshot = state
const listeners = new Set()

function setState(updater) {
  state = { ...state, ...updater(state) }
  listeners.forEach((listener) => listener())
}

const updateSite = (id, patch) => setState((current) => ({
  sites: current.sites.map((site) => (site.id === id ? { ...site, ...(typeof patch === 'function' ? patch(site) : patch) } : site)),
}))

export function useDemoState() {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => listeners.delete(listener) },
    () => state,
    () => serverSnapshot,
  )
}

/* ---------- selectors (data.js) ---------- */
export const currentPlan = (s) => PLANS[s.user.plan]
export const getSites = (s) => s.sites.slice(0, currentPlan(s).sites)
export const getSite = (s, id) => getSites(s).find((site) => site.id === id)
export const getSharedSite = (s, id) => s.sites.find((site) => site.id === id)
export const activeNow = (s, site) => (site.tracking ? Math.max(0, site.active + [0, 1, 0, -1, 0][s.heartbeat % 5]) : 0)
export const totalActive = (s) => getSites(s).reduce((total, site) => total + activeNow(s, site), 0)

const rangeFactors = { '1': 0.1785, '7': 1, '30': 4.31, '90': 12.14, '365': 43.7, all: 79.2 }

export function allocate(total, shares) {
  let left = total
  return shares.map((share, index) => {
    const count = index === shares.length - 1 ? left : Math.min(left, Math.round(total * share))
    left -= count
    return count
  })
}

export function siteStats(site, range) {
  const factor = site.views <= 1 ? 1 : (rangeFactors[range] || 1)
  const views = Math.round(site.views * factor)
  const pageCounts = allocate(views, site.pageShares)
  const referrerCounts = allocate(views, [0.3953, 0.2857, 0.1632, 0.1017, 0.0541])
  const deviceCounts = allocate(views, [0.61, 0.35, 0.04])
  const eventCounts = site.eventCounts.map((count) => Math.round(count * factor))
  return {
    views,
    pages: site.pages.map((name, index) => ({ name, count: pageCounts[index] })),
    referrers: ['Direct / None', 'Google', 'Instagram', 'Dribbble', 'Other'].map((name, index) => ({ name, count: referrerCounts[index] })),
    devices: ['Desktop', 'Mobile', 'Tablet'].map((name, index) => ({ name, count: deviceCounts[index] })),
    events: site.eventNames.map((name, index) => ({ name, count: eventCounts[index] })),
    eventTotal: eventCounts.reduce((sum, count) => sum + count, 0),
  }
}

export function workspaceStats(s) {
  const sites = getSites(s)
  const views = sites.reduce((sum, site) => sum + siteStats(site, s.range).views, 0)
  const previous = sites.reduce((sum, site) => sum + siteStats(site, s.range).views / (1 + site.growth / 100), 0)
  return { views, growth: previous ? (views / previous - 1) * 100 : 0, active: totalActive(s), sites: sites.length }
}

export function demoDateLabel(range) {
  if (range === 'all') return 'Sep 2024 – Sep 2026'
  if (range === '1') return 'September 8, 2026'
  const start = new Date(SAMPLE_TODAY)
  start.setUTCDate(start.getUTCDate() - Number(range) + 1)
  const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
  return `${fmt.format(start)} – ${fmt.format(SAMPLE_TODAY)}, 2026`
}

export function chartData(site, range) {
  const total = siteStats(site, range).views
  if (range === '7') {
    return {
      labels: ['Sep 2', 'Sep 3', 'Sep 4', 'Sep 5', 'Sep 6', 'Sep 7', 'Sep 8'],
      values: site.series,
      previous: site.series.map((value, index) => Math.round(value / (1 + site.growth / 100) * [1.03, 0.98, 1.05, 0.94, 1.02, 0.96, 1.02][index])),
    }
  }
  const count = range === '1' ? 24 : range === '365' ? 12 : range === 'all' ? 24 : 30
  const weights = Array.from({ length: count }, (_, index) => 0.75 + (index / count) * 0.4 + Math.sin(index * 1.7 + site.name.length) * 0.25 + Math.cos(index * 0.6) * 0.12)
  const sum = weights.reduce((a, b) => a + b, 0)
  const values = allocate(total, weights.map((weight) => weight / sum))
  const labels = Array.from({ length: count }, (_, index) => {
    if (range === '1') return `${index % 12 || 12}${index < 12 ? 'am' : 'pm'}`
    const date = new Date(SAMPLE_TODAY)
    if (range === '365' || range === 'all') {
      date.setUTCMonth(date.getUTCMonth() - count + index + 1)
      return new Intl.DateTimeFormat('en-US', { month: 'short', ...(range === 'all' ? { year: '2-digit' } : {}), timeZone: 'UTC' }).format(date)
    }
    date.setUTCDate(date.getUTCDate() - Number(range) + Math.floor(index * Number(range) / count) + 1)
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date)
  })
  return { labels, values, previous: values.map((value) => Math.round(value / (1 + site.growth / 100))) }
}

export const demoInstallSnippet = (origin, site) => `<script src="${origin}/track.js" data-site-id="${site.id}"></script>`

/* ---------- actions (main.js handlers) ---------- */
export const demoActions = {
  setRange: (range) => setState(() => ({ range })),
  setCompare: (compare) => setState(() => ({ compare })),
  setDigest: (digest) => setState(() => ({ digest })),
  tick: () => setState((current) => ({ heartbeat: current.heartbeat + 1 })),
  setPlan: (plan) => {
    if (!PLANS[plan]) return
    setState((current) => {
      const tooLong = (current.range === 'all' && plan !== 'business') || Number(current.range) > PLANS[plan].maxDays
      return { user: { ...current.user, plan }, range: tooLong ? '7' : current.range, shareUnlocked: [] }
    })
  },
  addSite: ({ name, domain }) => {
    const id = domain.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `site-${Date.now()}`
    setState((current) => ({
      sites: [...current.sites, {
        id, name, domain, monogram: monogramFor(name), color: SITE_COLORS[current.sites.length % SITE_COLORS.length],
        views: 0, growth: 0, active: 0, tracking: false, eventsEnabled: false, shared: false, passwordEnabled: false, demoPassword: '',
        series: [0, 0, 0, 0, 0, 0, 0], pages: ['/'], pageShares: [1], eventNames: [], eventCounts: [],
      }],
    }))
    return id
  },
  verifyInstall: (id) => updateSite(id, (site) => ({
    tracking: true,
    ...(!site.views ? { views: 1240, growth: 6.5, active: 2, series: [120, 180, 150, 210, 240, 190, 260] } : {}),
  })),
  enableEvents: (id) => updateSite(id, (site) => ({
    eventsEnabled: true,
    ...(!site.eventNames.length ? { eventNames: ['contact_click', 'newsletter_signup'], eventCounts: [64, 38] } : {}),
  })),
  setShared: (id, shared) => updateSite(id, { shared }),
  setPasswordEnabled: (id, passwordEnabled) => updateSite(id, (site) => ({ passwordEnabled, demoPassword: passwordEnabled && !site.demoPassword ? 'pageviz' : site.demoPassword })),
  unlockShare: (id) => setState((current) => ({ shareUnlocked: [...current.shareUnlocked, id] })),
}
