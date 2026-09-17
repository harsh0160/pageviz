import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Uptime monitors hit this instead of the static homepage, so the ping
// actually reaches Supabase and keeps the free-tier project from pausing
// for inactivity (a homepage ping never touches the database).
export async function GET() {
  const { error } = await supabase.from('sites').select('id', { count: 'exact', head: true })
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
