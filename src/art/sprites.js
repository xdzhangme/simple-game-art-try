// Original pixel art, authored as indexed character grids (see palette.js for the index letters).
// '.' is transparent, 't' is the room floor tint and 'u' its grid line. Nothing here is copied or
// traced from any reference artwork.

function draw(w, h, fn) {
  const g = Array.from({ length: h }, () => Array(w).fill('.'));
  const d = {
    px(x, y, c) {
      if (x >= 0 && y >= 0 && x < w && y < h) g[y][x] = c;
    },
    rect(x, y, rw, rh, c) {
      for (let j = y; j < y + rh; j++) for (let i = x; i < x + rw; i++) d.px(i, j, c);
    },
    // outlined box with optional 1 px top highlight and bottom shade
    box(x, y, bw, bh, fill, { hl, sh } = {}) {
      d.rect(x, y, bw, bh, 'o');
      d.rect(x + 1, y + 1, bw - 2, bh - 2, fill);
      if (hl) d.rect(x + 1, y + 1, bw - 2, 1, hl);
      if (sh) d.rect(x + 1, y + bh - 2, bw - 2, 1, sh);
    },
  };
  fn(d);
  return g.map((r) => r.join(''));
}

const BOOKS = 'amrvAWcb';

function tileFloor() {
  return draw(16, 16, (d) => {
    d.rect(0, 0, 16, 16, 't');
    d.rect(0, 0, 16, 1, 'u');
    d.rect(0, 0, 1, 16, 'u');
  });
}

function tileFace() {
  return draw(16, 16, (d) => {
    d.rect(0, 0, 16, 16, 'F');
    d.rect(0, 0, 16, 1, 'o');
    d.rect(0, 1, 16, 1, 'P');
    d.rect(0, 10, 16, 1, 'W');
    d.rect(0, 11, 16, 4, 'a');
    d.rect(0, 15, 16, 1, 'A');
  });
}

function tileDoor() {
  return draw(16, 16, (d) => {
    d.rect(0, 0, 16, 16, 'f');
    d.rect(0, 0, 16, 1, 'g');
    d.rect(0, 0, 1, 16, 'g');
    d.box(2, 2, 12, 12, 'b', { hl: 'W', sh: 'B' });
    d.rect(5, 5, 6, 6, 'B');
    d.rect(6, 6, 4, 4, 'b');
  });
}

function plant() {
  return draw(16, 24, (d) => {
    d.rect(7, 8, 2, 10, 'V');
    d.rect(3, 9, 5, 4, 'v');
    d.rect(8, 5, 5, 5, 'v');
    d.rect(5, 2, 6, 5, 'v');
    d.rect(2, 12, 5, 3, 'v');
    d.rect(9, 12, 5, 3, 'v');
    d.rect(6, 4, 1, 3, 'V');
    d.rect(10, 7, 1, 3, 'V');
    d.rect(4, 11, 1, 2, 'V');
    d.rect(11, 13, 1, 2, 'V');
    d.box(4, 16, 8, 8, 'p', { hl: 'W', sh: 'P' });
    d.rect(4, 16, 8, 1, 'o');
  });
}

function bin() {
  return draw(16, 16, (d) => {
    d.box(4, 5, 8, 11, 'A', { hl: 'a' });
    d.rect(3, 4, 10, 2, 'o');
    d.rect(4, 4, 8, 1, 'a');
    d.rect(7, 8, 1, 5, 'a');
    d.rect(10, 8, 1, 5, 'a');
  });
}

function cooler() {
  return draw(16, 24, (d) => {
    d.box(4, 1, 8, 9, 'c', { hl: 'W' });
    d.rect(5, 3, 2, 5, 'W');
    d.box(3, 10, 10, 14, 'p', { hl: 'W', sh: 'P' });
    d.rect(6, 13, 2, 2, 'a');
    d.rect(9, 13, 2, 2, 'r');
    d.rect(5, 19, 6, 2, 'P');
  });
}

