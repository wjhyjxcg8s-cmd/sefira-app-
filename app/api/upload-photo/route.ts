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

  // MODERATION CHECK - runs BEFORE sharp processing
  try {
    const boundary = '----FormBoundary' + Math.random().toString(36);

    const formParts = [
      `--${boundary}\r\nContent-Disposition: form-data; name="models"\r\n\r\nnudity-2.0,gore-2.0,weapon\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="api_user"\r\n\r\n64951376\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="api_secret"\r\n\r\nw6bHfthYTid3LTYsTdB6LPXKFJWJ5vQ2\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="media"; filename="image.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`,
    ];

    const preamble = Buffer.from(formParts.join(''));
    const ending = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([preamble, buffer, ending]);

    const modResponse = await fetch('https://api.sightengine.com/1.0/check.json', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length.toString(),
      },
      body: body,
    });

    const modResult = await modResponse.json() as Record<string, unknown>;
    console.log('Sightengine result:', JSON.stringify(modResult));

    if (modResult.status === 'success') {
      const nudity = (modResult.nudity ?? {}) as Record<string, number>;
      const gore = (modResult.gore ?? {}) as Record<string, number>;

      const isNSFW =
        (nudity.sexual_activity ?? 0) > 0.4 ||
        (nudity.sexual_display ?? 0) > 0.4 ||
        (nudity.erotica ?? 0) > 0.4 ||
        (nudity.very_suggestive ?? 0) > 0.5 ||
        (gore.prob ?? 0) > 0.5;

      if (isNSFW) {
        return NextResponse.json({ error: 'inappropriate_content' }, { status: 400 });
      }
    } else {
      console.log('Sightengine error:', modResult);
    }
  } catch (err) {
    console.log('Moderation check failed:', err);
    // Continue upload if API fails
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
