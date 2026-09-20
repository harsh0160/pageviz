'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Icon from '../Icon'
import CheckoutButton from '../../pricing/CheckoutButton'
import { useSoon } from '../Toast'
import { EmptyIcon, SoonBadge } from '../ui'
import { useThemePreference } from '@/lib/theme'
import { CONTACT_EMAIL, PLANS, PLAN_ORDER } from '@/lib/plans'
import AppShell from './AppShell'
import { useWorkspace } from './context'
import { ChangePasswordDialog, PlanPreviewDialog } from './dialogs'

// The reference's src/pages/settings.js (plus the sidebar's Team members item).

function SettingsShell({ tab, children }) {
  const ws = useWorkspace()
  const tabsRef = useRef(null)
  // Next port: on narrow screens the tabs become a sideways-scrolling row and "Plan & billing"
  // sat half off-screen while active; scroll the row (not the page) so the active tab shows.
  useEffect(() => {
    const row = tabsRef.current
    const active = row?.querySelector('.settings-tab.active')
    if (!row || !active || row.scrollWidth <= row.clientWidth) return
    const right = active.offsetLeft + active.offsetWidth
    if (active.offsetLeft < row.scrollLeft || right > row.scrollLeft + row.clientWidth) {
      row.scrollLeft = right - row.clientWidth + 12
    }
  }, [tab, ws.ready])
  if (!ws.ready) return <AppShell />
  const tabs = [
    [ws.paths.settings, 'palette', 'Appearance', 'appearance'],
    [ws.paths.account, 'user', 'Account', 'account'],
    [ws.paths.billing, 'credit-card', 'Plan & billing', 'billing'],
    [ws.paths.referrals, 'gift', 'Refer a friend', 'referrals'],
  ]
  return (
    <AppShell active="settings" crumb="Settings">
      <div className="page-head">
        <div>
          <span className="eyebrow">Workspace</span>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Tend to your account, your plan, and how Pageviz looks.</p>
        </div>
      </div>
      <div className="settings-layout">
        <nav className="settings-tabs" aria-label="Settings sections" ref={tabsRef}>
          {tabs.map(([href, icon, label, key]) => (
            <Link key={key} href={href} className={`settings-tab ${tab === key ? 'active' : ''}`} aria-current={tab === key ? 'page' : undefined}>
              <Icon name={icon} />{label}{key === 'referrals' && <SoonBadge />}
            </Link>
          ))}
        </nav>
        <div className="settings-body">{children}</div>
      </div>
    </AppShell>
  )
}

/* ---------- Appearance ---------- */

export function AppearanceView() {
  const ws = useWorkspace()
  const [theme, setTheme] = useThemePreference()

  const choice = (value, icon, label) => {
    const active = theme === value
    return (
      <button type="button" className={`theme-choice ${active ? 'active' : ''}`} onClick={() => setTheme(value)} aria-pressed={active}>
        <span className={`theme-choice-preview theme-choice-${value}`}><Icon name={icon} /></span>
        <span>{label}</span>
        {active && <span className="theme-choice-check"><Icon name="check" /></span>}
      </button>
    )
  }

  return (
    <SettingsShell tab="appearance">
      <section className="settings-card">
        <div className="settings-card-head"><h2>Color theme</h2><p>Choose a look that is easy on your eyes. System follows your device.</p></div>
        <div className="theme-choices">{choice('light', 'sun', 'Light')}{choice('dark', 'moon', 'Dark')}{choice('system', 'monitor', 'System')}</div>
      </section>
      <section className="settings-card">
        <div className="settings-card-head"><h2>Dashboard preferences</h2><p>Small touches to make the numbers feel like yours.</p></div>
        <div className="pref-row">
          <div><strong>Compare to previous period</strong><p>Show a dashed line for the period before, on every chart.</p></div>
          <button type="button" className="switch" role="switch" aria-checked={ws.compare} onClick={() => { ws.setCompare(!ws.compare); ws.toast(!ws.compare ? 'Comparison on' : 'Comparison off', { icon: 'trending-up' }) }} aria-label="Compare to previous period"></button>
        </div>
        <div className="pref-row">
          <div><strong>Weekly email digest</strong><p>A gentle Monday summary of how your sites did last week.</p></div>
          {ws.isDemo
            ? <button type="button" className="switch" role="switch" aria-checked={ws.digest} onClick={() => ws.actions.setDigest(!ws.digest)} aria-label="Weekly email digest"></button>
            // TODO: not wired yet — digest opt-out. The weekly-digest cron emails every account with pageviews; needs a profiles.digest_enabled column the cron filters on.
            // Until then a real account sees "Soon" instead of a switch that looks on but does nothing.
            : <SoonBadge />}
        </div>
        <div className="pref-row">
          <div><strong>Start the week on</strong><p>Which day your charts and digests begin.</p></div>
          {ws.isDemo
            ? <label className="mini-select"><Icon name="clock" /><select aria-label="Start of week" defaultValue="Monday"><option>Monday</option><option>Sunday</option></select><Icon name="chevron-down" /></label>
            // TODO: not wired yet — week start. Needs a profiles.week_start column; charts and the digest would read it.
            : <SoonBadge />}
        </div>
      </section>
    </SettingsShell>
  )
}

