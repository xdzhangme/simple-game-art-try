// Pixel-level reachability check using the real player collision (blocked()).
// Flood-fills the player's feet position from spawn and verifies that every room can be entered and
// every object slot has a reachable tile within interaction range (1 tile, Chebyshev).
// Run with `npm run check:map`. Exits non-zero on failure.
import { readFileSync } from 'node:fs';
import { blocked } from '../src/player.js';

const map = JSON.parse(readFileSync(new URL('../src/data/office-map.json', import.meta.url), 'utf8'));
const t = map.tileSize;
const Wpx = map.tiles[0].length * t;
const Hpx = map.tiles.length * t;
const STEP = 2;

const start = { x: Math.round((map.spawn.x + 0.5) * t), y: (map.spawn.y + 1) * t - 1 };
if (blocked(map, start.x, start.y)) {
  console.error('Spawn position is blocked');
  process.exit(1);
}

const key = (x, y) => y * Wpx + x;
const seen = new Set([key(start.x, start.y)]);
const queue = [[start.x, start.y]];
const tilesReached = new Set();
for (let i = 0; i < queue.length; i++) {
  const [x, y] = queue[i];
  tilesReached.add(`${Math.floor(x / t)},${Math.floor(y / t)}`);
  for (const [dx, dy] of [[STEP, 0], [-STEP, 0], [0, STEP], [0, -STEP]]) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= Wpx || ny >= Hpx || seen.has(key(nx, ny))) continue;
    if (blocked(map, nx, ny)) continue;
    seen.add(key(nx, ny));
    queue.push([nx, ny]);
  }
}

let failures = 0;
for (const r of map.rooms) {
  let inside = false;
  for (let y = r.y; y < r.y + r.h && !inside; y++) {
    for (let x = r.x; x < r.x + r.w; x++) if (tilesReached.has(`${x},${y}`)) { inside = true; break; }
  }
  if (!inside) {
    failures++;
    console.error(`Room not reachable: ${r.id}`);
  }
}
for (const s of map.slots) {
  let ok = false;
  for (let dy = -1; dy <= 1 && !ok; dy++) for (let dx = -1; dx <= 1; dx++) if (tilesReached.has(`${s.x + dx},${s.y + dy}`)) ok = true;
  if (!ok) {
    failures++;
    console.error(`Slot not reachable: ${s.id}`);
  }
}
// Decor must not overlap other props or sit on a doorway, and every doorway tile must be reachable.
const cellsOf = (p) => Array.from({ length: p.w * p.h }, (_, i) => `${p.x + (i % p.w)},${p.y + Math.floor(i / p.w)}`);
const owner = new Map();
for (const p of map.props) {
  if (p.layer === 'floor') continue;
  for (const c of cellsOf(p)) {
    if (owner.has(c)) {
      failures++;
      console.error(`Overlap at ${c}: ${owner.get(c)} / ${p.sprite}`);
    } else owner.set(c, p.sprite);
  }
}
for (const d of map.doors) {
  if (owner.has(`${d.x},${d.y}`) && map.props.some((p) => p.solid !== false && cellsOf(p).includes(`${d.x},${d.y}`))) {
    failures++;
    console.error(`Prop on doorway ${d.x},${d.y}`);
  }
  if (!tilesReached.has(`${d.x},${d.y}`)) {
    failures++;
    console.error(`Doorway not reachable ${d.x},${d.y}`);
  }
}
console.log(`rooms ${map.rooms.length}, slots ${map.slots.length}, unreachable ${failures}`);
process.exit(failures ? 1 : 0);
