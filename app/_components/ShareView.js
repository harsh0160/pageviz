'use client'

import { useState } from 'react'
import Link from 'next/link'
import Brand from './Brand'
import Icon from './Icon'
import ThemeButton from './ThemeButton'
import { useToast } from './Toast'
import { ChartCard, EmptyIcon, GrowthBadge, LiveBadge, MetricCard, SiteAvatar } from './ui'
import { formatNumber } from '@/lib/analytics'

// The reference's sharePage() from src/pages/share.js. Presentational only:
// the real page feeds it from /api/share-auth, the demo from sample data.

function ShareStatList({ title, rows }) {
  const max = Math.max(1, ...rows.map((row) => row.count))
  const total = rows.reduce((sum, row) => sum + row.count, 0) || 1
  return (
    <section className="card stat-card">
      <div className="card-header"><h2>{title}</h2></div>
      <ol className="stat-list">
        {rows.length ? rows.map((row) => (
          <li key={row.name} className="stat-row">
            <span className="stat-bar" style={{ width: `${(row.count / max * 100).toFixed(1)}%` }}></span>
            <span className="stat-content">
              <span className="stat-name">{row.name}</span>
              <span className="stat-figures"><span className="stat-count">{formatNumber(row.count)}</span><span className="stat-percent">{(row.count / total * 100).toFixed(1)}%</span></span>
            </span>
          </li>
        )) : <li className="stat-empty">Nothing here just yet.</li>}
      </ol>
    </section>
  )
}

function ShareHeader({ meta = true }) {
  return (
    <header className="share-header">
      <div className="container share-header-inner">
        <Brand />
        {meta
          ? <div className="share-header-meta"><span className="badge badge-soft"><Icon name="link" />Public stats</span><ThemeButton /></div>
          : <ThemeButton />}
      </div>
    </header>
  )
}

export default function ShareView({ status, site, stats, live = null, rangeText, chartNote = '', onUnlock, hint }) {
  const toast = useToast()
  const [password, setPassword] = useState('')
  const [shake, setShake] = useState(false)
  const [unlocking, setUnlocking] = useState(false)

  if (status === 'loading') {
    return <div className="share-page"><ShareHeader meta={false} /><main id="main-content" className="share-main app-loading"><Icon name="sprout" />Loading…</main></div>
  }

  if (status === 'not-shared') {
    return (
      <div className="share-page">
        <ShareHeader meta={false} />
        <main id="main-content" className="share-main">
          <div className="share-locked">
            <EmptyIcon name="eye-off" />
            <h1>This page isn&apos;t shared</h1>
            <p>The owner hasn&apos;t made public stats available for this site, or the link has been turned off.</p>
            <Link className="button button-primary" href="/">Visit Pageviz <Icon name="arrow-up-right" /></Link>
          </div>
        </main>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="share-page">
        <ShareHeader meta={false} />
        <main id="main-content" className="share-main">
          <div className="share-locked">
            <EmptyIcon name="info" />
            <h1>These stats didn&apos;t load</h1>
            <p>Something went wrong on our side. Give it a moment, then try again.</p>
            <button type="button" className="button button-primary" onClick={() => window.location.reload()}>Try again <Icon name="refresh-cw" /></button>
          </div>
        </main>
      </div>
    )
  }

  if (status === 'locked') {
    const submit = async (event) => {
      event.preventDefault()
      const value = password.trim()
      if (!value) return
      setUnlocking(true)
      const ok = await onUnlock(value)
      setUnlocking(false)
      if (!ok) {
        setShake(true)
        toast('That password doesn’t match', { icon: 'lock' })
        setTimeout(() => setShake(false), 500)
      }
    }
    return (
      <div className="share-page">
        <ShareHeader />
        <main id="main-content" className="share-main">
          <div className="share-locked">
            <EmptyIcon name="lock-keyhole" />
            <h1>{site?.name ? `${site.name}’s stats are password-protected` : 'These stats are password-protected'}</h1>
            <p>Enter the password the owner shared with you to peek at the numbers.</p>
            <form className="share-unlock" onSubmit={submit}>
              <div className={`input-with-icon ${shake ? 'shake' : ''}`}><Icon name="key-round" /><input className="input" name="password" type="password" placeholder="Password" autoComplete="off" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
              <button type="submit" className="button button-primary" disabled={unlocking}>Unlock <Icon name="arrow-right" /></button>
            </form>
            {hint && <p className="share-hint"><Icon name="info" />Demo hint: the password is <strong>{hint}</strong></p>}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="share-page">
      <ShareHeader />
      <main id="main-content" className="share-main">
        <div className="container share-container">
          <div className="share-title">
            <div className="share-title-site">
              <SiteAvatar site={site} size="avatar-large" />
              <div>
                <span className="eyebrow">Public dashboard</span>
                <h1>{site.name}</h1>
                <a className="site-domain" href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer"><Icon name="globe" />{site.domain}</a>
              </div>
            </div>
            {live !== null && <LiveBadge count={live} />}
          </div>
          <p className="share-range"><Icon name="clock" />{rangeText}</p>
          <div className="metric-grid">
            <MetricCard label="Pageviews" icon="bar-chart-3" value={formatNumber(stats.views)} extra={<><GrowthBadge growth={stats.growth} /><span>vs. previous</span></>} />
            {/* Reference shows "Visitors" here; Pageviz never reports visitors. */}
            <MetricCard label="Top page" icon="file" small truncate title={stats.topPage?.name} value={stats.topPage ? stats.topPage.name : '—'} extra={stats.topPage ? <span>{stats.topPage.share.toFixed(1)}% of pageviews</span> : <span>No page views yet</span>} />
            <MetricCard label="Reading now" icon="circle-dot" small value={live === null ? '—' : formatNumber(live)} extra={live === null ? <span>Live counts are a Pro feature</span> : <><span className="live-dot"></span>Live</>} />
          </div>
          <ChartCard chart={stats.chart} footerNote={chartNote} label={`${site.name} pageviews over time`} />
          <div className="stat-columns">
            <ShareStatList title="Top pages" rows={stats.pages} />
            <ShareStatList title="Referrers" rows={stats.referrers} />
          </div>
          <div className="share-foot">
            <Brand />
            <p>These stats are shared with Pageviz &mdash; simple, privacy-first analytics.</p>
            <Link className="button button-primary" href="/signup">Measure your own site free <Icon name="arrow-up-right" /></Link>
          </div>
        </div>
      </main>
    </div>
  )
}
