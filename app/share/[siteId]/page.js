'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ShareView from '../../_components/ShareView'
import { rangeWindow, bucketCounts, countBy, referrerName, growthPercent, dateLabel, monogramFor, cleanDomain } from '@/lib/analytics'
import { fetchActiveCount } from '@/lib/workspace-queries'
import { usePageTitle } from '../../_components/workspace/context'

// Pure data-fetching helper, kept outside the component: it never calls
// setState itself, it just returns a result the caller decides what to do
// with. Keeps the useEffect and the password-submit handler as the only
// places that touch component state.
async function fetchShareData(siteId, password) {
  try {
    const res = await fetch('/api/share-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId, password: password || '' }),
    })
    if (res.status === 404) return { notFound: true }
    if (res.status === 401) return { needsPassword: true }
    // A server error (or a network drop) used to leave the page on "Loading…" forever.
    if (!res.ok) return { failed: true }
    const data = await res.json()
    return { site: data.site, pageviews: data.pageviews, retentionDays: data.retentionDays }
  } catch {
    return { failed: true }
  }
}

// The design shows the last 30 days; a Free owner's link only holds 7 days of data.
function buildStats(pageviews, retentionDays, siteDomain) {
  const range = retentionDays !== null && retentionDays < 30 ? '7' : '30'
  const period = rangeWindow(range)
  const current = pageviews.filter((pv) => new Date(pv.created_at) >= period.start)
  const coversPrevious = retentionDays === null || retentionDays >= Number(range) * 2
  const previous = coversPrevious ? pageviews.filter((pv) => { const time = new Date(pv.created_at); return time >= period.previous.start && time < period.previous.end }).length : null
  const pages = countBy(current, (pv) => pv.page_url)
  return {
    range,
    views: current.length,
    growth: previous === null ? null : growthPercent(current.length, previous),
    topPage: pages[0] ? { name: pages[0].name, share: pages[0].count / current.length * 100 } : null,
    pages,
    referrers: countBy(current, (pv) => referrerName(pv.referrer, siteDomain)),
    chart: { labels: period.buckets.map((bucket) => bucket.label), values: bucketCounts(current, period.buckets), previous: null },
  }
}

export default function PublicShare() {
  const { siteId } = useParams()
  const [result, setResult] = useState({ status: 'loading' })
  const [live, setLive] = useState(null)

  const accept = (data) => {
    const stats = buildStats(data.pageviews || [], data.retentionDays, data.site?.domain)
    setResult({ status: 'ready', site: { ...data.site, domain: cleanDomain(data.site.domain), monogram: monogramFor(data.site.name), color: 'forest' }, stats, retentionDays: data.retentionDays })
  }
  usePageTitle(result.status === 'ready' ? `${result.site.name} — Shared stats` : result.status === 'not-shared' ? 'Not shared — Pageviz' : null)

  useEffect(() => {
    let cancelled = false
    fetchShareData(siteId).then((data) => {
      if (cancelled) return
      if (data.failed) setResult({ status: 'error' })
      else if (data.notFound) setResult({ status: 'not-shared' })
      else if (data.needsPassword) setResult({ status: 'locked' })
      else accept(data)
    })
    return () => { cancelled = true }
  }, [siteId])

  // "Reading now" via the existing /api/active-count — only for paid owners (Free keeps 7 days).
  const paidOwner = result.status === 'ready' && result.retentionDays !== 7
  useEffect(() => {
    if (!paidOwner) return
    const poll = () => fetchActiveCount(siteId).then(setLive)
    poll()
    const interval = setInterval(poll, 20000)
    return () => clearInterval(interval)
  }, [paidOwner, siteId])

  const unlock = async (password) => {
    const data = await fetchShareData(siteId, password)
    if (data.failed) { setResult({ status: 'error' }); return true }
    if (data.notFound) { setResult({ status: 'not-shared' }); return true }
    if (data.needsPassword) return false
    accept(data)
    return true
  }

  const range = result.stats?.range || '30'
  return (
    <ShareView
      status={result.status}
      site={result.site}
      stats={result.stats}
      live={paidOwner ? (live ?? 0) : null}
      rangeText={`Last ${range} days · ${dateLabel(range)}`}
      onUnlock={unlock}
    />
  )
}
