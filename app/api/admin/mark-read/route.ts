import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTc4NTUsImV4cCI6MjA5NDkzMzg1NX0.DARDlw_AL8WX6yfgYDgb6nSgCo84jMV05aNbfT-zHpI'
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY!
const ADMIN_EMAIL = 'supportsefira@gmail.com'

async function verifyAdmin(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  if (!auth) return null
  const c = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: auth } },
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data: { user } } = await c.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) return null
  return user
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { userId, convId } = body

  // Mark user_messages as read for a listing conversation
  if (convId) {
    const { error } = await supabaseAdmin
      .from('user_messages')
      .update({ is_read: true })
      .eq('conversation_id', convId)
      .neq('sender_id', admin.id)
    return NextResponse.json({ error: error?.message ?? null })
  }

  if (!userId) return NextResponse.json({ error: 'userId or convId required' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('admin_messages')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('sender', 'user')
    .eq('is_read', false)

  return NextResponse.json({ error: error?.message ?? null })
}
