'use client'

import { useEffect } from 'react'
import { getStoredTheme, applyTheme, syncThemeColor } from '@/lib/theme'

// Re-resolves the theme when the OS switches light/dark while the saved
// preference is 'system' (the reference does the same in main.js).
export default function ThemeWatcher() {
  useEffect(() => {
    // Re-apply the saved preference once React is live. The inline script in the
    // layout sets data-theme before first paint, but hydration can drop or overwrite
    // that attribute -- which is how a reader's dark mode used to vanish on reload.
    // Running it again here makes the theme self-healing whatever hydration does.
    applyTheme(getStoredTheme())
    syncThemeColor()
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => { if (getStoredTheme() === 'system') applyTheme('system') }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return null
}
