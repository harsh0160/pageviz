'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AuthLayout, { PasswordInput } from '../_components/AuthLayout'
import Icon from '../_components/Icon'

// The emailed link logs the browser into a short-lived recovery session
// before landing here — wait for Supabase to pick that up, then let the
// user set a new password with supabase.auth.updateUser.
export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('checking') // checking | ready | invalid
  const router = useRouter()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.location.hash.includes('error=')) { setStatus('invalid'); return }
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setStatus('ready')
    })
    supabase.auth.getSession().then(({ data }) => { if (data.session) setStatus('ready') })
    const timeout = setTimeout(() => setStatus((current) => (current === 'checking' ? 'invalid' : current)), 5000)
    return () => { sub.subscription.unsubscribe(); clearTimeout(timeout) }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (authError) setError(authError.message)
    else router.push('/dashboard')
  }

  return (
    <AuthLayout variant="login">
      <div className="auth-heading">
        <h1>Set a new password</h1>
        <p>Choose a new password for your account.</p>
      </div>
      {status === 'ready' && (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="password">New password</label>
            <PasswordInput autoComplete="new-password" placeholder="At least 8 characters" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          <div className="form-slot">{error && <div className="form-message error">{error}</div>}</div>
          <button type="submit" disabled={loading} className="button button-primary full-width button-large">
            {loading ? 'Please wait…' : <>Save new password <Icon name="arrow-right" /></>}
          </button>
        </form>
      )}
      {status === 'checking' && <p className="auth-alt">Checking your reset link…</p>}
      {status === 'invalid' && (
        <div className="form-message error">This reset link is invalid or has expired. <Link href="/forgot-password">Request a new one</Link>.</div>
      )}
    </AuthLayout>
  )
}
