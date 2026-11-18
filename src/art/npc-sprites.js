// Original pixel art for ambient NPCs: coworkers, robots and hybrid creatures.
// Sprites are generated from a small "look" description (see src/data/npcs.json) so one drawing routine
// covers many different people. Outfit, robot and creature colors resolve to theme tokens (themeable);
// skin and hair use fixed natural tones. Nothing here is copied or traced from any reference artwork.
import { currentPalette } from './atlas.js';
import { mix } from './palette.js';

export const SKIN_TONES = ['#f6d5b8', '#ecc19a', '#d9a574', '#bf8153', '#9a6238', '#744526', '#52301c'];

function draw(w, h, fn) {
  const g = Array.from({ length: h }, () => Array(w).fill('.'));
  const d = {
    px(x, y, c) {
      x = Math.round(x);
      y = Math.round(y);
      if (x >= 0 && y >= 0 && x < w && y < h) g[y][x] = c;
    },
    rect(x, y, rw, rh, c) {
      for (let j = y; j < y + rh; j++) for (let i = x; i < x + rw; i++) d.px(i, j, c);
    },
    box(x, y, bw, bh, fill, { hl, sh } = {}) {
      d.rect(x, y, bw, bh, 'i');
      d.rect(x + 1, y + 1, bw - 2, bh - 2, fill);
      if (hl) d.rect(x + 1, y + 1, bw - 2, 1, hl);
      if (sh) d.rect(x + 1, y + bh - 2, bw - 2, 1, sh);
    },
    ell(cx, cy, rx, ry, c) {
      for (let j = Math.floor(cy - ry); j <= Math.ceil(cy + ry); j++) {
        for (let i = Math.floor(cx - rx); i <= Math.ceil(cx + rx); i++) {
          if (((i + 0.5 - cx) / rx) ** 2 + ((j + 0.5 - cy) / ry) ** 2 <= 1) d.px(i, j, c);
        }
      }
    },
    blob(cx, cy, rx, ry, fill) {
      d.ell(cx, cy, rx + 1, ry + 1, 'i');
      d.ell(cx, cy, rx, ry, fill);
    },
  };
  fn(d);
  return g.map((r) => r.join(''));
}

const flip = (rows) => rows.map((r) => [...r].reverse().join(''));

// ---------------------------------------------------------------- humans (16x24)
const BUILDS = {
  down: { regular: [4, 8], broad: [3, 10], slim: [5, 6] },
  side: { regular: [5, 6], broad: [4, 8], slim: [5, 5] },
};

