'use client'

import Link from 'next/link'
import Icon from '../_components/Icon'
import { useSoon } from '../_components/Toast'

// Column titles, items and copy are word-for-word from the reference's roadmapPage().
// The reference renders them as static cards; here each one is clickable:
// shipped items open the feature in the demo workspace, the rest answer with
// the reference's own "still growing" toast.
const COLUMNS = [
  ['Growing now', 'sprout', [
    ['Combined multi-site view', 'Watch every site in one calm dashboard.', '/demo/all'],
    ['CSV exports', 'Take your numbers wherever you need them.', '/demo/studio-north'],
    ['Password-protected sharing', 'Send clean links to clients and collaborators.', '/demo/share/studio-north'],
  ]],
  ['Sprouting soon', 'leaf', [
    ['Team members', 'Invite collaborators into your workspace.'],
    ['Custom goals & funnels', 'Follow the little journeys that matter.'],
    ['Email digests', 'A gentle weekly summary in your inbox.'],
  ]],
  ['Seeds we’re planting', 'star', [
    ['Native mobile app', 'Your stats, in your pocket.'],
    ['Uptime pings', 'A quiet nudge if a site goes dark.'],
    ['Public API', 'Build your own little dashboards.'],
  ]],
]

export default function RoadmapGrid() {
  const soon = useSoon()
  return (
    <div className="roadmap-grid">
      {COLUMNS.map(([title, symbol, items]) => (
        <div key={title} className="roadmap-column">
          <div className="roadmap-column-head"><span className="feature-icon"><Icon name={symbol} /></span><h2>{title}</h2></div>
          {items.map(([name, description, href]) => (href ? (
            <Link key={name} href={href} className="roadmap-item">
              <strong>{name}</strong>
              <p>{description}</p>
              <span className="roadmap-item-cta">See it in the demo <Icon name="arrow-right" /></span>
            </Link>
          ) : (
            <button key={name} type="button" className="roadmap-item" onClick={soon}>
              <strong>{name}</strong>
              <p>{description}</p>
            </button>
          )))}
        </div>
      ))}
    </div>
  )
}
