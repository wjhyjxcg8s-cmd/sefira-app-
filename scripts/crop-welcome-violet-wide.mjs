// scripts/crop-welcome-violet-wide.mjs
//
// ONE-OFF — a WIDER, SHORTER crop of the owner's original violet welcome
// illustration, for the modal's capped band. Writes a NEW file,
// `public/welcome-popup-art-v6.webp`; every earlier file stays on disk untouched.
//
// ─── Why a landscape crop ───────────────────────────────────────────────────
//   The card has to fit entirely — band + headline + divider + copy + CTA — inside
//   the visible viewport of a real phone with Safari's toolbars up (~700px, not the
//   844px the layout viewport reports). With the ink box's own 0.926 portrait ratio,
//   a full-bleed band is 384px tall at 390 and the card lands at 636px, which does
//   not fit a ~595px budget: the text zone then scrolls and the headline slides up
//   under the band.
//
//   Capping the band height and keeping the portrait art would put the white flanks
//   back (the framed look we removed), so the art itself has to get wider.
//
//   `object-cover` was ruled out arithmetically, not by eye. At the band ratios this
//   invariant needs (>= 1.207), cover has to discard 23-33% of the artwork's height:
//     - anchored top    -> loses the house (dense ink runs to y=804 of 854)
//     - anchored centre -> loses the top pin (its tip is at y=0) AND the house base
//   Either way it breaks "all 5 pins and both buildings visible". So: recrop.
//
// ─── The crop ───────────────────────────────────────────────────────────────
//   Measured on welcome-popup-bg.webp (1346x1168). Ink box x 555..1345, y 127..980.
//   Row profile of the ink shows dense structure (>25% of width) from y=158 to
//   y=804 in ink-box coordinates, with only a sparse platform-shadow tail below.
//
//   Two moves, neither of which touches a pin or a building:
//     1. Trim 35px of that sparse shadow tail off the bottom (ink-box y 819..853,
//        15-19% coverage) -> height 818.
//     2. Extend LEFT into the source's own background to reach the target ratio.
//        The decorative dot grid lives at source x < ~160, so starting at x=242
//        keeps it out — this adds the plain soft gradient only.
//
//   Result 1104x818 = 1.350:1, close to the owner's original band ratio (the
//   max-h-64 band was ~1.39:1). Every pin, both buildings, the shop, the desk and
//   the house are intact. No colour is touched: crop only, no retint, no multiply,
//   no saturation change.
//
//   Trade-off recorded honestly: the scene sits in the right ~72% of the frame with
//   the source's own gradient on the left. Balancing it would need fabricated
//   background on the right, since the ink is flush to the source's right edge.
//
// ─── Run it ─────────────────────────────────────────────────────────────────
//   cd sefira-app && node scripts/crop-welcome-violet-wide.mjs [--verify]
import sharp from 'sharp';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'public', 'welcome-popup-bg.webp');
const OUT = path.join(ROOT, 'public', 'welcome-popup-art-v6.webp');

const CROP = { left: 242, top: 127, width: 1104, height: 818 };

await sharp(SRC).extract(CROP).webp({ quality: 92 }).toFile(OUT);

const meta = await sharp(OUT).metadata();
console.log(`wrote ${path.relative(ROOT, OUT)} — ${meta.width}x${meta.height} (${(meta.width / meta.height).toFixed(3)}:1)`);

if (process.argv.includes('--verify')) {
  const { data, info } = await sharp(OUT).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const isInk = (r, g, b) => Math.max(r, g, b) - Math.min(r, g, b) > 40 || 0.299 * r + 0.587 * g + 0.114 * b < 200;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * C;
    if (isInk(data[i], data[i + 1], data[i + 2])) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  console.log(`ink  x ${x0}..${x1} of ${W - 1}   y ${y0}..${y1} of ${H - 1}`);
  console.log(`top row ink present: ${y0 === 0 ? 'yes — the top pin tip survives the crop' : 'NO — pin lost'}`);
  console.log(`bottom row ink present: ${y1 >= H - 2 ? 'reaches the last row' : `ends ${H - 1 - y1}px above the edge (shadow tail trimmed)`}`);
}
