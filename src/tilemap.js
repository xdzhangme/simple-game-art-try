// Tile map renderer and camera. Tiles come from the indexed sprite atlas (src/art).
import { currentPalette, drawTile } from './art/atlas.js';

export const SCALE = 2;

export function mapSize(map) {
  return {
    width: map.tiles[0].length * map.tileSize,
    height: map.tiles.length * map.tileSize,
  };
}

// Centers the view on (x, y) in map pixels, clamped so the view stays inside the map.
// A map smaller than the view is centered instead.
export function clampCamera(x, y, view, size) {
  const axis = (pos, v, m) => (m <= v ? (m - v) / 2 : Math.min(Math.max(pos - v / 2, 0), m - v));
  return { x: axis(x, view.width, size.width), y: axis(y, view.height, size.height) };
}

export function tileAt(map, col, row) {
  const ch = map.tiles[row]?.[col];
  return ch === undefined ? 'void' : map.legend[ch] ?? 'void';
}

// Draws the visible tiles; the canvas bitmap is the unscaled view (CSS applies SCALE).
export function drawMap(ctx, map, camera, view) {
  const t = map.tileSize;
  const c = currentPalette();
  const camX = Math.round(camera.x);
  const camY = Math.round(camera.y);
  ctx.fillStyle = c.ink;
  ctx.fillRect(0, 0, view.width, view.height);
  const kindAt = (col, row) => tileAt(map, col, row);
  const col0 = Math.max(0, Math.floor(camX / t));
  const row0 = Math.max(0, Math.floor(camY / t));
  const col1 = Math.min(map.tiles[0].length - 1, Math.floor((camX + view.width) / t));
  const row1 = Math.min(map.tiles.length - 1, Math.floor((camY + view.height) / t));
  for (let row = row0; row <= row1; row++) {
    for (let col = col0; col <= col1; col++) {
      drawTile(ctx, map, kindAt, col, row, col * t - camX, row * t - camY);
    }
  }
}

// Sizes the canvas bitmap to the container at an integer scale and redraws on resize.
// Returns { setTarget(x, y), step(dt), redraw() }; the camera eases toward the target (map pixels)
// and drawOverlay(ctx, camX, camY) draws entities on top of the tiles.
export function createMapView(canvas, container, map, drawOverlay) {
  const ctx = canvas.getContext('2d');
  const size = mapSize(map);
  const target = { x: map.spawn.x * map.tileSize, y: map.spawn.y * map.tileSize };
  const view = { width: 0, height: 0 };
  let cam = null;

  function redraw() {
    if (!view.width || !view.height) return;
    cam ??= clampCamera(target.x, target.y, view, size);
    drawMap(ctx, map, cam, view);
    drawOverlay?.(ctx, Math.round(cam.x), Math.round(cam.y));
  }

  function resize() {
    view.width = Math.floor(container.clientWidth / SCALE);
    view.height = Math.floor(container.clientHeight / SCALE);
    canvas.width = view.width;
    canvas.height = view.height;
    cam = null;
    canvas.style.width = `${view.width * SCALE}px`;
    canvas.style.height = `${view.height * SCALE}px`;
    redraw();
  }

  new ResizeObserver(resize).observe(container);
  resize();

  return {
    setTarget(x, y) {
      target.x = x;
      target.y = y;
    },
    step(dt) {
      if (!view.width || !view.height) return;
      const goal = clampCamera(target.x, target.y, view, size);
      cam ??= goal;
      const k = 1 - Math.exp(-dt * 10);
      cam = { x: cam.x + (goal.x - cam.x) * k, y: cam.y + (goal.y - cam.y) * k };
      redraw();
    },
    redraw,
    // Jumps the camera straight to the target (no easing); applied on the next redraw/resize.
    snap() {
      cam = null;
      redraw();
    },
  };
}
