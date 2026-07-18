import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'supportsefira@gmail.com'

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return null
  const supabaseUser = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )
  const { data: { user }, error } = await supabaseUser.auth.getUser()
  if (error || !user || user.email !== ADMIN_EMAIL) return null
  return user
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const adminUser = await verifyAdmin(req)
  if (!adminUser) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, updates } = await req.json()
  console.log('update-user called with userId:', userId, 'updates:', updates)

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()

  console.log('update result:', data, 'error:', error)
  return Response.json({ data, error })
}
