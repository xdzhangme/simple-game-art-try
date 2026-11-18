// Generates src/data/office-map.json: the ~15-space portrait office (tiles, rooms, props, slots, objects).
// Run with `npm run build:map`. The JSON is committed; edit this script to change the layout.
import { writeFileSync } from 'node:fs';

const W = 30;
const H = 68;
const grid = Array.from({ length: H }, () => Array(W).fill(' '));
const props = [];
const slots = [];
const rooms = [];
const doors = [];

const CORRIDOR = { x0: 13, x1: 16 };
const CAPS = { 1: 10, 2: 18, 3: 26, 4: 34, 5: 42, 6: 50, 7: 58 };

// Walls are '#', back-wall face is 'F', floor '.', doorways 'D'.
function box(x0, y0, x1, y1) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) grid[y][x] = '#';
}
function fill(x0, y0, x1, y1, ch) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) grid[y][x] = ch;
}
function room(def) {
  const { id, name, type, tint, xa, xb, cap, floors } = def;
  const box0 = { x0: xa - 1, x1: xb + 1, y0: cap, y1: cap + 1 + floors + 1 };
  // draw the outer wall as a filled block, then carve the interior
  fill(box0.x0, box0.y0, box0.x1, box0.y1, '#');
  fill(xa, cap + 1, xb, cap + 1, 'F');
  fill(xa, cap + 2, xb, cap + 1 + floors, '.');
  rooms.push({ id, name, type, dept: def.dept ?? null, tint, floor: def.floor ?? 'grid', x: xa, y: cap + 2, w: xb - xa + 1, h: floors });
  // wall sign plaque (2 tiles wide) at the right end of the back wall
  add(`sign-${def.sign ?? id}`, def.signX ?? xb - 1, cap + 1, 2, 1, { solid: false });
}
const add = (sprite, x, y, w = 1, h = 1, extra = {}) => props.push({ sprite, x, y, w, h, ...extra });
const wallDecor = (sprite, x, y) => add(sprite, x, y, 1, 1, { solid: false });
const rug = (name, x, y, w, h) => add(name, x, y, w, h, { solid: false, layer: 'floor' });
const chair = (x, y) => add('chair', x, y, 1, 1, { solid: false, dx: 8 });

function desk(roomId, n, x, y) {
  const id = `${roomId}-${n}`;
  add('desk', x, y, 2, 1, { slot: id });
  chair(x, y + 1);
  slots.push({ id, room: roomId, x, y, prop: 'desk' });
}

// ---- department rooms ----
// Rooms alternate between departments and functional rooms on both sides of the corridor.
// `band` is the vertical slot (CAPS); `type` defaults to department. inset shifts the outer wall for an irregular outline.
const LEFT = [
  { id: 'finance', name: 'Finance', band: 1, inset: 0, tint: 'mint', floor: 'checker' },
  { id: 'print', name: 'Print room', type: 'tip', band: 2, inset: 1, tint: 'grey', floor: 'hatch' },
  { id: 'hr', name: 'HR', band: 3, inset: 2, tint: 'lavender', floor: 'dots' },
  { id: 'it', name: 'IT', band: 6, inset: 2, tint: 'ice', floor: 'tiles8' },
  { id: 'procurement', name: 'Procurement', band: 7, inset: 1, tint: 'butter', floor: 'zigzag' },
];
const RIGHT = [
  { id: 'sales', name: 'Sales', band: 1, inset: 0, tint: 'blush', floor: 'stripes' },
  { id: 'cafeteria', name: 'Cafeteria', type: 'tip', band: 2, inset: 1, tint: 'butter', floor: 'checker' },
  { id: 'legal', name: 'Legal', band: 3, inset: 2, tint: 'sky', floor: 'planks' },
  { id: 'ops', name: 'Operations', band: 4, inset: 1, tint: 'sage', floor: 'hatch' },
  { id: 'workspace', name: 'Open workspace', type: 'tip', band: 5, inset: 0, tint: 'sky', floor: 'dots' },
  { id: 'marketing', name: 'Marketing', band: 6, inset: 1, tint: 'peach', floor: 'diamond' },
  { id: 'service', name: 'Service', band: 7, inset: 2, tint: 'sand', floor: 'bands' },
];

