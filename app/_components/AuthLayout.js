'use client'

import { useState } from 'react'
import Brand from './Brand'
import Icon from './Icon'
import ThemeButton from './ThemeButton'

// The reference's authAside() + authHeader() from src/pages/auth.js.
export default function AuthLayout({ variant, children }) {
  return (
    <main id="main-content" className="auth-layout">
      <aside className="auth-aside">
        <div className="auth-aside-top"><Brand /></div>
        <div className="auth-aside-body">
          <span className="eyebrow">{variant === 'signup' ? 'Welcome to the garden' : 'Welcome back'}</span>
          <h2 className="auth-aside-title">{variant === 'signup' ? 'A calmer way to understand your website.' : 'Your quiet corner of the web, waiting.'}</h2>
        </div>
        <ul className="auth-aside-points">
          <li><Icon name="leaf" />Cookie-free &amp; privacy-first</li>
          <li><Icon name="shield-check" />Your data stays yours</li>
        </ul>
      </aside>
      <section className="auth-panel">
        <div className="auth-inner">
          <div className="auth-mobile-head"><Brand /><ThemeButton /></div>
          {children}
        </div>
      </section>
    </main>
  )
}

export function PasswordInput({ id = 'password', autoComplete, placeholder, value, onChange, minLength }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="input-with-icon">
      <Icon name="lock" />
      <input className="input" id={id} name="password" type={visible ? 'text' : 'password'} autoComplete={autoComplete} placeholder={placeholder} value={value} onChange={onChange} minLength={minLength} required />
      <button type="button" className="icon-button icon-button-tiny" onClick={() => setVisible((shown) => !shown)} aria-label={visible ? 'Hide password' : 'Show password'}>
        <Icon name={visible ? 'eye-off' : 'eye'} />
      </button>
    </div>
  )
}
