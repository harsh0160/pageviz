'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { planFor, isPaidPlan, isMaxPlan } from '@/lib/plans'
import {
  rangeWindow, rangeAllowed, bucketCounts, previousBucketCounts, countBy, referrerName, growthPercent, hashSharePassword, downloadPageviewsCsv, downloadCombinedCsv,
} from '@/lib/analytics'
import {
  loadProfile, loadSites, toSite, countPageviews, fetchSitePageviews, fetchPageviewTimes, fetchSiteEvents, fetchActiveCount,
} from '@/lib/workspace-queries'
import { useToast } from '../Toast'
import { WorkspaceContext, buildPaths, useDialogHost } from './context'

// The signed-in user's real workspace. Everything shown comes from Supabase.

// Survives remounts between /dashboard and /settings so the shell doesn't flash.
let cache = null

const displayName = (user) => user.user_metadata?.name || user.email?.split('@')[0] || 'You'

export default function RealWorkspace({ children }) {
  const router = useRouter()
  const toast = useToast()
  const { openDialog, closeDialog, host } = useDialogHost()
  const [account, setAccount] = useState(cache?.account || null)
  const [sites, setSites] = useState(cache?.sites || [])
  const [range, setRangeState] = useState(cache?.range || '7')
  const [compare, setCompareState] = useState(true)
  const [live, setLive] = useState(cache?.live || {})

  const planKey = account?.planKey || 'free'
  const paid = isPaidPlan(planKey)

  // Auth guard + initial load (same calls the dashboard always made).
  useEffect(() => {
    let cancelled = false
    supabase.auth.getUser().then(async ({ data }) => {
      if (cancelled) return
      if (!data.user) { router.push('/login'); return }
      const user = data.user
      const [profile, siteList] = await Promise.all([loadProfile(user.id), loadSites(user.id)])
      const withTracking = await Promise.all(siteList.map(async (site) => ({ ...site, tracking: (await countPageviews(site.id).catch(() => 0)) > 0 })))
      if (cancelled) return
      // savedName is what is actually stored; name falls back to the email prefix, so compare against savedName.
      const nextAccount = { id: user.id, email: user.email, name: displayName(user), savedName: user.user_metadata?.name || '', planKey: profile.plan, managementUrls: profile.managementUrls, nextBilledAt: profile.nextBilledAt }
      setAccount(nextAccount)
      setSites(withTracking)
      cache = { ...(cache || {}), account: nextAccount, sites: withTracking }
    })
    return () => { cancelled = true }
  }, [router])

  // Paddle sends the buyer straight back here, but the plan only changes once Paddle's
  // webhook reaches our server a few seconds later. Without this wait they land on a
  // dashboard that still says Free and reasonably conclude the payment failed -- the
  // one moment where a confused customer is most likely to pay a second time.
  const accountId = account?.id
  useEffect(() => {
    if (!accountId) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('upgraded') !== '1') return
    // Drop the flag immediately so a refresh doesn't start the wait all over again.
    window.history.replaceState({}, '', window.location.pathname)

    let cancelled = false
    let tries = 0
    toast('Payment received. Activating your plan…', { icon: 'activity' })
    const timer = setInterval(async () => {
      tries += 1
      const profile = await loadProfile(accountId).catch(() => null)
      if (cancelled) return
      if (profile && profile.plan !== 'free') {
        clearInterval(timer)
        const paidBits = { planKey: profile.plan, managementUrls: profile.managementUrls, nextBilledAt: profile.nextBilledAt }
        setAccount((prev) => (prev ? { ...prev, ...paidBits } : prev))
        if (cache?.account) cache.account = { ...cache.account, ...paidBits }
        toast('Your plan is active. Thank you!', { celebration: true, icon: 'sprout' })
      } else if (tries >= 20) {
        // ~60s. The payment is Paddle's to keep either way, so say that plainly
        // rather than leaving them staring at a free plan they just paid to leave.
        clearInterval(timer)
        toast('Payment received, but the plan is still updating. Refresh in a minute, or write to us.', { icon: 'mail' })
      }
    }, 3000)
    return () => { cancelled = true; clearInterval(timer) }
  }, [accountId, toast])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pv_compare')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved !== null) setCompareState(saved === '1')
    } catch (e) {}
  }, [])

  useEffect(() => { if (cache) cache.sites = sites }, [sites])

  // A locked range (e.g. after a downgrade) falls back to 7 days, as in the reference.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (account && !rangeAllowed(range, planKey)) setRangeState('7')
  }, [account, planKey, range])

  const setRange = useCallback((value) => { setRangeState(value); if (cache) cache.range = value }, [])
  const setCompare = useCallback((value) => {
    setCompareState(value)
    try { localStorage.setItem('pv_compare', value ? '1' : '0') } catch (e) {}
  }, [])

  const celebrate = useCallback((siteId) => {
    try {
      if (localStorage.getItem(`pv_celebrated_${siteId}`) === '1') return
      localStorage.setItem(`pv_celebrated_${siteId}`, '1')
    } catch (e) {}
    toast('Your first visits are in. Welcome aboard!', { celebration: true, icon: 'sprout' })
  }, [toast])

  // First-visitor watch: the app's existing ActivationStatus poll (every 5s).
  const waitingIds = sites.filter((site) => site.tracking === false).map((site) => site.id).join(',')
  useEffect(() => {
    if (!waitingIds) return
    const ids = waitingIds.split(',')
    const check = async () => {
      for (const id of ids) {
        const count = await countPageviews(id).catch(() => 0)
        if (count > 0) {
          setSites((current) => current.map((site) => (site.id === id ? { ...site, tracking: true } : site)))
          celebrate(id)
        }
      }
    }
    const interval = setInterval(check, 5000)
    return () => clearInterval(interval)
  }, [waitingIds, celebrate])

  // "Reading now": the existing /api/active-count, polled every 20s, paid plans only.
  const trackingIds = sites.filter((site) => site.tracking).map((site) => site.id).join(',')
  useEffect(() => {
    if (!paid || !trackingIds) return
    const ids = trackingIds.split(',')
    const poll = async () => {
      const counts = await Promise.all(ids.map(async (id) => [id, await fetchActiveCount(id)]))
      setLive(Object.fromEntries(counts))
      if (cache) cache.live = Object.fromEntries(counts)
    }
    poll()
    const interval = setInterval(poll, 20000)
    return () => clearInterval(interval)
  }, [paid, trackingIds])

  const actions = useMemo(() => ({
    async addSite({ name, domain }) {
      if (!account) return null
      const { data, error } = await supabase.from('sites').insert({ user_id: account.id, name, domain }).select().single()
      if (error || !data) { toast(error?.message || 'Could not add that site', { icon: 'info' }); return null }
      setSites((current) => [toSite(data, current.length, false), ...current])
      return data.id
    },
    async removeSite(siteId) {
      // Clean up the site's own data first, in case the DB doesn't cascade-delete it.
      await Promise.all([
        supabase.from('pageviews').delete().eq('site_id', siteId),
        supabase.from('events').delete().eq('site_id', siteId),
        supabase.from('heartbeats').delete().eq('site_id', siteId),
      ])
      const { error } = await supabase.from('sites').delete().eq('id', siteId)
      if (error) { toast(error.message, { icon: 'info' }); return false }
      setSites((current) => current.filter((site) => site.id !== siteId))
      if (cache) cache.sites = cache.sites.filter((site) => site.id !== siteId)
      toast('Site removed', { icon: 'check' })
      router.push(buildPaths('real').home)
      return true
    },
    async verifyInstall(siteId) {
      const count = await countPageviews(siteId).catch(() => 0)
      if (count > 0) {
        setSites((current) => current.map((site) => (site.id === siteId ? { ...site, tracking: true } : site)))
        celebrate(siteId)
      } else {
        toast('Listening for your first visitor…', { icon: 'activity' })
      }
    },
    async setShared(siteId, shared) {
      const { error } = await supabase.from('sites').update({ public_enabled: shared }).eq('id', siteId)
      if (error) { toast(error.message, { icon: 'info' }); return false }
      setSites((current) => current.map((site) => (site.id === siteId ? { ...site, shared } : site)))
      toast(shared ? 'Public page is live' : 'Public page turned off', { icon: 'link' })
      return true
    },
    async setSharePassword(siteId, password) {
      const hashed = await hashSharePassword(password)
      const { error } = await supabase.from('sites').update({ share_password: hashed }).eq('id', siteId)
      if (error) { toast(error.message, { icon: 'info' }); return false }
      setSites((current) => current.map((site) => (site.id === siteId ? { ...site, passwordEnabled: !!hashed } : site)))
      toast(hashed ? 'Password protection on' : 'Password protection off', { icon: 'lock' })
      return true
    },
    exportCsv(site, rows, currentRange) {
      if (!isPaidPlan(planKey)) { router.push(buildPaths('real').pricing); return }
      downloadPageviewsCsv(site, rows || [], currentRange)
      toast('CSV export started', { icon: 'download' })
    },
    // Every site in one file. Unlike the per-site export, the rows are not already on
    // screen, so they are fetched here -- one request per site, which is at most 30.
    async exportAllCsv(currentRange) {
      if (!isMaxPlan(planKey)) { router.push(buildPaths('real').pricing); return }
      if (!sites.length) { toast('No sites to export yet', { icon: 'info' }); return }
      toast('Gathering every site…', { icon: 'download' })
      try {
        const since = rangeWindow(currentRange).start
        const sections = await Promise.all(
          sites.map(async (site) => ({ site, pageviews: await fetchSitePageviews(site.id, since) }))
        )
        downloadCombinedCsv(sections, currentRange)
        toast('CSV export started', { icon: 'download' })
      } catch (err) {
        toast('Could not build the export. Please try again.', { icon: 'info' })
      }
    },
    async logout() {
      await supabase.auth.signOut()
      cache = null
      router.push('/login')
    },
    // Returns { error } or { notice } so the form can show it inline (toasts vanish too fast).
    async updateAccount(name, email) {
      const updates = {}
      if (name && name !== account.savedName) updates.data = { name }
      if (email && email !== account.email) updates.email = email
      if (!updates.data && !updates.email) return {}
      const { error } = await supabase.auth.updateUser(updates)
      if (error) return { error: error.message }
      if (updates.data) {
        setAccount((current) => ({ ...current, name, savedName: name }))
        if (cache) cache.account = { ...cache.account, name, savedName: name }
      }
      toast('Changes saved', { icon: 'check' })
      // Changing the email needs a confirmation click before it takes effect, so the account's
      // email stays the old one until the link is opened. Supabase may also mail the old address.
      if (updates.email) return { notice: `We sent a confirmation link to ${updates.email}. Open it, and open the one sent to your current email too if you got one. Your email changes only after that.` }
      return {}
    },
    // Returns the error message, or null when the password was updated.
    async changePassword(password) {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) return error.message
      toast('Password updated', { icon: 'check' })
      return null
    },
  }), [account, planKey, sites, router, toast, celebrate])

  const totalLive = Object.values(live).reduce((sum, value) => sum + (value || 0), 0)

  const value = useMemo(() => ({
    mode: 'real',
    isDemo: false,
    ready: !!account,
    paths: buildPaths('real'),
    user: account ? { name: account.name, email: account.email, initial: account.name[0].toUpperCase() } : null,
    planKey,
    plan: planFor(planKey),
    isPaid: paid,
    isMax: isMaxPlan(planKey),
    // Paddle's own cancel / update-card pages, and the next charge date. Null until a
    // subscription webhook has filled them in, so the UI must cope with not having them.
    billing: { managementUrls: account?.managementUrls || null, nextBilledAt: account?.nextBilledAt || null },
    sites,
    getSite: (id) => sites.find((site) => site.id === id),
    range, setRange, compare, setCompare,
    digest: true,
    live: paid ? live : {},
    totalLive: paid ? totalLive : null,
    liveFor: (id) => (paid ? (live[id] ?? null) : null),
    openDialog, closeDialog, toast,
    actions,
    hooks: { useDashboardStats, useSiteStats, useOverviewStats },
  }), [account, planKey, paid, sites, range, setRange, compare, setCompare, live, totalLive, openDialog, closeDialog, toast, actions])

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
      {host}
    </WorkspaceContext.Provider>
  )
}

