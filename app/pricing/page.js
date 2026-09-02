import Link from 'next/link'
import CheckoutButton from './CheckoutButton'

export const metadata = {
  title: 'Pricing — Pageviz',
  description: 'Simple, honest pricing for Pageviz — privacy-first website analytics.',
}

const displayFont = { fontFamily: 'var(--font-display)' }
const monoFont = { fontFamily: 'var(--font-mono-data)' }

function Check() {
  return (
    <svg className="w-4.25 h-4.25 text-[#1F4A3D] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

const plans = [
  {
    name: 'Free',
    price: 'Free',
    sub: 'No credit card, ever.',
    features: ['1 site tracked', 'Unlimited pageviews', '7-day history', 'Referrer and device breakdown'],
    cta: { label: 'Start free', href: '/login?signup=1', style: 'outline' },
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    sub: 'For production sites and growing projects.',
    featured: true,
    features: ['Up to 10 sites', '1-year history', 'CSV export', 'Password-protected share links', 'Custom events & goals', 'Real-time visitor count', 'Priority email support'],
    cta: { label: 'Upgrade to Pro', checkoutPlan: 'pro', style: 'primary' },
  },
  {
    name: 'Business',
    price: '$22',
    period: '/month',
    sub: 'For teams running several properties.',
    features: ['Up to 30 sites', 'Everything in Pro', 'Multi-site combined dashboard', 'Forever history', 'Priority support & onboarding help'],
    cta: { label: 'Upgrade to Business', checkoutPlan: 'business', style: 'outline' },
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7]" style={{ fontFamily: 'var(--font-body)' }}>
      <nav className="border-b border-[#E4E7E1] sticky top-0 z-20 bg-[#FAFAF7]/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-7 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-[#13221D]" style={displayFont}>
            <svg width="26" height="18" viewBox="0 0 26 18" fill="none">
              <polyline points="1,13 7,13 9,4 12,15 14,9 16,9 18,3 20,13 25,13" stroke="#1F4A3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Pageviz
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hidden sm:inline text-sm font-medium text-[#5C6E65] hover:text-[#13221D] transition-colors">Log in</Link>
            <Link href="/login?signup=1" className="text-sm font-bold text-white bg-[#E64A12] hover:bg-[#13221D] transition-colors rounded-lg px-5 py-2.5">Sign up free</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-7 py-20">
        <div className="max-w-xl mb-14">
          <span className="block text-xs tracking-wide text-[#E64A12] uppercase font-medium mb-3" style={monoFont}>pricing</span>
          <h1 className="text-[28px] sm:text-4xl font-bold leading-tight text-[#13221D]" style={displayFont}>Simple, honest pricing.</h1>
          <p className="mt-3.5 text-[17px] text-[#5C6E65]">Start free forever on side projects. Upgrade when your traffic — or your site count — grows.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 bg-white relative ${
                plan.featured
                  ? 'border-2 border-[#E64A12] shadow-[0_20px_44px_-28px_rgba(230,74,18,0.4)]'
                  : 'border border-[#E4E7E1]'
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3.5 left-7 bg-[#E64A12] text-white font-bold text-[11.5px] px-3.5 py-1.5 rounded-full uppercase" style={monoFont}>
                  Most popular
                </span>
              )}
              <h3 className="text-[22px] font-semibold text-[#13221D]">{plan.name}</h3>
              <div className="my-4 flex items-baseline gap-1">
                <span className="text-[34px] font-medium" style={monoFont}>{plan.price}</span>
                {plan.period && <span className="text-sm text-[#5C6E65]">{plan.period}</span>}
              </div>
              <div className="text-sm text-[#5C6E65] mb-6">{plan.sub}</div>
              <ul className="flex flex-col gap-3.5 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-[15px] items-start">
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.cta.checkoutPlan ? (
                <CheckoutButton
                  plan={plan.cta.checkoutPlan}
                  className={`w-full flex justify-center text-sm font-bold rounded-lg px-5 py-3 transition-colors ${
                    plan.cta.style === 'primary'
                      ? 'text-white bg-[#E64A12] hover:bg-[#13221D]'
                      : 'text-[#1F4A3D] border-[1.5px] border-[#1F4A3D] hover:bg-[#1F4A3D] hover:text-white'
                  }`}
                >
                  {plan.cta.label}
                </CheckoutButton>
              ) : (
                <Link
                  href={plan.cta.href}
                  className={`w-full flex justify-center text-sm font-bold rounded-lg px-5 py-3 transition-colors ${
                    plan.cta.style === 'primary'
                      ? 'text-white bg-[#E64A12] hover:bg-[#13221D]'
                      : 'text-[#1F4A3D] border-[1.5px] border-[#1F4A3D] hover:bg-[#1F4A3D] hover:text-white'
                  }`}
                >
                  {plan.cta.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-[#5C6E65]">
          Questions about billing? See our{' '}
          <Link href="/refund" className="text-[#1F4A3D] font-medium underline">Refund Policy</Link>
          {' '}or{' '}
          <Link href="/terms" className="text-[#1F4A3D] font-medium underline">Terms of Service</Link>.
        </p>
      </main>

      <footer className="border-t border-[#E4E7E1] py-10">
        <div className="max-w-5xl mx-auto px-7 flex flex-wrap justify-between gap-2.5 items-center">
          <p className="text-xs text-[#5C6E65]" style={monoFont}>© 2026 Pageviz</p>
          <div className="flex gap-5 text-xs text-[#5C6E65]" style={monoFont}>
            <Link href="/privacy" className="hover:text-[#13221D]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#13221D]">Terms</Link>
            <Link href="/refund" className="hover:text-[#13221D]">Refund</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}