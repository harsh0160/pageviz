'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AuthLayout from '../_components/AuthLayout'
import Icon from '../_components/Icon'

// Auth: the app's existing Supabase project, via resetPasswordForEmail — the
// user finishes on /reset-password after clicking the emailed link.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const field = event.currentTarget.querySelector('[name="email"]')
    if (field && !field.checkValidity()) { setError('Please enter a valid email address.'); field.focus(); return }
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (authError) setError(authError.message)
    else setSent(true)
  }

  return (
    <AuthLayout variant="login">
      <div className="auth-heading">
        <h1>Reset your password</h1>
        <p>Enter your email and we&apos;ll send you a link to set a new one.</p>
      </div>
      {sent ? (
        <div className="form-message">Check your inbox — we&apos;ve sent a link to <strong>{email}</strong> to reset your password.</div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input className="input" id="email" name="email" type="email" autoComplete="email" placeholder="you@yourstudio.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="form-slot">{error && <div className="form-message error">{error}</div>}</div>
          <button type="submit" disabled={loading} className="button button-primary full-width button-large">
            {loading ? 'Please wait…' : <>Send reset link <Icon name="arrow-right" /></>}
          </button>
        </form>
      )}
      <p className="auth-alt">Remembered it? <Link href="/login">Log in</Link></p>
    </AuthLayout>
  )
}