function human(look, dir, frame) {
  const side = dir === 'left' || dir === 'right';
  const wc = Boolean(look.wheelchair);
  const sh = wc ? 3 : look.height === 'short' ? 2 : 0;
  const bob = !wc && frame === 3 ? 1 : 0;
  const y = (n) => n + sh - bob;
  const hx = side ? 5 : 4;
  const hw = side ? 6 : 8;
  const [lx, lw] = BUILDS[side ? 'side' : 'down'][look.build ?? 'regular'];
  const style = look.hair ?? 'short';
  const g = draw(16, 24, (d) => {
    if (style === 'curly') {
      d.rect(hx - 2, y(1), hw + 4, 7, 'i');
      d.rect(hx - 1, y(2), hw + 2, 6, 'h');
    }
    d.rect(hx - 1, y(1), hw + 2, 10, 'i');
    d.rect(hx, y(2), hw, 8, 's');
    // torso
    const th = wc ? 7 : 8;
    d.rect(lx - 1, y(10), lw + 2, th, 'i');
    d.rect(lx, y(11), lw, th - 2, 'a');
    d.rect(lx, y(11), lw, 1, 'W');
    d.rect(lx, y(10) + th - 2, lw, 1, 'A');
    const armR = look.prosthArm ? 'g' : 'a';
    if (!side) {
      d.rect(lx - 1, y(12), 1, 4, 'a');
      d.rect(lx + lw, y(12), 1, 4, armR);
      d.px(lx - 1, y(16), 's');
      d.px(lx + lw, y(16), look.prosthArm ? 'G' : 's');
    } else {
      const swing = wc ? 0 : frame === 1 ? -1 : frame === 2 ? 1 : 0;
      d.rect(lx + 2 + swing, y(12), 2, 4, look.prosthArm ? 'g' : 'A');
      d.px(lx + 2 + swing, y(16), look.prosthArm ? 'G' : 's');
    }
    // hair and face
    const top = style === 'scarf' ? 'q' : 'h';
    if (dir === 'down') {
      if (style !== 'bald') {
        d.rect(hx, y(2), hw, 3, top);
        d.px(hx, y(4), top);
        d.px(hx + hw - 1, y(4), top);
      }
      if (style === 'scarf') {
        d.rect(hx, y(4), 1, 5, 'q');
        d.rect(hx + hw - 1, y(4), 1, 5, 'q');
        d.rect(hx, y(9), hw, 1, 'q');
      }
      if (style === 'long' || style === 'braids') {
        d.rect(hx - 1, y(5), 1, 9, 'h');
        d.rect(hx + hw, y(5), 1, 9, 'h');
        if (style === 'braids') {
          d.px(hx - 1, y(13), 'a');
          d.px(hx + hw, y(13), 'a');
        }
      }
      if (style === 'bun') d.rect(hx + 2, y(0), 4, 1, 'h');
      d.px(hx + 1, y(6), 'i');
      d.px(hx + hw - 2, y(6), 'i');
      if (look.glasses) {
        const lens = look.glasses === 'dark' ? 'i' : 'G';
        [hx, hx + hw - 3].forEach((gx) => {
          d.rect(gx, y(5), 3, 3, 'G');
          d.px(gx + 1, y(6), lens);
        });
        d.rect(hx + 3, y(6), 2, 1, 'G');
        if (look.glasses === 'dark') {
          d.px(hx, y(6), 'i');
          d.px(hx + 2, y(6), 'i');
          d.px(hx + hw - 3, y(6), 'i');
          d.px(hx + hw - 1, y(6), 'i');
        }
      }
      if (look.beard) d.rect(hx, y(7), hw, 2, 'h');
      d.rect(hx + 3, y(8), 2, 1, look.beard ? 'k' : 's');
    } else if (dir === 'up') {
      d.rect(hx, y(2), hw, 7, style === 'bald' ? 's' : top);
      if (style === 'scarf') d.rect(hx, y(9), hw, 1, 'q');
      if (style === 'long' || style === 'braids') d.rect(hx - 1, y(5), hw + 2, 9, 'h');
      if (style === 'bun') d.rect(hx + 2, y(0), 4, 1, 'h');
    } else {
      if (style !== 'bald') {
        d.rect(hx, y(2), hw, 3, top);
        d.rect(hx + hw - 3, y(4), 3, 4, top);
        d.px(hx, y(4), style === 'scarf' ? 'q' : 'h');
      }
      if (style === 'scarf') d.rect(hx + hw - 3, y(8), 3, 2, 'q');
      if (style === 'long' || style === 'braids') d.rect(hx + hw - 3, y(8), 4, 6, 'h');
      if (style === 'bun') d.rect(hx + hw - 3, y(0), 3, 2, 'h');
      d.px(hx + 1, y(6), 'i');
      if (look.glasses) {
        d.rect(hx, y(5), 3, 3, 'G');
        d.px(hx + 1, y(6), look.glasses === 'dark' ? 'i' : 'G');
        d.px(hx + 3, y(6), 'G');
      }
      if (look.beard) d.rect(hx, y(7), 3, 2, 'h');
    }
    wc ? chairLower(d, { side, dir, lx, lw, frame, y, look }) : legs(d, { side, lx, frame, y, look, sh });
    // walking aids
    if (look.cane && !wc) {
      const white = look.cane === 'white';
      const cx = side ? hx - 1 : dir === 'down' ? lx - 2 : lx + lw + 1;
      for (let row = y(16); row < 24; row++) {
        if (white) {
          d.px(cx, row, 'i');
          d.px(cx + 1, row, (row & 1) ? 'W' : 'r');
        } else d.px(cx, row, 'b');
      }
      if (!white) d.px(cx + 1, y(15), 'b');
      d.px(cx, y(15), white ? 'i' : 'b');
    }
  });
  return dir === 'right' ? flip(g) : g;
}

