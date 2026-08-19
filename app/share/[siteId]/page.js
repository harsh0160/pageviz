'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function PublicShare() {
  const params = useParams()
  const siteId = params.siteId
  const [site, setSite] = useState(null)
  const [pageviews, setPageviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: siteData } = await supabase.from('sites').select('*').eq('id', siteId).eq('public_enabled', true).single()
      if (!siteData) { setNotFound(true); setLoading(false); return }
      setSite(siteData)

      const since = new Date()
      since.setDate(since.getDate() - 30)
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
  }, [siteId])

  if (loading) return <p className="p-6 text-stone-500 text-sm">Loading...</p>
  if (notFound) return <p className="p-6 text-stone-500 text-sm">This dashboard is private or doesn&apos;t exist.</p>

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
        <p className="text-stone-500 text-sm mb-6">{site.domain} · last 30 days</p>

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
          Powered by pageviz — free privacy-friendly analytics
        </Link>
      </div>
    </div>
  )
}