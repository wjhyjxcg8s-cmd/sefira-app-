// scripts/crop-hero-art.mjs
//
// ONE-OFF — rebuilds the "en son ilanlar" hero artwork as a NEW file.
// `public/son-ilanlar-hero.webp` is served with an immutable cache header, so it
// is never overwritten; this writes `public/son-ilanlar-hero-v2.webp` beside it
// and the component points at the new name.
//
// Same sharp pipeline shape as scripts/generate-image-variants.mjs.
//
// ─── What it fixes ──────────────────────────────────────────────────────────
//   The source (1200x800, actually a JPEG despite the .webp name) carries a tall
//   band of empty near-white above the illustration and another below it. Inside
//   the section plate that dead space read as extra gap rather than as artwork,
//   so the ink bounding box is measured and cropped to.
//
//   Measured ink bbox at |pixel - background| > 8:  rows 95..761, cols 19..1199.
//   CROP below keeps a few pixels of margin around that so nothing clips.
//
// ─── Why it is tinted ───────────────────────────────────────────────────────
//   The artwork sits on the section plate (`bg-orange-50`, #fff7ed). The source
//   background is a neutral near-white (254,254,253), which would show as a pale
//   rectangle on that warm plate. Multiplying by TINT_MULTIPLIER maps the source
//   background onto the plate colour exactly (multiply: out = a*b/255), so the
//   artwork dissolves into the surface with no seam. The same multiply pulls the
//   blue channel out of the oranges, which — with the SATURATION step before it —
//   is what stops the illustration looking washed out.
//
// ─── Run it ─────────────────────────────────────────────────────────────────
//   cd sefira-app && node scripts/crop-hero-art.mjs
//   Add --verify to print the resulting corner/background pixels.
//
// ────────────────────────────────────────────────────────────────────────────

import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'public', 'son-ilanlar-hero.webp');
const OUT = path.join(ROOT, 'public', 'son-ilanlar-hero-v2.webp');

// ─── Derived: the detail crop the header strip actually renders ─────────────
//   The full band art is a wide cityscape; the compact header only has room for a
//   square, so it shows the one cluster that carries the meaning — globe + pin +
//   magnifier. Column ink density in -v2 puts that cluster at x 660..1135 (peak
//   density x≈900); this square clears the globe's left silhouette, lets the
//   magnifier bleed off the right (it meets the plate's edge there anyway), and
//   leaves only a thin row of rooftops at the bottom instead of the cityscape.
const DETAIL_OUT = path.join(ROOT, 'public', 'son-ilanlar-detail-v1.webp');
const DETAIL_CROP = { left: 600, top: 0, width: 540, height: 540 };


// Ink bbox (95..761 / 19..1199) plus a small margin so the globe does not sit hard
// against the plate's top edge; the right edge has ink all the way to 1199, so
// nothing is trimmed there. The margin is not the dead white band it replaces —
// TINT_MULTIPLIER below turns it into the plate's own colour, i.e. real padding.
const CROP = { left: 10, top: 72, width: 1190, height: 704 };

const SATURATION = 1.22;
// Chosen so 254,254,253 (source background) lands on 255,247,237 = orange-50.
const TINT_MULTIPLIER = { r: 255, g: 248, b: 239 };
const WEBP_QUALITY = 82;

const VERIFY = process.argv.includes('--verify');
const kb = (bytes) => (bytes / 1024).toFixed(1) + 'KB';

async function main() {
  const meta = await sharp(SRC).metadata();
  console.log(`[hero] source ${path.basename(SRC)} ${meta.width}x${meta.height} (${meta.format})`);

  const right = CROP.left + CROP.width;
  const bottom = CROP.top + CROP.height;
  if (right > meta.width || bottom > meta.height) {
    throw new Error(`CROP extends past the source (${right}x${bottom} vs ${meta.width}x${meta.height})`);
  }

  const buf = await sharp(SRC)
    .extract(CROP)
    // Saturation first, tint second: the multiply must be the last thing to touch
    // the background so it lands on the plate colour exactly.
    .modulate({ saturation: SATURATION })
    .composite([
      {
        input: {
          create: {
            width: CROP.width,
            height: CROP.height,
            channels: 3,
            background: TINT_MULTIPLIER,
          },
        },
        blend: 'multiply',
      },
    ])
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  await sharp(buf).toFile(OUT);
  console.log(`[hero] wrote ${path.basename(OUT)} ${CROP.width}x${CROP.height} — ${kb(buf.length)}`);

  // Derived detail. Cropped from the finished -v2 buffer, so it inherits the same
  // saturation and the same orange-50 background — it drops into the plate with no
  // seam and needs no scrim of its own.
  const detail = await sharp(buf)
    .extract(DETAIL_CROP)
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
  await sharp(detail).toFile(DETAIL_OUT);
  console.log(
    `[hero] wrote ${path.basename(DETAIL_OUT)} ${DETAIL_CROP.width}x${DETAIL_CROP.height} — ${kb(detail.length)}`,
  );

  if (VERIFY) {
    const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
    const at = (x, y) => {
      const i = (y * info.width + x) * info.channels;
      return `${data[i]},${data[i + 1]},${data[i + 2]}`;
    };
    console.log(`[hero] top-left      ${at(2, 2)}`);
    console.log(`[hero] top-right     ${at(info.width - 3, 2)}`);
    console.log(`[hero] bottom-left   ${at(2, info.height - 3)}`);
    console.log('[hero] target plate  255,247,237  (orange-50)');
  }
}

main().catch((err) => {
  console.error('[hero] fatal:', err);
  process.exit(1);
});
