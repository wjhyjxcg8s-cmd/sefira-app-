import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://ceetzophaybywfuhezhv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4'
)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const [profileRes, listingsRes, reviewsRes, authRes, convsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', userId).single(),
    supabase.from('listings').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('reviews').select('*').eq('reviewer_id', userId).order('created_at', { ascending: false }),
    supabase.auth.admin.getUserById(userId),
    supabase.from('conversations').select('id, user1_id, user2_id, updated_at').or(`user1_id.eq.${userId},user2_id.eq.${userId}`).order('updated_at', { ascending: false }).limit(20)
  ])

  const conversations = convsRes.data || []
  const otherIds = conversations.map((c: { user1_id: string; user2_id: string }) => c.user1_id === userId ? c.user2_id : c.user1_id)
  const { data: otherProfiles } = otherIds.length > 0
    ? await supabase.from('profiles').select('user_id, display_name, avatar_url').in('user_id', otherIds)
    : { data: [] }

  return NextResponse.json({
    profile: profileRes.data,
    listings: listingsRes.data || [],
    reviews: reviewsRes.data || [],
    authUser: authRes.data?.user || null,
    conversations,
    otherProfiles: otherProfiles || []
  })
}
