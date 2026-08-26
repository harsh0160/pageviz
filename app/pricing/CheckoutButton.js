'use client'

import { useEffect, useState } from 'react'

// Sandbox price IDs — swap for live pri_ IDs once verification is approved
const PRICE_IDS = {
  pro: 'pri_01m0x6qar386c4snh3xpfez5cg',
  business: 'pri_01m0x6sd5jqb660zm4eka60zw3',
}

export default function CheckoutButton({ plan, className, children }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (window.Paddle) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReady(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
    script.onload = () => {
      window.Paddle.Environment.set('sandbox')
      window.Paddle.Initialize({ token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN })
      setReady(true)
    }
    document.body.appendChild(script)
  }, [])

  const openCheckout = () => {
    if (!ready) return
    window.Paddle.Checkout.open({
      items: [{ priceId: PRICE_IDS[plan], quantity: 1 }],
      settings: { displayMode: 'overlay', variant: 'one-page' },
    })
  }

  return (
    <button onClick={openCheckout} disabled={!ready} className={className}>
      {ready ? children : 'Loading…'}
    </button>
  )
}