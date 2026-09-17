'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import Icon from './Icon'

const ToastContext = createContext(() => {})

// One toast at a time, bottom-centre — the reference's toast() from main.js.
export function ToastProvider({ children }) {
  const [current, setCurrent] = useState(null)
  const timer = useRef(null)

  const toast = useCallback((message, options = {}) => {
    clearTimeout(timer.current)
    setCurrent({ id: Date.now(), message, celebration: !!options.celebration, icon: options.icon || (options.celebration ? 'sparkles' : 'check') })
    timer.current = setTimeout(() => setCurrent(null), options.celebration ? 3600 : 2600)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div id="toast-region" className="toast-region" role="status" aria-live="polite" aria-atomic="true">
        {current && (
          <div key={current.id} className={`toast ${current.celebration ? 'toast-celebration' : ''}`}>
            <Icon name={current.icon} />
            <span>{current.message}</span>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

// The reference's data-action="soon" — used for every not-yet-built control.
export function useSoon() {
  const toast = useToast()
  return useCallback(() => toast('That feature is still growing', { icon: 'sprout' }), [toast])
}

export async function copyText(text, toast) {
  try {
    await navigator.clipboard.writeText(text)
    toast('Copied to clipboard', { icon: 'copy' })
  } catch {
    toast('Press Ctrl/Cmd + C to copy', { icon: 'info' })
  }
}
