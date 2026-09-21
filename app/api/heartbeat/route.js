import { createClient } from '@supabase/supabase-js'
import { corsHeaders, shouldIgnore, preflight, isSiteId, readJson } from '../../../lib/ingest'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// The script's ref is 20-ish random characters; anything longer is not ours.
const REF_MAX = 64

export async function POST(req) {
  const body = await readJson(req)
  const site_id = body?.site_id
  const visitor_ref = body?.visitor_ref
  if (!isSiteId(site_id) || !visitor_ref) {
    return Response.json({ error: 'Missing site_id or visitor_ref' }, { status: 400, headers: corsHeaders })
  }
  if (await shouldIgnore(req, 'heartbeat', site_id)) {
    return Response.json({ ok: true }, { headers: corsHeaders })
  }
  // This ref becomes a row of its own, so an unbounded one is a free way to run
  // up someone else's storage bill -- the same hole /api/track had.
  const ref = String(visitor_ref).slice(0, REF_MAX)

  // One row per (site, visitor) pair, timestamp bumped on every heartbeat.
  // "Active now" = count of rows updated in the last 5 minutes -- see
  // /api/active-count. Needs a unique constraint on (site_id, visitor_ref)
  // for the upsert to work, see the SQL migration note.
  const { error } = await supabase
    .from('heartbeats')
    .upsert({ site_id, visitor_ref: ref, last_seen_at: new Date().toISOString() }, { onConflict: 'site_id,visitor_ref' })

  // Log the real reason, but never hand a stranger the database's own words.
  if (error) {
    console.error('Heartbeat upsert failed:', error.message)
    return Response.json({ error: 'Could not record heartbeat' }, { status: 500, headers: corsHeaders })
  }
  return Response.json({ ok: true }, { headers: corsHeaders })
}

export const OPTIONS = preflight
