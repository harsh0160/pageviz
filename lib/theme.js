'use client'

import { useEffect, useState } from 'react'

// Saved preference lives in localStorage under pv_theme: 'light' | 'dark' | 'system'.
// The resolved value ('light' | 'dark') is stamped on <html data-theme>, which is
// what every CSS token in app/globals.css keys off.

export function getStoredTheme() {
  try { return localStorage.getItem('pv_theme') || 'system' } catch (e) { return 'system' }
}

export function resolveTheme(theme) {
  const systemDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  return theme === 'dark' || (theme === 'system' && systemDark) ? 'dark' : 'light'
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', resolveTheme(theme))
  try { localStorage.setItem('pv_theme', theme) } catch (e) {}
  syncThemeColor()
}

// Mirrors the reference's <meta name="theme-color"> update, reading the live token.
export function syncThemeColor() {
  const color = getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim()
  if (!color) return
  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', color)
}

// The resolved theme on <html>, kept live across toggles from any component.
export function useResolvedTheme() {
  const [theme, setTheme] = useState('light')
  useEffect(() => {
    const read = () => setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])
  return theme
}

// The saved preference (including 'system'), for the Appearance settings.
export function useThemePreference() {
  const [preference, setPreference] = useState('system')
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreference(getStoredTheme())
  }, [])
  const choose = (value) => { setPreference(value); applyTheme(value) }
  return [preference, choose]
}
