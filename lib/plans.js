// Plan catalogue, from the reference build's src/data.js.
// DB keys stay free / pro / business (profiles.plan, Paddle webhook, share-auth).
// "business" is only ever *displayed* as "Max" — never rename the key.

export const PLAN_ORDER = ['free', 'pro', 'business']

export const PLANS = {
  free: {
    name: 'Free', price: 0, sites: 1, history: '7 days', maxDays: 7,
    description: 'A little insight goes a long way.',
    features: ['1 website', '7-day data history', 'Simple, cookieless analytics', 'All the essentials, no noise'],
  },
  pro: {
    name: 'Pro', price: 9, sites: 10, history: '1 year', maxDays: 365,
    description: 'For your next chapter of growth.',
    // Reference says "Real-time visitor count"; Pageviz never reports visitors, so the
    // feature is named after the metric it actually shows ("Reading now").
    features: ['10 websites', '1-year data history', 'Real-time “reading now” count', 'Custom events & goals', 'CSV exports', 'Password-protected share links'],
  },
  business: {
    name: 'Max', price: 22, sites: 30, history: 'Forever', maxDays: Infinity,
    description: 'The whole picture, all together.',
    features: ['30 websites', 'Keep your data forever', 'Everything in Pro', 'Combined multi-site dashboard'],
  },
}

export const planFor = (key) => PLANS[key] || PLANS.free
export const isPaidPlan = (key) => key === 'pro' || key === 'business'
export const isMaxPlan = (key) => key === 'business'

export const CONTACT_EMAIL = 'pagevizofficial@gmail.com'

// The public address customers install the script from. The snippet must ALWAYS
// show this, never window.location.origin -- otherwise a snippet copied while
// looking at localhost (or any preview URL) sends that customer's traffic nowhere.
export const PUBLIC_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://pageviz.netlify.app'