function vending(body, accent) {
  return draw(16, 24, (d) => {
    d.box(1, 0, 14, 24, body, { hl: accent });
    d.rect(3, 3, 10, 12, 'i');
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) d.rect(4 + c * 2 + (c > 1 ? 0 : 0), 4 + r * 4, 2, 3, 'mWcr'[(r + c) % 4]);
    }
    d.rect(4, 17, 8, 2, 'o');
    d.rect(5, 20, 6, 2, accent);
  });
}

function desk() {
  return draw(32, 20, (d) => {
    d.box(10, 0, 12, 9, 'p', { hl: 'W' });
    d.rect(11, 1, 10, 6, 'c');
    d.rect(12, 2, 3, 1, 'W');
    d.rect(15, 9, 2, 2, 'o');
    d.box(1, 10, 30, 6, 'b', { hl: 'W' });
    d.rect(2, 16, 28, 2, 'B');
    d.rect(2, 18, 2, 2, 'o');
    d.rect(28, 18, 2, 2, 'o');
    d.rect(12, 12, 8, 2, 'W');
    d.rect(3, 12, 3, 3, 'm');
    d.rect(24, 12, 4, 3, 'W');
    d.rect(25, 13, 2, 1, 'a');
  });
}

function chair() {
  return draw(16, 16, (d) => {
    d.box(4, 0, 8, 8, 'A', { hl: 'a' });
    d.box(3, 8, 10, 4, 'a', { hl: 'W' });
    d.rect(7, 12, 2, 2, 'o');
    d.rect(4, 14, 8, 1, 'o');
  });
}

function sofa() {
  return draw(32, 16, (d) => {
    d.box(2, 0, 28, 9, 'A', { hl: 'a' });
    d.box(0, 4, 5, 11, 'A', { hl: 'a' });
    d.box(27, 4, 5, 11, 'A', { hl: 'a' });
    d.box(4, 8, 24, 7, 'a', { hl: 'W' });
    d.rect(15, 9, 1, 5, 'A');
  });
}

function armchair() {
  return draw(16, 16, (d) => {
    d.box(2, 0, 12, 9, 'A', { hl: 'a' });
    d.box(0, 4, 4, 11, 'A', { hl: 'a' });
    d.box(12, 4, 4, 11, 'A', { hl: 'a' });
    d.box(3, 8, 10, 7, 'a', { hl: 'W' });
  });
}

function coffeeTable() {
  return draw(16, 16, (d) => {
    d.box(1, 5, 14, 7, 'b', { hl: 'W' });
    d.rect(2, 12, 2, 3, 'o');
    d.rect(12, 12, 2, 3, 'o');
    d.rect(6, 1, 4, 4, 'v');
    d.rect(7, 4, 2, 2, 'p');
  });
}

function roundTable() {
  return draw(16, 16, (d) => {
    d.rect(3, 3, 10, 9, 'o');
    d.rect(4, 2, 8, 11, 'o');
    d.rect(4, 3, 8, 9, 'b');
    d.rect(5, 4, 4, 1, 'W');
    d.rect(7, 12, 2, 3, 'o');
  });
}

function rug(w, h) {
  const pw = w * 16;
  const ph = h * 16;
  return draw(pw, ph, (d) => {
    d.rect(0, 0, pw, ph, 'o');
    d.rect(1, 1, pw - 2, ph - 2, 'm');
    d.rect(3, 3, pw - 6, ph - 6, 'a');
    d.rect(5, 5, pw - 10, ph - 10, 'p');
    for (let x = 8; x < pw - 8; x += 8) {
      for (let y = 8; y < ph - 8; y += 8) {
        d.rect(x, y, 2, 2, 'a');
        d.rect(x + 3, y + 3, 2, 2, 'P');
      }
    }
  });
}

function lamp() {
  return draw(16, 24, (d) => {
    d.rect(5, 22, 6, 2, 'o');
    d.rect(7, 9, 2, 13, 'B');
    d.box(3, 1, 10, 9, 'm', { hl: 'W' });
    d.rect(4, 8, 8, 1, 'b');
  });
}

