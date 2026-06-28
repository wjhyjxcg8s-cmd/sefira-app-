import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const convId = searchParams.get('convId')
  if (!convId) return NextResponse.json({ error: 'Missing convId' }, { status: 400 })
  const { data, error } = await supabase
    .from('user_messages')
    .select('id, content, sender_id, created_at')
    .eq('conversation_id', convId)
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ messages: data || [] })
}