// Five desk positions per layout as [dx, dy] from the room's top-left floor tile (dy 0 = storage row).
const LAYOUTS = {
  rows: [[1, 3], [4, 3], [7, 3], [1, 6], [5, 6]],
  pods: [[1, 3], [4, 3], [1, 6], [4, 6], [7, 4]],
  stagger: [[1, 3], [4, 4], [7, 3], [2, 6], [6, 6]],
  benches: [[1, 3], [4, 3], [7, 3], [2, 5], [6, 5]],
  ring: [[1, 3], [1, 5], [7, 3], [7, 5], [4, 6]],
  scatter: [[2, 3], [5, 3], [1, 5], [4, 6], [7, 5]],
};

// Per-department furniture. Entries: [sprite, dx, row, w]. Rows: 1 = back wall, 2 = storage row, 7 = bottom row.
// A negative dx counts from the right edge (-1 is the last column). Rug: [sprite, dx, w, h] at row 4.
const DECOR = {
  finance: {
    layout: 'rows',
    items: [['window', 0, 1], ['chart', 3, 1, 2], ['clock', 6, 1], ['safe', 0, 2], ['cabinet', 2, 2], ['cabinet', 3, 2], ['plant', -1, 2], ['bin', -1, 7]],
    rug: ['rug-4x2', 3, 4, 2],
    extra: [['ledger', 7, 1], ['ledger', 8, 1], ['cabinet', 4, 2], ['plant', 0, 7], ['safe', 0, 6], ['cabinet', 0, 3], ['bin', 0, 5], ['cactus', -1, 3]],
  },
  hr: {
    layout: 'pods',
    items: [['window', 0, 1], ['frame', 3, 1], ['poster', 5, 1], ['plant', 0, 2], ['sofa', 2, 2, 2], ['cabinet', 5, 2], ['plant', -1, 2], ['armchair', -1, 7]],
    rug: ['rug-3x2', 3, 3, 2],
    extra: [['coat-rack', 1, 2], ['frame', 7, 1], ['cactus', 4, 2], ['plant', 0, 6], ['bin', 0, 7], ['shelf', 6, 2, 2], ['lamp', 0, 3], ['coat-rack', -1, 3], ['plant', -1, 6]],
  },
  it: {
    layout: 'stagger',
    items: [['monitors', 0, 1, 2], ['clock', 3, 1], ['server', 0, 2], ['server', 1, 2], ['server', 2, 2], ['cabinet', 4, 2], ['plant', -1, 2], ['boxes', -1, 7]],
    extra: [['monitors', 5, 1, 2], ['server', 3, 2], ['server', 5, 2], ['server', 6, 2], ['cabinet', 0, 3], ['server', 0, 4], ['server', 0, 5], ['bin', 0, 7], ['cactus', 0, 6], ['lamp', -1, 3]],
  },
  sales: {
    layout: 'benches',
    items: [['whiteboard', 2, 1, 2], ['frame', 5, 1], ['globe', 0, 2], ['shelf', 2, 2, 2], ['plant', -1, 2], ['cooler', -1, 7]],
    rug: ['rug-4x2', 3, 4, 2],
    extra: [['chart', 7, 1, 2], ['trophy', 4, 2], ['trophy', 5, 2], ['frame', 1, 1], ['poster', 8, 1], ['cabinet', 0, 3], ['trophy', 0, 6], ['plant', 0, 7], ['lamp', -1, 3], ['bin', -1, 6]],
  },
  legal: {
    layout: 'ring',
    items: [['frame', 0, 1], ['frame', 3, 1], ['shelf', 0, 2, 2], ['shelf', 2, 2, 2], ['shelf', 4, 2, 2], ['plant', -1, 2], ['lamp', -1, 7]],
    rug: ['rug-3x2', 3, 3, 2],
    extra: [['scales', 6, 2], ['scales', 7, 2], ['frame', 6, 1], ['frame', 8, 1], ['cabinet', 0, 3], ['cabinet', 0, 4], ['cabinet', 0, 5], ['lamp', 0, 6], ['plant', 0, 7], ['coat-rack', -1, 3], ['bin', -1, 6]],
  },
  ops: {
    layout: 'scatter',
    items: [['window', 0, 1], ['clock', 3, 1], ['poster', 5, 1], ['box-shelf', 0, 2, 2], ['boxes', 3, 2], ['conveyor', 4, 2, 2], ['plant', -1, 2], ['boxes', -1, 7]],
    extra: [['pallet', 0, 6, 2], ['pallet', 2, 7, 2], ['boxes', 5, 2], ['boxes', 6, 2], ['box-shelf', 7, 2, 2], ['poster', 7, 1], ['whiteboard', 8, 1, 2], ['boxes', 0, 3], ['boxes', 0, 4], ['boxes', -1, 3], ['boxes', -1, 6]],
  },
  marketing: {
    layout: 'scatter',
    items: [['poster', 0, 1], ['poster', 2, 1], ['frame', 4, 1], ['easel', 0, 2], ['easel', 2, 2], ['shelf', 4, 2, 2], ['plant', -1, 2], ['lamp', -1, 7]],
    rug: ['rug-3x2', 3, 3, 2],
    extra: [['poster', 6, 1], ['poster', 8, 1], ['easel', 5, 2], ['easel', 6, 2], ['globe', 7, 2], ['lamp', 0, 3], ['plant', 0, 6], ['easel', 0, 7], ['frame', 1, 1], ['bin', -1, 6], ['cactus', -1, 3]],
  },
  procurement: {
    layout: 'stagger',
    items: [['window', 0, 1], ['clock', 2, 1], ['poster', 4, 1], ['box-shelf', 0, 2, 2], ['boxes', 3, 2], ['boxes', 4, 2], ['cabinet', 5, 2], ['plant', -1, 2], ['boxes', -1, 7]],
    extra: [['ledger', 5, 1], ['ledger', 6, 1], ['box-shelf', 6, 2, 2], ['pallet', 0, 6, 2], ['boxes', 0, 3], ['boxes', 0, 4], ['cabinet', 0, 5], ['clock', 8, 1], ['plant', -1, 3], ['bin', -1, 6]],
  },
  service: {
    layout: 'ring',
    items: [['window', 0, 1], ['frame', 3, 1], ['clock', 5, 1], ['counter', 0, 2, 2], ['coffee-machine', 2, 2], ['plant', 3, 2], ['cabinet', 5, 2], ['bin', -1, 7]],
    rug: ['rug-4x2', 2, 4, 2],
    extra: [['poster', 7, 1], ['coat-rack', 6, 2], ['microwave', 1, 2], ['lamp', 0, 3], ['plant', 0, 6], ['armchair', 0, 7], ['cabinet', 0, 4], ['bin', -1, 3], ['cactus', -1, 6]],
  },
  print: {
    items: [['window', 0, 1], ['poster', 4, 1], ['clock', 7, 1], ['plant', 0, 2], ['printer', 1, 2, 2], ['printer', 4, 2, 2], ['box-shelf', 7, 2, 2], ['boxes', 0, 6], ['boxes', 1, 6], ['cabinet', 3, 6], ['bin', -1, 7]],
    rug: ['rug-3x2', 4, 3, 2],
    extra: [['printer', 6, 2, 2], ['cabinet', 5, 6], ['boxes', 0, 4], ['boxes', 0, 5], ['box-shelf', 1, 6, 2], ['boxes', 6, 6], ['boxes', 7, 6], ['poster', 1, 1], ['ledger', 2, 1], ['cabinet', -1, 3], ['cabinet', -1, 6], ['cactus', 0, 3]],
  },
  cafeteria: {
    items: [['window', 0, 1], ['frame', 4, 1], ['clock', 6, 1], ['counter', 0, 2, 2], ['coffee-machine', 2, 2], ['fridge', 3, 2], ['vending-red', 4, 2], ['vending-blue', 5, 2], ['plant', -1, 2],
      ['round-table', 2, 4], ['round-table', 5, 4], ['round-table', 8, 4], ['round-table', 3, 6], ['round-table', 7, 6], ['lamp', -1, 7], ['bin', 0, 7]],
    extra: [['microwave', 3, 2], ['microwave', 6, 2], ['cooler', 6, 2], ['poster', 7, 1], ['frame', 8, 1], ['round-table', 0, 6], ['round-table', 9, 6], ['plant', 0, 3], ['coffee-machine', 7, 2], ['lamp', 0, 7], ['plant', -1, 6], ['cactus', 0, 4]],
  },
  workspace: {
    desks: [[1, 4], [4, 4], [7, 4], [1, 6], [4, 6], [7, 6]],
    items: [['window', 0, 1], ['whiteboard', 3, 1, 2], ['clock', 6, 1], ['plant', 0, 2], ['shelf', 2, 2, 2], ['plant', -1, 2], ['bin', -1, 7]],
    extra: [['coat-rack', 1, 2], ['cabinet', 5, 2], ['cabinet', 6, 2], ['printer', 7, 2, 2], ['coffee-machine', 4, 2], ['poster', 7, 1], ['frame', 8, 1], ['monitors', 9, 1, 2], ['lamp', 0, 3], ['cactus', 0, 7], ['cooler', -1, 3], ['plant', -1, 6], ['bin', 0, 6], ['lamp', -1, 7]],
  },
};

