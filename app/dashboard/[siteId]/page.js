'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
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
  const [plan, setPlan] = useState('free')
  const [sharePassword, setSharePassword] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [events, setEvents] = useState([])
  const [activeNow, setActiveNow] = useState(null)
  const router = useRouter()
  const params = useParams()
  const siteId = params.siteId
  const isPaid = plan === 'pro' || plan === 'business'

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profileData } = await supabase.from('profiles').select('plan').eq('id', user.id).maybeSingle()
      setPlan(profileData?.plan || 'free')
      const { data: siteData } = await supabase.from('sites').select('*').eq('id', siteId).single()
      setSite(siteData)
      setSharePassword(siteData?.share_password || '')

      const since = new Date()
      since.setDate(since.getDate() - range)

      const { data: pvData } = await supabase
        .from('pageviews')
        .select('*')
        .eq('site_id', siteId)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: true })
      setPageviews(pvData || [])

      const { data: eventData } = await supabase
        .from('events')
        .select('event_name, created_at')
        .eq('site_id', siteId)
        .gte('created_at', since.toISOString())
      setEvents(eventData || [])
      setLoading(false)
    }
    load()
  }, [siteId, router, range])

  useEffect(() => {
    if (!isPaid || !siteId) return
    const poll = () => {
      fetch(`/api/active-count?site_id=${siteId}`)
        .then((r) => r.json())
        .then((d) => setActiveNow(typeof d.active === 'number' ? d.active : null))
        .catch(() => {})
    }
    poll()
    const interval = setInterval(poll, 20000)
    return () => clearInterval(interval)
  }, [isPaid, siteId])

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

  const saveSharePassword = async () => {
  const hashed = sharePassword
    ? Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sharePassword))))
        .map(b => b.toString(16).padStart(2, '0')).join('')
    : null
  const { error } = await supabase.from('sites').update({ share_password: hashed }).eq('id', siteId)
  if (!error) { setPasswordSaved(true); setTimeout(() => setPasswordSaved(false), 2000) }
}
  const exportCSV = () => {
    const header = ['date', 'page_url', 'referrer', 'device_type']
    const rows = pageviews.map((pv) => [
      pv.created_at,
      pv.page_url,
      pv.referrer || 'Direct',
      pv.device_type || 'Unknown',
    ])
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${site.name.replace(/\s+/g, '-').toLowerCase()}-pageviews-${range}d.csv`
    a.click()
    URL.revokeObjectURL(url)
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

  const eventCounts = {}
  events.forEach((ev) => { eventCounts[ev.event_name] = (eventCounts[ev.event_name] || 0) + 1 })
  const topEvents = Object.entries(eventCounts).sort((a, b) => b[1] - a[1])

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto p-6">
        <button onClick={() => router.push('/dashboard')} className="text-sm text-stone-500 hover:text-[#195C4C] transition-colors mb-4">← Back</button>

        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{site.name}</h1>
            <p className="text-stone-500 text-sm flex items-center gap-2">
              {site.domain}
              {isPaid && activeNow !== null && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  {activeNow} active now
                </span>
              )}
            </p>
          </div>
          <div className="flex bg-white border border-stone-200 rounded-lg p-1">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setRange(r.days)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  range === r.days ? 'bg-[#195C4C] text-white' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {isPaid ? (
          <button onClick={exportCSV} className="text-xs font-medium text-[#195C4C] border border-[#195C4C] rounded-lg px-3 py-1.5 hover:bg-[#195C4C] hover:text-white transition-colors mb-4">
            Export CSV
          </button>
        ) : (
          <Link href="/pricing" className="inline-block text-xs text-stone-400 hover:text-[#195C4C] mb-4">
            CSV export is on Pro →
          </Link>
        )}

        <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-stone-900">Public dashboard</p>
            <p className="text-xs text-stone-500">Anyone with the link can view stats — no login needed</p>
          </div>
          <div className="flex items-center gap-3">
            {site.public_enabled && (
              <button onClick={copyLink} className="text-xs font-medium text-[#195C4C] border border-[#195C4C] rounded-lg px-3 py-1.5 hover:bg-[#195C4C] hover:text-white transition-colors">
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            )}
            <button
              onClick={togglePublic}
              className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 ${site.public_enabled ? 'bg-[#195C4C] justify-end' : 'bg-stone-300 justify-start'}`}
            >
              <span className="w-5 h-5 bg-white rounded-full shadow-sm" />
            </button>
          </div>
        </div>

        {site.public_enabled && isPaid && (
          <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-4">
            <p className="text-sm font-medium text-stone-900">Password protect this link</p>
            <p className="text-xs text-stone-500 mt-1 mb-2">Leave blank for no password.</p>
            <div className="flex gap-2">
              <input
                type="password"
                value={sharePassword}
                onChange={(e) => setSharePassword(e.target.value)}
                placeholder="No password set"
                className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#195C4C]/25 focus:border-[#195C4C]"
              />
              <button onClick={saveSharePassword} className="text-xs font-medium text-white bg-[#195C4C] hover:bg-[#195C4C] rounded-lg px-3.5 transition-colors">
                {passwordSaved ? 'Saved!' : 'Save'}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-4">
          <p className="text-sm font-medium text-stone-900">Exclude your own visits</p>
          <p className="text-xs text-stone-500 mt-1 mb-2">Open this link once in your browser — your visits won&apos;t be tracked after that.</p>
          <code className="block bg-stone-50 border border-stone-200 text-xs font-mono p-2.5 rounded-lg overflow-x-auto text-stone-700">
            {`https://${site.domain}?pv_exclude=1`}
          </code>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-4">
          <p className="text-4xl font-mono font-bold text-[#195C4C]">{totalViews}</p>
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
                <Line type="monotone" dataKey="count" stroke="#195C4C" strokeWidth={2} dot={{ fill: '#195C4C', r: 3 }} />
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

        {isPaid ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 mt-4">
            <h2 className="font-medium text-stone-900 mb-1 text-sm">Custom Events</h2>
            <p className="text-xs text-stone-400 mb-3">
              Call <code className="bg-stone-50 px-1 py-0.5 rounded">pageviz(&apos;event_name&apos;)</code> from any button or form on your site.
            </p>
            {topEvents.length === 0 && <p className="text-sm text-stone-400">No events tracked yet</p>}
            {topEvents.map(([name, count]) => (
              <div key={name} className="flex justify-between text-sm py-1.5 border-t border-stone-100 first:border-0">
                <span className="text-stone-700">{name}</span>
                <span className="text-stone-400 font-mono">{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <Link href="/pricing" className="block bg-white border border-dashed border-stone-300 rounded-2xl p-5 mt-4 text-center text-sm text-stone-400 hover:text-[#195C4C] hover:border-[#195C4C] transition-colors">
            Custom events (signup clicks, goals) are on Pro →
          </Link>
        )}
      </div>
    </div>
  )
}