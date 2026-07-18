import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const ADMIN_EMAIL = 'supportsefira@gmail.com';

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;
  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error } = await supabaseUser.auth.getUser();
  if (error || !user || user.email !== ADMIN_EMAIL) return null;
  return user;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let compressed: Buffer;
  try {
    compressed = await sharp(buffer)
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .resize(1080, 1920, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch (err) {
    console.error('sharp error:', err);
    return NextResponse.json({ error: 'Image processing failed' }, { status: 500 });
  }

  const fileName = `story_${Date.now()}.webp`;
  const contentType = 'image/webp';

  const { error } = await supabase.storage
    .from('stories')
    .upload(fileName, compressed, { contentType, upsert: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from('stories').getPublicUrl(fileName);
  const publicUrl = data.publicUrl;

  const caption = formData.get('caption') as string | null;
  const weekLabel = (formData.get('week_label') as string | null) || 'Bu Hafta';

  const { error: insertError } = await supabase.from('weekly_stories').insert([{
    image_url: publicUrl,
    caption: caption || null,
    week_label: weekLabel,
  }]);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ url: publicUrl });
}