const WALL_SPRITES = new Set(['window', 'frame', 'clock', 'poster', 'whiteboard', 'chart', 'monitors', 'ledger', 'pinboard']);

// Extra decoration is placed only where it cannot overlap existing props or crowd a doorway.
// Candidates that do not fit are skipped, so the lists can be generous.
function placeExtras(list, at, { xa, xb, cap, floors, doorX }) {
  const taken = new Set();
  props.forEach((p) => {
    if (p.layer === 'floor') return;
    for (let j = 0; j < p.h; j++) for (let i = 0; i < p.w; i++) taken.add(p.x + i + "," + (p.y + j));
  });
  const doorSide = doorX < xa ? xa : xb;
  const dir = doorX < xa ? 1 : -1;
  list.forEach(([sprite, dx, row, w = 1]) => {
    const x = at(dx);
    const y = cap + row;
    const wall = WALL_SPRITES.has(sprite);
    const cells = [];
    for (let i = 0; i < w; i++) cells.push([x + i, y]);
    const inside = cells.every(([cx, cy]) => cx >= xa && cx <= xb && cy >= cap + 1 && cy <= cap + 1 + floors);
    const blocked = cells.some(([cx, cy]) => taken.has(cx + "," + cy));
    // keep a 2-tile apron in front of the doorway (rows cap+3..cap+6, nearest two columns)
    const apron = !wall && cells.some(([cx, cy]) => Math.abs(cx - doorSide) < 2 && cy >= cap + 3 && cy <= cap + 6);
    if (!inside || blocked || apron) return;
    cells.forEach(([cx, cy]) => taken.add(cx + "," + cy));
    add(sprite, x, y, w, 1, wall ? { solid: false } : {});
  });
}

