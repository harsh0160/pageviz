'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const FREE_SITE_LIMIT = 1

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [sites, setSites] = useState([])
  const [plan, setPlan] = useState('free')
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      // eslint-disable-next-line react-hooks/immutability
      else { setUser(data.user); loadSites(data.user.id); loadPlan(data.user.id) }
    })
  }, [router])

  const loadSites = async (userId) => {
    const { data } = await supabase.from('sites').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    setSites(data || [])
  }

  const loadPlan = async (userId) => {
    // No row in profiles yet just means "never paid" — that's the normal
    // state for most users, not an error, so default to free rather than
    // showing a loading/error state over it.
    const { data } = await supabase.from('profiles').select('plan').eq('id', userId).maybeSingle()
    setPlan(data?.plan || 'free')
  }

  const siteLimit = plan === 'free' ? FREE_SITE_LIMIT : Infinity

  const handleAddSite = async (e) => {
    e.preventDefault()
    if (sites.length >= siteLimit) return
    setLoading(true)
    const { error } = await supabase.from('sites').insert({ user_id: user.id, name, domain })
    setLoading(false)
    if (!error) { setName(''); setDomain(''); loadSites(user.id) }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) return <p className="p-6 text-stone-500 text-sm">Loading...</p>

  const limitReached = sites.length >= siteLimit

  return (
    <div className="min-h-screen bg-dotted">
      <div className="border-b border-stone-200 bg-white/70 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg width="22" height="16" viewBox="0 0 28 20" fill="none">
              <polyline points="2,16 10,10 18,12 26,3" stroke="#1F6F5C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="2" cy="16" r="2.5" fill="#1F6F5C"/>
              <circle cx="10" cy="10" r="2.5" fill="#1F6F5C"/>
              <circle cx="18" cy="12" r="2.5" fill="#1F6F5C"/>
              <circle cx="26" cy="3" r="2.5" fill="#1F6F5C"/>
            </svg>
            <span className="font-semibold text-stone-900 tracking-tight">pageviz</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/pricing" className="text-sm text-stone-500 hover:text-[#1F6F5C] transition-colors">Pricing</Link>
            <button onClick={handleLogout} className="text-sm text-stone-500 hover:text-[#1F6F5C] transition-colors">Log out</button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-stone-900">{user.email}</h1>
          <p className="text-sm text-stone-500 font-mono">{sites.length} site{sites.length !== 1 ? 's' : ''} tracked</p>
        </div>

        {limitReached ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6 text-center">
            <div className="w-10 h-10 bg-[#1F6F5C]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-[#1F6F5C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="font-semibold text-stone-900">You&apos;ve hit the free plan limit</p>
            <p className="text-sm text-stone-500 mt-1 mb-4">Free plan includes {FREE_SITE_LIMIT} site. Upgrade to track more sites.</p>
            <Link href="/pricing" className="inline-block bg-[#1F6F5C] hover:bg-[#195C4C] text-white text-sm font-medium rounded-lg px-5 py-2 transition-colors">
              Upgrade
            </Link>
          </div>
        ) : (
          <form onSubmit={handleAddSite} className="bg-white border border-stone-200 rounded-2xl p-5 mb-6 space-y-3">
            <h2 className="font-medium text-stone-900">Add a site</h2>
            <input placeholder="Site name (e.g. My Blog)" value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6F5C]/25 focus:border-[#1F6F5C]" required />
            <input placeholder="Domain (e.g. myblog.com)" value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6F5C]/25 focus:border-[#1F6F5C]" required />
            <button type="submit" disabled={loading} className="bg-[#1F6F5C] hover:bg-[#195C4C] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50">
              {loading ? 'Adding...' : 'Add site'}
            </button>
          </form>
        )}

        <div className="space-y-3">
          {sites.map((site) => (
            <div key={site.id} className="bg-white border border-stone-200 rounded-2xl p-5">
              <Link href={`/dashboard/${site.id}`} className="flex items-center gap-2 font-medium text-stone-900 hover:text-[#1F6F5C] transition-colors">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {site.name} <span className="text-stone-400 text-sm font-normal">({site.domain})</span>
              </Link>
              <p className="text-xs text-stone-500 mt-3 mb-1">Paste this before &lt;/body&gt; on your site:</p>
              <code className="block bg-stone-50 border border-stone-200 text-xs font-mono p-2.5 rounded-lg overflow-x-auto text-stone-700">
                {`<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/track.js" data-site-id="${site.id}"></script>`}
              </code>
            </div>
          ))}
          {sites.length === 0 && (
            <p className="text-sm text-stone-400 text-center py-8">No sites yet — add your first one above.</p>
          )}
        </div>
      </div>
    </div>
  )
}