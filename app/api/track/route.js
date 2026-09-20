import { createClient } from '@supabase/supabase-js'
import { corsHeaders, shouldIgnore, preflight } from '../../../lib/ingest'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const { site_id, page_url, referrer, device_type } = await request.json()
    if (!site_id || !page_url) {
      return Response.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders })
    }
    // Bots and over-limit callers get a normal-looking reply but nothing is stored.
    if (shouldIgnore(request, 'pageview', site_id)) {
      return Response.json({ success: true }, { headers: corsHeaders })
    }
    const { error } = await supabase.from('pageviews').insert({ site_id, page_url, referrer, device_type })
    if (error) {
      console.error('Insert failed:', error)
      return Response.json({ error: error.message }, { status: 500, headers: corsHeaders })
    }
    return Response.json({ success: true }, { headers: corsHeaders })
  } catch (err) {
    console.error('Route crashed:', err)
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders })
  }
}

export const OPTIONS = preflight
