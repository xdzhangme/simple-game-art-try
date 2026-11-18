// Renders the indexed sprites with the current theme palette and caches the result.
import { INDEX, mix, readPalette } from './palette.js';
import { SPRITES } from './sprites.js';

let palette = null;
let dirty = true;
const cache = new Map();

if (typeof MutationObserver !== 'undefined') {
  // theme.json is applied as inline CSS variables on <html>
  new MutationObserver(() => (dirty = true)).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style'],
  });
}

export function currentPalette() {
  if (dirty || !palette) {
    palette = readPalette();
    cache.clear();
    dirty = false;
  }
  return palette;
}

// Returns a canvas for a sprite. Options: tint (room tint name) and locked (gray silhouette).
export function sprite(name, { tint = null, locked = false } = {}) {
  const pal = currentPalette();
  const key = `${name}|${tint ?? ''}|${locked ? 1 : 0}`;
  let canvas = cache.get(key);
  if (canvas) return canvas;
  const rows = SPRITES[name];
  if (!rows) return null;
  const base = tint ? pal[`tint${tint[0].toUpperCase()}${tint.slice(1)}`] ?? pal.floor : pal.floor;
  const colors = { ...Object.fromEntries(Object.entries(INDEX).map(([ch, token]) => [ch, pal[token]])) };
  colors.t = base;
  colors.u = tint ? mix(base, pal.outline, 0.12) : pal.grid;
  colors.q = mix(base, pal.outline, 0.22);
  canvas = document.createElement('canvas');
  canvas.width = rows[0].length;
  canvas.height = rows.length;
  const ctx = canvas.getContext('2d');
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.') continue;
      ctx.fillStyle = locked ? (ch === 'o' || ch === 'i' ? pal.lockedOutline : pal.locked) : colors[ch];
      ctx.fillRect(x, y, 1, 1);
    }
  });
  cache.set(key, canvas);
  return canvas;
}

const roomTints = new WeakMap();

// Per-tile room tint names, built once per map from rooms[].{x,y,w,h,tint}.
function tintAt(map, col, row) {
  let grid = roomTints.get(map);
  if (!grid) {
    grid = new Map();
    for (const r of map.rooms ?? []) {
      if (!r.tint) continue;
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) grid.set(`${x},${y}`, r);
    }
    roomTints.set(map, grid);
  }
  return grid.get(`${col},${row}`) ?? null;
}

const SOLID_EDGE = new Set(['void', 'floor', 'door']);

function drawWall(ctx, map, kindAt, col, row, px, py, t, pal) {
  ctx.fillStyle = pal.wall;
  ctx.fillRect(px, py, t, t);
  ctx.fillStyle = pal.outline;
  if (SOLID_EDGE.has(kindAt(col, row - 1))) ctx.fillRect(px, py, t, 1);
  if (SOLID_EDGE.has(kindAt(col, row + 1))) ctx.fillRect(px, py + t - 1, t, 1);
  if (SOLID_EDGE.has(kindAt(col - 1, row))) ctx.fillRect(px, py, 1, t);
  if (SOLID_EDGE.has(kindAt(col + 1, row))) ctx.fillRect(px + t - 1, py, 1, t);
}

// Draws one map tile at (px, py); kindAt(col, row) gives neighbor kinds for the wall outline.
export function drawTile(ctx, map, kindAt, col, row, px, py) {
  const kind = kindAt(col, row);
  if (kind === 'void') return;
  const pal = currentPalette();
  const t = map.tileSize;
  if (kind === 'wall') return drawWall(ctx, map, kindAt, col, row, px, py, t, pal);
  const name = kind === 'wallface' ? 'face' : kind === 'door' ? 'door' : 'floor';
  const room = name === 'floor' ? tintAt(map, col, row) : null;
  const img = (room && sprite(`floor-${room.floor}`, { tint: room.tint })) || sprite(name, { tint: room?.tint ?? null });
  ctx.drawImage(img, px, py);
}

// Draws a prop (or any sprite) with its bottom-left at the foot of its tile footprint.
export function drawProp(ctx, map, p, camX, camY, opts) {
  const img = sprite(p.sprite, opts);
  if (!img) return;
  const t = map.tileSize;
  const x = p.x * t + (p.dx ?? 0) - camX;
  const y = (p.y + (p.h ?? 1)) * t - img.height - camY;
  ctx.drawImage(img, Math.round(x), Math.round(y));
}

// Base line (map pixels) used to depth-sort props with the player.
export const propBase = (map, p) => (p.y + (p.h ?? 1)) * map.tileSize;

export function drawCharacter(ctx, dir, frame, x, y) {
  ctx.drawImage(sprite(`char-${dir}-${frame}`), Math.round(x), Math.round(y));
}
