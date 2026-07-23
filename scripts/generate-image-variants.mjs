// scripts/generate-image-variants.mjs
//
// ONE-OFF MIGRATION — backfills responsive image variants for EXISTING listing
// photos already sitting in Supabase storage. Run once on the Hetzner box with
// the service role key. Safe to re-run (idempotent).
//
// ─── Storage layout (from grepping the upload code) ─────────────────────────
//   • Listing photos:  bucket "listing-photos", path `${userId}/${timestamp}.webp`
//                      (app/api/upload-photo/route.ts:105-109)
//   • Avatars:         bucket "avatars"  (app/api/upload-avatar/route.ts:118)  — SEPARATE bucket
//   • Stories:         bucket "stories"  (app/api/upload-story/route.ts:64)    — SEPARATE bucket
//
//   Avatars and stories live in their OWN buckets, so scoping this script to the
//   "listing-photos" bucket is already sufficient isolation — it can never touch
//   an avatar or a story. No in-bucket path/name discriminator is needed.
//
//   Within listing-photos, originals are one folder deep: `<uuid>/<epoch-ms>.webp`.
//   Uploads use upsert:true, so re-running upload is harmless.
//
// ─── What this produces ─────────────────────────────────────────────────────
//   For every original  X.ext  it writes two siblings in the SAME folder:
//     X_thumb.webp  → resize({ width: 400, withoutEnlargement: true }).webp({ quality: 78 })
//     X_card.webp   → resize({ width: 800, withoutEnlargement: true }).webp({ quality: 78 })
//   The display code relies on this exact naming — do not change it here.
//
// ─── Idempotency ────────────────────────────────────────────────────────────
//   • Lists every object up front.
//   • Files whose basename ends in _thumb / _card ARE variants → never treated
//     as originals (so we never make X_thumb_thumb.webp).
//   • An original is skipped if BOTH of its variants already exist. If only one
//     is missing, only the missing one is (re)generated.
//
// ─── Credentials (never hardcoded) ──────────────────────────────────────────
//   Reads from process.env:
//     SUPABASE_URL               (falls back to NEXT_PUBLIC_SUPABASE_URL, which
//                                 is what .env.local actually defines)
//     SUPABASE_SERVICE_ROLE_KEY  (service role — required for full storage access)
//
// ─── Run it (Hetzner) ───────────────────────────────────────────────────────
//   cd ~/sefira-app \
//     && set -a && . ./.env.local && set +a \
//     && node scripts/generate-image-variants.mjs
//
// ────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// ── Config ──────────────────────────────────────────────────────────────────
const BUCKET = 'listing-photos';
const CONCURRENCY = 3;
const LIST_PAGE_SIZE = 1000;
const VARIANTS = [
  { suffix: '_thumb', width: 400 },
  { suffix: '_card', width: 800 },
];
const WEBP_QUALITY = 78;

// ── Credentials ─────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Missing credentials. Need SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and ' +
    'SUPABASE_SERVICE_ROLE_KEY in the environment.',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Helpers ─────────────────────────────────────────────────────────────────
const kb = (bytes) => (bytes == null ? '?' : (bytes / 1024).toFixed(1) + 'KB');

function parsePath(path) {
  const slash = path.lastIndexOf('/');
  const dir = slash === -1 ? '' : path.slice(0, slash);
  const file = slash === -1 ? path : path.slice(slash + 1);
  const dot = file.lastIndexOf('.');
  const base = dot === -1 ? file : file.slice(0, dot);
  return { dir, base };
}

const isVariant = (base) => base.endsWith('_thumb') || base.endsWith('_card');
const join = (dir, name) => (dir ? `${dir}/${name}` : name);

// Recursively list every object in the bucket. Supabase .list() returns one
// level; folders come back with a null id / no metadata, files carry metadata.
async function listAllFiles(prefix = '') {
  const out = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
      limit: LIST_PAGE_SIZE,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw new Error(`list('${prefix}') failed: ${error.message}`);
    if (!data || data.length === 0) break;

    for (const entry of data) {
      const full = join(prefix, entry.name);
      const isFolder = entry.id === null || entry.metadata == null;
      if (isFolder) {
        out.push(...(await listAllFiles(full)));
      } else {
        out.push({ path: full, size: entry.metadata?.size ?? null });
      }
    }

    if (data.length < LIST_PAGE_SIZE) break;
    offset += LIST_PAGE_SIZE;
  }
  return out;
}

// Simple fixed-size worker pool over `items`.
async function runPool(items, concurrency, worker) {
  let next = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) break;
      await worker(items[i], i);
    }
  });
  await Promise.all(workers);
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`[variants] bucket="${BUCKET}"  concurrency=${CONCURRENCY}`);
  console.log('[variants] listing all objects…');

  const all = await listAllFiles('');
  const pathSet = new Set(all.map((f) => f.path));

  const originals = all.filter((f) => !isVariant(parsePath(f.path).base));
  const variantCount = all.length - originals.length;
  console.log(
    `[variants] found ${all.length} objects — ${originals.length} originals, ${variantCount} existing variants`,
  );

  const stats = { processed: 0, skipped: 0, failed: 0 };

  await runPool(originals, CONCURRENCY, async (orig) => {
    const { dir, base } = parsePath(orig.path);

    // Which variants are missing?
    const wanted = VARIANTS.map((v) => ({
      ...v,
      path: join(dir, `${base}${v.suffix}.webp`),
    }));
    const missing = wanted.filter((v) => !pathSet.has(v.path));

    if (missing.length === 0) {
      stats.skipped++;
      console.log(`[skip] ${orig.path} (both variants exist)`);
      return;
    }

    try {
      const { data: blob, error: dlErr } = await supabase.storage
        .from(BUCKET)
        .download(orig.path);
      if (dlErr || !blob) throw new Error(dlErr?.message || 'empty download');

      const input = Buffer.from(await blob.arrayBuffer());
      const parts = [];

      for (const v of missing) {
        const buf = await sharp(input)
          .resize({ width: v.width, withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toBuffer();

        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(v.path, buf, { contentType: 'image/webp', upsert: true });
        if (upErr) throw new Error(`upload ${v.path}: ${upErr.message}`);

        pathSet.add(v.path);
        parts.push(`${v.suffix.slice(1)} ${kb(buf.length)}`);
      }

      stats.processed++;
      const note = missing.length < VARIANTS.length ? ' (partial: filled missing only)' : '';
      console.log(`[ok]   ${orig.path}  ${kb(orig.size)} -> ${parts.join(' / ')}${note}`);
    } catch (err) {
      stats.failed++;
      console.error(`[FAIL] ${orig.path}: ${err.message}`);
    }
  });

  console.log('─'.repeat(60));
  console.log(
    `[variants] done — processed=${stats.processed}  skipped=${stats.skipped}  failed=${stats.failed}` +
    `  (originals seen=${originals.length})`,
  );
  // Non-zero exit if anything failed, so a CI/ssh wrapper can notice.
  if (stats.failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('[variants] fatal:', err);
  process.exit(1);
});
