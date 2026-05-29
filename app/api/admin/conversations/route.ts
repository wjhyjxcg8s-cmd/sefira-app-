import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ceetzophaybywfuhezhv.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTc4NTUsImV4cCI6MjA5NDkzMzg1NX0.DARDlw_AL8WX6yfgYDgb6nSgCo84jMV05aNbfT-zHpI'
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4'
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

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const userId = new URL(req.url).searchParams.get('userId')

  // Return full thread for a single user
  if (userId) {
    const { data, error } = await supabaseAdmin
      .from('admin_messages')
      .select('*')
      .eq('user_id', userId)
      .eq('is_global', false)
      .order('created_at', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ messages: data ?? [] })
  }

  // Fetch all non-global messages ordered newest first
  const { data, error } = await supabaseAdmin
    .from('admin_messages')
    .select('*')
    .eq('is_global', false)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const msgs = data ?? []

  // Track latest message and unread count per user (msgs already DESC so first = latest)
  const latestPerUser = new Map<string, typeof msgs[0]>()
  const unreadCounts = new Map<string, number>()

  for (const msg of msgs) {
    if (!msg.user_id) continue
    if (!latestPerUser.has(msg.user_id)) latestPerUser.set(msg.user_id, msg)
    if (msg.sender === 'user' && !msg.is_read) {
      unreadCounts.set(msg.user_id, (unreadCounts.get(msg.user_id) ?? 0) + 1)
    }
  }

  // Enrich with real emails from profiles table
  const userIds = Array.from(latestPerUser.keys())
  const { data: profiles } = userIds.length
    ? await supabaseAdmin.from('profiles').select('id, email').in('id', userIds)
    : { data: [] }

  const emailMap = new Map<string, string>()
  for (const p of profiles ?? []) {
    if (p.email) emailMap.set(p.id, p.email)
  }

  const conversations = Array.from(latestPerUser.entries()).map(([uid, msg]) => ({
    user_id: uid,
    email: emailMap.get(uid) ?? (msg.email || null),
    last_message: msg.message,
    last_date: msg.created_at,
    unread_count: unreadCounts.get(uid) ?? 0,
  }))

  return NextResponse.json({ conversations })
}