function legs(d, { side, lx, frame, y, look, sh }) {
  const legTop = y(18);
  const legH = 5 - sh;
  const left = frame === 1 ? 1 : 0;
  const right = frame === 2 ? 1 : 0;
  const prosth = look.prosthLeg;
  if (!side) {
    [[lx - 1, left, prosth === 'left'], [lx + 4, right, prosth === 'right']].forEach(([x, lift, metal]) => {
      d.rect(x, legTop, 5, legH - lift, 'i');
      d.rect(x + 1, legTop, 3, legH - 1 - lift, metal ? 'g' : 'n');
      if (metal) d.rect(x + 1, legTop + 1, 3, 1, 'G');
      d.rect(x, legTop + legH - 1 - lift, 5, 2, 'i');
      if (metal) d.rect(x + 1, legTop + legH - lift, 3, 1, 'G');
    });
    return;
  }
  const f = frame === 1 ? 2 : frame === 2 ? -2 : 0;
  [[lx - 1 + f, false], [lx + 1 - f, Boolean(prosth)]].forEach(([x, metal]) => {
    d.rect(x, legTop, 5, legH, 'i');
    d.rect(x + 1, legTop, 3, legH - 1, metal ? 'g' : 'n');
    if (metal) d.rect(x + 1, legTop + 1, 3, 1, 'G');
    d.rect(x, legTop + legH - 1, 6, 2, 'i');
  });
}

// Wheelchair: seat, footrests and wheels whose spokes turn while rolling.
function chairLower(d, { side, dir, lx, lw, frame, y }) {
  const spin = frame === 0 ? 0 : frame;
  if (!side) {
    [1, 12].forEach((wx) => {
      d.rect(wx, y(12) + 1, 3, 10, 'i');
      d.rect(wx + 1, y(12) + 2, 1, 8, 'g');
      d.px(wx + 1, y(12) + 3 + ((spin * 2) % 6), 'G');
      d.px(wx + 1, y(12) + 6 + ((spin * 2) % 3), 'G');
    });
    if (dir === 'down') {
      d.rect(lx - 1, 19, lw + 2, 3, 'i');
      d.rect(lx, 19, lw, 2, 'n');
      [lx, lx + lw - 3].forEach((x) => {
        d.rect(x, 21, 3, 3, 'i');
        d.rect(x + 1, 21, 1, 1, 'n');
        d.rect(x, 22, 3, 1, 'e');
      });
    } else {
      d.rect(lx - 1, 19, lw + 2, 4, 'i');
      d.rect(lx, 20, lw, 2, 'G');
    }
    return;
  }
  d.rect(2, 19, 8, 2, 'i');
  d.rect(2, 19, 7, 1, 'n');
  d.rect(1, 20, 3, 4, 'i');
  d.rect(2, 20, 1, 2, 'n');
  d.rect(1, 22, 3, 1, 'e');
  d.rect(12, 14, 3, 3, 'G');
  d.ell(9, 19, 5, 5, 'i');
  d.ell(9, 19, 4, 4, 'g');
  d.ell(9, 19, 1, 1, 'G');
  const [ax, ay] = [[3, 0], [2, 2], [0, 3], [-2, 2]][spin % 4];
  d.px(9 + ax, 19 + ay, 'G');
  d.px(9 - ax, 19 - ay, 'G');
  d.px(9 + ay, 19 - ax, 'G');
  d.px(9 - ay, 19 + ax, 'G');
  d.px(3, 23, 'i');
}

