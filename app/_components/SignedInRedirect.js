'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// The homepage's existing behaviour: a signed-in user goes straight to their dashboard.
export default function SignedInRedirect() {
  const router = useRouter()
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push('/dashboard')
    })
  }, [router])
  return null
}
