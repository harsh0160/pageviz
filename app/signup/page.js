'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AuthLayout, { PasswordInput } from '../_components/AuthLayout'
import Icon from '../_components/Icon'

// Design: reference src/pages/auth.js → signupPage(). Auth: the app's existing
// Supabase sign-up (moved here from the old /login?signup=1 toggle).
export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const router = useRouter()

  const handleSubmit = async (event) => {
    event.preventDefault()
    const field = event.currentTarget.querySelector('[name="email"]')
    if (field && !field.checkValidity()) { setError('Please enter a valid email address.'); field.focus(); return }
    // The form is noValidate, so the password input's own minLength never fires.
    if (password.length < 8) { setError('Please use a password of at least 8 characters.'); return }
    if (!terms) { setError('Please accept the terms to continue.'); return }
    setError('')
    setLoading(true)
    // The name is saved to the user's metadata so the workspace can greet them by it.
    const { data, error: authError } = await supabase.auth.signUp({ email, password, options: { data: { name: name.trim() } } })
    setLoading(false)
    if (authError) setError(authError.message)
    // With email confirmation switched on, sign-up returns no session: the account only
    // works once the link is opened. Say that, instead of bouncing to a login that fails.
    else if (!data.session) setSent(true)
    else router.push('/dashboard')
  }

  if (sent) {
    return (
      <AuthLayout variant="signup">
        <div className="auth-heading">
          <h1>Check your inbox</h1>
          <p>We sent a confirmation link to <strong>{email}</strong>. Open it and your workspace is ready.</p>
        </div>
        <div className="inline-note"><Icon name="mail" /><span>Nothing after a few minutes? Look in spam, or <button type="button" className="text-link" onClick={() => setSent(false)}>use another address</button>.</span></div>
        <p className="auth-alt">Already confirmed? <Link href="/login">Log in</Link></p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout variant="signup">
      <div className="auth-heading">
        <h1>Plant your first site</h1>
        <p>Free forever, no card required. You&apos;ll be counting visits in about a minute.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="name">Your name</label>
          <input className="input" id="name" name="name" type="text" autoComplete="name" placeholder="Alex Rivera" value={name} onChange={(event) => setName(event.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input className="input" id="email" name="email" type="email" autoComplete="email" placeholder="you@yourstudio.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Create a password</label>
          <PasswordInput autoComplete="new-password" placeholder="At least 8 characters" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
          <small>Use eight or more characters with a mix of letters and numbers.</small>
        </div>
        <label className="check-row">
          <input type="checkbox" name="terms" checked={terms} onChange={(event) => setTerms(event.target.checked)} required />
          {/* One shared tab name: the first click opens a new tab, the next one reuses it. */}
          <span>I agree to the <Link href="/terms" target="pageviz-legal">terms</Link> and <Link href="/privacy" target="pageviz-legal">privacy policy</Link>.</span>
        </label>
        <div className="form-slot">{error && <div className="form-message error">{error}</div>}</div>
        <button type="submit" disabled={loading} className="button button-primary full-width button-large">
          {loading ? 'Please wait…' : <>Create my free account <Icon name="arrow-right" /></>}
        </button>
      </form>
      <div className="auth-divider"><span>or</span></div>
      <Link href="/demo" className="button button-secondary full-width"><Icon name="circle-play" />Explore the demo first</Link>
      <p className="auth-alt">Already growing something? <Link href="/login">Log in</Link></p>
    </AuthLayout>
  )
}
