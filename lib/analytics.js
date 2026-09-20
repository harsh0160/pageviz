// Pure helpers that turn raw pageview rows into what the reference design
// shows: range windows, chart buckets, top-N lists, growth. Used by the real
// workspace, the public share page, and (for formatting) the demo.

export const formatNumber = (value) => new Intl.NumberFormat('en-US').format(Math.round(value || 0))
export const compactNumber = (value) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value || 0)

// Range picker options from the reference's rangePicker(): value, label, and the
// plan needed to unlock it (30/90/365 days need a paid plan, all time needs Max).
export const RANGE_OPTIONS = [
  { value: '1', label: 'Today', needs: null },
  { value: '7', label: 'Last 7 days', needs: null },
  { value: '30', label: 'Last 30 days', needs: 'pro' },
  { value: '90', label: 'Last 90 days', needs: 'pro' },
  { value: '365', label: 'Last 12 months', needs: 'pro' },
  { value: 'all', label: 'All time', needs: 'business' },
]

export function rangeAllowed(range, planKey) {
  const option = RANGE_OPTIONS.find((item) => item.value === range)
  if (!option || !option.needs) return true
  if (option.needs === 'pro') return planKey === 'pro' || planKey === 'business'
  return planKey === 'business'
}

export const rangeCaption = (range) => (range === 'all' ? 'all time' : `last ${range === '1' ? 'day' : `${range} days`}`)

const startOfDay = (date) => { const copy = new Date(date); copy.setHours(0, 0, 0, 0); return copy }
const addDays = (date, days) => { const copy = new Date(date); copy.setDate(copy.getDate() + days); return copy }
const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1)
const addMonths = (date, months) => new Date(date.getFullYear(), date.getMonth() + months, 1)
const shiftMonths = (date, months) => { const copy = new Date(date); copy.setMonth(copy.getMonth() + months); return copy }
const dayLabel = (date) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)

// Window + chart buckets for a range, in the visitor's local time. Bucket counts
// follow the reference's chartData(): 24 hours, 7 days, 30 days, 30 three-day
// buckets for 90 days, 12 months, and months since the first pageview for all time.
export function rangeWindow(range, { now = new Date(), firstDate = null } = {}) {
  const end = now
  let start
  let buckets = []

  if (range === '1') {
    start = startOfDay(now)
    buckets = Array.from({ length: 24 }, (_, hour) => {
      const bucketStart = new Date(start); bucketStart.setHours(hour)
      const bucketEnd = new Date(start); bucketEnd.setHours(hour + 1)
      return { start: bucketStart, end: bucketEnd, label: `${hour % 12 || 12}${hour < 12 ? 'am' : 'pm'}` }
    })
  } else if (range === '365' || range === 'all') {
    let first = addMonths(startOfMonth(now), -11)
    if (range === 'all') {
      first = firstDate ? startOfMonth(new Date(firstDate)) : startOfMonth(now)
      if (first >= startOfMonth(now)) first = addMonths(startOfMonth(now), -1)
    }
    start = range === 'all' ? null : first
    const months = (now.getFullYear() - first.getFullYear()) * 12 + now.getMonth() - first.getMonth() + 1
    buckets = Array.from({ length: months }, (_, index) => {
      const bucketStart = addMonths(first, index)
      return {
        start: bucketStart,
        end: addMonths(first, index + 1),
        label: new Intl.DateTimeFormat('en-US', { month: 'short', ...(range === 'all' ? { year: '2-digit' } : {}) }).format(bucketStart),
      }
    })
  } else {
    const days = Number(range) || 7
    const size = days === 90 ? 3 : 1
    start = addDays(startOfDay(now), -(days - 1))
    buckets = Array.from({ length: days / size }, (_, index) => {
      const bucketStart = addDays(start, index * size)
      return { start: bucketStart, end: addDays(bucketStart, size), label: dayLabel(bucketStart) }
    })
  }

  // Previous period = the same elapsed span, shifted back one period, so a
  // half-finished today is compared with the same hours of yesterday.
  let previous = null
  if (range === '365') {
    previous = { start: addMonths(start, -12), end: shiftMonths(end, -12), shiftMonths: 12 }
  } else if (range !== 'all') {
    const shiftDays = range === '1' ? 1 : Number(range)
    previous = { start: addDays(start, -shiftDays), end: addDays(end, -shiftDays), shiftDays }
  }

  const days = range === 'all'
    ? Math.max(1, Math.ceil((now - (firstDate ? new Date(firstDate) : now)) / 86400000))
    : range === '1' ? 1 : range === '365' ? 365 : Number(range)

  return { range, start, end, previous, buckets, days }
}

