'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
]

export default function SiteDetail() {
  const [site, setSite] = useState(null)
  const [pageviews, setPageviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState(7)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const params = useParams()
  const siteId = params.siteId

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: siteData } = await supabase.from('sites').select('*').eq('id', siteId).single()
      setSite(siteData)

      const since = new Date()
      since.setDate(since.getDate() - range)

      const { data: pvData } = await supabase
        .from('pageviews')
        .select('*')
        .eq('site_id', siteId)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: true })
      setPageviews(pvData || [])
      setLoading(false)
    }
    load()
  }, [siteId, router, range])

  const togglePublic = async () => {
    const newValue = !site.public_enabled
    const { error } = await supabase.from('sites').update({ public_enabled: newValue }).eq('id', siteId)
    if (!error) setSite({ ...site, public_enabled: newValue })
  }

  const copyLink = () => {
    const url = `${window.location.origin}/share/${siteId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <p className="p-6 text-stone-500 text-sm">Loading...</p>
  if (!site) return <p className="p-6 text-stone-500 text-sm">Site not found</p>

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

  const refCounts = {}
  pageviews.forEach((pv) => {
    const ref = pv.referrer || 'Direct'
    refCounts[ref] = (refCounts[ref] || 0) + 1
  })
  const topReferrers = Object.entries(refCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const deviceCounts = {}
  pageviews.forEach((pv) => {
    const device = pv.device_type || 'Unknown'
    deviceCounts[device] = (deviceCounts[device] || 0) + 1
  })
  const topDevices = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1])

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto p-6">
        <button onClick={() => router.push('/dashboard')} className="text-sm text-stone-500 hover:text-[#1F6F5C] transition-colors mb-4">← Back</button>

        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{site.name}</h1>
            <p className="text-stone-500 text-sm">{site.domain}</p>
          </div>
          <div className="flex bg-white border border-stone-200 rounded-lg p-1">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setRange(r.days)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  range === r.days ? 'bg-[#1F6F5C] text-white' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-stone-900">Public dashboard</p>
            <p className="text-xs text-stone-500">Anyone with the link can view stats — no login needed</p>
          </div>
          <div className="flex items-center gap-3">
            {site.public_enabled && (
              <button onClick={copyLink} className="text-xs font-medium text-[#1F6F5C] border border-[#1F6F5C] rounded-lg px-3 py-1.5 hover:bg-[#1F6F5C] hover:text-white transition-colors">
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            )}
            <button
              onClick={togglePublic}
              className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 ${site.public_enabled ? 'bg-[#1F6F5C] justify-end' : 'bg-stone-300 justify-start'}`}
            >
              <span className="w-5 h-5 bg-white rounded-full shadow-sm" />
            </button>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-4">
          <p className="text-sm font-medium text-stone-900">Exclude your own visits</p>
          <p className="text-xs text-stone-500 mt-1 mb-2">Open this link once in your browser — your visits won&apos;t be tracked after that.</p>
          <code className="block bg-stone-50 border border-stone-200 text-xs font-mono p-2.5 rounded-lg overflow-x-auto text-stone-700">
            {`https://${site.domain}?pv_exclude=1`}
          </code>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-4">
          <p className="text-4xl font-mono font-bold text-[#1F6F5C]">{totalViews}</p>
          <p className="text-sm text-stone-500 mt-1">Pageviews — last {range} days</p>
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

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-5">
            <h2 className="font-medium text-stone-900 mb-3 text-sm">Top Pages</h2>
            {topPages.length === 0 && <p className="text-sm text-stone-400">No data yet</p>}
            {topPages.map(([page, count]) => (
              <div key={page} className="flex justify-between text-sm py-1.5 border-t border-stone-100 first:border-0">
                <span className="truncate text-stone-700">{page}</span>
                <span className="text-stone-400 font-mono">{count}</span>
              </div>
            ))}
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-5">
            <h2 className="font-medium text-stone-900 mb-3 text-sm">Top Referrers</h2>
            {topReferrers.length === 0 && <p className="text-sm text-stone-400">No data yet</p>}
            {topReferrers.map(([ref, count]) => (
              <div key={ref} className="flex justify-between text-sm py-1.5 border-t border-stone-100 first:border-0">
                <span className="truncate text-stone-700">{ref}</span>
                <span className="text-stone-400 font-mono">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 mt-4">
          <h2 className="font-medium text-stone-900 mb-3 text-sm">Devices</h2>
          {topDevices.length === 0 && <p className="text-sm text-stone-400">No data yet</p>}
          {topDevices.map(([device, count]) => (
            <div key={device} className="flex justify-between text-sm py-1.5 border-t border-stone-100 first:border-0">
              <span className="text-stone-700">{device}</span>
              <span className="text-stone-400 font-mono">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}