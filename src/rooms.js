// Room-level progress, extra decor and first-run guidance (docs/VISUAL-SPEC.md sections 7 and 8).
import { tileAt } from './tilemap.js';

export const DEPT_KEY = 'department';

// Rooms that carry use cases: department rooms and the general meeting room.
const caseRoom = (r) => r.type === 'department' || r.type === 'general';
// Room dept ids that differ from the use case department ids.
const DEPT_ALIAS = { ops: 'operations' };

export const roomDept = (room) => (room.type === 'general' ? 'general' : DEPT_ALIAS[room.dept] ?? room.dept);

export function roomAtPixel(map, x, y) {
  const t = map.tileSize;
  const col = Math.floor(x / t);
  const row = Math.floor(y / t);
  return map.rooms.find((r) => col >= r.x && col < r.x + r.w && row >= r.y && row < r.y + r.h) ?? null;
}

export function roomUseCases(room, useCases) {
  const dept = roomDept(room);
  return useCases.filter((u) => u.meta.department === dept);
}

// { done, total } for a room, from the completed id list.
export function roomProgress(room, useCases, completed) {
  const cases = roomUseCases(room, useCases);
  const done = new Set(completed);
  return { done: cases.filter((u) => done.has(u.id)).length, total: cases.length };
}

// 0..3 extra decor pieces: a rug after the first case, a lamp at half, frames once the room is complete.
export function decorLevel({ done, total }) {
  if (!total || !done) return 0;
  return 1 + (done >= Math.ceil(total / 2) ? 1 : 0) + (done >= total ? 1 : 0);
}

const cache = new WeakMap();

// Free spots for extra decor, found once per room: a rug, a lamp and a wall frame.
export function decorSpots(map, room) {
  let byRoom = cache.get(map);
  if (!byRoom) cache.set(map, (byRoom = new Map()));
  if (byRoom.has(room.id)) return byRoom.get(room.id);
  const taken = new Set();
  const take = (x, y, w, h) => {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) taken.add(`${x + i},${y + j}`);
  };
  map.props.forEach((p) => take(p.x, p.y, p.w ?? 1, p.h ?? 1));
  (map.slots ?? []).forEach((s) => take(s.x, s.y, 1, 2));
  (map.objects ?? []).forEach((o) => take(o.x, o.y, 4, 2));
  const free = (x, y, w, h, kind) => {
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        if (taken.has(`${x + i},${y + j}`) || tileAt(map, x + i, y + j) !== kind) return false;
      }
    }
    return true;
  };
  const find = (w, h, kind, rows, cols) => {
    for (const y of rows) for (const x of cols) if (free(x, y, w, h, kind)) return { x, y };
    return null;
  };
  const cols = Array.from({ length: room.w }, (_, i) => room.x + i);
  const floorRows = Array.from({ length: room.h }, (_, i) => room.y + room.h - 1 - i);
  const spots = [
    { sprite: 'rug-3x2', w: 3, h: 2, layer: 'floor', ...find(3, 2, 'floor', floorRows.slice(1), cols) },
    { sprite: 'lamp', w: 1, h: 1, ...find(1, 1, 'floor', floorRows, [...cols].reverse()) },
    { sprite: 'frame', w: 1, h: 1, ...find(1, 1, 'wallface', [room.y - 2, room.y - 1], cols) },
  ].filter((s) => s.x !== undefined);
  byRoom.set(room.id, spots);
  return spots;
}

// The door tile (map coordinates) that leads into a room from the corridor.
export function doorFor(map, room) {
  const side = map.doors.filter((d) => d.y >= room.y && d.y < room.y + room.h && (d.x === room.x - 1 || d.x === room.x + room.w));
  return side[0] ?? null;
}

export function pickableRooms(map) {
  return map.rooms.filter(caseRoom).filter((r) => r.type === 'department');
}