/* ---------- data hooks ---------- */

function useDashboardStats(ws) {
  const { ready, range } = ws
  const ids = ws.sites.map((site) => site.id).join(',')
  const [stats, setStats] = useState({ loading: true, perSite: {}, totals: { views: 0, growth: null } })

  useEffect(() => {
    if (!ready) return
    let cancelled = false
    const list = ids ? ids.split(',') : []
    const period = rangeWindow(range)
    const week = rangeWindow('7')
    ;(async () => {
      try {
        const [counts, weekRows] = await Promise.all([
          Promise.all(list.map(async (id) => [id, ...(await Promise.all([
            countPageviews(id, { since: period.start }),
            period.previous ? countPageviews(id, { since: period.previous.start, until: period.previous.end }) : null,
          ]))])),
          list.length ? fetchPageviewTimes(list, week.start) : [],
        ])
        if (cancelled) return
        const perSite = {}
        let views = 0
        let previous = 0
        for (const [id, current, before] of counts) {
          views += current
          previous += before || 0
          perSite[id] = { views: current, growth: before === null ? null : growthPercent(current, before), series: bucketCounts(weekRows.filter((row) => row.site_id === id), week.buckets) }
        }
        setStats({ loading: false, perSite, totals: { views, growth: period.previous ? growthPercent(views, previous) : null } })
      } catch (error) {
        console.error('Dashboard stats failed', error)
        if (!cancelled) setStats((current) => ({ ...current, loading: false }))
      }
    })()
    return () => { cancelled = true }
  }, [ready, ids, range])

  return stats
}