// Counts rows (sorted or not) into buckets by created_at.
export function bucketCounts(rows, buckets) {
  const counts = new Array(buckets.length).fill(0)
  if (!buckets.length) return counts
  const edges = buckets.map((bucket) => bucket.start.getTime())
  const last = buckets[buckets.length - 1].end.getTime()
  for (const row of rows) {
    const time = new Date(row.created_at).getTime()
    if (time < edges[0] || time >= last) continue
    let low = 0
    let high = edges.length - 1
    while (low < high) {
      const mid = (low + high + 1) >> 1
      if (edges[mid] <= time) low = mid
      else high = mid - 1
    }
    counts[low] += 1
  }
  return counts
}

// Previous-period series aligned to the current buckets (for the dashed line).
export function previousBucketCounts(rows, window) {
  if (!window.previous) return null
  const shifted = window.buckets.map((bucket) => (window.previous.shiftMonths
    ? { start: addMonths(bucket.start, -12), end: addMonths(bucket.end, -12) }
    : { start: addDays(bucket.start, -window.previous.shiftDays), end: addDays(bucket.end, -window.previous.shiftDays) }))
  return bucketCounts(rows, shifted)
}

export function countBy(rows, keyFn, limit = 5) {
  const counts = new Map()
  for (const row of rows) {
    const key = keyFn(row)
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  const sorted = [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
  return limit ? sorted.slice(0, limit) : sorted
}

// "https://example.com/" → "example.com". Sites added before the redesign stored
// the domain exactly as typed, so every read goes through this too.
export const cleanDomain = (domain) => String(domain || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '')

// "https://www.google.com/search?q=…" → "google.com"; empty → "Direct / None".
export function referrerName(referrer) {
  if (!referrer) return 'Direct / None'
  try { return new URL(referrer).hostname.replace(/^www\./, '') || referrer } catch { return referrer }
}

export function growthPercent(current, previous) {
  if (!previous) return null
  return ((current / previous) - 1) * 100
}

export function dateLabel(range, now = new Date(), firstDate = null) {
  const long = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const short = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
  const monthYear = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' })
  if (range === '1') return long.format(now)
  if (range === 'all') return firstDate ? `${monthYear.format(new Date(firstDate))} – ${monthYear.format(now)}` : `Until ${monthYear.format(now)}`
  const start = rangeWindow(range, { now }).start
  return `${short.format(start)} – ${short.format(now)}, ${now.getFullYear()}`
}

const csvCell = (cell) => `"${String(cell).replace(/"/g, '""')}"`
const rangeSuffix = (range) => (range === 'all' ? 'all' : `${range}d`)

function downloadCsv(filename, header, rows) {
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const pageviewRow = (pv) => [pv.created_at, pv.page_url, pv.referrer || 'Direct', pv.device_type || 'Unknown']

// The app's existing CSV export (moved from app/dashboard/[siteId]/page.js), unchanged columns.
export function downloadPageviewsCsv(site, pageviews, range) {
  downloadCsv(
    `${site.name.replace(/\s+/g, '-').toLowerCase()}-pageviews-${rangeSuffix(range)}.csv`,
    ['date', 'page_url', 'referrer', 'device_type'],
    pageviews.map(pageviewRow)
  )
}

// Every site in one file -- the same columns as above with the site name in front,
// which is the whole point of the Max "all sites together" view. Takes
// [{ site, pageviews }] so the caller decides how the rows were fetched.
export function downloadCombinedCsv(sections, range) {
  downloadCsv(
    `pageviz-all-sites-${rangeSuffix(range)}.csv`,
    ['site', 'date', 'page_url', 'referrer', 'device_type'],
    sections.flatMap(({ site, pageviews }) => pageviews.map((pv) => [site.name, ...pageviewRow(pv)]))
  )
}

// The app's existing share-password hashing (SHA-256, hex) — share-auth compares against this.
export async function hashSharePassword(password) {
  if (!password) return null
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export const SITE_COLORS = ['forest', 'pink', 'sand', 'lavender']
export const monogramFor = (name) => (String(name || '').trim()[0] || 'n').toLowerCase()
