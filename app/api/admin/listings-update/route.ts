import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const { id, action } = await request.json()
  if (!id || !action) return NextResponse.json({ error: 'Missing id or action' }, { status: 400 })
  const is_deleted = action === 'hide'
  const { error } = await supabase.from('listings').update({ is_deleted }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
