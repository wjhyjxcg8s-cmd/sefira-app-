import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const { id, filename } = await request.json()
  if (!id || !filename) return NextResponse.json({ error: 'Missing id or filename' }, { status: 400 })
  await supabase.storage.from('stories').remove([filename])
  const { error } = await supabase.from('weekly_stories').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
