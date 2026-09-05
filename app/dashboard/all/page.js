'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#1F4A3D', '#E64A12', '#5C6E65', '#8B7355', '#4A6FA5', '#A64B4B']

export default function CombinedDashboard() {
  const [user, setUser] = useState(null)
  const [plan, setPlan] = useState('free')
  const [sites, setSites] = useState([])
  const [pageviews, setPageviews] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      const { data: profileData } = await supabase.from('profiles').select('plan').eq('id', data.user.id).maybeSingle()
      const userPlan = profileData?.plan || 'free'
      setPlan(userPlan)
      if (userPlan !== 'business') { setLoading(false); return }

      const { data: siteRows } = await supabase.from('sites').select('id, name, domain').eq('user_id', data.user.id)
      setSites(siteRows || [])
      if (siteRows && siteRows.length > 0) {
        const since = new Date()
        since.setDate(since.getDate() - 30)
        const { data: pvRows } = await supabase
          .from('pageviews')
          .select('site_id, created_at')
          .in('site_id', siteRows.map((s) => s.id))
          .gte('created_at', since.toISOString())
        setPageviews(pvRows || [])
      }
      setLoading(false)
    })
  }, [router])

  if (loading) return <p className="p-6 text-stone-500 text-sm">Loading...</p>

  if (plan !== 'business') {
    return (
      <div className="min-h-screen bg-dotted flex items-center justify-center p-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 max-w-sm text-center">
          <p className="font-semibold text-stone-900">Combined view is a Max feature</p>
          <p className="text-sm text-stone-500 mt-2 mb-5">See every site&apos;s traffic in one dashboard once you&apos;re on Max.</p>
          <Link href="/pricing" className="inline-block bg-[#195C4C] hover:bg-[#195C4C] text-white text-sm font-medium rounded-lg px-5 py-2 transition-colors">
            View plans
          </Link>
        </div>
      </div>
    )
  }

  const totalViews = pageviews.length
  const byDay = {}
  const bySite = {}
  pageviews.forEach((pv) => {
    const day = pv.created_at.slice(0, 10)
    byDay[day] = byDay[day] || {}
    byDay[day][pv.site_id] = (byDay[day][pv.site_id] || 0) + 1
    bySite[pv.site_id] = (bySite[pv.site_id] || 0) + 1
  })
  const chartData = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => {
      const row = { date }
      sites.forEach((s) => { row[s.name] = counts[s.id] || 0 })
      return row
    })
  const siteBreakdown = sites
    .map((s) => ({ ...s, views: bySite[s.id] || 0 }))
    .sort((a, b) => b.views - a.views)

  return (
    <div className="min-h-screen bg-dotted">
      <div className="border-b border-stone-200 bg-white/70 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-sm text-stone-500 hover:text-[#195C4C] transition-colors">← All sites</Link>
          <span className="font-semibold text-stone-900 tracking-tight">Combined view</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-4">
          <p className="text-4xl font-mono font-bold text-[#195C4C]">{totalViews}</p>
          <p className="text-sm text-stone-500 mt-1">Pageviews across {sites.length} site{sites.length !== 1 ? 's' : ''} · last 30 days</p>
        </div>

        {chartData.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-4" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E0" />
                <XAxis dataKey="date" fontSize={12} stroke="#a8a29e" />
                <YAxis allowDecimals={false} fontSize={12} stroke="#a8a29e" />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E7E5E0', fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {sites.map((s, i) => (
                  <Line key={s.id} type="monotone" dataKey={s.name} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <h2 className="font-medium text-stone-900 mb-3 text-sm">By site</h2>
          {siteBreakdown.map((s) => (
            <Link key={s.id} href={`/dashboard/${s.id}`} className="flex justify-between text-sm py-2 border-t border-stone-100 first:border-0 hover:text-[#195C4C] transition-colors">
              <span className="text-stone-700">{s.name} <span className="text-stone-400">({s.domain})</span></span>
              <span className="text-stone-500 font-mono">{s.views}</span>
            </Link>
          ))}
          {sites.length === 0 && <p className="text-sm text-stone-400 py-4 text-center">No sites yet.</p>}
        </div>
      </div>
    </div>
  )
}