/* ---------- Account ---------- */

export function AccountView() {
  const ws = useWorkspace()
  const soon = useSoon()
  const fullName = ws.user?.fullName || ws.user?.name || ''
  const [name, setName] = useState(fullName)
  const [email, setEmail] = useState(ws.user?.email || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(fullName); setEmail(ws.user?.email || '')
  }, [fullName, ws.user?.email])

  const save = async (event) => {
    event.preventDefault()
    if (ws.isDemo) { ws.toast('Changes saved', { icon: 'check' }); return }
    setSaving(true)
    setMessage(null)
    const result = await ws.actions.updateAccount(name.trim(), email.trim())
    setSaving(false)
    if (result.error) setMessage({ text: result.error, error: true })
    else if (result.notice) setMessage({ text: result.notice })
  }

  return (
    <SettingsShell tab="account">
      <section className="settings-card">
        <div className="settings-card-head"><h2>Your details</h2><p>How you appear across your workspace.</p></div>
        <div className="account-identity">
          <span className="workspace-avatar workspace-avatar-large">{ws.user?.initial}</span>
          <div><strong>{fullName}</strong><span className="muted">{ws.user?.email}</span></div>
          {/* Profile photos need a Supabase Storage bucket + avatar_url column — not built yet. */}
          <SoonBadge />
        </div>
        <form className="settings-form" onSubmit={save}>
          <div className="field-pair">
            <div className="field"><label htmlFor="acc-name">Name</label><input className="input" id="acc-name" value={name} onChange={(event) => setName(event.target.value)} required /></div>
            <div className="field"><label htmlFor="acc-email">Email</label><input className="input" id="acc-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
          </div>
          {message && <div className={`form-message${message.error ? ' error' : ''}`}>{message.text}</div>}
          <button type="submit" disabled={saving} className="button button-primary">{saving ? 'Saving…' : <>Save changes <Icon name="check" /></>}</button>
        </form>
      </section>
      <section className="settings-card">
        <div className="settings-card-head"><h2>Password</h2><p>Keep your quiet corner secure.</p></div>
        <button type="button" className="button button-secondary" onClick={ws.isDemo ? soon : () => ws.openDialog(<ChangePasswordDialog />)}><Icon name="key-round" />Change password</button>
      </section>
      <section className="settings-card settings-card-danger">
        <div className="settings-card-head"><h2>Close account</h2><p>Delete your workspace and all its data. This can&apos;t be undone.</p></div>
        {/* Self-serve deletion needs a service-role route + cleanup + Paddle cancel — not built yet, so this goes through us for now. */}
        <p className="muted">Email us at <strong>{CONTACT_EMAIL}</strong> and we&apos;ll close it for you.</p>
      </section>
    </SettingsShell>
  )
}

/* ---------- Plan & billing ---------- */