// Second decoration pass inspired by general office prop variety (pinboards, copiers, folders, crates, extinguishers).
const MORE = {
  finance: [['pinboard', 5, 1, 2], ['extinguisher', -1, 5], ['folders', 8, 2], ['plant-bush', 0, 5]],
  hr: [['pinboard', 1, 1, 2], ['plant-bush', 3, 7], ['folders', 7, 2], ['extinguisher', -1, 5]],
  it: [['pinboard', 3, 1, 2], ['extinguisher', 0, 2], ['copier', 7, 2, 2], ['folders', 4, 7]],
  sales: [['pinboard', 3, 1, 2], ['plant-bush', 0, 5], ['folders', 8, 2], ['extinguisher', -1, 7]],
  legal: [['pinboard', 1, 1, 2], ['folders', 6, 7], ['plant-bush', -1, 7], ['extinguisher', -1, 5]],
  ops: [['crate-stack', 4, 6], ['crate-stack', 6, 6], ['crate-stack', 8, 6], ['pinboard', 3, 1, 2], ['extinguisher', -1, 5]],
  marketing: [['pinboard', 8, 1, 2], ['plant-bush', 0, 4], ['folders', 8, 7], ['extinguisher', -1, 5]],
  procurement: [['pinboard', 3, 1, 2], ['crate-stack', 5, 7], ['crate-stack', 7, 7], ['folders', 8, 2], ['extinguisher', -1, 5]],
  service: [['pinboard', 3, 1, 2], ['copier', 5, 2, 2], ['plant-bush', 7, 7], ['folders', 8, 7]],
  print: [['copier', 3, 2, 2], ['pinboard', 5, 1, 2], ['crate-stack', 8, 6], ['folders', 2, 7], ['extinguisher', -1, 5]],
  cafeteria: [['pinboard', 1, 1, 2], ['plant-bush', 0, 5], ['plant-bush', -1, 4], ['extinguisher', -1, 7]],
  workspace: [['pinboard', 3, 1, 2], ['plant-bush', 3, 7], ['plant-bush', 7, 7], ['folders', 9, 7], ['extinguisher', -1, 5]],
};

