// scripts/generate-image-variants.mjs
//
// ONE-OFF MIGRATION — backfills responsive image variants for EXISTING files
// already sitting in Supabase storage. Run once on the Hetzner box with the
// service role key. Safe to re-run (idempotent).
//
// ─── Buckets & variants (see BUCKETS config below) ──────────────────────────
//   • listing-photos  path `${userId}/${timestamp}.webp`  (app/api/upload-photo)
//         → X_thumb.webp (w400) + X_card.webp (w800)
//   • avatars         path `${userId}/avatar.webp`         (app/api/upload-avatar)
//         → X_thumb.webp (w200)   [thumb only]
//
//   `stories` lives in its own bucket and is intentionally NOT processed.
//   Each bucket is one folder deep (`<uuid>/<file>`); uploads use upsert:true.
//
// ─── What this produces ─────────────────────────────────────────────────────
//   For every original  X.ext  it writes the bucket's variants as siblings in the
//   SAME folder, e.g.  X_thumb.webp  via
//     sharp().resize({ width, withoutEnlargement: true }).webp({ quality: 78 })
//   The display code relies on this exact naming (app/lib/imageVariants.ts).
//
// ─── Idempotency ────────────────────────────────────────────────────────────
//   • Lists every object per bucket up front.
//   • Files whose basename ends in _thumb / _card ARE variants → never treated
//     as originals (so we never make X_thumb_thumb.webp).
//   • An original is skipped if ALL of its bucket's variants already exist; only
//     the missing ones are (re)generated. upsert:true makes writes safe.
//
// ─── Credentials (never hardcoded) ──────────────────────────────────────────
//   Reads from process.env:
//     SUPABASE_URL               (falls back to NEXT_PUBLIC_SUPABASE_URL)
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
// Add a bucket here to have it processed; each lists its own variant set.
const BUCKETS = [
  {
    name: 'listing-photos',
    variants: [
      { suffix: '_thumb', width: 400 },
      { suffix: '_card', width: 800 },
    ],
  },
  {
    name: 'avatars',
    variants: [
      { suffix: '_thumb', width: 200 },
      { suffix: '_card', width: 512 },
    ],
  },
];

const CONCURRENCY = 3;
const LIST_PAGE_SIZE = 1000;
const WEBP_QUALITY = 78;

// --force: regenerate variants even when they already exist (upsert overwrites).
// Needed to repair the earlier run's mis-oriented avatar thumbs. Without it, the
// default skip-if-exists behavior is unchanged.
const FORCE = process.argv.includes('--force');

// --bucket=<name>: process ONLY that bucket from BUCKETS (e.g. --bucket=avatars
// skips listing-photos entirely). Absent → process all buckets. Combines with
// --force. Unknown name → hard error listing the valid options.
const BUCKET_FILTER = (process.argv.find((a) => a.startsWith('--bucket=')) ?? '').split('=')[1] || null;
const SELECTED_BUCKETS = BUCKET_FILTER
  ? BUCKETS.filter((b) => b.name === BUCKET_FILTER)
  : BUCKETS;
if (BUCKET_FILTER && SELECTED_BUCKETS.length === 0) {
  console.error(
    `Unknown --bucket="${BUCKET_FILTER}". Valid: ${BUCKETS.map((b) => b.name).join(', ')}.`,
  );
  process.exit(1);
}

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

// Recursively list every object in a bucket. Supabase .list() returns one level;
// folders come back with a null id / no metadata, files carry metadata.
async function listAllFiles(bucket, prefix = '') {
  const out = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: LIST_PAGE_SIZE,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw new Error(`list('${bucket}/${prefix}') failed: ${error.message}`);
    if (!data || data.length === 0) break;

    for (const entry of data) {
      const full = join(prefix, entry.name);
      const isFolder = entry.id === null || entry.metadata == null;
      if (isFolder) {
        out.push(...(await listAllFiles(bucket, full)));
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

// ── Per-bucket processing ───────────────────────────────────────────────────
async function processBucket(bucket) {
  const variantLabel = bucket.variants.map((v) => `${v.suffix.slice(1)}@${v.width}`).join(', ');
  console.log(`\n[variants] ── bucket "${bucket.name}" (${variantLabel}) ──`);
  console.log('[variants] listing all objects…');

  const all = await listAllFiles(bucket.name, '');
  const pathSet = new Set(all.map((f) => f.path));

  const originals = all.filter((f) => !isVariant(parsePath(f.path).base));
  const existingVariants = all.length - originals.length;
  console.log(
    `[variants] found ${all.length} objects — ${originals.length} originals, ${existingVariants} existing variants`,
  );

  const stats = { processed: 0, skipped: 0, failed: 0, originals: originals.length };

  await runPool(originals, CONCURRENCY, async (orig) => {
    const { dir, base } = parsePath(orig.path);

    const wanted = bucket.variants.map((v) => ({
      ...v,
      path: join(dir, `${base}${v.suffix}.webp`),
    }));
    const missing = FORCE ? wanted : wanted.filter((v) => !pathSet.has(v.path));

    if (missing.length === 0) {
      stats.skipped++;
      console.log(`[skip] ${bucket.name}/${orig.path} (all variants exist)`);
      return;
    }

    try {
      const { data: blob, error: dlErr } = await supabase.storage
        .from(bucket.name)
        .download(orig.path);
      if (dlErr || !blob) throw new Error(dlErr?.message || 'empty download');

      const input = Buffer.from(await blob.arrayBuffer());
      const parts = [];

      for (const v of missing) {
        const buf = await sharp(input)
          // .rotate() with no args auto-orients from EXIF and strips the tag, so
          // legacy raw avatars (which carry an orientation flag) get it baked in
          // before resize. Harmless for already-upright files.
          .rotate()
          .resize({ width: v.width, withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toBuffer();

        const { error: upErr } = await supabase.storage
          .from(bucket.name)
          .upload(v.path, buf, { contentType: 'image/webp', upsert: true });
        if (upErr) throw new Error(`upload ${v.path}: ${upErr.message}`);

        pathSet.add(v.path);
        parts.push(`${v.suffix.slice(1)} ${kb(buf.length)}`);
      }

      stats.processed++;
      const note = missing.length < wanted.length ? ' (partial: filled missing only)' : '';
      console.log(`[ok]   ${bucket.name}/${orig.path}  ${kb(orig.size)} -> ${parts.join(' / ')}${note}`);
    } catch (err) {
      stats.failed++;
      console.error(`[FAIL] ${bucket.name}/${orig.path}: ${err.message}`);
    }
  });

  console.log(
    `[variants] "${bucket.name}" done — processed=${stats.processed}  skipped=${stats.skipped}  failed=${stats.failed}`,
  );
  return stats;
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`[variants] buckets=[${SELECTED_BUCKETS.map((b) => b.name).join(', ')}]  concurrency=${CONCURRENCY}`);

  const totals = { processed: 0, skipped: 0, failed: 0, originals: 0 };
  for (const bucket of SELECTED_BUCKETS) {
    const s = await processBucket(bucket);
    totals.processed += s.processed;
    totals.skipped += s.skipped;
    totals.failed += s.failed;
    totals.originals += s.originals;
  }

  console.log('─'.repeat(60));
  console.log(
    `[variants] ALL DONE — processed=${totals.processed}  skipped=${totals.skipped}  ` +
    `failed=${totals.failed}  (originals seen=${totals.originals})`,
  );
  // Non-zero exit if anything failed, so a CI/ssh wrapper can notice.
  if (totals.failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('[variants] fatal:', err);
  process.exit(1);
});
