import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function POST(request) {
  try {
    const { site_id, page_url, referrer } = await request.json()
    if (!site_id || !page_url) {
      return Response.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders })
    }
    const { error } = await supabase.from('pageviews').insert({ site_id, page_url, referrer })
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

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders })
}