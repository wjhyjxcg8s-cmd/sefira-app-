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
  const userId = formData.get('userId') as string | null;

  if (!file || !userId) {
    return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Moderation check before upload
  try {
    const moderationForm = new FormData();
    moderationForm.append('media', new Blob([buffer], { type: 'image/jpeg' }), 'image.jpg');
    moderationForm.append('models', 'nudity-2.0,weapon,alcohol,recreational_drug,gore-2.0');
    moderationForm.append('api_user', '64951376');
    moderationForm.append('api_secret', 'w6bHfthYTid3LTYsTdB6LPXKFJWJ5vQ2');
    const modRes = await fetch('https://api.sightengine.com/1.0/check.json', {
      method: 'POST',
      body: moderationForm,
    });
    const modResult = await modRes.json() as Record<string, unknown>;
    if (modResult.status === 'success') {
      const nudity = modResult.nudity as Record<string, number> | undefined;
      if (nudity && (
        (nudity.sexual_activity ?? 0) > 0.5 ||
        (nudity.sexual_display ?? 0) > 0.5 ||
        (nudity.erotica ?? 0) > 0.5
      )) {
        return NextResponse.json({ error: 'inappropriate_content' }, { status: 400 });
      }
      const gore = modResult.gore as Record<string, number> | undefined;
      if (gore && (gore.prob ?? 0) > 0.5) {
        return NextResponse.json({ error: 'inappropriate_content' }, { status: 400 });
      }
      const weapon = modResult.weapon as number | undefined;
      if (typeof weapon === 'number' && weapon > 0.7) {
        return NextResponse.json({ error: 'inappropriate_content' }, { status: 400 });
      }
    }
  } catch {
    // If moderation API fails, allow the upload to proceed
  }

  const compressed = await sharp(buffer)
    .rotate()
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();

  const path = `${userId}/${Date.now()}.webp`;

  const { error } = await supabase.storage
    .from('listing-photos')
    .upload(path, compressed, { contentType: 'image/webp', upsert: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from('listing-photos').getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