function department(def, side) {
  const cap = CAPS[def.band];
  const xa = side === 'L' ? 1 + def.inset : 18;
  const xb = side === 'L' ? 11 : 28 - def.inset;
  const isDept = !def.type;
  room({ ...def, type: def.type ?? 'department', dept: isDept ? def.id : null, xa, xb, cap, floors: 6 });
  const doorX = side === 'L' ? 12 : 17;
  doors.push({ x: doorX, y: cap + 4 }, { x: doorX, y: cap + 5 });
  grid[cap + 4][doorX] = 'D';
  grid[cap + 5][doorX] = 'D';
  const decor = DECOR[def.id];
  const at = (dx) => (dx < 0 ? xb + dx + 1 : xa + dx);
  if (decor.rug) rug(decor.rug[0], xa + decor.rug[1], cap + 4, decor.rug[2], decor.rug[3]);
  decor.items.forEach(([sprite, dx, row, w = 1]) => {
    add(sprite, at(dx), cap + row, w, 1, WALL_SPRITES.has(sprite) ? { solid: false } : {});
  });
  (decor.desks ?? []).forEach(([dx, dy]) => {
    add('desk', xa + dx, cap + dy, 2, 1);
    chair(xa + dx, cap + dy + 1);
  });
  if (decor.layout) LAYOUTS[decor.layout].forEach(([dx, dy], i) => desk(def.id, i + 1, xa + dx, cap + dy));
  placeExtras([...(decor.extra ?? []), ...(MORE[def.id] ?? [])], at, { xa, xb, cap, floors: 6, doorX });
}
LEFT.forEach((d) => department(d, 'L'));
RIGHT.forEach((d) => department(d, 'R'));

// ---- general meeting room (left, bands 4-5, 10 general slots) ----
{
  const cap = CAPS[4];
  const floors = CAPS[6] - cap - 2;
  room({ id: 'general', name: 'General meeting room', type: 'general', tint: 'grey', floor: 'grid', xa: 1, xb: 11, cap, floors });
  doors.push({ x: 12, y: cap + 4 }, { x: 12, y: cap + 5 });
  grid[cap + 4][12] = 'D';
  grid[cap + 5][12] = 'D';
  wallDecor('window', 1, cap + 1);
  add('whiteboard', 4, cap + 1, 2, 1, { solid: false });
  wallDecor('clock', 8, cap + 1);
  wallDecor('poster', 6, cap + 1);
  add('plant', 1, cap + 2);
  add('shelf', 3, cap + 2, 2, 1);
  add('cabinet', 6, cap + 2);
  add('plant', 11, cap + 2);
  let n = 1;
  [1, 4, 7].forEach((dx) => desk('general', n++, 1 + dx, cap + 3));
  [1, 4, 7].forEach((dx) => desk('general', n++, 1 + dx, cap + 6));
  [0, 3, 6, 9].forEach((dx) => desk('general', n++, 1 + dx, cap + 9));
  rug('rug-4x3', 4, cap + 11, 4, 3);
  add('meeting-table', 4, cap + 12, 4, 2);
  add('plant', 11, cap + 13);
  add('bin', 1, cap + 13);
  wallDecor('ledger', 7, cap + 1);
  add('coat-rack', 10, cap + 2);
  add('cactus', 2, cap + 2);
  add('coffee-machine', 8, cap + 2);
  add('lamp', 1, cap + 11);
  add('lamp', 11, cap + 11);
}