function wallFrame() {
  return draw(16, 16, (d) => {
    d.box(2, 2, 12, 10, 'B');
    d.rect(4, 4, 8, 6, 'c');
    d.rect(4, 8, 2, 2, 'a');
    d.rect(6, 6, 2, 4, 'A');
    d.rect(8, 7, 2, 3, 'a');
    d.rect(10, 5, 2, 5, 'A');
  });
}

function wallWindow() {
  return draw(16, 16, (d) => {
    d.box(1, 1, 14, 13, 'W');
    d.rect(3, 3, 10, 9, 'c');
    d.rect(7, 3, 2, 9, 'W');
    d.rect(3, 7, 10, 1, 'W');
    d.rect(3, 3, 3, 1, 'W');
  });
}

function wallClock() {
  return draw(16, 16, (d) => {
    d.rect(4, 3, 8, 10, 'o');
    d.rect(3, 4, 10, 8, 'o');
    d.rect(4, 4, 8, 8, 'W');
    d.rect(7, 5, 1, 3, 'i');
    d.rect(8, 8, 3, 1, 'i');
    d.px(7, 8, 'r');
  });
}

function whiteboard() {
  return draw(32, 16, (d) => {
    d.box(1, 1, 30, 12, 'W', { sh: 'P' });
    d.rect(4, 4, 5, 3, 'm');
    d.rect(11, 4, 5, 3, 'c');
    d.rect(18, 4, 5, 3, 'r');
    d.rect(4, 9, 8, 1, 'P');
    d.rect(14, 9, 10, 1, 'P');
    d.rect(10, 13, 12, 1, 'A');
  });
}

function poster() {
  return draw(16, 16, (d) => {
    d.box(3, 1, 10, 13, 'W');
    d.rect(5, 3, 6, 4, 'a');
    d.rect(5, 8, 6, 1, 'A');
    d.rect(5, 10, 4, 1, 'm');
  });
}

function shelf() {
  return draw(32, 32, (d) => {
    d.box(0, 2, 32, 30, 'b', { hl: 'W' });
    d.rect(1, 3, 30, 1, 'B');
    for (let row = 0; row < 3; row++) {
      const y = 5 + row * 9;
      d.rect(2, y, 28, 8, 'B');
      d.rect(2, y + 7, 28, 1, 'o');
      for (let i = 0; i < 12; i++) {
        const h = 5 + ((i * 3 + row) % 3);
        d.rect(3 + i * 2, y + 7 - h, 2, h, BOOKS[(i + row * 3) % BOOKS.length]);
      }
    }
  });
}

function cabinet() {
  return draw(16, 24, (d) => {
    d.box(2, 2, 12, 22, 'l', { hl: 'p', sh: 'L' });
    d.rect(3, 12, 10, 1, 'L');
    d.rect(7, 7, 2, 1, 'o');
    d.rect(7, 17, 2, 1, 'o');
  });
}

function printer() {
  return draw(32, 24, (d) => {
    d.box(8, 0, 16, 8, 'W');
    d.rect(10, 2, 12, 1, 'P');
    d.box(2, 7, 28, 14, 'p', { hl: 'W', sh: 'P' });
    d.rect(5, 10, 10, 3, 'o');
    d.rect(22, 10, 4, 2, 'd');
    d.rect(8, 17, 16, 2, 'P');
    d.rect(3, 21, 2, 3, 'o');
    d.rect(27, 21, 2, 3, 'o');
  });
}

function boxes() {
  return draw(16, 16, (d) => {
    d.box(1, 6, 10, 10, 'b', { hl: 'W' });
    d.rect(5, 6, 2, 10, 'B');
    d.box(8, 1, 7, 8, 'b', { hl: 'W' });
    d.rect(11, 1, 1, 8, 'B');
  });
}

