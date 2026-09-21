import { corsHeaders, shouldIgnore, preflight, isSiteId, ingestDb } from '../../../lib/ingest'

export async function POST(request) {
  try {
    const { site_id, page_url, referrer, device_type } = await request.json()
    if (!isSiteId(site_id) || !page_url) {
      return Response.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders })
    }
    // A site id sits in plain sight in every snippet, so anything arriving here is a
    // stranger's input. Unbounded text is the cheapest way to run up someone else's
    // storage bill, and the script itself only ever sends one of two device values.
    const page = String(page_url).slice(0, 2048)
    const ref = referrer ? String(referrer).slice(0, 2048) : null
    const device = device_type === 'Mobile' ? 'Mobile' : 'Desktop'
    // Bots and over-limit callers get a normal-looking reply but nothing is stored.
    if (await shouldIgnore(request, 'pageview', site_id)) {
      return Response.json({ success: true }, { headers: corsHeaders })
    }
    const supabase = ingestDb()
    if (!supabase) {
      return Response.json({ error: 'Could not record pageview' }, { status: 500, headers: corsHeaders })
    }
    const { error } = await supabase.from('pageviews').insert({ site_id, page_url: page, referrer: ref, device_type: device })
    if (error) {
      // Log the real reason, but never hand a stranger the database's own words.
      console.error('Insert failed:', error.message)
      return Response.json({ error: 'Could not record pageview' }, { status: 500, headers: corsHeaders })
    }
    return Response.json({ success: true }, { headers: corsHeaders })
  } catch (err) {
    console.error('Route crashed:', err)
    return Response.json({ error: 'Could not record pageview' }, { status: 500, headers: corsHeaders })
  }
}

export const OPTIONS = preflight
