'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AuthLayout, { PasswordInput } from '../_components/AuthLayout'
import Icon from '../_components/Icon'

// Design: reference src/pages/auth.js → loginPage(). Auth: the app's existing Supabase sign-in.
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Old links (and CheckoutButton) still point at /login?signup=1 — sign-up now has its own page.
    if (window.location.search.includes('signup')) router.replace('/signup')
  }, [router])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const field = event.currentTarget.querySelector('[name="email"]')
    if (field && !field.checkValidity()) { setError('Please enter a valid email address.'); field.focus(); return }
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) setError(authError.message)
    else router.push('/dashboard')
  }

  return (
    <AuthLayout variant="login">
      <div className="auth-heading">
        <h1>Log back in</h1>
        <p>Good to see you again. Let&apos;s see how things are growing.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input className="input" id="email" name="email" type="email" autoComplete="email" placeholder="you@yourstudio.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div className="field">
          <div className="field-row">
            <label htmlFor="password">Password</label>
            <Link href="/forgot-password" className="field-link">Forgot it?</Link>
          </div>
          <PasswordInput autoComplete="current-password" placeholder="Your password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
        <div className="form-slot">{error && <div className="form-message error">{error}</div>}</div>
        <button type="submit" disabled={loading} className="button button-primary full-width button-large">
          {loading ? 'Please wait…' : <>Log in <Icon name="arrow-right" /></>}
        </button>
      </form>
      <div className="auth-divider"><span>or</span></div>
      <Link href="/demo" className="button button-secondary full-width"><Icon name="circle-play" />Skip in and explore the demo</Link>
      <p className="auth-alt">New here? <Link href="/signup">Create a free account</Link></p>
    </AuthLayout>
  )
}
