'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getStoredTheme, applyTheme } from '@/lib/theme'

const NAV_ITEMS = [
  { key: 'appearance', label: 'Appearance' },
  { key: 'account', label: 'Account' },
  { key: 'billing', label: 'Billing' },
]

function ThemeOption({ label, value, active, onSelect }) {
  return (
    <button onClick={() => onSelect(value)}
      className={`text-left rounded-xl border-2 overflow-hidden transition-colors ${active ? 'border-[#E64A12]' : 'border-stone-200 dark:border-white/10 hover:border-stone-300'}`}>
      <div className="h-20 flex">
        {(value === 'light' || value === 'system') && (
          <div className="flex-1 bg-[#FAFAF7] p-2 space-y-1.5">
            <div className="h-1.5 w-8 rounded-full bg-stone-300" />
            <div className="h-1.5 w-12 rounded-full bg-[#E64A12]/60" />
            <div className="h-1.5 w-6 rounded-full bg-stone-200" />
          </div>
        )}
        {(value === 'dark' || value === 'system') && (
          <div className="flex-1 bg-[#14231E] p-2 space-y-1.5">
            <div className="h-1.5 w-8 rounded-full bg-white/20" />
            <div className="h-1.5 w-12 rounded-full bg-[#FF5A1F]/60" />
            <div className="h-1.5 w-6 rounded-full bg-white/10" />
          </div>
        )}
      </div>
      <div className="px-3 py-2 flex items-center justify-between bg-white dark:bg-[#181818]">
        <span className="text-sm font-medium text-stone-900 dark:text-[#F9FAFB]">{label}</span>
        {active && (
          <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </button>
  )
}

export default function Settings() {
  const [user, setUser] = useState(null)
  const [theme, setThemeState] = useState('system')
  const [section, setSection] = useState('appearance')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else setUser(data.user)
    })
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(getStoredTheme())
  }, [router])

  const handleThemeSelect = (value) => { setThemeState(value); applyTheme(value) }
  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login') }

  if (!user) return <p className="p-6 text-stone-500 text-sm">Loading...</p>

  return (
    <div className="min-h-screen bg-[#FAFAF7] dark:bg-[#181818]">
      <div className="border-b border-stone-200 dark:border-white/10 bg-white/70 dark:bg-[#181818]/70 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-stone-500 dark:text-[#A0B3AC]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/dashboard" className="text-sm text-stone-500 dark:text-[#A0B3AC] hover:text-stone-900 dark:hover:text-white">← Dashboard</Link>
          <h1 className="font-semibold text-stone-900 dark:text-[#F9FAFB] ml-2">Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 flex gap-8">
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-48 shrink-0`}>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <button key={item.key} onClick={() => { setSection(item.key); setSidebarOpen(false) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${section === item.key ? 'bg-[#1F4A3D]/10 text-[#1F4A3D] dark:bg-[#34D399]/15 dark:text-[#34D399]' : 'text-stone-500 dark:text-[#A0B3AC] hover:bg-stone-100 dark:hover:bg-white/5'}`}>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          {section === 'appearance' && (
            <div>
              <h2 className="font-semibold text-stone-900 dark:text-[#F9FAFB] mb-1">Appearance</h2>
              <p className="text-sm text-stone-500 dark:text-[#738A82] mb-5">Choose how Pageviz looks on this device.</p>
              <div className="grid grid-cols-3 gap-4 max-w-lg">
                <ThemeOption label="System" value="system" active={theme === 'system'} onSelect={handleThemeSelect} />
                <ThemeOption label="Light" value="light" active={theme === 'light'} onSelect={handleThemeSelect} />
                <ThemeOption label="Dark" value="dark" active={theme === 'dark'} onSelect={handleThemeSelect} />
              </div>
            </div>
          )}
          {section === 'account' && (
            <div>
              <h2 className="font-semibold text-stone-900 dark:text-[#F9FAFB] mb-1">Account</h2>
              <p className="text-sm text-stone-500 dark:text-[#738A82] mb-5">{user.email}</p>
              <button onClick={handleLogout} className="text-sm font-medium text-red-600 border border-red-200 rounded-lg px-4 py-2 hover:bg-red-50">Log out</button>
            </div>
          )}
          {section === 'billing' && (
            <div>
              <h2 className="font-semibold text-stone-900 dark:text-[#F9FAFB] mb-1">Billing</h2>
              <p className="text-sm text-stone-500 dark:text-[#738A82] mb-5">Manage your plan and payment details.</p>
              <Link href="/pricing" className="inline-block bg-[#E64A12] hover:bg-[#CC3D0B] text-white text-sm font-medium rounded-lg px-5 py-2">View plans</Link>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}