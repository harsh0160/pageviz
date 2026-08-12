'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      router.push(data.user ? '/dashboard' : '/login')
    })
  }, [router])

  return <p className="p-6 text-neutral-500 text-sm">Loading...</p>
}
