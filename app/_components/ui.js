'use client'

import Link from 'next/link'
import Icon from './Icon'
import { TrafficChart, CombinedChart } from './Charts'
import { RANGE_OPTIONS, rangeAllowed, formatNumber } from '@/lib/analytics'

// Small building blocks from the reference's src/ui.js and src/pages/app.js.

export const SoonBadge = () => <span className="badge badge-soon">Soon</span>

export function LiveBadge({ count }) {
  return (
    <span className="live-badge">
      <span className="live-dot"></span>
      <span><strong>{formatNumber(count)}</strong> active now</span>
    </span>
  )
}

export function GrowthBadge({ growth }) {
  if (growth === null || growth === undefined || !Number.isFinite(Number(growth))) return <span className="muted">&mdash;</span>
  const down = Number(growth) < 0
  return (
    <span className={`growth ${down ? 'growth-down' : ''}`}>
      <Icon name={down ? 'arrow-down-right' : 'arrow-up-right'} />
      {Math.abs(Number(growth)).toFixed(1)}%
    </span>
  )
}

export function SiteAvatar({ site, size = '' }) {
  return <span className={`site-avatar ${site.color} ${size}`}>{site.monogram}</span>
}

export const EmptyIcon = ({ name = 'sprout' }) => <span className="empty-icon"><Icon name={name} /></span>

export function BackLink({ href, children }) {
  return <Link className="back-link" href={href}><Icon name="arrow-left" />{children}</Link>
}

export function MetricCard({ label, icon, value, extra, small = false, truncate = false, title }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}{icon && <Icon name={icon} />}</div>
      <div className={`metric-value ${small ? 'metric-value-small' : ''} ${truncate ? 'metric-value-truncate' : ''}`} title={title}>{value}</div>
      <div className="metric-extra">{extra || ' '}</div>
    </div>
  )
}

export function RangePicker({ range, onChange, planKey }) {
  return (
    <label className="range-picker">
      <Icon name="clock" />
      <span className="sr-only">Date range</span>
      <select value={range} onChange={(event) => onChange(event.target.value)} aria-label="Date range">
        {RANGE_OPTIONS.map((option) => {
          const locked = !rangeAllowed(option.value, planKey)
          return (
            <option key={option.value} value={option.value} disabled={locked}>
              {option.label}{locked ? (option.needs === 'business' ? ' · Max' : ' · Pro') : ''}
            </option>
          )
        })}
      </select>
      <Icon name="chevron-down" />
    </label>
  )
}

export function ChartCard({ combined = false, preview = false, compare = false, chart, series, footerNote, label }) {
  const title = combined ? 'The whole picture' : 'Pageviews over time'
  return (
    <section className="card chart-card">
      <div className="card-header">
        <div>
          <h2>{title}</h2>
          {!preview && <p>Small moments. A growing story.</p>}
        </div>
        <div className="chart-legend">
          <span><i className="legend-dot"></i>{combined ? 'All sites' : 'This period'}</span>
          {!combined && compare && <span className="legend-previous"><i className="legend-dash"></i>Previous period</span>}
        </div>
      </div>
      <div className={`chart-container ${preview ? 'chart-preview' : ''}`}>
        {combined
          ? <CombinedChart labels={series?.labels} series={series?.series} />
          : <TrafficChart labels={chart?.labels} values={chart?.values} previous={chart?.previous} compare={compare} preview={preview} label={label} />}
      </div>
      {!preview && (
        <div className="chart-footer">
          <span><Icon name="shield-check" /> Every view counted. Every visitor respected.</span>
          <span>{footerNote}</span>
        </div>
      )}
    </section>
  )
}

export function StatList({ title, subtitle, rows, icon, link, empty = 'Nothing here just yet.', action }) {
  const max = Math.max(1, ...rows.map((row) => row.count))
  const total = rows.reduce((sum, row) => sum + row.count, 0) || 1
  return (
    <section className="card stat-card">
      <div className="card-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      <ol className="stat-list">
        {rows.length ? rows.map((row) => (
          <li key={row.name} className="stat-row">
            <span className="stat-bar" style={{ width: `${(row.count / max * 100).toFixed(1)}%` }}></span>
            <span className="stat-content">
              {link
                ? <a href={link(row)} className="stat-name" target="_blank" rel="noopener noreferrer">{icon && <Icon name={icon} />}{row.name}<Icon name="external-link" /></a>
                : <span className="stat-name">{icon && <Icon name={icon} />}{row.name}</span>}
              <span className="stat-figures">
                <span className="stat-count">{formatNumber(row.count)}</span>
                <span className="stat-percent">{(row.count / total * 100).toFixed(1)}%</span>
              </span>
            </span>
          </li>
        )) : <li className="stat-empty">{empty}</li>}
      </ol>
    </section>
  )
}
