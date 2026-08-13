'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (typeof window !== 'undefined' && window.location.search.includes('signup')) setIsSignUp(true)
  }, [])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-dotted flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <svg width="26" height="19" viewBox="0 0 28 20" fill="none">
            <polyline points="2,16 10,10 18,12 26,3" stroke="#1F6F5C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="2" cy="16" r="2.5" fill="#1F6F5C" />
            <circle cx="10" cy="10" r="2.5" fill="#1F6F5C" />
            <circle cx="18" cy="12" r="2.5" fill="#1F6F5C" />
            <circle cx="26" cy="3" r="2.5" fill="#1F6F5C" />
          </svg>
          <span className="font-semibold text-lg text-stone-900 tracking-tight">pageviz</span>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-2xl p-8 space-y-4">
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
            <p className="text-sm text-stone-500 mt-1">{isSignUp ? 'Start tracking in under a minute.' : 'Log in to see your stats.'}</p>
          </div>
          <input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6F5C]/25 focus:border-[#1F6F5C] transition-colors" required />
          <input type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6F5C]/25 focus:border-[#1F6F5C] transition-colors" required />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-[#1F6F5C] hover:bg-[#195C4C] text-white rounded-lg px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-50">
            {loading ? 'Please wait...' : isSignUp ? 'Sign up' : 'Log in'}
          </button>
          <button type="button" onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-stone-500 hover:text-[#1F6F5C] underline block text-center w-full transition-colors">
            {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </form>
      </div>
    </div>
  )
}