'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

// One interface, two sources. RealWorkspace fills it from Supabase for the
// signed-in user; DemoWorkspace fills it from the reference's sample data.
// Every workspace screen (shell, dashboard, site, overview, settings, dialogs)
// reads only from here, so the design is shared and the data never mixes.
export const WorkspaceContext = createContext(null)

export function useWorkspace() {
  const workspace = useContext(WorkspaceContext)
  if (!workspace) throw new Error('useWorkspace must be used inside a workspace provider')
  return workspace
}

export function buildPaths(mode) {
  const demo = mode === 'demo'
  const home = demo ? '/demo' : '/dashboard'
  const settings = demo ? '/demo/settings' : '/settings'
  return {
    home,
    overview: `${home}/all`,
    site: (id) => `${home}/${id}`,
    settings,
    account: `${settings}/account`,
    billing: `${settings}/billing`,
    referrals: `${settings}/referrals`,
    team: `${settings}/team`,
    share: (id) => (demo ? `/demo/share/${id}` : `/share/${id}`),
    pricing: `/pricing?from=${demo ? 'demo' : 'workspace'}`,
  }
}

// The reference keeps a single <dialog id="app-dialog"> and swaps its contents.
export function useDialogHost() {
  const [content, setContent] = useState(null)
  const openDialog = useCallback((node) => setContent(node), [])
  const closeDialog = useCallback(() => setContent(null), [])
  const host = useMemo(() => <DialogHost content={content} onClose={closeDialog} />, [content, closeDialog])
  return { openDialog, closeDialog, host }
}

function DialogHost({ content, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (content && !dialog.open) dialog.showModal()
    if (!content && dialog.open) dialog.close()
    if (content) {
      const focusable = dialog.querySelector('input:not([readonly]), button:not([data-close])')
      if (focusable) setTimeout(() => focusable.focus(), 40)
    }
  }, [content])

  return (
    <dialog
      id="app-dialog"
      ref={ref}
      aria-labelledby="dialog-title"
      onClick={(event) => { if (event.target === ref.current) onClose() }}
      onCancel={(event) => { event.preventDefault(); onClose() }}
    >
      {content}
    </dialog>
  )
}

export const installSnippet = (site) => {
  const origin = typeof window === 'undefined' ? '' : window.location.origin
  return `<script src="${origin}/track.js" data-site-id="${site.id}"></script>`
}

// For titles only known on the client (a site's name). Next streams route
// metadata into <head> after hydration, so hold the title until unmount.
export const usePageTitle = (title) => {
  useEffect(() => {
    if (!title) return
    document.title = title
    const observer = new MutationObserver(() => { if (document.title !== title) document.title = title })
    observer.observe(document.head, { subtree: true, childList: true, characterData: true })
    return () => observer.disconnect()
  }, [title])
}
