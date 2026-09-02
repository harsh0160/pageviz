import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(req) {
  const body = await req.json()
  const { site_id, event_name } = body

  if (!site_id || !event_name) {
    return NextResponse.json({ error: 'Missing site_id or event_name' }, { status: 400 })
  }
  // Keep event names short and bounded -- this is meant for a handful of
  // named goals ("signup", "checkout"), not arbitrary free text.
  const cleanName = String(event_name).slice(0, 64)

  const { error } = await supabase.from('events').insert({ site_id, event_name: cleanName })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
