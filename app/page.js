'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const barHeights = [38, 52, 44, 68, 58, 82, 64, 88, 74, 94, 80, 100]

const faqs = [
  { q: "Do I still need a cookie banner?", a: "Usually no. pageviz doesn't set cookies or store personal identifiers, so most sites won't need a consent banner for it." },
  { q: "Will the script slow my site down?", a: "It shouldn't. The script is under 2kb and loads asynchronously, so it won't block your page from rendering." },
  { q: "How far back does my history go?", a: "The free plan keeps 7 days of history. Pro, once live, extends that to a full year." },
  { q: "Who can see my data?", a: "Only you. It's stored in your own project and never sold or shared with third parties." },
]

export default function Home() {
  const router = useRouter()
  const [count, setCount] = useState(2847)
  const [openFaq, setOpenFaq] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push('/dashboard')
    })
  }, [])

  useEffect(() => {
    const id = setInterval(() => setCount((c) => c + Math.floor(Math.random() * 4) + 1), 4000)
    return () => clearInterval(id)
  }, [])

  const displayFont = { fontFamily: 'var(--font-display)' }
  const monoFont = { fontFamily: 'var(--font-mono-data)' }

  return (
    <div className="min-h-screen bg-[#FAFAF7]" style={{ fontFamily: 'var(--font-body)' }}>
      <nav className="border-b border-[#E4E7E1] sticky top-0 z-20 bg-[#FAFAF7]/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-xl text-[#13221D]" style={displayFont}>
            <svg width="26" height="18" viewBox="0 0 26 18" fill="none">
              <polyline points="1,13 7,13 9,4 12,15 14,9 16,9 18,3 20,13 25,13" stroke="#1F4A3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            pageviz
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#5C6E65]" style={monoFont}>
            <span className="relative flex h-[7px] w-[7px]">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5A1F] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-[7px] w-[7px] bg-[#FF5A1F]"></span>
            </span>
            recording — live
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hidden sm:inline text-sm font-medium text-[#5C6E65] hover:text-[#13221D] transition-colors">Log in</Link>
            <Link href="/login?signup=1" className="text-sm font-bold text-white bg-[#E64A12] hover:bg-[#13221D] transition-colors rounded-lg px-5 py-2.5">Sign up free</Link>
          </div>
        </div>
      </nav>

      <header className="max-w-5xl mx-auto px-7 pt-20 pb-0">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs tracking-wide text-[#1F4A3D] bg-white border border-[#E4E7E1] px-3.5 py-1.5 rounded-full mb-6" style={monoFont}>
              ● NO COOKIES · 1.8KB SCRIPT · GDPR-FRIENDLY
            </span>
            <h1 className="text-[42px] sm:text-6xl font-bold leading-[1.03] text-[#13221D] tracking-tight" style={displayFont}>
              Every visit,<br />one clean <span className="text-[#E64A12]">signal</span>.
            </h1>
            <p className="mt-5 text-lg text-[#5C6E65] max-w-md">
              pageviz tells you who&apos;s on your site right now — no cookies, no consent banner, no forty-tab dashboard to make sense of it.
            </p>
            <div className="flex flex-wrap gap-3.5 mt-8">
              <Link href="/login?signup=1" className="inline-flex items-center text-base font-bold text-white bg-[#E64A12] hover:bg-[#13221D] transition-colors rounded-lg px-6 py-3.5">Start tracking — free</Link>
              <a href="#specsheet" className="inline-flex items-center text-base font-bold text-[#1F4A3D] border-[1.5px] border-[#1F4A3D] hover:bg-[#1F4A3D] hover:text-white transition-colors rounded-lg px-6 py-3.5">See the spec sheet</a>
            </div>
            <p className="mt-4 text-xs text-[#5C6E65]" style={monoFont}>1 site free · no credit card · live in under 2 minutes</p>
          </div>

          <div className="bg-white border border-[#E4E7E1] rounded-2xl overflow-hidden shadow-[0_24px_60px_-30px_rgba(19,34,29,0.28)]">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E4E7E1]">
              <span className="w-[9px] h-[9px] rounded-full bg-[#F0997B]"></span>
              <span className="w-[9px] h-[9px] rounded-full bg-[#FAC775]"></span>
              <span className="w-[9px] h-[9px] rounded-full bg-[#97C459]"></span>
              <span className="ml-2.5 text-[11px] text-[#5C6E65] bg-[#FAFAF7] rounded px-2.5 py-1" style={monoFont}>pageviz.app/dashboard</span>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="text-[34px] font-medium text-[#123028] leading-none" style={monoFont}>{count.toLocaleString()}</div>
                  <div className="text-[13px] text-[#5C6E65] mt-1.5">Pageviews this week</div>
                </div>
                <span className="text-xs font-medium text-[#27500A] bg-[#EAF3DE] px-2.5 py-1 rounded" style={monoFont}>+18%</span>
              </div>
              <div className="flex items-end gap-1.5 h-[100px] mb-5">
                {barHeights.map((h, i) => <span key={i} className="flex-1 bg-[#1F4A3D] opacity-85 rounded-t-sm" style={{ height: `${h}%` }} />)}
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-[#E4E7E1] pt-4">
                <div>
                  <h5 className="text-[11px] uppercase tracking-wide text-[#5C6E65] font-semibold mb-2.5">Top pages</h5>
                  <div className="flex justify-between text-sm py-1"><span>/pricing</span><span className="text-[#5C6E65]" style={monoFont}>842</span></div>
                  <div className="flex justify-between text-sm py-1"><span>/docs</span><span className="text-[#5C6E65]" style={monoFont}>410</span></div>
                </div>
                <div>
                  <h5 className="text-[11px] uppercase tracking-wide text-[#5C6E65] font-semibold mb-2.5">Devices</h5>
                  <div className="flex justify-between text-sm py-1"><span>Mobile</span><span className="text-[#5C6E65]" style={monoFont}>68%</span></div>
                  <div className="flex justify-between text-sm py-1"><span>Desktop</span><span className="text-[#5C6E65]" style={monoFont}>32%</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-[#123028] py-24 mt-[88px]">
        <div className="max-w-5xl mx-auto px-7 text-center">
          <p className="font-bold text-[#FAFAF7] text-[26px] sm:text-4xl leading-[1.28] max-w-3xl mx-auto tracking-tight" style={displayFont}>
            Built for indie developers who&apos;d rather <span className="text-[#FF5A1F]">ship</span> than fight a dashboard.
          </p>
        </div>
      </div>

      <section id="specsheet" className="py-20 border-t border-[#E4E7E1]">
        <div className="max-w-5xl mx-auto px-7">
          <div className="max-w-xl mb-11">
            <span className="block text-xs tracking-wide text-[#E64A12] uppercase font-medium mb-3" style={monoFont}>the spec sheet</span>
            <h2 className="text-[28px] sm:text-4xl font-bold leading-tight text-[#13221D]" style={displayFont}>Built light. Built honest.</h2>
            <p className="mt-3.5 text-[17px] text-[#5C6E65]">No hidden weight, no data-broker fine print. This is exactly what runs on your site.</p>
          </div>
          <div className="border border-[#E4E7E1] rounded-2xl overflow-hidden bg-white">
            <div className="grid sm:grid-cols-[230px_1fr]">
              <div className="p-6 text-xs text-[#5C6E65] tracking-wide uppercase bg-[#FAFAF7] sm:border-r border-b sm:border-b-0 border-[#E4E7E1] flex items-center" style={monoFont}>Script size</div>
              <div className="p-6 text-[17px] flex items-center"><strong className="font-bold">1.8kb</strong>&nbsp;minified, loads in one async request</div>
            </div>
            <div className="grid sm:grid-cols-[230px_1fr] border-t border-[#E4E7E1]">
              <div className="p-6 text-xs text-[#5C6E65] tracking-wide uppercase bg-[#FAFAF7] sm:border-r border-b sm:border-b-0 border-[#E4E7E1] flex items-center" style={monoFont}>Cookies set</div>
              <div className="p-6 text-[17px] flex items-center"><strong className="font-bold">Zero.</strong>&nbsp;Nothing written to the visitor&apos;s browser</div>
            </div>
            <div className="grid sm:grid-cols-[230px_1fr] border-t border-[#E4E7E1]">
              <div className="p-6 text-xs text-[#5C6E65] tracking-wide uppercase bg-[#FAFAF7] sm:border-r border-b sm:border-b-0 border-[#E4E7E1] flex items-center" style={monoFont}>Setup time</div>
              <div className="p-6 text-[17px] flex items-center">One script tag before <span className="mx-1" style={monoFont}>&lt;/body&gt;</span> — no config file</div>
            </div>
            <div className="grid sm:grid-cols-[230px_1fr] border-t border-[#E4E7E1]">
              <div className="p-6 text-xs text-[#5C6E65] tracking-wide uppercase bg-[#FAFAF7] sm:border-r border-b sm:border-b-0 border-[#E4E7E1] flex items-center" style={monoFont}>Data ownership</div>
              <div className="p-6 text-[17px] flex items-center">Stored in your own project. Never sold, never shared</div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 border-t border-[#E4E7E1]">
        <div className="max-w-5xl mx-auto px-7">
          <div className="max-w-xl mb-11">
            <span className="block text-xs tracking-wide text-[#E64A12] uppercase font-medium mb-3" style={monoFont}>how it works</span>
            <h2 className="text-[28px] sm:text-4xl font-bold leading-tight text-[#13221D]" style={displayFont}>Three steps. No onboarding tour.</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-9">
            <div>
              <div className="w-[42px] h-[42px] rounded-full bg-[#1F4A3D] text-white flex items-center justify-center text-sm font-medium mb-5" style={monoFont}>01</div>
              <h3 className="text-[19px] font-semibold mb-2 text-[#13221D]">Drop in the script</h3>
              <p className="text-[15px] text-[#5C6E65]">Paste one line before the closing body tag on any site you own.</p>
            </div>
            <div>
              <div className="w-[42px] h-[42px] rounded-full bg-[#1F4A3D] text-white flex items-center justify-center text-sm font-medium mb-5" style={monoFont}>02</div>
              <h3 className="text-[19px] font-semibold mb-2 text-[#13221D]">Visitors arrive</h3>
              <p className="text-[15px] text-[#5C6E65]">Each pageview sends a single anonymous ping — no identifiers stored.</p>
            </div>
            <div>
              <div className="w-[42px] h-[42px] rounded-full bg-[#1F4A3D] text-white flex items-center justify-center text-sm font-medium mb-5" style={monoFont}>03</div>
              <h3 className="text-[19px] font-semibold mb-2 text-[#13221D]">Watch it update</h3>
              <p className="text-[15px] text-[#5C6E65]">Pageviews, referrers and devices land on your dashboard in real time.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-[#E4E7E1]">
        <div className="max-w-5xl mx-auto px-7">
          <div className="max-w-xl mb-8">
            <span className="block text-xs tracking-wide text-[#E64A12] uppercase font-medium mb-3" style={monoFont}>compliance, plainly</span>
            <h2 className="text-[28px] sm:text-4xl font-bold leading-tight text-[#13221D]" style={displayFont}>Doesn&apos;t need the fine print</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {['No cookies', 'GDPR-friendly', 'Open metrics', 'Self-serve'].map((label) => (
              <span key={label} className="text-[13.5px] font-medium bg-[#1F4A3D] text-white px-4 py-2.5 rounded-full flex items-center gap-2" style={monoFont}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-[#E4E7E1]">
        <div className="max-w-5xl mx-auto px-7">
          <div className="max-w-xl mb-11">
            <span className="block text-xs tracking-wide text-[#E64A12] uppercase font-medium mb-3" style={monoFont}>pricing</span>
            <h2 className="text-[28px] sm:text-4xl font-bold leading-tight text-[#13221D]" style={displayFont}>One honest free plan.</h2>
            <p className="mt-3.5 text-[17px] text-[#5C6E65]">No trial countdown. Pro is coming — this is what&apos;s live today.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border-2 border-[#E64A12] rounded-2xl p-8 bg-white relative shadow-[0_20px_44px_-28px_rgba(230,74,18,0.4)]">
              <span className="absolute -top-3.5 left-7 bg-[#E64A12] text-white font-bold text-[11.5px] px-3.5 py-1.5 rounded-full uppercase" style={monoFont}>Live now</span>
              <h3 className="text-[22px] font-semibold text-[#13221D]">Free</h3>
              <div className="text-[34px] font-medium my-4" style={monoFont}>Free</div>
              <div className="text-sm text-[#5C6E65] mb-6">No credit card, ever.</div>
              <ul className="flex flex-col gap-3.5 mb-7">
                {['1 site tracked', 'Unlimited pageviews', '7-day history', 'Referrer and device breakdown'].map((f) => (
                  <li key={f} className="flex gap-2.5 text-[15px] items-start">
                    <svg className="w-[17px] h-[17px] text-[#1F4A3D] mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login?signup=1" className="w-full flex justify-center text-sm font-bold text-white bg-[#E64A12] hover:bg-[#13221D] transition-colors rounded-lg px-5 py-3">Start free</Link>
            </div>
            <div className="border border-[#E4E7E1] rounded-2xl p-8 bg-white">
              <h3 className="text-[22px] font-semibold text-[#13221D]">Pro</h3>
              <div className="text-2xl font-medium my-4" style={monoFont}>Coming soon</div>
              <div className="text-sm text-[#5C6E65] mb-6">For sites that outgrow one.</div>
              <ul className="flex flex-col gap-3.5 mb-7">
                {['Unlimited sites', '1-year history', 'CSV export', 'Priority email support'].map((f) => (
                  <li key={f} className="flex gap-2.5 text-[15px] items-start">
                    <svg className="w-[17px] h-[17px] text-[#1F4A3D] mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button disabled className="w-full flex justify-center text-sm font-bold text-[#1F4A3D] border-[1.5px] border-[#1F4A3D] opacity-60 cursor-not-allowed rounded-lg px-5 py-3">Get notified</button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-[#E4E7E1]">
        <div className="max-w-5xl mx-auto px-7">
          <div className="max-w-xl mb-8">
            <span className="block text-xs tracking-wide text-[#E64A12] uppercase font-medium mb-3" style={monoFont}>questions</span>
            <h2 className="text-[28px] sm:text-4xl font-bold leading-tight text-[#13221D]" style={displayFont}>Before you install it</h2>
          </div>
          <div>
            {faqs.map((item, i) => (
              <div key={i} className={`border-b border-[#E4E7E1] ${i === 0 ? 'border-t' : ''}`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex justify-between items-center py-6 text-left text-[17px] font-semibold text-[#13221D]">
                  {item.q}
                  <span className={`text-xl text-[#E64A12] transition-transform ${openFaq === i ? 'rotate-45' : ''}`} style={monoFont}>+</span>
                </button>
                {openFaq === i && <p className="pb-6 text-[#5C6E65] text-[15px] max-w-xl">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-[#E64A12] py-20 text-center">
        <div className="max-w-5xl mx-auto px-7">
          <h2 className="text-white text-[28px] sm:text-4xl font-bold" style={displayFont}>Start tracking, without the surveillance.</h2>
          <p className="text-[#FFE0D3] mt-3 text-base">One free site. No credit card. Live in under two minutes.</p>
          <Link href="/login?signup=1" className="inline-flex mt-7 text-base font-bold text-[#E64A12] bg-white hover:bg-[#13221D] hover:text-white transition-colors rounded-lg px-7 py-4">Start tracking — free</Link>
        </div>
      </div>

      <footer className="py-14">
        <div className="max-w-5xl mx-auto px-7">
          <div className="grid sm:grid-cols-[1.4fr_1fr_1fr_1fr] gap-9 pb-11">
            <div>
              <div className="flex items-center gap-2.5 font-bold text-xl text-[#13221D] mb-3" style={displayFont}>
                <svg width="26" height="18" viewBox="0 0 26 18" fill="none"><polyline points="1,13 7,13 9,4 12,15 14,9 16,9 18,3 20,13 25,13" stroke="#1F4A3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                pageviz
              </div>
              <p className="text-sm text-[#5C6E65] max-w-[230px]">Lightweight, cookieless analytics for people who&apos;d rather not manage a consent banner.</p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wide text-[#5C6E65] mb-4" style={monoFont}>Product</h4>
              <a href="#" className="block text-sm mb-2.5 text-[#13221D] hover:text-[#E64A12]">Features</a>
              <a href="#" className="block text-sm mb-2.5 text-[#13221D] hover:text-[#E64A12]">Pricing</a>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wide text-[#5C6E65] mb-4" style={monoFont}>Resources</h4>
              <a href="#" className="block text-sm mb-2.5 text-[#13221D] hover:text-[#E64A12]">FAQ</a>
            </div>
            <div>
<h4 className="text-xs uppercase tracking-wide text-[#5C6E65] mb-4" style={monoFont}>Legal</h4>
<Link href="/privacy" target="_blank" rel="noopener noreferrer" className="block text-sm mb-2.5 text-[#13221D] hover:text-[#E64A12]">Privacy</Link>
<Link href="/terms" target="_blank" rel="noopener noreferrer" className="block text-sm mb-2.5 text-[#13221D] hover:text-[#E64A12]">Terms</Link>
<Link href="/refund" target="_blank" rel="noopener noreferrer" className="block text-sm mb-2.5 text-[#13221D] hover:text-[#E64A12]">Refund Policy</Link>
            </div>
          </div>
          <div className="border-t border-[#E4E7E1] pt-6 flex flex-wrap justify-between gap-2.5 items-center">
            <p className="text-xs text-[#5C6E65]" style={monoFont}>© 2026 pageviz</p>
            <p className="text-xs text-[#5C6E65] flex items-center gap-2" style={monoFont}>
              <span className="w-[7px] h-[7px] rounded-full bg-[#FF5A1F] inline-block"></span>
              all systems recording
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}


