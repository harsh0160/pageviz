'use client'

import Icon from './Icon'
import { applyTheme, useResolvedTheme } from '@/lib/theme'

export default function ThemeButton() {
  const theme = useResolvedTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button type="button" className="icon-button theme-toggle" onClick={() => applyTheme(next)} aria-label={`Switch to ${next} mode`} title="Switch color theme">
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
    </button>
  )
}