// ---------------------------------------------------------------- robots
// Each robot is drawn for view = 'front' | 'back' | 'side' (left); right is mirrored.
const ROBOTS = {
  // hovering round floor cleaner
  tidy(d, view, frame) {
    const o = frame & 1;
    d.ell(8, 9, 6, 1, 'S');
    d.blob(8, 5 - o, 6, 3, 'a');
    d.rect(3, 7 - o, 10, 1, 'A');
    d.ell(8, 3 - o, 3, 2, 'W');
    d.px(8, 2 - o, frame === 3 ? 'W' : 'm');
    if (view !== 'back') d.px(view === 'side' ? 3 : 6, 5 - o, 'c');
    if (view === 'front') d.px(10, 5 - o, 'c');
    return [16, 10];
  },
  // delivery cart on treads
  hauler(d, view, frame) {
    d.rect(1, 14, 14, 4, 'i');
    d.rect(2, 15, 12, 2, 'G');
    for (let x = 2 + (frame % 3); x < 14; x += 3) d.px(x, 15 + (x & 1), 'g');
    d.box(2, 6, 12, 9, 'a', { hl: 'W', sh: 'A' });
    d.box(4, 0, 8, 7, 'b', { hl: 'B' });
    d.rect(7, 1, 2, 5, 'B');
    if (view === 'back') d.rect(5, 9, 6, 3, 'A');
    else {
      d.rect(5, 9, 6, 3, 'c');
      d.px(view === 'side' ? 5 : 6, 10, 'i');
      if (view === 'front') d.px(9, 10, 'i');
    }
    d.px(view === 'side' ? 2 : 3, 12, 'm');
    return [16, 18];
  },
  // humanoid assistant
  android(d, view, frame) {
    const b = frame === 3 ? 1 : 0;
    d.px(7, 0, 'm');
    d.box(side(view) ? 5 : 4, 1 - b + 1, side(view) ? 6 : 8, 7, 'g', { hl: 'W' });
    if (view !== 'back') {
      d.rect(side(view) ? 5 : 5, 3 - b + 1, side(view) ? 4 : 6, 3, 'c');
      d.px(side(view) ? 6 : 6, 4 - b + 1, 'i');
      if (view === 'front') d.px(9, 4 - b + 1, 'i');
    } else d.rect(6, 4, 4, 2, 'G');
    d.rect(7, 9 - b, 2, 1, 'G');
    d.box(side(view) ? 5 : 3, 10 - b, side(view) ? 6 : 10, 8, 'a', { hl: 'W', sh: 'A' });
    d.px(8, 13 - b, 'm');
    if (view === 'side') d.rect(7, 11 - b, 2, 6, 'G');
    else {
      d.rect(1, 11 - b, 2, 6, 'G');
      d.rect(13, 11 - b, 2, 6, 'G');
    }
    const l = frame === 1 ? 1 : 0;
    const r = frame === 2 ? 1 : 0;
    if (view === 'side') {
      const s = frame === 1 ? 2 : frame === 2 ? -2 : 0;
      d.box(4 + s, 18, 4, 6, 'G');
      d.box(8 - s, 18, 4, 6, 'g');
    } else {
      d.box(4, 18, 4, 6 - l, 'G');
      d.box(8, 18, 4, 6 - r, 'g');
    }
    return [16, 24];
  },
  // barista arm on a wheeled base
  barista(d, view, frame) {
    d.box(3, 12, 10, 8, 'a', { hl: 'W', sh: 'A' });
    d.rect(4, 19, 3, 1, 'G');
    d.rect(9, 19, 3, 1, 'G');
    if (view !== 'back') {
      d.rect(5, 14, 6, 3, 'c');
      d.px(6, 15, 'i');
      d.px(9, 15, 'i');
    }
    d.rect(7, 8, 2, 4, 'g');
    d.rect(3, 6, 6, 2, 'g');
    const up = frame & 1;
    d.rect(2, 3 - up, 2, 4 + up, 'g');
    d.box(0, 0 - up + 1, 4, 3, 'W');
    d.px(1, 1 - up + 1, 'b');
    if (frame === 3) d.px(1, -1 + 1, 'W');
    return [16, 20];
  },
  // quadcopter that hovers a little above the floor
  drone(d, view, frame) {
    const o = frame & 1;
    d.ell(8, 15, 5, 1, 'S');
    d.rect(1 + o, 3, 5 - o, 1, 'G');
    d.rect(10, 3, 5 - o, 1, 'G');
    d.rect(3, 4, 1, 3, 'g');
    d.rect(12, 4, 1, 3, 'g');
    d.blob(8, 8 + o, 4, 2, 'a');
    d.rect(5, 9 + o, 6, 1, 'A');
    if (view !== 'back') {
      d.ell(8, 8 + o, 1, 1, 'c');
      d.px(8, 8 + o, 'i');
    }
    return [16, 17];
  },
  // four-legged maintenance crawler with a lantern
  spider(d, view, frame) {
    const a = frame & 1;
    for (let k = 0; k < 4; k++) {
      const lift = (k + a) & 1;
      const x = 2 + k * 3;
      d.px(x, 8, 'i');
      d.px(x - (k < 2 ? 1 : -1), 9 + lift, 'i');
      d.px(x - (k < 2 ? 1 : -1), 10 + lift, 'i');
      d.px(x - (k < 2 ? 2 : -2), 11, 'i');
    }
    d.blob(8, 7, 4, 3, 'a');
    d.rect(5, 9, 6, 1, 'A');
    d.px(8, 3, 'i');
    d.px(8, 2, 'i');
    d.px(8, 1, frame === 2 ? 'W' : 'm');
    if (view !== 'back') {
      d.px(side(view) ? 5 : 6, 6, 'c');
      if (view === 'front') d.px(10, 6, 'c');
    }
    return [16, 13];
  },
  // wheeled monitor-face greeter
  screen(d, view, frame) {
    d.box(4, 20, 8, 4, 'G');
    d.px(5, 23, 'g');
    d.px(10, 23, 'g');
    d.rect(7, 14, 2, 6, 'g');
    const w = side(view) ? 8 : 14;
    const x = side(view) ? 4 : 1;
    d.box(x, 1, w, 13, 'a', { hl: 'W' });
    if (view === 'back') d.rect(x + 2, 4, w - 4, 7, 'A');
    else {
      d.rect(x + 1, 3, w - 2, 9, 'c');
      const ex = side(view) ? x + 2 : 5;
      d.px(ex, 6, frame === 3 ? 'c' : 'i');
      if (view === 'front') d.px(10, 6, frame === 3 ? 'c' : 'i');
      const mx = side(view) ? x + 1 : 6;
      d.rect(mx, 9, side(view) ? 3 : 4, 1, 'i');
      d.px(mx - 1, 8, 'i');
      if (view === 'front') d.px(10, 8, 'i');
    }
    d.px(8, 0, 'm');
    return [16, 24];
  },
};
const side = (view) => view === 'side';

