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
  rooms.push({ id, name, type, dept: def.dept ?? null, tint, x: xa, y: cap + 2, w: xb - xa + 1, h: floors });
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
const LEFT = [
  { id: 'finance', name: 'Finance', band: 1, inset: 0, tint: 'mint' },
  { id: 'hr', name: 'HR', band: 2, inset: 1, tint: 'lavender' },
  { id: 'it', name: 'IT', band: 5, inset: 2, tint: 'ice' },
];
const RIGHT = [
  { id: 'sales', name: 'Sales', band: 1, inset: 0, tint: 'blush' },
  { id: 'legal', name: 'Legal', band: 2, inset: 2, tint: 'sky' },
  { id: 'ops', name: 'Operations', band: 3, inset: 1, tint: 'sage' },
  { id: 'marketing', name: 'Marketing', band: 4, inset: 0, tint: 'peach' },
  { id: 'procurement', name: 'Procurement', band: 5, inset: 1, tint: 'butter' },
  { id: 'service', name: 'Service', band: 6, inset: 2, tint: 'sand' },
];

function department(def, side) {
  const cap = CAPS[def.band];
  const xa = side === 'L' ? 1 + def.inset : 18;
  const xb = side === 'L' ? 11 : 28 - def.inset;
  room({ ...def, type: 'department', dept: def.id, xa, xb, cap, floors: 6 });
  const doorX = side === 'L' ? 12 : 17;
  doors.push({ x: doorX, y: cap + 4 }, { x: doorX, y: cap + 5 });
  grid[cap + 4][doorX] = 'D';
  grid[cap + 5][doorX] = 'D';
  // back wall
  wallDecor('window', xa, cap + 1);
  wallDecor('frame', xb - 2, cap + 1);
  wallDecor('clock', xa + 4, cap + 1);
  // storage row
  add('plant', xa, cap + 2, 1, 1);
  add('shelf', xa + 2, cap + 2, 2, 1);
  add('cabinet', xa + 5, cap + 2, 1, 1);
  add('cabinet', xa + 6, cap + 2, 1, 1);
  add('plant', xb, cap + 2, 1, 1);
  rug('rug-4x2', xa + 3, cap + 4, 4, 2);
  // five workstations: 3 in the front row, 2 in the back row
  [1, 4, 7].forEach((dx, i) => desk(def.id, i + 1, xa + dx, cap + 3));
  [1, 5].forEach((dx, i) => desk(def.id, i + 4, xa + dx, cap + 6));
  add('bin', xb, cap + 7, 1, 1);
  add('plant', xb - 1, cap + 7, 1, 1);
}
LEFT.forEach((d) => department(d, 'L'));
RIGHT.forEach((d) => department(d, 'R'));

// ---- general meeting room (left, bands 3-4, 10 general slots) ----
{
  const cap = CAPS[3];
  const floors = CAPS[5] - cap - 2;
  room({ id: 'general', name: 'General meeting room', type: 'general', tint: 'grey', xa: 1, xb: 11, cap, floors });
  doors.push({ x: 12, y: cap + 4 }, { x: 12, y: cap + 5 });
  grid[cap + 4][12] = 'D';
  grid[cap + 5][12] = 'D';
  wallDecor('window', 1, cap + 1);
  add('whiteboard', 4, cap + 1, 2, 1, { solid: false });
  wallDecor('clock', 8, cap + 1);
  wallDecor('poster', 10, cap + 1);
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
}

// ---- tip rooms ----
// Reception / lobby with stairwell (top)
{
  room({ id: 'lobby', name: 'Reception', type: 'tip', tint: 'ice', xa: 1, xb: 16, cap: 0, floors: 8 });
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
}
// Lounge / pantry (top right)
{
  room({ id: 'lounge', name: 'Lounge and pantry', type: 'tip', tint: 'peach', xa: 18, xb: 28, cap: 0, floors: 8 });
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
}
// Print room (left, band 6)
{
  const cap = CAPS[6];
  room({ id: 'print', name: 'Print room', type: 'tip', tint: 'grey', xa: 2, xb: 11, cap, floors: 6 });
  doors.push({ x: 12, y: cap + 4 }, { x: 12, y: cap + 5 });
  grid[cap + 4][12] = 'D';
  grid[cap + 5][12] = 'D';
  wallDecor('window', 2, cap + 1);
  wallDecor('poster', 6, cap + 1);
  wallDecor('clock', 9, cap + 1);
  add('printer', 3, cap + 2, 2, 1);
  add('printer', 6, cap + 2, 2, 1);
  add('box-shelf', 9, cap + 2, 2, 1);
  add('boxes', 2, cap + 6);
  add('boxes', 3, cap + 6);
  add('cabinet', 5, cap + 6);
  add('bin', 11, cap + 7);
  add('plant', 2, cap + 2);
  rug('rug-3x2', 6, cap + 4, 3, 2);
}
// Open workspace (bottom, wide)
{
  const cap = CAPS[7];
  room({ id: 'workspace', name: 'Open workspace', type: 'tip', tint: 'sky', xa: 1, xb: 28, cap, floors: 7 });
  [2, 28 - 1].forEach((x) => wallDecor('window', x, cap + 1));
  wallDecor('frame', 6, cap + 1);
  wallDecor('clock', 10, cap + 1);
  add('whiteboard', 18, cap + 1, 2, 1, { solid: false });
  wallDecor('poster', 23, cap + 1);
  add('plant', 1, cap + 2);
  add('plant', 28, cap + 2);
  add('shelf', 3, cap + 2, 2, 1);
  add('shelf', 24, cap + 2, 2, 1);
  [2, 5, 8, 19, 22, 25].forEach((x) => {
    add('desk', x, cap + 4, 2, 1);
    chair(x, cap + 5);
  });
  add('plant', 11, cap + 7);
  add('plant', 18, cap + 7);
  add('bin', 28, cap + 7);
}

// ---- corridor ----
// (done after the room blocks so the corridor wins over the shared walls)
fill(CORRIDOR.x0, 10, CORRIDOR.x1, 58, '.');
[11, 19, 27, 35, 43, 51].forEach((y, i) => {
  add(i % 2 ? 'lamp' : 'plant', i % 2 ? 16 : 13, y);
});
add('bin', 16, 12);
add('cooler', 13, 38);
add('bin', 13, 44);
add('plant', 16, 52);
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
