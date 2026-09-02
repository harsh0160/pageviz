import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(req) {
  const { site_id, visitor_ref } = await req.json()
  if (!site_id || !visitor_ref) {
    return NextResponse.json({ error: 'Missing site_id or visitor_ref' }, { status: 400 })
  }

  // One row per (site, visitor) pair, timestamp bumped on every heartbeat.
  // "Active now" = count of rows updated in the last 5 minutes -- see
  // /api/active-count. Needs a unique constraint on (site_id, visitor_ref)
  // for the upsert to work, see the SQL migration note.
  const { error } = await supabase
    .from('heartbeats')
    .upsert({ site_id, visitor_ref, last_seen_at: new Date().toISOString() }, { onConflict: 'site_id,visitor_ref' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
