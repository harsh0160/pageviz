import { ImageResponse } from 'next/og'

// The card people see when a Pageviz link is pasted into X, Slack or WhatsApp.
// Next renders this at build time, outside a browser, so CSS custom properties
// cannot be resolved here -- these four values are the same tokens as the dark
// theme in app/globals.css and must be changed together with them.
const BACKGROUND = '#162019'
const TEXT = '#e8efe4'
const MUTED = '#a0b09a'
const ACCENT = '#d2e7af'

export const alt = 'Pageviz — simple, privacy-first website analytics'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function openGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: BACKGROUND,
          padding: '80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '52px' }}>
          {/* Only the bars tilt, the same -12deg as .brand-mark in globals.css. */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', transform: 'rotate(-12deg)' }}>
            <div style={{ width: '14px', height: '28px', backgroundColor: ACCENT, borderRadius: '3px' }} />
            <div style={{ width: '14px', height: '48px', backgroundColor: ACCENT, borderRadius: '3px' }} />
            <div style={{ width: '14px', height: '68px', backgroundColor: ACCENT, borderRadius: '3px' }} />
          </div>
          <div style={{ fontSize: '44px', color: TEXT, marginLeft: '26px' }}>Pageviz</div>
        </div>
        <div style={{ fontSize: '86px', color: TEXT, lineHeight: 1.1, letterSpacing: '-2px' }}>
          Less noise. More insight.
        </div>
        <div style={{ fontSize: '38px', color: MUTED, marginTop: '32px' }}>
          Simple, cookieless website analytics. All your sites, one dashboard.
        </div>
      </div>
    ),
    size
  )
}