// ---------------------------------------------------------------- hybrid creatures (face left, mirrored for right)
const CREATURES = {
  // cat with moth wings
  mothcat(d, f) {
    const flap = f & 1;
    d.ell(10, flap ? 8 : 4, 4, 4, 'i');
    d.ell(10, flap ? 8 : 4, 3, 3, 'W');
    d.px(10, flap ? 8 : 4, 'x');
    d.blob(8, 11, 4, 3, 'a');
    d.rect(1, 6, 3, 3, 'i');
    d.rect(2, 7, 1, 1, 'A');
    d.rect(6, 6, 3, 3, 'i');
    d.blob(4, 10, 3, 3, 'a');
    d.rect(2, 6, 1, 3, 'a');
    d.rect(6, 6, 1, 3, 'a');
    d.px(3, 10, 'i');
    d.px(2, 11, 'x');
    d.px(2, 8, 'i');
    d.px(0, 7, 'i');
    d.rect(12, 12, 3, 1, 'a');
    d.px(14, 11 - (f & 1), 'a');
    d.px(5, 14, 'i');
    d.px(9 + (f & 1), 14, 'i');
    return [16, 16];
  },
  // owl head on a snail body
  snowl(d, f) {
    const s = f & 1;
    d.ell(8, 16, 7, 2, 'i');
    d.ell(8, 16, 6, 1, 'A');
    d.blob(11, 10, 4, 4, 'x');
    d.rect(10, 9, 2, 2, 'X');
    d.px(12, 9, 'X');
    d.px(9, 11, 'X');
    d.blob(5, 9 + s, 4, 4, 'a');
    d.rect(1, 3 + s, 2, 3, 'i');
    d.rect(7, 3 + s, 2, 3, 'i');
    d.rect(1, 4 + s, 1, 1, 'a');
    d.rect(8, 4 + s, 1, 1, 'a');
    d.rect(2, 7 + s, 3, 3, 'W');
    d.rect(6, 7 + s, 3, 3, 'W');
    d.px(3, 8 + s, 'i');
    d.px(7, 8 + s, 'i');
    d.px(5, 11 + s, 'm');
    d.rect(1 - s, 14, 2, 1, 'a');
    return [16, 18];
  },
  // jellyfish crowned with a leaf
  jellyleaf(d, f) {
    const o = f & 1;
    d.blob(8, 8 + o, 5, 4, 'a');
    d.rect(5, 6 + o, 3, 1, 'W');
    d.ell(8, 2 + o, 3, 1, 'v');
    d.px(8, 3 + o, 'V');
    d.px(6, 9 + o, 'i');
    d.px(10, 9 + o, 'i');
    for (const x of [4, 6, 8, 10, 12]) {
      for (let row = 13 + o; row < 20; row++) d.px(x + (((row + f * 2) >> 1) & 1), row, (row & 1) ? 'x' : 'a');
    }
    return [16, 20];
  },
  // crab carrying a mushroom
  mushcrab(d, f) {
    const s = f & 1;
    d.blob(8, 4, 6, 3, 'r');
    d.px(5, 3, 'W');
    d.px(8, 2, 'W');
    d.px(11, 4, 'W');
    d.px(7, 5, 'W');
    d.box(4, 8, 8, 4, 'a', { hl: 'W' });
    d.px(6, 9, 'i');
    d.px(9, 9, 'i');
    d.rect(0, 8 - s, 3, 3, 'i');
    d.rect(1, 9 - s, 1, 1, 'x');
    d.rect(13, 8 - (1 - s), 3, 3, 'i');
    d.rect(14, 9 - (1 - s), 1, 1, 'x');
    for (let k = 0; k < 3; k++) {
      d.px(3 - k + (s && k ? 1 : 0), 12 + (k & 1), 'i');
      d.px(12 + k - (s && k ? 1 : 0), 12 + (k & 1), 'i');
    }
    return [16, 14];
  },
  // fluffy cloud with ram horns
  cloudram(d, f) {
    const s = f & 1;
    d.blob(10, 8, 4, 3, 'W');
    d.blob(7, 9, 4, 3, 'W');
    d.blob(12, 10, 3, 2, 'W');
    d.rect(4, 8, 6, 5, 'W');
    d.blob(3, 9, 2, 3, 'A');
    d.px(2, 9, 'W');
    d.rect(1, 5, 3, 1, 'x');
    d.px(0, 6, 'x');
    d.px(0, 7, 'x');
    d.px(1, 8, 'x');
    d.px(4, 5, 'x');
    d.px(5, 6, 'x');
    for (const x of [5, 8, 11]) d.rect(x, 13, 1, 2 - ((x + s) & 1), 'i');
    d.px(14, 7 - s, 'm');
    return [16, 16];
  },
  // frog with an anglerfish lantern
  lanternfrog(d, f) {
    const glow = f & 1;
    d.blob(8, 10, 6, 4, 'a');
    d.blob(4, 5, 2, 2, 'a');
    d.blob(9, 5, 2, 2, 'a');
    d.px(4, 5, 'W');
    d.px(9, 5, 'W');
    d.px(3, 5, 'i');
    d.px(8, 5, 'i');
    d.rect(1, 11, 6, 1, 'i');
    d.rect(9, 12, 4, 3, 'A');
    d.px(3, 3, 'i');
    d.px(2, 2, 'i');
    d.px(1, 1, 'i');
    d.rect(0, 0, 3, 3, glow ? 'W' : 'm');
    d.px(0, 0, 'i');
    d.px(2, 2, glow ? 'm' : 'W');
    d.rect(11, 15, 3, 1, 'i');
    return [16, 16];
  },
};

