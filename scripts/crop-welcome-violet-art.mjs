// scripts/crop-welcome-violet-art.mjs
//
// ONE-OFF — crops the OWNER'S ORIGINAL violet welcome illustration for the
// restored modal. Writes a NEW file, `public/welcome-popup-art-v4.webp`; the
// source and every earlier crop stay on disk untouched.
//
// ─── Why a new crop ─────────────────────────────────────────────────────────
//   `welcome-popup-bg.webp` (1346x1168) parks the scene in its right 59% — the
//   left third is empty background with a decorative dot grid. That is why the
//   original `object-cover object-[70%_35%]` treatment read as "starting from the
//   left with dots in the corner" on a phone, and why cover also ate ~140px off
//   the top of the source (straight through the blue building pin) in the band's
//   wider box.
//
//   `welcome-popup-art.webp` (the 470f2fa66 crop) fixed the clipping but is not
//   balanced: it was cut at left 495 against ink starting at 555, so it carries a
//   60px margin on the left and 0 on the right — contained and centred, the
//   drawing therefore sits visibly off to one side.
//
// ─── The crop ───────────────────────────────────────────────────────────────
//   Measured, not eyeballed, with the same discriminator shape crop-hero-art.mjs
//   uses: a pixel is ink when it is saturated (max-min > 40) or dark (luma < 200).
//   That deliberately excludes the pale lavender blobs and the grey dot grid, so
//   the decorations are cropped away and only the illustration itself is kept.
//
//     INK bbox  x 555..1345, y 127..980  (791x854)
//     margins   left 555, right 0, top 127, bottom 187
//
//   The ink is flush to the source's right edge, so there is no margin to balance
//   against — the crop is taken as the ink box EXACTLY. Canvas == drawing, so the
//   band's `justify-center` centres the illustration itself, and the breathing
//   room above the pins comes from the band's CSS padding rather than from baked
//   -in whitespace (which is what let the old version clip).
//
//   No colour is touched: no retint, no multiply, no saturation change. This is a
//   crop and a resize of the owner's artwork, nothing else.
//
// ─── Run it ─────────────────────────────────────────────────────────────────
//   cd sefira-app && node scripts/crop-welcome-violet-art.mjs [--verify]
import sharp from 'sharp';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'public', 'welcome-popup-bg.webp');
const OUT = path.join(ROOT, 'public', 'welcome-popup-art-v4.webp');

const CROP = { left: 555, top: 127, width: 791, height: 854 };
const WIDTH = 640; // ~2.5x the ~250px the band draws it at

await sharp(SRC).extract(CROP).resize({ width: WIDTH }).webp({ quality: 92 }).toFile(OUT);

const meta = await sharp(OUT).metadata();
console.log(`wrote ${path.relative(ROOT, OUT)} — ${meta.width}x${meta.height} (${(meta.width / meta.height).toFixed(3)}:1)`);

if (process.argv.includes('--verify')) {
  const { data, info } = await sharp(OUT).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const px = (x, y) => {
    const i = (y * W + x) * C;
    return [data[i], data[i + 1], data[i + 2]];
  };
  console.log('corners  TL', px(2, 2), 'TR', px(W - 3, 2), 'BL', px(2, H - 3), 'BR', px(W - 3, H - 3));
  console.log('edges    top', px(W >> 1, 2), 'bottom', px(W >> 1, H - 3), 'left', px(2, H >> 1), 'right', px(W - 3, H >> 1));

  // Confirm the drawing fills the canvas: ink must touch every edge.
  const isInk = (r, g, b) => Math.max(r, g, b) - Math.min(r, g, b) > 40 || 0.299 * r + 0.587 * g + 0.114 * b < 200;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * C;
    if (isInk(data[i], data[i + 1], data[i + 2])) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  console.log(`ink in crop  x ${x0}..${x1} of ${W - 1}   y ${y0}..${y1} of ${H - 1}  (margins L${x0} R${W - 1 - x1} T${y0} B${H - 1 - y1})`);
}
