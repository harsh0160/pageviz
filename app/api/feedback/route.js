import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { emailOwner } from '@/lib/alert'
import { tooMany } from '@/lib/rate-limit'
import { planFor } from '@/lib/plans'

// "Share feedback" in the workspace sidebar. A signed-in customer's message is emailed
// to the owner, with Reply-To set to the customer, so answering is one click. Nothing
// is stored in the database.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const MAX_LENGTH = 2000

export async function POST(req) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer /, '')
  const { data: auth } = token ? await supabaseAdmin.auth.getUser(token) : { data: null }
  const user = auth?.user
  if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  const message = typeof body?.message === 'string' ? body.message.trim() : ''
  if (!message || message.length > MAX_LENGTH) {
    return NextResponse.json({ error: `Please write between 1 and ${MAX_LENGTH} characters.` }, { status: 400 })
  }

  // Plenty for a real person, and it keeps the owner's inbox from being flooded.
  if (tooMany(`feedback:${user.id}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'That is a lot of messages in one hour. Please try again later.' }, { status: 429 })
  }

  const { data: profile } = await supabaseAdmin.from('profiles').select('plan').eq('id', user.id).maybeSingle()
  const sent = await emailOwner({
    subject: `Pageviz feedback from ${user.email}`,
    text: `${message}\n\n--\nFrom: ${user.email}\nPlan: ${planFor(profile?.plan).name}\nUser id: ${user.id}\nTime: ${new Date().toISOString()}`,
    replyTo: user.email,
  })
  if (!sent) return NextResponse.json({ error: 'Your message could not be sent.' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
