// Regenerate Verdant app-icon assets from inline SVG via sharp.
// Run: node scripts/gen-icon.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'assets/images');
mkdirSync(OUT, { recursive: true });

const NIGHT = '#0F1612';
const NIGHT2 = '#17241D';
const LIME = '#C6D45A';
const LIME_INK = '#2A3318';

// A single bold leaf, tilted, with a midrib + side veins. Drawn in a 1024 box,
// centered near 512,512 so it survives adaptive-icon cropping.
function leaf({ fill, veinOpacity = 0.55 }) {
  return `
    <g transform="rotate(-14 512 512)">
      <path d="M512 168
               C 706 352, 706 700, 512 872
               C 318 700, 318 352, 512 168 Z"
            fill="${fill}"/>
      <path d="M512 226 C 508 430, 508 640, 512 812"
            stroke="${LIME_INK}" stroke-opacity="${veinOpacity}"
            stroke-width="14" fill="none" stroke-linecap="round"/>
      <g stroke="${LIME_INK}" stroke-opacity="${veinOpacity * 0.8}" stroke-width="10" fill="none" stroke-linecap="round">
        <path d="M512 360 C 560 372, 600 400, 628 452"/>
        <path d="M512 360 C 464 372, 424 400, 396 452"/>
        <path d="M512 500 C 566 516, 606 548, 636 604"/>
        <path d="M512 500 C 458 516, 418 548, 388 604"/>
        <path d="M512 640 C 556 656, 590 684, 612 728"/>
        <path d="M512 640 C 468 656, 434 684, 412 728"/>
      </g>
    </g>`;
}

// Faint glasshouse panes behind the leaf — a few lines, not a full grid.
function panes(opacity) {
  return `
    <g stroke="#FFFFFF" stroke-opacity="${opacity}" stroke-width="6" fill="none">
      <line x1="512" y1="120" x2="512" y2="904"/>
      <line x1="220" y1="330" x2="804" y2="694"/>
      <line x1="804" y1="330" x2="220" y2="694"/>
    </g>`;
}

const bgGradient = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${NIGHT2}"/>
      <stop offset="1" stop-color="${NIGHT}"/>
    </linearGradient>
  </defs>`;

const fullIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${bgGradient}
  <rect width="1024" height="1024" fill="url(#bg)"/>
  ${panes(0.05)}
  ${leaf({ fill: LIME })}
</svg>`;

// Adaptive foreground: leaf only, scaled to ~60% inside the safe zone, transparent bg.
const foreground = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <g transform="translate(512 512) scale(0.66) translate(-512 -512)">
    ${leaf({ fill: LIME })}
  </g>
</svg>`;

const background = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${bgGradient}
  <rect width="1024" height="1024" fill="url(#bg)"/>
  ${panes(0.05)}
</svg>`;

// Monochrome (Android themed icons): white silhouette, transparent bg.
const monochrome = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <g transform="translate(512 512) scale(0.66) translate(-512 -512)">
    ${leaf({ fill: '#FFFFFF', veinOpacity: 0 })}
  </g>
</svg>`;

async function png(svg, name, size) {
  const out = resolve(OUT, name);
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out);
  console.log('wrote', name, `${size}x${size}`);
}

await png(fullIcon, 'icon.png', 1024);
await png(fullIcon, 'splash-icon.png', 1024);
await png(fullIcon, 'favicon.png', 48);
await png(foreground, 'android-icon-foreground.png', 1024);
await png(background, 'android-icon-background.png', 1024);
await png(monochrome, 'android-icon-monochrome.png', 1024);
console.log('done');
