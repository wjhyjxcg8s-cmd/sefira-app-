import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
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
  return NextResponse.json({ url: data.publicUrl });
}
