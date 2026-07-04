import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const convId = searchParams.get('convId')

  // ── Thread for a specific listing conversation (user_messages) ──────────────
  if (convId) {
    const { data, error } = await supabaseAdmin
      .from('user_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const normalized = (data ?? []).map((msg: any) => ({
      id: msg.id,
      user_id: msg.sender_id !== admin.id ? msg.sender_id : null,
      message: msg.content,
      created_at: msg.created_at,
      sender: msg.sender_id === admin.id ? 'admin' : 'user',
      is_read: msg.is_read ?? false,
    }))
    return NextResponse.json({ messages: normalized })
  }

  // ── Thread for a support (admin_messages) conversation ─────────────────────
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

  // ── Conversation list: merge admin_messages + user_messages ─────────────────

  // Shared helpers
  const emailMap = new Map<string, string>()
  const profileMap = new Map<string, any>()

  async function enrichUser(uid: string) {
    if (!emailMap.has(uid)) {
      try {
        const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(uid)
        if (authUser?.email) emailMap.set(uid, authUser.email)
      } catch {}
    }
  }

  // --- Source 1: admin_messages -----------------------------------------------
  const { data: adminMsgs, error: adminErr } = await supabaseAdmin
    .from('admin_messages')
    .select('*')
    .eq('is_global', false)
    .order('created_at', { ascending: false })

  if (adminErr) return NextResponse.json({ error: adminErr.message }, { status: 500 })

  const latestPerUser = new Map<string, any>()
  const adminUnread = new Map<string, number>()

  for (const msg of adminMsgs ?? []) {
    if (!msg.user_id) continue
    if (!latestPerUser.has(msg.user_id)) latestPerUser.set(msg.user_id, msg)
    if (msg.sender === 'user' && !msg.is_read) {
      adminUnread.set(msg.user_id, (adminUnread.get(msg.user_id) ?? 0) + 1)
    }
  }

  const adminUserIds = Array.from(latestPerUser.keys())
  await Promise.all(adminUserIds.map(enrichUser))

  if (adminUserIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', adminUserIds)
    for (const p of profiles ?? []) profileMap.set(p.user_id, p)
  }

  const adminConversations = Array.from(latestPerUser.entries()).map(([uid, msg]) => ({
    key: uid,
    user_id: uid,
    email: emailMap.get(uid) ?? (msg.email || null),
    display_name: profileMap.get(uid)?.display_name ?? null,
    last_message: msg.message,
    last_date: msg.created_at,
    unread_count: adminUnread.get(uid) ?? 0,
    source: 'admin' as const,
  }))

  // --- Source 2: user_messages (listing conversations) -----------------------
  const adminUserId = admin.id

  const { data: listingConvRows } = await supabaseAdmin
    .from('conversations')
    .select('id, user1_id, user2_id, updated_at')
    .or(`user1_id.eq.${adminUserId},user2_id.eq.${adminUserId}`)
    .order('updated_at', { ascending: false })

  const listingConversations: any[] = []

  if (listingConvRows && listingConvRows.length > 0) {
    const convIds = listingConvRows.map((c: any) => c.id)
    const otherUserIds = [
      ...new Set(
        listingConvRows
          .map((c: any) => (c.user1_id === adminUserId ? c.user2_id : c.user1_id))
          .filter(Boolean) as string[]
      ),
    ]

    // Last message + unread count per conversation
    const { data: allMsgs } = await supabaseAdmin
      .from('user_messages')
      .select('id, conversation_id, content, created_at, sender_id, is_read')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: false })

    const lastMsgByConv = new Map<string, any>()
    const unreadByConv = new Map<string, number>()
    for (const msg of allMsgs ?? []) {
      const cid = (msg as any).conversation_id
      if (!lastMsgByConv.has(cid)) lastMsgByConv.set(cid, msg)
      if ((msg as any).sender_id !== adminUserId && !(msg as any).is_read) {
        unreadByConv.set(cid, (unreadByConv.get(cid) ?? 0) + 1)
      }
    }

    // Enrich new users not already in maps
    const newUserIds = otherUserIds.filter((uid) => !profileMap.has(uid))
    if (newUserIds.length > 0) {
      const { data: newProfiles } = await supabaseAdmin
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', newUserIds)
      for (const p of newProfiles ?? []) profileMap.set(p.user_id, p)
    }
    await Promise.all(otherUserIds.map(enrichUser))

    for (const conv of listingConvRows) {
      const lastMsg = lastMsgByConv.get(conv.id)
      if (!lastMsg) continue // no messages yet — skip
      const otherUserId = conv.user1_id === adminUserId ? conv.user2_id : conv.user1_id

      listingConversations.push({
        key: conv.id,
        user_id: otherUserId,
        email: emailMap.get(otherUserId) ?? null,
        display_name: profileMap.get(otherUserId)?.display_name ?? null,
        last_message: (lastMsg as any).content,
        last_date: (lastMsg as any).created_at,
        unread_count: unreadByConv.get(conv.id) ?? 0,
        source: 'listing' as const,
        conversation_id: conv.id,
      })
    }
  }

  // Merge and sort newest-first
  const all = [...adminConversations, ...listingConversations]
  all.sort((a, b) => new Date(b.last_date).getTime() - new Date(a.last_date).getTime())

  return NextResponse.json({ conversations: all })
}