// ---- tip rooms ----
// Reception / lobby with stairwell (top)
{
  room({ id: 'lobby', name: 'Reception', type: 'tip', tint: 'ice', floor: 'diamond', signX: 13, xa: 1, xb: 16, cap: 0, floors: 8 });
  wallDecor('window', 3, 1);
  wallDecor('frame', 7, 1);
  wallDecor('clock', 11, 1);
  add('vending-red', 1, 2);
  add('vending-blue', 2, 2);
  add('cooler', 3, 2);
  add('bin', 4, 2);
  add('reception', 6, 3, 3, 1);
  add('plant', 9, 3);
  add('stairs', 15, 2, 2, 3);
  rug('rug-4x3', 9, 5, 4, 3);
  add('sofa', 9, 5, 2, 1);
  add('coffee-table', 10, 6);
  add('armchair', 9, 7);
  add('armchair', 12, 7);
  add('lamp', 13, 5);
  add('plant', 1, 8);
  add('plant', 5, 7);
  add('trophy', 5, 2);
  add('coat-rack', 14, 2);
  add('armchair', 2, 6);
  add('lamp', 1, 5);
  add('cactus', 8, 8);
  wallDecor('poster', 1, 1);
  wallDecor('poster', 9, 1);
}
// Lounge / pantry (top right)
{
  room({ id: 'lounge', name: 'Lounge and pantry', type: 'tip', tint: 'peach', floor: 'planks', xa: 18, xb: 28, cap: 0, floors: 8 });
  grid[4][17] = 'D';
  grid[5][17] = 'D';
  doors.push({ x: 17, y: 4 }, { x: 17, y: 5 });
  wallDecor('window', 18, 1);
  wallDecor('frame', 22, 1);
  wallDecor('clock', 26, 1);
  add('counter', 19, 2, 2, 1);
  add('coffee-machine', 21, 2);
  add('fridge', 23, 2);
  add('cooler', 24, 2);
  add('plant', 28, 2);
  rug('rug-4x3', 20, 5, 4, 3);
  add('sofa', 20, 5, 2, 1);
  add('coffee-table', 21, 6);
  add('armchair', 24, 6);
  add('round-table', 26, 5);
  add('lamp', 28, 5);
  add('plant', 18, 8);
  add('bin', 28, 8);
  add('microwave', 25, 2);
  add('cactus', 19, 6);
  add('lamp', 18, 5);
  add('boxes', 27, 8);
  wallDecor('poster', 20, 1);
  wallDecor('poster', 24, 1);
}
// ---- corridor ----
// (done after the room blocks so the corridor wins over the shared walls)
fill(CORRIDOR.x0, 10, CORRIDOR.x1, 65, '.');
fill(CORRIDOR.x0, 66, CORRIDOR.x1, 66, '#');
[11, 19, 27, 35, 43, 51, 59].forEach((y, i) => {
  add(i % 2 ? 'lamp' : 'plant', i % 2 ? 16 : 13, y);
});
add('bin', 16, 12);
add('cooler', 13, 36);
add('bin', 13, 44);
add('plant', 16, 52);
add('bin', 16, 64);
// corridor tiles beside rooms must stay walkable: doors were carved earlier on the wall columns only

// Re-apply the doorways that the corridor fill does not touch (wall columns 12 and 17).
const tiles = grid.map((r) => r.join(''));

// ---- objects bound to existing use cases ----
const bind = { 'finance-1': 'finance-variance-summary', 'sales-1': 'sales-meeting-brief', 'hr-1': 'hr-onboarding-plan', 'general-1': 'general-inbox-triage' };
const objects = slots
  .filter((s) => bind[s.id])
  .map((s) => ({ id: `obj-${bind[s.id]}`, x: s.x, y: s.y, useCaseId: bind[s.id] }));

const out = {
  tileSize: 16,
  legend: { ' ': 'void', '#': 'wall', F: 'wallface', '.': 'floor', D: 'door' },
  spawn: { x: 14, y: 8 },
  rooms,
  slots,
  objects,
  props,
  doors,
  tiles,
};
writeFileSync(new URL('../src/data/office-map.json', import.meta.url), JSON.stringify(out, null, 1) + '\n');
console.log(`rooms ${rooms.length}, slots ${slots.length}, props ${props.length}, ${W}x${H}`);
