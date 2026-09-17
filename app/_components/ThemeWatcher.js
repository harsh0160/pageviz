'use client'

import { useEffect } from 'react'
import { getStoredTheme, applyTheme, syncThemeColor } from '@/lib/theme'

// Re-resolves the theme when the OS switches light/dark while the saved
// preference is 'system' (the reference does the same in main.js).
export default function ThemeWatcher() {
  useEffect(() => {
    syncThemeColor()
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => { if (getStoredTheme() === 'system') applyTheme('system') }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return null
}