const EMPTY_SITE_STATS = { loading: true, views: 0, growth: null, perDay: 0, topPage: null, pages: [], referrers: [], devices: [], events: [], eventTotal: 0, chart: { labels: [], values: [], previous: null }, rows: [] }

function useSiteStats(ws, siteId) {
  const { ready, range, isPaid } = ws
  const site = ws.sites.find((item) => item.id === siteId)
  const tracking = !!site?.tracking
  const [stats, setStats] = useState(EMPTY_SITE_STATS)

  useEffect(() => {
    if (!ready || !tracking) return
    let cancelled = false
    ;(async () => {
      try {
        const rows = await fetchSitePageviews(siteId, rangeWindow(range).start)
        const period = rangeWindow(range, { firstDate: rows[0]?.created_at })
        const [previousRows, events] = await Promise.all([
          period.previous ? fetchPageviewTimes(siteId, period.previous.start, period.previous.end) : [],
          isPaid ? fetchSiteEvents(siteId, period.start) : [],
        ])
        if (cancelled) return
        const views = rows.length
        const pages = countBy(rows, (row) => row.page_url)
        setStats({
          loading: false,
          views,
          growth: period.previous ? growthPercent(views, previousRows.length) : null,
          perDay: Math.round(views / period.days),
          topPage: pages[0] ? { name: pages[0].name, share: views ? pages[0].count / views * 100 : 0 } : null,
          pages,
          referrers: countBy(rows, (row) => referrerName(row.referrer)),
          devices: countBy(rows, (row) => row.device_type || 'Unknown', 0),
          events: countBy(events, (row) => row.event_name, 0),
          eventTotal: events.length,
          chart: { labels: period.buckets.map((bucket) => bucket.label), values: bucketCounts(rows, period.buckets), previous: previousBucketCounts(previousRows, period) },
          rows,
        })
      } catch (error) {
        console.error('Site stats failed', error)
        if (!cancelled) setStats((current) => ({ ...current, loading: false }))
      }
    })()
    return () => { cancelled = true }
  }, [ready, tracking, siteId, range, isPaid])

  return stats
}