export const NPC_KINDS = { robot: Object.keys(ROBOTS), creature: Object.keys(CREATURES) };

function colorsFor(def, pal) {
  const base = (token) => pal[token] ?? pal.accent;
  const c = {
    i: pal.ink, o: pal.outline, f: pal.floor, g: '#a9b3c2', G: '#5d677b', b: pal.wood, B: pal.woodDark,
    c: pal.screen, m: pal.marker, r: pal.red, d: pal.done, v: pal.leaf, V: pal.leafDark, W: pal.onAccent,
    S: mix(pal.floor, pal.ink, 0.22), e: pal.ink,
  };
  if (def.kind === 'human') {
    const look = def.look;
    const skin = look.skin ?? SKIN_TONES[2];
    const hair = look.hairColor ?? '#3a2c28';
    const top = base(look.top ?? 'accent');
    Object.assign(c, {
      s: skin, k: mix(skin, '#000000', 0.18), h: hair,
      a: top, A: mix(top, pal.ink, 0.3), W: mix(top, '#ffffff', 0.4),
      n: base(look.bottom ?? 'accentDark'), q: base(look.scarf ?? 'marker'),
    });
    if (look.cane === 'white') c.W = '#ffffff';
  } else {
    const a = base(def.color ?? 'accent');
    const x = base(def.accent ?? 'marker');
    Object.assign(c, { a, A: mix(a, pal.ink, 0.3), x, X: mix(x, pal.ink, 0.3) });
    if (def.kind === 'creature') c.W = mix(a, '#ffffff', 0.6);
    else c.W = mix(a, '#ffffff', 0.45);
  }
  return c;
}

