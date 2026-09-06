import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Uses the SERVICE ROLE key (like share-auth) so it can read heartbeats
// even with RLS locked down — no anon SELECT policy needed on this table.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req) {
  const siteId = new URL(req.url).searchParams.get('site_id')
  if (!siteId) return NextResponse.json({ error: 'Missing site_id' }, { status: 400 })

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const { count, error } = await supabaseAdmin
    .from('heartbeats')
    .select('visitor_ref', { count: 'exact', head: true })
    .eq('site_id', siteId)
    .gte('last_seen_at', fiveMinAgo)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ active: count || 0 })
}