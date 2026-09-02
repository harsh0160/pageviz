'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Pure data-fetching helper, kept outside the component: it never calls
// setState itself, it just returns a result the caller decides what to do
// with. Keeps the useEffect and the password-submit handler as the only
// places that touch component state.
async function fetchShareData(siteId, password) {
  const res = await fetch('/api/share-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ siteId, password: password || '' }),
  })
  if (res.status === 404) return { notFound: true }
  if (res.status === 401) return { needsPassword: true }
  const data = await res.json()
  return { site: data.site, pageviews: data.pageviews, retentionDays: data.retentionDays }
}

export default function PublicShare() {
  const params = useParams()
  const siteId = params.siteId
  const [site, setSite] = useState(null)
  const [pageviews, setPageviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [needsPassword, setNeedsPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [retentionDays, setRetentionDays] = useState(30)

  useEffect(() => {
    let cancelled = false
    fetchShareData(siteId).then((result) => {
      if (cancelled) return
      if (result.notFound) setNotFound(true)
      else if (result.needsPassword) setNeedsPassword(true)
      else { setSite(result.site); setPageviews(result.pageviews); setRetentionDays(result.retentionDays) }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [siteId])

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await fetchShareData(siteId, password)
    if (result.notFound) setNotFound(true)
    else if (result.needsPassword) setError('Incorrect password')
    else { setSite(result.site); setPageviews(result.pageviews); setRetentionDays(result.retentionDays); setNeedsPassword(false) }
    setLoading(false)
  }

  if (loading) return <p className="p-6 text-stone-500 text-sm">Loading...</p>
  if (notFound) return <p className="p-6 text-stone-500 text-sm">This dashboard is private or doesn&apos;t exist.</p>

  if (needsPassword) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <form onSubmit={handlePasswordSubmit} className="bg-white border border-stone-200 rounded-2xl p-6 w-full max-w-sm">
          <p className="font-medium text-stone-900 mb-1">Password protected</p>
          <p className="text-sm text-stone-500 mb-4">Enter the password to view this dashboard.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6F5C]/25 focus:border-[#1F6F5C] mb-2"
            placeholder="Password"
            autoFocus
          />
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
          <button type="submit" className="w-full bg-[#1F6F5C] hover:bg-[#195C4C] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
            View dashboard
          </button>
        </form>
      </div>
    )
  }

  const totalViews = pageviews.length
  const viewsByDay = {}
  pageviews.forEach((pv) => {
    const day = pv.created_at.slice(0, 10)
    viewsByDay[day] = (viewsByDay[day] || 0) + 1
  })
  const chartData = Object.entries(viewsByDay).map(([date, count]) => ({ date, count }))

  const pageCounts = {}
  pageviews.forEach((pv) => { pageCounts[pv.page_url] = (pageCounts[pv.page_url] || 0) + 1 })
  const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{site.name}</h1>
        <p className="text-stone-500 text-sm mb-6">{site.domain} · {retentionDays ? `last ${retentionDays} days` : 'all-time'}</p>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-4">
          <p className="text-4xl font-mono font-bold text-[#1F6F5C]">{totalViews}</p>
          <p className="text-sm text-stone-500 mt-1">Pageviews</p>
        </div>

        {chartData.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-4" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E0" />
                <XAxis dataKey="date" fontSize={12} stroke="#a8a29e" />
                <YAxis allowDecimals={false} fontSize={12} stroke="#a8a29e" />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E7E5E0', fontSize: 13 }} />
                <Line type="monotone" dataKey="count" stroke="#1F6F5C" strokeWidth={2} dot={{ fill: '#1F6F5C', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <h2 className="font-medium text-stone-900 mb-3 text-sm">Top Pages</h2>
          {topPages.map(([page, count]) => (
            <div key={page} className="flex justify-between text-sm py-1.5 border-t border-stone-100 first:border-0">
              <span className="truncate text-stone-700">{page}</span>
              <span className="text-stone-400 font-mono">{count}</span>
            </div>
          ))}
        </div>

        <Link href="/" className="block text-center text-xs text-stone-400 mt-6 hover:text-[#1F6F5C] transition-colors">
          Powered by Pageviz — free privacy-friendly analytics
        </Link>
      </div>
    </div>
  )
}
