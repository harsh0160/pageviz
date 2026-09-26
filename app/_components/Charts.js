'use client'

import { useEffect, useId, useState } from 'react'
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { compactNumber, formatNumber } from '@/lib/analytics'

// Ports src/charts.js. Chart.js `tension: 0.4` → recharts `type="monotone"`,
// y axis begins at zero, gradient fill 32% → 2%, no points until hover.
// Colours are read from the CSS tokens so both themes stay in step.

const TOKENS = ['--chart-green', '--chart-fill', '--chart-second', '--chart-third', '--sage', '--border', '--border-strong', '--muted', '--surface']

function readTokens() {
  const styles = getComputedStyle(document.documentElement)
  return Object.fromEntries(TOKENS.map((name) => [name, styles.getPropertyValue(name).trim()]))
}

function useTokens() {
  const [tokens, setTokens] = useState(null)
  useEffect(() => {
    const read = () => setTokens(readTokens())
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])
  return tokens
}

const tickStyle = (tokens) => ({ fill: tokens['--muted'], fontSize: 10, fontFamily: 'var(--font-body)' })

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">{label}</div>
      {payload.map((item) => (
        <div key={item.dataKey} className="chart-tooltip-row">
          {/* The previous period is drawn dashed, so its key is a ring rather than a filled dot. */}
          <span className={`chart-tooltip-dot${item.dataKey === 'previous' ? ' ring' : ''}`} style={{ color: item.color }} />
          <span className="chart-tooltip-label">{item.name}</span>
          <span className="chart-tooltip-value">{formatNumber(item.value)}{unit && <small>{unit}</small>}</span>
        </div>
      ))}
    </div>
  )
}

// Shared by both charts: a faint dashed line marks the hovered day, and the box stays at
// the top of the chart and glides sideways with the pointer instead of trailing it up and
// down (recharts' default follows both ways, slowly, over 400ms).
const tooltipProps = (tokens) => ({
  cursor: { stroke: tokens['--border-strong'], strokeWidth: 1, strokeDasharray: '4 4' },
  position: { y: 0 },
  offset: 16,
  animationDuration: 120,
  animationEasing: 'ease-out',
  wrapperStyle: { pointerEvents: 'none' },
})

const xInterval = (length) => Math.max(0, Math.ceil(length / 8) - 1)

export function TrafficChart({ labels = [], values = [], previous = null, compare = false, preview = false, label = 'Sample website pageviews over time' }) {
  const tokens = useTokens()
  const gradientId = `pv-fill-${useId().replace(/:/g, '')}`
  if (!tokens) return <div role="img" aria-label={label} style={{ height: '100%' }} />

  const showPrevious = !preview && compare && Array.isArray(previous)
  const data = labels.map((name, index) => ({ name, value: values[index] || 0, ...(showPrevious ? { previous: previous[index] || 0 } : {}) }))
  const green = tokens['--chart-green']

  return (
    <div role="img" aria-label={`${label}. Detailed counts are in the statistics and data tables.`} style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 18, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tokens['--chart-fill']} stopOpacity={0.32} />
              <stop offset="100%" stopColor={tokens['--chart-fill']} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {!preview && <CartesianGrid vertical={false} stroke={tokens['--border']} />}
          <XAxis dataKey="name" hide={preview} axisLine={false} tickLine={false} tick={tickStyle(tokens)} tickMargin={8} interval={xInterval(data.length)} />
          <YAxis hide={preview} domain={[0, 'auto']} allowDecimals={false} axisLine={false} tickLine={false} tick={tickStyle(tokens)} tickCount={5} tickMargin={10} width={44} tickFormatter={compactNumber} />
          {!preview && <Tooltip {...tooltipProps(tokens)} content={<ChartTooltip unit=" views" />} />}
          <Area
            type="monotone"
            dataKey="value"
            name="This period"
            stroke={green}
            strokeWidth={2.5}
            strokeLinejoin="round"
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={preview ? false : { r: 5, fill: green, stroke: tokens['--surface'], strokeWidth: 2 }}
            isAnimationActive={!preview}
          />
          {showPrevious && (
            <Line type="monotone" dataKey="previous" name="Previous period" stroke={tokens['--sage']} strokeWidth={1.5} strokeDasharray="5 5" dot={false} activeDot={{ r: 4, fill: tokens['--sage'], stroke: tokens['--surface'] }} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CombinedChart({ labels = [], series = [] }) {
  const tokens = useTokens()
  const gradientId = `pv-fill-${useId().replace(/:/g, '')}`
  if (!tokens) return <div role="img" aria-label="Combined site pageviews over time" style={{ height: '100%' }} />

  const palette = [tokens['--chart-green'], tokens['--chart-third'], tokens['--sage'], tokens['--chart-second']]
  const data = labels.map((name, index) => {
    const row = { name }
    series.forEach((item) => { row[item.id] = item.values[index] || 0 })
    return row
  })

  return (
    <div role="img" aria-label="Combined site pageviews over time. Detailed counts are in the statistics and data tables." style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 18, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tokens['--chart-fill']} stopOpacity={0.32} />
              <stop offset="100%" stopColor={tokens['--chart-fill']} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={tokens['--border']} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={tickStyle(tokens)} tickMargin={8} interval={xInterval(data.length)} />
          <YAxis domain={[0, 'auto']} allowDecimals={false} axisLine={false} tickLine={false} tick={tickStyle(tokens)} tickCount={5} tickMargin={10} width={44} tickFormatter={compactNumber} />
          <Tooltip {...tooltipProps(tokens)} content={<ChartTooltip unit="" />} />
          {series.map((item, index) => {
            const color = palette[index % palette.length]
            return (
              <Area
                key={item.id}
                type="monotone"
                dataKey={item.id}
                name={item.name}
                stroke={color}
                strokeWidth={2}
                fill={index === 0 ? `url(#${gradientId})` : 'transparent'}
                dot={false}
                activeDot={{ r: 5, fill: color, stroke: tokens['--surface'], strokeWidth: 2 }}
              />
            )
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
