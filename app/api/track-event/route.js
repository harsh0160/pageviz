import { createClient } from '@supabase/supabase-js'
import { corsHeaders, shouldIgnore, preflight } from '../../../lib/ingest'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(req) {
  const body = await req.json()
  const { site_id, event_name } = body

  if (!site_id || !event_name) {
    return Response.json({ error: 'Missing site_id or event_name' }, { status: 400, headers: corsHeaders })
  }
  if (shouldIgnore(req, 'event', site_id)) {
    return Response.json({ ok: true }, { headers: corsHeaders })
  }
  // Keep event names short and bounded -- this is meant for a handful of
  // named goals ("signup", "checkout"), not arbitrary free text.
  const cleanName = String(event_name).slice(0, 64)

  const { error } = await supabase.from('events').insert({ site_id, event_name: cleanName })
  if (error) return Response.json({ error: error.message }, { status: 500, headers: corsHeaders })

  return Response.json({ ok: true }, { headers: corsHeaders })
}

export const OPTIONS = preflight
