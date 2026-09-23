'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { loadPaddle } from '@/lib/paddle-loader'
import { PLAN_TO_PRICE } from '@/lib/paddle-prices'
import { trackGoal } from '@/lib/goal'

export default function CheckoutButton({ plan, className, children, discountCode }) {
  const [status, setStatus] = useState('loading')
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    // Paddle.js brings Paddle's own Retain (ProfitWell) tracker with it, and someone who is
    // not signed in cannot check out anyway -- their click goes to sign-up first. So only a
    // signed-in visitor loads Paddle ahead of time; people just reading the prices never do.
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      if (!data.session) { setStatus('ready'); return }
      loadPaddle()
        .then(() => { if (!cancelled) setStatus('ready') })
        .catch(() => { if (!cancelled) setStatus('error') })
    })
    return () => { cancelled = true }
  }, [])

  const handleClick = async () => {
    if (status === 'loading') return

    if (status === 'error') {
      setStatus('loading')
      loadPaddle()
        .then(() => setStatus('ready'))
        .catch(() => setStatus('error'))
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login?signup=1')
      return
    }

    // Signed in after this page loaded (say, in another tab)? Then Paddle was never loaded
    // here. If it already is, this resolves at once.
    try {
      await loadPaddle()
    } catch (err) {
      setStatus('error')
      return
    }

    // The last step we can see ourselves: Paddle's overlay takes over from here,
    // and the webhook tells us whether it ended in a payment.
    trackGoal(`checkout_${plan}`)

    window.Paddle.Checkout.open({
      items: [{ priceId: PLAN_TO_PRICE[plan], quantity: 1 }],
      customData: { user_id: user.id },
      ...(discountCode ? { discountCode } : {}),
      settings: {
        displayMode: 'overlay',
        variant: 'one-page',
        // Paddle's page is its own site, so our CSS can't reach it. Matching the
        // app's light/dark theme (plus logo + brand colour set in Paddle) is as
        // close to "ours" as the hosted checkout gets.
        theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
        // The flag tells the dashboard a payment just happened, so it can wait for
        // Paddle's webhook instead of greeting the buyer with their old free plan.
        successUrl: `${window.location.origin}/dashboard?upgraded=1`,
      },
    })
  }

  const label = status === 'ready' ? children : status === 'error' ? 'Try again' : 'Loading…'

  return (
    <button onClick={handleClick} disabled={status === 'loading'} className={className}>
      {label}
    </button>
  )
}