function boxShelf() {
  return draw(32, 32, (d) => {
    d.rect(0, 1, 32, 31, 'A');
    d.rect(1, 2, 30, 29, 'a');
    for (let row = 0; row < 3; row++) {
      const y = 3 + row * 10;
      d.rect(1, y, 30, 9, 'o');
      d.rect(1, y + 1, 30, 7, 'A');
      for (let i = 0; i < 3; i++) d.box(3 + i * 9, y + 1, 8, 8, 'b', { hl: 'W' });
    }
  });
}

function counter() {
  return draw(32, 24, (d) => {
    d.box(0, 12, 32, 12, 'p', { hl: 'W', sh: 'P' });
    d.rect(0, 10, 32, 3, 'W');
    d.rect(0, 12, 32, 1, 'o');
    d.rect(15, 14, 1, 8, 'P');
    d.box(4, 2, 8, 8, 'o');
    d.rect(5, 3, 6, 4, 'i');
    d.rect(6, 7, 4, 2, 'r');
    d.box(17, 3, 10, 7, 'l', { hl: 'p' });
    d.rect(19, 5, 5, 3, 'i');
    d.rect(25, 5, 1, 3, 'd');
  });
}

function fridge() {
  return draw(16, 24, (d) => {
    d.box(2, 0, 12, 24, 'l', { hl: 'p', sh: 'L' });
    d.rect(3, 9, 10, 1, 'L');
    d.rect(11, 3, 1, 4, 'o');
    d.rect(11, 12, 1, 6, 'o');
  });
}

function coffeeMachine() {
  return draw(16, 16, (d) => {
    d.box(3, 1, 10, 13, 'A', { hl: 'a' });
    d.rect(5, 4, 6, 3, 'i');
    d.rect(6, 8, 4, 6, 'W');
    d.rect(7, 10, 2, 3, 'B');
    d.rect(4, 14, 8, 1, 'o');
  });
}

function reception() {
  return draw(48, 24, (d) => {
    d.box(18, 0, 12, 9, 'p', { hl: 'W' });
    d.rect(19, 1, 10, 6, 'c');
    d.rect(23, 9, 2, 3, 'o');
    d.box(1, 9, 46, 8, 'b', { hl: 'W' });
    d.box(1, 16, 46, 8, 'B', { hl: 'b' });
    d.rect(4, 11, 4, 3, 'm');
    d.rect(36, 11, 6, 3, 'W');
  });
}

function stairs() {
  return draw(32, 48, (d) => {
    d.box(0, 0, 32, 48, 'l');
    for (let i = 0; i < 7; i++) {
      d.rect(3, 3 + i * 6, 24, 5, 'p');
      d.rect(3, 3 + i * 6, 24, 1, 'W');
      d.rect(3, 7 + i * 6, 24, 1, 'L');
    }
    d.rect(27, 1, 4, 46, 'A');
    d.rect(28, 1, 1, 46, 'a');
  });
}

function meetingTable() {
  return draw(64, 32, (d) => {
    for (let i = 0; i < 3; i++) {
      d.box(8 + i * 17, 0, 10, 8, 'A', { hl: 'a' });
      d.box(8 + i * 17, 24, 10, 8, 'A', { hl: 'a' });
    }
    d.box(2, 5, 60, 22, 'b', { hl: 'W', sh: 'B' });
    d.rect(4, 8, 56, 1, 'B');
    d.rect(29, 12, 6, 5, 'p');
    d.rect(30, 9, 4, 4, 'v');
  });
}

