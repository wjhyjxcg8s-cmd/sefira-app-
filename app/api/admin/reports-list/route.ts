import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://ceetzophaybywfuhezhv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4'
)
export async function GET() {
  const { data: reports, error } = await supabase
    .from('reported_messages')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const allUserIds = [...new Set((reports || []).flatMap(r => [r.reporter_id, r.reported_user_id]).filter(Boolean))]
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('user_id, display_name')
    .in('user_id', allUserIds)
  const profileMap = Object.fromEntries((profilesData || []).map(p => [p.user_id, p]))

  return NextResponse.json({ reports: reports || [], profileMap })
}
