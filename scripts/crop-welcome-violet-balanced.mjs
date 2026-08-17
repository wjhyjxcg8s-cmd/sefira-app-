// scripts/crop-welcome-violet-balanced.mjs
//
// ONE-OFF — a BALANCED crop of the owner's original violet welcome illustration,
// replacing the v6 landscape crop in the modal's full-bleed mobile band. Writes a
// NEW file, `public/welcome-popup-art-v7.webp`; every earlier file stays on disk.
//
// ─── The problem v6 left behind ─────────────────────────────────────────────
//   v6 (1104x818, 1.350:1, scripts/crop-welcome-violet-wide.mjs) reached its
//   landscape ratio by extending LEFT into the source's own background, because
//   the scene is flush to the source's right edge. Full-bleed, that reads as the
//   drawing hugging the right edge with a wash-coloured void down the left.
//
// ─── Why the void cannot simply be split in two ─────────────────────────────
//   Measured, not assumed. Object mask = local luminance gradient > 25 (the pastel
//   wash and its decorative curves are smooth; the isometric objects have hard
//   edges), columns counted at >=5% vertical reach:
//
//     welcome-popup-bg.webp  1346x1168   objects x 44..1342   right margin 3px
//     welcome-popup-art-v6   1104x818    objects x 306..1095  right margin 8px
//
//   The shop's platform is clipped by the illustration's OWN canvas — the artwork
//   bleeds off its right edge by construction. There is no right-hand background
//   to extend into, at any crop. So the empty width cannot be shared between the
//   two sides; it can only be made smaller, by making the frame less wide, which
//   means making the band taller.
//
//   `object-position` was ruled out by the same geometry: v6's ratio EQUALS the
//   band's ratio below lg, so object-cover degenerates to object-contain and there
//   is no hidden overflow to pan. Any shift exposes band background on the right,
//   precisely where the ink is flush.
//
// ─── What "taller" costs, and the config that was dropped ───────────────────
//   Measured in headless Chrome against the real card (Geist metrics, the app's own
//   generated stylesheet), 6 languages x 8 viewports, invariant = the text zone
//   must not scroll (body.scrollHeight <= body.clientHeight) with the card capped
//   at max-h-[92dvh]:
//
//     ratio   scene centre   360x640 RU     390x700 RU slack   rest of the 48
//     1.350   63.5%          ok             51.1px             ok      (v6)
//     1.280   61.5%          ok              ~38px             ok
//     1.225   59.9%          SCROLLS +6      24.2px            ok
//     1.167   57.8%          SCROLLS +19     10.0px            ok      (v7, this file)
//     1.131   56.4%          SCROLLS +28      0.1px            ok
//     ~1.05   ~51%           scrolls         scrolls           —
//
//   Russian is the longest copy (a 327px text zone) and it alone sets the floor;
//   every other language has 25px+ to spare at 360x640 even here. Reaching a
//   visually centred scene is arithmetically impossible while 360x640 Russian is
//   held: it caps the band at 259.6px and so the art at ~1.28:1, which moves the
//   scene by 2 percentage points — a change nobody can see. 360x640 was therefore
//   dropped from the supported set by the owner's decision, in exchange for the
//   balance the rest of the matrix gains.
//
//   1.167 rather than the 1.131 that maximises balance: at 1.131 the now-tightest
//   HELD config, 390x700 Russian, clears by 0.1px. That is the boundary, not a
//   margin — a phone whose small viewport is 699px, or a Geist fallback that wraps
//   one word differently, tips it into scrolling. 1.167 buys a real 10px floor and
//   gives back only 1.4 of the 7.1 points of centring on offer. Note the standing
//   sensitivity: every ratio here except v6's depends on the codebase's ~700px
//   model of iOS Safari's small viewport, and Russian is what tests it.
//
// ─── The crop ───────────────────────────────────────────────────────────────
//   Same top edge and same height as v6, so not one pixel of the scene changes:
//   top=127 is the tip of the topmost pin, height=818 keeps every pin, both
//   buildings, the shop, the desk and the house, and trims only the sparse
//   platform-shadow tail below the dense ink. The single change is the left edge,
//   moved from x=242 to x=391, which removes 149px of empty wash:
//
//     955x818 = 1.167:1   objects x 157..947   left margin 157, right margin 7
//     scene bbox centre 57.8% of frame, mass centroid 54.7%
//
//   Crop only — no retint, no multiply, no saturation change, no synthesised
//   background. The residual 57.8% is the artwork's own right-bleed, not a defect
//   of this crop.
//
// ─── Run it ─────────────────────────────────────────────────────────────────
//   cd sefira-app && node scripts/crop-welcome-violet-balanced.mjs [--verify]
import sharp from 'sharp';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'public', 'welcome-popup-bg.webp');
const OUT = path.join(ROOT, 'public', 'welcome-popup-art-v7.webp');

const CROP = { left: 391, top: 127, width: 955, height: 818 };

await sharp(SRC).extract(CROP).webp({ quality: 92 }).toFile(OUT);

const meta = await sharp(OUT).metadata();
console.log(`wrote ${path.relative(ROOT, OUT)} — ${meta.width}x${meta.height} (${(meta.width / meta.height).toFixed(3)}:1)`);

if (process.argv.includes('--verify')) {
  const { data, info } = await sharp(OUT).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  // Ink box, the same loose test the earlier crop scripts used — it answers "did the
  // top pin and the house survive?".
  const isInk = (r, g, b) => Math.max(r, g, b) - Math.min(r, g, b) > 40 || 0.299 * r + 0.587 * g + 0.114 * b < 200;
  let y0 = H, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * C;
    if (isInk(data[i], data[i + 1], data[i + 2])) { if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  console.log(`top row ink present: ${y0 === 0 ? 'yes — the top pin tip survives the crop' : 'NO — pin lost'}`);
  console.log(`bottom row ink present: ${y1 >= H - 2 ? 'reaches the last row' : `ends ${H - 1 - y1}px above the edge (shadow tail trimmed)`}`);

  // Object mask, the strict test — it answers "is the scene centred?".
  const lum = new Float64Array(W * H);
  for (let p = 0, i = 0; p < W * H; p++, i += C) lum[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  const reach = new Float64Array(W);
  let mass = 0, moment = 0;
  for (let x = 1; x < W - 1; x++) {
    let a = -1, b = -1;
    for (let y = 1; y < H - 1; y++) {
      const p = y * W + x;
      if (Math.abs(lum[p + 1] - lum[p - 1]) + Math.abs(lum[p + W] - lum[p - W]) > 25) { if (a < 0) a = y; b = y; }
    }
    reach[x] = a < 0 ? 0 : b - a + 1;
    mass += reach[x];
    moment += reach[x] * x;
  }
  let x0 = -1, x1 = -1;
  for (let x = 0; x < W; x++) if (reach[x] / H >= 0.05) { if (x0 < 0) x0 = x; x1 = x; }
  console.log(`objects x ${x0}..${x1}  left margin ${x0}px  right margin ${W - 1 - x1}px`);
  console.log(`scene bbox centre ${(100 * (x0 + x1) / 2 / W).toFixed(1)}%   mass centroid ${(100 * (moment / mass) / W).toFixed(1)}%   of frame width`);
}
