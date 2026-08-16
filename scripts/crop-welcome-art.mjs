// scripts/crop-welcome-art.mjs
//
// ONE-OFF — builds the welcome modal's artwork as a NEW file. Nothing is
// overwritten: `public/welcome-popup-art-v2.webp` is written beside the files it
// supersedes and the component points at the new name.
//
// ─── Why this source ────────────────────────────────────────────────────────
//   The modal used to carry `welcome-popup-bg.webp` (and its crop), a purple/violet
//   illustration that shares no palette with the product — flat #f97316 on warm
//   stone/orange-50 neutrals. `son-ilanlar-hero-v2.webp` is the same house style as
//   the homepage's "en son ilanlar" band, it is already orange-toned, and
//   scripts/crop-hero-art.mjs already multiplied its background onto orange-50:
//   measured corners are (254,247,238) against #fff7ed = (255,247,237). Dropped on
//   a `bg-orange-50` band it therefore has no visible picture box at all. It is
//   also unreferenced by any component today, so reusing it costs nothing.
//
// ─── The crop ───────────────────────────────────────────────────────────────
//   A trim, not a recomposition. Ink measured at |pixel - background| > 10 runs
//   rows 24..691 of 704 — the scene already fills the source almost edge to edge,
//   so any aggressive letterbox crop slices the building bases mid-wall and reads
//   as a cut. This keeps the whole illustration and only removes the dead margin.
//
//   The modal keeps the artwork subordinate the other way instead: the band caps
//   its HEIGHT (160/176px), so the art draws ~280-310px wide inside a ~390px band
//   and the greeting stays the subject. Because the art's background and the band
//   are the same orange-50, the space either side is invisible.
//
// ─── Run it ─────────────────────────────────────────────────────────────────
//   cd sefira-app && node scripts/crop-welcome-art.mjs [--verify]
import sharp from 'sharp';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'public', 'son-ilanlar-hero-v2.webp');
const OUT = path.join(ROOT, 'public', 'welcome-popup-art-v2.webp');

const CROP = { left: 18, top: 22, width: 1170, height: 672 }; // ink box + a hair
const WIDTH = 760; // ~2.4x the ~310px the modal draws it at

await sharp(SRC).extract(CROP).resize({ width: WIDTH }).webp({ quality: 88 }).toFile(OUT);

const meta = await sharp(OUT).metadata();
console.log(`wrote ${path.relative(ROOT, OUT)} — ${meta.width}x${meta.height} (${(meta.width / meta.height).toFixed(2)}:1)`);

if (process.argv.includes('--verify')) {
  const { data, info } = await sharp(OUT).raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => {
    const i = (y * info.width + x) * info.channels;
    return [data[i], data[i + 1], data[i + 2]];
  };
  console.log('corners  TL', px(2, 2), 'TR', px(info.width - 3, 2), 'BL', px(2, info.height - 3), 'BR', px(info.width - 3, info.height - 3));
  console.log('target   orange-50 #fff7ed = [255, 247, 237]');
}