const caches = new WeakMap();

// Returns { canvas, w, h } for an NPC definition, facing and animation frame (0 idle, 1-3 moving).
export function npcSprite(def, facing = 'down', frame = 0) {
  const pal = currentPalette();
  let cache = caches.get(pal);
  if (!cache) caches.set(pal, (cache = new Map()));
  const key = `${def.id}|${facing}|${frame}`;
  let hit = cache.get(key);
  if (hit) return hit;
  let rows;
  const horizontal = facing === 'left' || facing === 'right';
  if (def.kind === 'human') rows = human(def.look, facing, frame);
  else {
    const fn = def.kind === 'robot' ? ROBOTS[def.model] : CREATURES[def.model];
    const view = horizontal ? 'side' : facing === 'up' ? 'back' : 'front';
    let size;
    rows = draw(16, 24, (d) => (size = def.kind === 'robot' ? fn(d, view, frame) : fn(d, frame)));
    rows = rows.slice(0, size[1]);
    if (facing === 'right') rows = flip(rows);
  }
  const colors = colorsFor(def, pal);
  const canvas = document.createElement('canvas');
  canvas.width = rows[0].length;
  canvas.height = rows.length;
  const ctx = canvas.getContext('2d');
  rows.forEach((row, yy) => {
    for (let xx = 0; xx < row.length; xx++) {
      const ch = row[xx];
      if (ch !== '.') {
        ctx.fillStyle = colors[ch] ?? '#ff00ff';
        ctx.fillRect(xx, yy, 1, 1);
      }
    }
  });
  hit = { canvas, w: canvas.width, h: canvas.height };
  cache.set(key, hit);
  return hit;
}
