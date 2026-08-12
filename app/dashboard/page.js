'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
const FREE_SITE_LIMIT = 1
export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [sites, setSites] = useState([])
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const loadSites = async (userId) => {
    const { data } = await supabase.from('sites').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    setSites(data || [])
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else { setUser(data.user); loadSites(data.user.id) }
    })
  }, [router])

  const handleAddSite = async (e) => {
    e.preventDefault()
    if (sites.length >= FREE_SITE_LIMIT) return
    setLoading(true)
    const { error } = await supabase.from('sites').insert({ user_id: user.id, name, domain })
    setLoading(false)
    if (!error) { setName(''); setDomain(''); loadSites(user.id) }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) return <p className="p-6 text-neutral-500 text-sm">Loading...</p>

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">{user.email}</h1>
            <p className="text-sm text-neutral-500">{sites.length} site{sites.length !== 1 ? 's' : ''} tracked</p>
          </div>
          <button onClick={handleLogout} className="text-sm text-neutral-500 hover:text-indigo-600">Log out</button>
        </div>

        <form onSubmit={handleAddSite} className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-5 mb-6 space-y-3">
          <h2 className="font-medium text-neutral-900">Add a site</h2>
          <input placeholder="Site name (e.g. My Blog)" value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          <input placeholder="Domain (e.g. myblog.com)" value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50">
            {loading ? 'Adding...' : 'Add site'}
          </button>
        </form>

        <div className="space-y-3">
          {sites.map((site) => (
            <div key={site.id} className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-5">
              <Link href={`/dashboard/${site.id}`} className="flex items-center gap-2 font-medium text-neutral-900 hover:text-indigo-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {site.name} <span className="text-neutral-400 text-sm font-normal">({site.domain})</span>
              </Link>
              <p className="text-xs text-neutral-500 mt-3 mb-1">Paste this before &lt;/body&gt; on your site:</p>
              <code className="block bg-neutral-50 border border-neutral-200 text-xs font-mono p-2.5 rounded-lg overflow-x-auto text-neutral-700">
                {`<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/track.js" data-site-id="${site.id}"></script>`}
              </code>
            </div>
          ))}
          {sites.length === 0 && (
            <p className="text-sm text-neutral-400 text-center py-8">No sites yet — add your first one above.</p>
          )}
        </div>
      </div>
    </div>
  )
}