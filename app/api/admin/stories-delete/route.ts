import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const ADMIN_EMAIL = 'supportsefira@gmail.com'

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return null
  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data: { user }, error } = await supabaseUser.auth.getUser()
  if (error || !user || user.email !== ADMIN_EMAIL) return null
  return user
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const adminUser = await verifyAdmin(request)
  if (!adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, filename } = await request.json()
  if (!id || !filename) return NextResponse.json({ error: 'Missing id or filename' }, { status: 400 })
  await supabase.storage.from('stories').remove([filename])
  const { error } = await supabase.from('weekly_stories').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
