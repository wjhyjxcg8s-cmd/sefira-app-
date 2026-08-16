// Copies the 4x3 SVG flag set out of the `flag-icons` package (MIT) into
// public/flags, which is what <CountryFlag> points at.
//
// The package is a devDependency and its CSS is deliberately NOT imported: that
// stylesheet is 28KB of background-image rules for 271 countries that every page
// would download to draw two flags. Serving the SVGs straight from our own origin
// ships zero CSS and zero JS, and only the flags actually on screen transfer
// (most are 200–700 bytes). Self-hosted on purpose — no third-party origin, so
// nothing here has to be unpicked when the CSP work lands.
//
// Re-run after bumping flag-icons:  node scripts/sync-flags.mjs
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.join(process.cwd(), 'node_modules', 'flag-icons', 'flags', '4x3');
const DEST = path.join(process.cwd(), 'public', 'flags');

if (!fs.existsSync(SRC)) {
  console.error('flag-icons not installed — run `npm i -D flag-icons` first.');
  process.exit(1);
}

fs.mkdirSync(DEST, { recursive: true });
let copied = 0;
let bytes = 0;
for (const file of fs.readdirSync(SRC)) {
  if (!file.endsWith('.svg')) continue;
  const from = path.join(SRC, file);
  fs.copyFileSync(from, path.join(DEST, file));
  bytes += fs.statSync(from).size;
  copied += 1;
}
console.log(`copied ${copied} flags (${(bytes / 1024 / 1024).toFixed(2)} MB) -> public/flags`);
