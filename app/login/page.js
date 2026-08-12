'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
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
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 bg-white border border-neutral-200 rounded-2xl shadow-sm p-8">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
          <p className="text-sm text-neutral-500 mt-1">{isSignUp ? 'Start tracking in under a minute.' : 'Log in to see your stats.'}</p>
        </div>
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50">
          {loading ? 'Please wait...' : isSignUp ? 'Sign up' : 'Log in'}
        </button>
        <button type="button" onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-neutral-500 hover:text-indigo-600 underline block text-center w-full">
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </button>
      </form>
    </div>
  )
}