function useOverviewStats(ws) {
  const { ready, range, isMax } = ws
  const ids = ws.sites.map((site) => site.id).join(',')
  const [stats, setStats] = useState({ loading: true, rows: [], totals: { views: 0, growth: null }, chart: { labels: [], series: [] }, bestGrower: null })

  useEffect(() => {
    if (!ready || !isMax) return
    let cancelled = false
    const list = ids ? ids.split(',') : []
    ;(async () => {
      try {
        const rows = list.length ? await fetchPageviewTimes(list, rangeWindow(range).start) : []
        const period = rangeWindow(range, { firstDate: rows[0]?.created_at })
        const previousCounts = period.previous
          ? Object.fromEntries(await Promise.all(list.map(async (id) => [id, await countPageviews(id, { since: period.previous.start, until: period.previous.end })])))
          : {}
        if (cancelled) return
        const bySite = Object.fromEntries(list.map((id) => [id, rows.filter((row) => row.site_id === id)]))
        const total = rows.length
        const previousTotal = Object.values(previousCounts).reduce((sum, count) => sum + count, 0)
        const siteRows = ws.sites.map((site) => ({
          site,
          views: bySite[site.id].length,
          growth: period.previous ? growthPercent(bySite[site.id].length, previousCounts[site.id]) : null,
          share: total ? bySite[site.id].length / total * 100 : 0,
        })).sort((a, b) => b.views - a.views)
        const growers = siteRows.filter((row) => row.growth !== null).sort((a, b) => b.growth - a.growth)
        setStats({
          loading: false,
          rows: siteRows,
          totals: { views: total, growth: period.previous ? growthPercent(total, previousTotal) : null },
          chart: {
            labels: period.buckets.map((bucket) => bucket.label),
            series: siteRows.filter((row) => row.site.tracking).map((row) => ({ id: row.site.id, name: row.site.name, values: bucketCounts(bySite[row.site.id], period.buckets) })),
          },
          // With no pageviews in the range there is nothing to crown.
          bestGrower: total ? (growers[0] || siteRows[0]) : null,
        })
      } catch (error) {
        console.error('Overview stats failed', error)
        if (!cancelled) setStats((current) => ({ ...current, loading: false }))
      }
    })()
    return () => { cancelled = true }
    // ws.sites is keyed by ids above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, isMax, ids, range])

  return stats
}
