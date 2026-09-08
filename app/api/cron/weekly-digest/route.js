import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// Protected cron endpoint — trigger weekly from an EXTERNAL scheduler
// (UptimeRobot, which you already use, or a free service like cron-job.org).
// Netlify's own native "Scheduled Functions" have had reported reliability
// issues (silently not firing) in production for some users, so an external
// trigger hitting this URL is the safer, boringly-reliable choice.
//
// Set up:
//   1. npm install resend
//   2. Sign up at resend.com, verify your sending domain, get an API key
//   3. Add RESEND_API_KEY and CRON_SECRET (any random string you make up)
//      to Netlify env vars
//   4. Point an external cron (UptimeRobot monitor, weekly interval, or
//      cron-job.org) at:
//      POST https://pageviz.netlify.app/api/cron/weekly-digest?secret=YOUR_CRON_SECRET

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  const secret = new URL(req.url).searchParams.get('secret')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
  if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 })

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  let sent = 0
  let skipped = 0

  for (const user of usersData.users) {
    const { data: sites } = await supabaseAdmin.from('sites').select('id, name, domain').eq('user_id', user.id)
    if (!sites || sites.length === 0) { skipped++; continue }

    const siteIds = sites.map((s) => s.id)

    const { count: thisWeek } = await supabaseAdmin
      .from('pageviews').select('id', { count: 'exact', head: true })
      .in('site_id', siteIds).gte('created_at', sevenDaysAgo)

    const { count: lastWeek } = await supabaseAdmin
      .from('pageviews').select('id', { count: 'exact', head: true })
      .in('site_id', siteIds).gte('created_at', fourteenDaysAgo).lt('created_at', sevenDaysAgo)

    if (!thisWeek) { skipped++; continue }

    const change = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : null
    const trendLine = change === null ? '' : change >= 0 ? ` (up ${change}% from last week)` : ` (down ${Math.abs(change)}% from last week)`

    try {
      await resend.emails.send({
        from: 'Pageviz <digest@pageviz.app>', // change to your verified sending domain
        to: user.email,
        subject: `Your week on Pageviz: ${thisWeek.toLocaleString()} pageviews`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2 style="color:#13221D">Your week in review</h2>
            <p style="font-size:28px;font-weight:700;color:#1F4A3D;margin:12px 0 4px">${thisWeek.toLocaleString()} pageviews${trendLine}</p>
            <p style="color:#5C6E65;font-size:14px">across ${sites.length} site${sites.length !== 1 ? 's' : ''}: ${sites.map((s) => s.name).join(', ')}</p>
            <a href="https://pageviz.netlify.app/dashboard" style="display:inline-block;background:#E64A12;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;margin-top:16px">View full dashboard</a>
            <p style="color:#9CA3AF;font-size:11px;margin-top:32px">You're receiving this because you have an active Pageviz account. Reply to this email or write to pagevizofficial@gmail.com to stop these.</p>
          </div>
        `,
      })
      sent++
    } catch (e) {
      console.error(`Failed to email ${user.email}:`, e)
    }
  }

  return NextResponse.json({ sent, skipped, total: usersData.users.length })
}