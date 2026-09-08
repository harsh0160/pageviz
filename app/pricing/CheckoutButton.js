'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { loadPaddle } from '@/lib/paddle-loader'
import { PLAN_TO_PRICE } from '@/lib/paddle-prices'

export default function CheckoutButton({ plan, className, children, discountCode }) {
  const [status, setStatus] = useState('loading')
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    const attempt = () => {
      loadPaddle()
        .then(() => { if (!cancelled) setStatus('ready') })
        .catch(() => { if (!cancelled) setStatus('error') })
    }
    attempt()
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

    window.Paddle.Checkout.open({
      items: [{ priceId: PLAN_TO_PRICE[plan], quantity: 1 }],
      customData: { user_id: user.id },
      ...(discountCode ? { discountCode } : {}),
      settings: {
        displayMode: 'overlay',
        variant: 'one-page',
        successUrl: `${window.location.origin}/dashboard`,
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