export function BillingView() {
  const ws = useWorkspace()
  const soon = useSoon()
  if (!ws.ready) return <SettingsShell tab="billing" />
  const { plan, planKey, isPaid } = ws
  const usage = ws.sites.length
  const rank = (key) => PLAN_ORDER.indexOf(key)

  // Paddle hosts cancelling and card updates on its own pages and gives us the links
  // per subscription. They only exist after a subscription webhook has arrived, so
  // everything below falls back to the old "Soon" behaviour when they are missing.
  const managementUrls = ws.billing?.managementUrls
  const cancelUrl = managementUrls?.cancel || null
  const updateCardUrl = managementUrls?.update_payment_method || null
  const nextBilledAt = ws.billing?.nextBilledAt
  const renewalNote = nextBilledAt
    ? `Renews on ${new Date(nextBilledAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}. Receipts arrive by email.`
    : 'Billing is handled by Paddle. Receipts arrive by email.'

  const planAction = (key) => {
    const item = PLANS[key]
    if (ws.isDemo) return <button type="button" className="button button-secondary button-small" onClick={() => ws.openDialog(<PlanPreviewDialog plan={key} />)}>Switch to {item.name}</button>
    // TODO: upgrading an existing subscriber this way opens a SECOND Paddle subscription
    // (double billing). Real fix: update the live subscription through Paddle's API.
    if (rank(key) > rank(planKey)) return <CheckoutButton plan={key} className="button button-secondary button-small">Switch to {item.name}</CheckoutButton>
    // TODO: not wired yet — downgrades. Needs Paddle subscription update/cancel (API or customer portal link) — a new checkout would double-bill.
    return <button type="button" className="button button-secondary button-small" onClick={soon}>Switch to {item.name}</button>
  }

  return (
    <SettingsShell tab="billing">
      <section className="settings-card settings-card-plan">
        <div className="plan-current">
          <div><span className="eyebrow">Current plan</span><h2 className="plan-current-name">{plan.name}</h2><p>{plan.description}</p></div>
          <div className="plan-current-price"><strong>${plan.price}</strong><span>/ month</span></div>
        </div>
        <div className="plan-usage-bar">
          <div className="usage-line"><span>Websites</span><span>{usage} of {plan.sites}</span></div>
          <div className="progress-track"><span style={{ width: `${Math.min(100, usage / plan.sites * 100)}%` }}></span></div>
        </div>
        {isPaid ? (
          <div className="plan-current-foot">
            {ws.isDemo
              ? <span className="muted"><Icon name="info" />Demo mode &mdash; no real billing. Next renewal would be Oct 8, 2026.</span>
              : <span className="muted"><Icon name="info" />{renewalNote}</span>}
            {updateCardUrl && !ws.isDemo && <a className="text-link" href={updateCardUrl} target="_blank" rel="noreferrer"><Icon name="credit-card" />Update payment method</a>}
            {ws.isDemo
              ? <button type="button" className="text-link" onClick={() => ws.openDialog(<PlanPreviewDialog plan="free" />)}>Switch to Free</button>
              : cancelUrl
                ? <a className="text-link" href={cancelUrl} target="_blank" rel="noreferrer">Cancel subscription</a>
                : <button type="button" className="text-link" onClick={soon}>Switch to Free</button>}
          </div>
        ) : (
          <div className="plan-current-foot"><span className="muted"><Icon name="leaf" />You are on the free plan. No card on file, ever.</span></div>
        )}
      </section>

      <section className="settings-card">
        <div className="settings-card-head">
          <h2>Try another plan</h2>
          <p>{ws.isDemo ? 'Switch instantly to preview what each plan unlocks. Nothing is charged.' : 'Move up whenever your garden needs a little more room. Cancel any time.'}</p>
        </div>
        <div className="plan-options">
          {PLAN_ORDER.map((key) => {
            const item = PLANS[key]
            const current = planKey === key
            return (
              <div key={key} className={`plan-option ${current ? 'current' : ''}`}>
                <div className="plan-option-head">
                  <div><strong>{item.name}</strong><span className="muted">{item.description}</span></div>
                  <div className="plan-option-price"><strong>${item.price}</strong><span>/mo</span></div>
                </div>
                {current ? <span className="badge badge-green"><Icon name="check" />Current plan</span> : planAction(key)}
              </div>
            )
          })}
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card-head"><h2>Billing history</h2><p>Your receipts would live here.</p></div>
        {isPaid && ws.isDemo ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Plan</th><th>Amount</th><th></th></tr></thead>
              <tbody>
                {['Sep 8, 2026', 'Aug 8, 2026', 'Jul 8, 2026'].map((date) => (
                  <tr key={date}><td>{date}</td><td>{plan.name} (monthly)</td><td className="num">${plan.price}.00</td><td><button type="button" className="text-link" onClick={soon}><Icon name="download" />Receipt</button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : isPaid ? (
          // TODO: not wired yet — billing history. Needs Paddle transactions API (server route with the Paddle API key) listed by paddle_customer_id.
          <div className="empty-inline"><Icon name="mail" /><p>Paddle emails you a receipt for every payment.</p></div>
        ) : (
          <div className="empty-inline"><Icon name="credit-card" /><p>No invoices yet. Free plans stay free.</p></div>
        )}
      </section>
    </SettingsShell>
  )
}

/* ---------- Refer a friend ---------- */

export function ReferralsView() {
  // Referrals need a referrals table, a /r/[code] sign-up route, and a Paddle
  // discount/credit for the reward — none of that exists yet, so this stays
  // a plain "Soon" placeholder instead of a referral flow that can't pay out.
  return (
    <SettingsShell tab="referrals">
      <section className="settings-card">
        <div className="setup-hero">
          <EmptyIcon name="gift" />
          <h1 className="page-title">Refer a friend <SoonBadge /></h1>
          <p className="page-sub">Send people your link and you&apos;ll both get a month of Pro, once this is live.</p>
        </div>
      </section>
    </SettingsShell>
  )
}

/* ---------- Team members (sidebar item, "Soon") ---------- */

export function TeamView() {
  const ws = useWorkspace()
  if (!ws.ready) return <AppShell />
  // TODO: not wired yet — team members. Needs a workspace_members table (workspace/site owner, member user, role), invite emails (Resend), and RLS on sites/pageviews that admits members.
  // The reference has no screen for this route; this is the reference's setup-hero pattern with the roadmap's own copy.
  return (
    <AppShell active="team" crumb="Team members">
      <div className="setup-hero">
        <EmptyIcon name="users" />
        <h1 className="page-title">Team members <SoonBadge /></h1>
        <p className="page-sub">Invite collaborators into your workspace.</p>
        <Link className="button button-secondary" href="/roadmap">What’s growing <Icon name="arrow-right" /></Link>
      </div>
    </AppShell>
  )
}