// ---- reward icons (16x16) ----
function rewardPlant() {
  return draw(16, 16, (d) => {
    d.rect(7, 4, 2, 7, 'V');
    d.rect(3, 5, 4, 3, 'v');
    d.rect(9, 3, 4, 4, 'v');
    d.rect(5, 1, 5, 4, 'v');
    d.rect(2, 8, 4, 2, 'v');
    d.rect(10, 8, 4, 2, 'v');
    d.box(4, 10, 8, 6, 'p', { hl: 'W', sh: 'P' });
  });
}
function rewardPoster() {
  return poster();
}
function rewardDeskLamp() {
  return draw(16, 16, (d) => {
    d.rect(4, 14, 8, 2, 'o');
    d.rect(7, 8, 2, 6, 'B');
    d.box(3, 1, 10, 8, 'm', { hl: 'W' });
  });
}
function rewardArmchair() {
  return armchair();
}
function rewardRug() {
  return rug(1, 1);
}
function rewardClock() {
  return wallClock();
}
function rewardBookshelf() {
  return draw(16, 16, (d) => {
    d.box(1, 1, 14, 14, 'b', { hl: 'W' });
    for (let row = 0; row < 2; row++) {
      d.rect(2, 3 + row * 6, 12, 5, 'B');
      for (let i = 0; i < 5; i++) d.rect(3 + i * 2, 4 + row * 6 + (i % 2), 2, 4 - (i % 2), BOOKS[(i + row) % BOOKS.length]);
    }
  });
}
function rewardFridge() {
  return draw(16, 16, (d) => {
    d.box(4, 0, 8, 16, 'l', { hl: 'p', sh: 'L' });
    d.rect(5, 6, 6, 1, 'L');
    d.rect(9, 2, 1, 3, 'o');
  });
}
function rewardCooler() {
  return draw(16, 16, (d) => {
    d.box(5, 0, 6, 6, 'c', { hl: 'W' });
    d.box(4, 6, 8, 10, 'p', { hl: 'W', sh: 'P' });
    d.rect(6, 9, 2, 2, 'a');
  });
}
function rewardCactus() {
  return draw(16, 16, (d) => {
    d.rect(6, 2, 4, 9, 'v');
    d.rect(3, 5, 3, 2, 'v');
    d.rect(3, 3, 2, 3, 'v');
    d.rect(10, 6, 3, 2, 'v');
    d.rect(11, 4, 2, 3, 'v');
    d.rect(8, 3, 1, 7, 'V');
    d.box(4, 10, 8, 6, 'r', { hl: 'W' });
  });
}

// ---- UI markers ----
function bubble() {
  return draw(12, 14, (d) => {
    d.box(0, 0, 12, 11, 'm', { hl: 'W' });
    d.rect(5, 11, 2, 2, 'o');
    d.px(5, 11, 'm');
    d.px(6, 11, 'm');
    d.rect(5, 2, 2, 4, 'i');
    d.rect(5, 7, 2, 2, 'i');
  });
}

function sparkle() {
  return draw(8, 8, (d) => {
    d.rect(3, 0, 2, 8, 'W');
    d.rect(0, 3, 8, 2, 'W');
    d.rect(3, 3, 2, 2, 'm');
  });
}

