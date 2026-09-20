'use client'

// Pricing page renders one CheckoutButton per paid plan (Pro, Business).
// Previously each button independently injected its own <script> tag and
// called Paddle.Initialize() in its own onload handler. With two buttons on
// the page, that's two script tags racing, and Paddle.Initialize() throws if
// called a second time — so whichever button's onload lost the race never
// reached its setReady(true) line and stayed stuck on "Loading..." forever.
//
// This module makes loading Paddle a singleton: the first caller kicks off
// the script + Initialize, every other caller (any number of buttons, any
// number of times) just awaits the SAME promise.

let paddlePromise = null

export function loadPaddle() {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (window.Paddle) return Promise.resolve(window.Paddle)
  if (paddlePromise) return paddlePromise

  // A Paddle client token always starts with live_ or test_. Catching a missing or
  // pasted-from-the-masked-UI value here turns a confusing "Something went wrong"
  // popup from Paddle into an obvious failure we can see in the console.
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
  if (!/^(live|test)_[a-z0-9]+$/i.test(token || '')) {
    return Promise.reject(new Error('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is missing or malformed (it must start with live_ or test_)'))
  }

  paddlePromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
    script.onload = () => {
      try {
        // sandbox for now — flip to 'production' in the same commit you swap
        // the price IDs in lib/paddle-prices.js over to live ones
        window.Paddle.Environment.set('production')
        window.Paddle.Initialize({ token })
        resolve(window.Paddle)
      } catch (err) {
        paddlePromise = null // let a future call retry instead of staying stuck on a bad promise
        reject(err)
      }
    }
    script.onerror = () => {
      paddlePromise = null
      reject(new Error('Failed to load Paddle.js'))
    }
    document.body.appendChild(script)
  })

  return paddlePromise
}