import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://ceetzophaybywfuhezhv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4'
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
