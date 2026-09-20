import { createClient } from '@supabase/supabase-js'
import { corsHeaders, shouldIgnore, preflight } from '../../../lib/ingest'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(req) {
  const { site_id, visitor_ref } = await req.json()
  if (!site_id || !visitor_ref) {
    return Response.json({ error: 'Missing site_id or visitor_ref' }, { status: 400, headers: corsHeaders })
  }
  if (shouldIgnore(req, 'heartbeat', site_id)) {
    return Response.json({ ok: true }, { headers: corsHeaders })
  }

  // One row per (site, visitor) pair, timestamp bumped on every heartbeat.
  // "Active now" = count of rows updated in the last 5 minutes -- see
  // /api/active-count. Needs a unique constraint on (site_id, visitor_ref)
  // for the upsert to work, see the SQL migration note.
  const { error } = await supabase
    .from('heartbeats')
    .upsert({ site_id, visitor_ref, last_seen_at: new Date().toISOString() }, { onConflict: 'site_id,visitor_ref' })

  if (error) return Response.json({ error: error.message }, { status: 500, headers: corsHeaders })
  return Response.json({ ok: true }, { headers: corsHeaders })
}

export const OPTIONS = preflight