// ---- character: 16x24, 4 directions x 4 frames (0 idle, 1 and 2 stride, 3 passing) ----
function character(dir, frame) {
  const side = dir === 'left' || dir === 'right';
  const g = draw(16, 24, (d) => {
    const bob = frame === 3 ? 1 : 0;
    const y = (n) => n - bob;
    const lx = side ? 5 : 4;
    const lw = side ? 6 : 8;
    // head
    d.rect(lx - 1, y(1), lw + 2, 10, 'i');
    d.rect(lx, y(2), lw, 8, 's');
    if (dir === 'down') {
      d.rect(lx, y(2), lw, 3, 'h');
      d.rect(lx, y(4), 1, 1, 'h');
      d.rect(lx + lw - 1, y(4), 1, 1, 'h');
      d.px(lx + 1, y(6), 'i');
      d.px(lx + lw - 2, y(6), 'i');
    } else if (dir === 'up') {
      d.rect(lx, y(2), lw, 7, 'h');
    } else {
      d.rect(lx, y(2), lw, 3, 'h');
      d.rect(lx + lw - 3, y(4), 3, 4, 'h');
      d.px(lx + 1, y(6), 'i');
    }
    // torso
    d.rect(lx - 1, y(10), lw + 2, 8, 'i');
    d.rect(lx, y(11), lw, 6, 'a');
    d.rect(lx, y(11), lw, 1, 'W');
    d.rect(lx, y(16), lw, 1, 'A');
    if (!side) {
      d.rect(lx - 1, y(12), 1, 4, 'a');
      d.rect(lx + lw, y(12), 1, 4, 'a');
    } else {
      const swing = frame === 1 ? -1 : frame === 2 ? 1 : 0;
      d.rect(lx + 2 + swing, y(12), 2, 4, 'A');
    }
    // legs
    const legTop = y(18);
    const left = frame === 1 ? 1 : 0;
    const right = frame === 2 ? 1 : 0;
    if (!side) {
      d.rect(lx - 1, legTop, 5, 5 - left, 'i');
      d.rect(lx, legTop, 3, 4 - left, 'A');
      d.rect(lx - 1, legTop + 4 - left, 5, 2, 'i');
      d.rect(lx + 4, legTop, 5, 5 - right, 'i');
      d.rect(lx + 5, legTop, 3, 4 - right, 'A');
      d.rect(lx + 4, legTop + 4 - right, 5, 2, 'i');
    } else {
      const f = frame === 1 ? 2 : frame === 2 ? -2 : 0;
      d.rect(lx - 1 + f, legTop, 5, 5, 'i');
      d.rect(lx + f, legTop, 3, 4, 'A');
      d.rect(lx + 1 - f, legTop, 5, 5, 'i');
      d.rect(lx + 2 - f, legTop, 3, 4, 'A');
      d.rect(lx - 1 + f, legTop + 4, 6, 2, 'i');
      d.rect(lx + 1 - f, legTop + 4, 6, 2, 'i');
    }
  });
  return dir === 'right' ? g.map((r) => [...r].reverse().join('')) : g;
}

export const DIRECTIONS = ['down', 'up', 'left', 'right'];
export const FRAMES = 4;

export const SPRITES = {
  floor: tileFloor(),
  face: tileFace(),
  door: tileDoor(),
  plant: plant(),
  bin: bin(),
  cooler: cooler(),
  'vending-red': vending('r', 'm'),
  'vending-blue': vending('A', 'c'),
  desk: desk(),
  chair: chair(),
  sofa: sofa(),
  armchair: armchair(),
  'coffee-table': coffeeTable(),
  'round-table': roundTable(),
  'rug-3x2': rug(3, 2),
  'rug-4x2': rug(4, 2),
  'rug-4x3': rug(4, 3),
  lamp: lamp(),
  frame: wallFrame(),
  window: wallWindow(),
  clock: wallClock(),
  whiteboard: whiteboard(),
  poster: poster(),
  shelf: shelf(),
  cabinet: cabinet(),
  printer: printer(),
  boxes: boxes(),
  'box-shelf': boxShelf(),
  counter: counter(),
  fridge: fridge(),
  'coffee-machine': coffeeMachine(),
  reception: reception(),
  stairs: stairs(),
  'meeting-table': meetingTable(),
  bubble: bubble(),
  sparkle: sparkle(),
  'reward-plant-fern': rewardPlant(),
  'reward-poster-welcome': rewardPoster(),
  'reward-desk-lamp': rewardDeskLamp(),
  'reward-coffee-machine': coffeeMachine(),
  'reward-armchair': rewardArmchair(),
  'reward-rug': rewardRug(),
  'reward-clock': rewardClock(),
  'reward-bookshelf': rewardBookshelf(),
  'reward-fridge': rewardFridge(),
  'reward-water-cooler': rewardCooler(),
  'reward-frame': wallFrame(),
  'reward-cactus': rewardCactus(),
};

for (const dir of DIRECTIONS) {
  for (let f = 0; f < FRAMES; f++) SPRITES[`char-${dir}-${f}`] = character(dir, f);
}
