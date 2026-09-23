'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Icon from '../Icon'
import { copyText, useSoon } from '../Toast'
import { SoonBadge } from '../ui'
import { PasswordInput } from '../AuthLayout'
import { PLANS } from '@/lib/plans'
import { cleanDomain } from '@/lib/analytics'
import { useWorkspace, installSnippet } from './context'

// Ported from the reference build: src/dialogs.js.

function DialogHeader({ title, subtitle }) {
  const { closeDialog } = useWorkspace()
  return (
    <div className="dialog-header">
      <div>
        <h2 id="dialog-title">{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <button type="button" className="icon-button" data-close onClick={closeDialog} aria-label="Close"><Icon name="x" /></button>
    </div>
  )
}

// The reference's data-action="add-site": respects the plan's site limit.
export function useAddSite() {
  const ws = useWorkspace()
  return () => {
    if (ws.sites.length >= ws.plan.sites) { ws.toast('You’ve reached your plan’s site limit', { icon: 'info' }); return }
    ws.openDialog(<AddSiteDialog />)
  }
}

export function AddSiteDialog() {
  const ws = useWorkspace()
  const router = useRouter()
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    const cleanName = name.trim()
    const siteDomain = cleanDomain(domain)
    if (!cleanName || !siteDomain) return
    setSaving(true)
    const id = await ws.actions.addSite({ name: cleanName, domain: siteDomain })
    setSaving(false)
    if (!id) return
    ws.closeDialog()
    router.push(ws.paths.site(id))
    setTimeout(() => ws.openDialog(<SetupDialog siteId={id} />), 300)
  }

  return (
    <>
      <DialogHeader title="Plant a new site" subtitle={`You have room for ${ws.plan.sites} sites on the ${ws.plan.name} plan.`} />
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="new-name">Website name</label>
          <input className="input" id="new-name" placeholder="My lovely website" value={name} onChange={(event) => setName(event.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="new-domain">Domain</label>
          <div className="input-with-icon"><Icon name="globe" /><input className="input" id="new-domain" placeholder="example.com" value={domain} onChange={(event) => setDomain(event.target.value)} required /></div>
          <small>Just the domain, no https:// needed.</small>
        </div>
        <div className="inline-note"><Icon name="leaf" /><span>Your new site starts cookie-free and empty, ready for its first pageview.</span></div>
        <div className="dialog-footer">
          <button type="button" className="button button-secondary" onClick={ws.closeDialog}>Cancel</button>
          <button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Creating…' : <>Create site <Icon name="arrow-right" /></>}</button>
        </div>
      </form>
    </>
  )
}

export function SetupDialog({ siteId }) {
  const ws = useWorkspace()
  const site = ws.getSite(siteId)
  if (!site) return null
  const snippet = installSnippet(site)
  return (
    <>
      <DialogHeader title="Add your snippet" subtitle={`Paste this into ${site.domain} to start counting.`} />
      <ol className="install-steps">
        <li><div><strong>Copy the snippet below</strong><p>One small script, about 2 KB.</p></div></li>
        <li><div><strong>Paste it into your HTML</strong><p>Just before the closing &lt;/head&gt; tag, on every page.</p></div></li>
        <li><div><strong>Publish and wait a beat</strong><p>Your first visit will appear within seconds.</p></div></li>
      </ol>
      <div className="code-box">
        <pre>{snippet}</pre>
        <button type="button" className="button button-secondary button-small" onClick={() => copyText(snippet, ws.toast)}><Icon name="copy" />Copy snippet</button>
      </div>
      <div className="dialog-footer">
        <button type="button" className="button button-secondary" onClick={ws.closeDialog}>I&apos;ll do it later</button>
        <button type="button" className="button button-primary" onClick={() => { ws.closeDialog(); ws.actions.verifyInstall(site.id) }}><Icon name="check" />I&apos;ve added it</button>
      </div>
    </>
  )
}

export function ShareDialog({ siteId }) {
  const ws = useWorkspace()
  const site = ws.getSite(siteId)
  const [password, setPassword] = useState('')
  const [editingPassword, setEditingPassword] = useState(false)
  if (!site) return null

  const link = `${typeof window === 'undefined' ? '' : window.location.origin}${ws.paths.share(site.id)}`
  const free = ws.planKey === 'free'
  const demoSite = ws.isDemo ? ws.allSites.find((item) => item.id === site.id) : null
  const passwordOn = site.passwordEnabled || editingPassword

  const togglePassword = async () => {
    if (ws.isDemo) { ws.actions.setPasswordEnabled(site.id, !site.passwordEnabled); return }
    if (passwordOn) {
      setEditingPassword(false)
      setPassword('')
      if (site.passwordEnabled) await ws.actions.setSharePassword(site.id, null)
    } else {
      setEditingPassword(true)
    }
  }

  const savePassword = async (event) => {
    event.preventDefault()
    if (!password) return
    if (await ws.actions.setSharePassword(site.id, password)) { setEditingPassword(false); setPassword('') }
  }

  return (
    <>
      <DialogHeader title="Share your stats" subtitle="Send a clean, read-only page to anyone." />
      <div className="toggle-row dialog-section">
        <div><strong>Public stats page</strong><p>Anyone with the link can view a read-only dashboard.</p></div>
        <button type="button" className="switch" role="switch" aria-checked={site.shared} onClick={() => ws.actions.setShared(site.id, !site.shared)} aria-label="Public stats page"></button>
      </div>
      <div hidden={!site.shared}>
        <div className="copy-field">
          <input className="input" value={link} readOnly />
          <button type="button" className="button button-primary" onClick={() => copyText(link, ws.toast)}><Icon name="copy" />Copy</button>
        </div>
        <div className="toggle-row dialog-section">
          <div><strong>Password protection</strong><p>{free ? 'Available on the Pro plan.' : 'Require a password to view the page.'}</p></div>
          {free
            ? <Link className="button button-soft button-small" href={ws.paths.pricing} onClick={ws.closeDialog}>Pro <Icon name="arrow-up-right" /></Link>
            : <button type="button" className="switch" role="switch" aria-checked={passwordOn} onClick={togglePassword} aria-label="Password protection"></button>}
        </div>
        {!free && ws.isDemo && site.passwordEnabled && (
          <div className="copy-field"><div className="input-with-icon" style={{ flex: 1 }}><Icon name="key-round" /><input className="input" value={demoSite?.demoPassword || ''} readOnly /></div></div>
        )}
        {!free && !ws.isDemo && passwordOn && (
          // Real passwords are stored hashed (the app's existing SHA-256), so they can be replaced but never shown.
          <form className="copy-field" onSubmit={savePassword}>
            <div className="input-with-icon" style={{ flex: 1 }}>
              <Icon name="key-round" />
              <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={site.passwordEnabled ? 'Password set — type to replace it' : 'Choose a password'} autoComplete="new-password" />
            </div>
            <button type="submit" className="button button-primary" disabled={!password}>Save</button>
          </form>
        )}
      </div>
      <div className="dialog-footer">
        <a className="button button-secondary" href={ws.paths.share(site.id)} target="_blank" rel="noopener noreferrer"><Icon name="external-link" />Preview</a>
        <button type="button" className="button button-primary" onClick={ws.closeDialog}>Done</button>
      </div>
    </>
  )
}

export function SiteMenuDialog({ siteId, onExport }) {
  const ws = useWorkspace()
  const soon = useSoon()
  const site = ws.getSite(siteId)
  if (!site) return null
  return (
    <>
      <DialogHeader title={site.name} subtitle={site.domain} />
      <div className="menu-list">
        <button type="button" className="menu-item" onClick={() => ws.openDialog(<ShareDialog siteId={site.id} />)}>
          <Icon name="link" /><span><strong>Share settings</strong><small>Public link and password</small></span><Icon name="chevron-right" />
        </button>
        <button type="button" className="menu-item" onClick={() => { ws.closeDialog(); onExport() }}>
          <Icon name="download" /><span><strong>Export CSV</strong><small>Download this site&apos;s data</small></span><Icon name="chevron-right" />
        </button>
        <button type="button" className="menu-item" onClick={() => ws.openDialog(<SetupDialog siteId={site.id} />)}>
          <Icon name="code-xml" /><span><strong>Installation snippet</strong><small>Re-copy your tracking code</small></span><Icon name="chevron-right" />
        </button>
        <button type="button" className="menu-item menu-item-danger" onClick={ws.isDemo ? soon : () => ws.openDialog(<RemoveSiteDialog siteId={site.id} />)}>
          <Icon name="x" /><span><strong>Remove site</strong><small>Delete this site and its data</small></span>
        </button>
      </div>
    </>
  )
}

export function RemoveSiteDialog({ siteId }) {
  const ws = useWorkspace()
  const [removing, setRemoving] = useState(false)
  const site = ws.getSite(siteId)
  if (!site) return null

  const confirm = async () => {
    setRemoving(true)
    const ok = await ws.actions.removeSite(siteId)
    setRemoving(false)
    if (ok) ws.closeDialog()
  }

  return (
    <>
      <DialogHeader title="Remove this site?" subtitle={`${site.name} and all its pageviews, events and share settings will be deleted. This can't be undone.`} />
      <div className="dialog-footer">
        <button type="button" className="button button-secondary" onClick={ws.closeDialog}>Cancel</button>
        <button type="button" disabled={removing} className="button button-danger" onClick={confirm}>{removing ? 'Removing…' : 'Remove site'}</button>
      </div>
    </>
  )
}

export function EventsDialog({ names }) {
  const ws = useWorkspace()
  return (
    <>
      <DialogHeader title="Custom events" subtitle="Count the moments that matter on your site." />
      {/* The reference shows pageviz.track(); the real tracking script exposes pageviz('event_name'). */}
      <div className="inline-note"><Icon name="info" /><span>Call <code>pageviz(&apos;event_name&apos;)</code> anywhere in your code to record an event. No personal data attached.</span></div>
      <div className="menu-list events-list">
        {names.length
          ? names.map((name) => <div key={name} className="event-row"><Icon name="mouse-pointer-2" /><code>{name}</code><span className="badge badge-soft">Active</span></div>)
          : <p className="stat-empty">No events recorded yet.</p>}
      </div>
      <div className="dialog-footer">
        <button type="button" className="button button-secondary" onClick={ws.closeDialog}>Close</button>
        {/* Custom goals need a goals table — events themselves are already created implicitly by pageviz('name'), no manual step needed yet. */}
        <button type="button" className="button button-primary" disabled><Icon name="plus" />New goal <SoonBadge /></button>
      </div>
    </>
  )
}

export function WorkspaceDialog() {
  const ws = useWorkspace()
  return (
    <>
      <DialogHeader title="Your workspace" subtitle="Workspaces keep separate collections of sites." />
      <div className="menu-list">
        <div className="workspace-current">
          <span className="workspace-avatar">{ws.user.initial}</span>
          <span><strong>Your workspace</strong><small>Personal · {ws.plan.name} plan</small></span>
          <Icon name="check" />
        </div>
        {/* Multiple workspaces need a workspaces table + workspace_id on sites — not built yet. */}
        <button type="button" className="menu-item" disabled>
          <Icon name="plus" /><span><strong>New workspace</strong><small>Group sites for a team or client</small></span><SoonBadge />
        </button>
      </div>
      <div className="dialog-footer">
        <Link className="button button-secondary" href={ws.paths.account} onClick={ws.closeDialog}><Icon name="user" />Account</Link>
        {ws.isDemo
          ? <Link className="button button-secondary" href="/" onClick={ws.closeDialog}><Icon name="log-out" />Log out</Link>
          : <button type="button" className="button button-secondary" onClick={() => { ws.closeDialog(); ws.actions.logout() }}><Icon name="log-out" />Log out</button>}
      </div>
    </>
  )
}

export function ChangePasswordDialog() {
  const ws = useWorkspace()
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    const message = await ws.actions.changePassword(password)
    setSaving(false)
    if (message) setError(message)
    else ws.closeDialog()
  }

  return (
    <>
      <DialogHeader title="Change password" subtitle="Choose a new password for your account." />
      <form className="settings-form dialog-section" onSubmit={save}>
        <div className="field">
          <label htmlFor="new-password">New password</label>
          <PasswordInput id="new-password" autoComplete="new-password" placeholder="At least 8 characters" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
        {error && <div className="form-message error">{error}</div>}
        <div className="dialog-footer">
          <button type="button" className="button button-secondary" onClick={ws.closeDialog}>Cancel</button>
          <button type="submit" disabled={saving || password.length < 8} className="button button-primary">{saving ? 'Saving…' : 'Update password'}</button>
        </div>
      </form>
    </>
  )
}

const CELEBRATIONS = { pro: 'Welcome to Pro. Room to grow!', business: 'Welcome to Max. The whole garden is yours!', free: 'Back on the free plan.' }

// Demo only: switches the sample workspace's plan (no payment anywhere).
export function PlanPreviewDialog({ plan }) {
  const ws = useWorkspace()
  const router = useRouter()
  const item = PLANS[plan]
  const confirm = () => {
    ws.closeDialog()
    ws.actions.setPlan(plan)
    ws.toast(CELEBRATIONS[plan] || 'Plan updated', { celebration: plan !== 'free', icon: plan === 'free' ? 'leaf' : 'sparkles' })
    if (window.location.pathname === ws.paths.overview && plan !== 'business') router.push(ws.paths.home)
  }
  return (
    <>
      <DialogHeader title={`Preview the ${item.name} plan`} subtitle="Switch instantly to explore what it unlocks. No payment, no commitment." />
      <div className="plan-preview">
        <span className="feature-icon"><Icon name={plan === 'business' ? 'layers' : plan === 'free' ? 'leaf' : 'sparkles'} /></span>
        <div className="plan-preview-price"><strong>${item.price}</strong><span>/month</span></div>
        <ul className="price-features">{item.features.slice(0, 5).map((feature) => <li key={feature}><Icon name="check" />{feature}</li>)}</ul>
      </div>
      <div className="dialog-footer">
        <button type="button" className="button button-secondary" onClick={ws.closeDialog}>Not now</button>
        <button type="button" className="button button-primary" onClick={confirm}>Explore {item.name} <Icon name="arrow-right" /></button>
      </div>
    </>
  )
}
