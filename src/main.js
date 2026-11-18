import { config } from './config.js';
import { applyI18n, setLang } from './i18n.js';
import { initLibrary } from './library.js';
import { loadTheme } from './theme.js';
import officeMap from './data/office-map.json';
import { blocked, createPlayer, drawPlayer } from './player.js';
import { OPEN_USE_CASE } from './rules.js';
import { createMapView } from './tilemap.js';
import useCases from './data/use-cases.json';
import { drawInteractables, loadObjects, nearestInteractable } from './interactables.js';
import { initRules } from './rules.js';
import { drawProp, propBase, sprite } from './art/atlas.js';
import { initCardPanel } from './panel.js';
import { initButtons } from './buttons.js';
import { playBlip } from './sound.js';
import { isCompleted, completedIds, onProgressChange } from './progress.js';
import { decorLevel, decorSpots, doorFor, roomAtPixel, roomProgress } from './rooms.js';
import { initGuide } from './guide.js';

document.title = config.companyName;
document.getElementById('badge').textContent = config.badge;
document.getElementById('company').textContent = config.companyName;

// A free tile next to the object (below first), as feet position; null if none is free.
function standingSpot(map, o) {
  const t = map.tileSize;
  const sides = [[0, 1, 'up'], [-1, 0, 'right'], [1, 0, 'left'], [0, -1, 'down'], [-1, 1, 'up'], [1, 1, 'up'], [-1, -1, 'down'], [1, -1, 'down']];
  for (const [dx, dy, facing] of sides) {
    const x = (o.x + dx + 0.5) * t;
    const y = (o.y + dy + 1) * t - 1;
    if (!blocked(map, x, y)) return { x, y, facing };
  }
  return null;
}

const tabs = [...document.querySelectorAll('[data-tab]')];
function showTab(name) {
  tabs.forEach((tab) => {
    const on = tab.dataset.tab === name;
    tab.setAttribute('aria-selected', String(on));
    tab.tabIndex = on ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !on;
  });
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => showTab(tab.dataset.tab));
  tab.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    const next = tabs[(i + step + tabs.length) % tabs.length];
    showTab(next.dataset.tab);
    next.focus();
  });
});
showTab('game');

document.querySelectorAll('.lang button').forEach((b) =>
  b.addEventListener('click', () => setLang(b.dataset.lang)),
);

const dialog = document.getElementById('disclaimer-dialog');
document.getElementById('disclaimer-btn').addEventListener('click', () => dialog.showModal());
document.getElementById('disclaimer-close').addEventListener('click', () => dialog.close());

const gamePanel = document.getElementById('panel-game');
const player = createPlayer(officeMap, () => !gamePanel.hidden);
const objects = loadObjects(officeMap, useCases);

// "Open in game" from a Library card: switch tab, stand next to the object and open its card.
// Returns false (and changes nothing) when the use case has no map object.
function openInGame(useCaseId) {
  const object = objects.find((o) => o.useCaseId === useCaseId);
  if (!object) return false;
  const spot = standingSpot(officeMap, object);
  if (spot) {
    player.x = spot.x;
    player.y = spot.y;
    player.facing = spot.facing;
  }
  showTab('game');
  mapView.setTarget(player.x, player.y - 8);
  mapView.snap();
  active = nearestInteractable(officeMap, objects, player);
  window.dispatchEvent(new CustomEvent(OPEN_USE_CASE, { detail: { useCaseId, objectId: object.id } }));
  return true;
}

initLibrary(document.getElementById('library-list'), {
  hasObject: (id) => objects.some((o) => o.useCaseId === id),
  onOpenInGame: openInGame,
});
applyI18n();
let active = null;
initRules(window, () => active, () => !gamePanel.hidden);
initCardPanel(document.getElementById('card'), useCases);

// Each bound object has a reward item two tiles to its right: grey silhouette until the case is finished.
const rewardProps = objects
  .map((o) => {
    const rewardId = useCases.find((u) => u.id === o.useCaseId)?.rewardId;
    return rewardId && sprite(`reward-${rewardId}`) ? { useCaseId: o.useCaseId, sprite: `reward-${rewardId}`, x: o.x + 2, y: o.y, w: 1, h: 1 } : null;
  })
  .filter(Boolean);
const SPARKLE_MS = 1200;
const sparkles = new Map();
onProgressChange((e) => {
  if (e.type === 'complete') {
    sparkles.set(e.useCaseId, performance.now());
    playBlip();
  }
  else sparkles.clear();
});

// Short pixel sparkle: four 2px stars twinkling outward around a freshly unlocked reward.
function drawSparkle(ctx, map, p, camX, camY, age) {
  const t = map.tileSize;
  const cx = Math.round(p.x * t + t / 2 - camX);
  const cy = Math.round((p.y + 1) * t - t / 2 - camY);
  const r = 6 + Math.round(age * 10);
  const on = Math.floor(age * 12) % 2 === 0;
  ctx.fillStyle = playerColors().marker;
  [[-r, -r], [r - 2, -r], [-r, r - 2], [r - 2, r - 2]].forEach(([dx, dy]) => {
    ctx.fillRect(cx + dx, cy + dy, 2, 2);
    if (on) ctx.fillRect(cx + dx - 1, cy + dy + 0, 4, 2);
  });
}

function playerColors() {
  const css = getComputedStyle(document.documentElement);
  const v = (name) => css.getPropertyValue(name).trim();
  return { outline: v('--ink'), marker: v('--marker'), done: v('--done'), accent: v('--accent'), onAccent: v('--on-accent') };
}

const guide = initGuide(officeMap, document.body);
const caseRooms = officeMap.rooms.filter((r) => r.type === 'department' || r.type === 'general');
const signs = new Map(
  caseRooms.map((r) => [r.id, officeMap.props.find((p) => p.sprite.startsWith('sign-') && p.x >= r.x && p.x < r.x + r.w && p.y === r.y - 1)]),
);

// Extra decor props for rooms whose progress has grown.
function decorProps() {
  const done = completedIds();
  return caseRooms.flatMap((r) => decorSpots(officeMap, r).slice(0, decorLevel(roomProgress(r, useCases, done))));
}

// Progress plate ("FINANCE 2/5") above each room sign.
function drawRoomSigns(ctx, camX, camY, colors) {
  const t = officeMap.tileSize;
  const done = completedIds();
  ctx.font = '12px "Jersey 10", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  caseRooms.forEach((r) => {
    const sign = signs.get(r.id);
    const prog = roomProgress(r, useCases, done);
    if (!sign || !prog.total) return;
    const label = `${r.name.toUpperCase()} ${prog.done}/${prog.total}`;
    const w = Math.ceil(ctx.measureText(label).width) + 6;
    const cx = sign.x * t + t - camX;
    const y = sign.y * t - 11 - camY;
    ctx.fillStyle = colors.outline;
    ctx.fillRect(Math.round(cx - w / 2) - 1, y - 1, w + 2, 12);
    ctx.fillStyle = prog.done === prog.total ? colors.done : colors.accent;
    ctx.fillRect(Math.round(cx - w / 2), y, w, 10);
    ctx.fillStyle = colors.onAccent;
    ctx.fillText(label, Math.round(cx), y + 8);
  });
}

// Bobbing arrow above the door of the room picked on first run.
function drawGuideArrow(ctx, now, camX, camY) {
  const id = guide.target();
  const room = officeMap.rooms.find((r) => r.id === id);
  const door = room && doorFor(officeMap, room);
  if (!door) return;
  const t = officeMap.tileSize;
  const bob = Math.round(Math.sin(now / 200) * 3);
  ctx.drawImage(sprite('guide-arrow'), Math.round(door.x * t + t / 2 - 7 - camX), Math.round(door.y * t - 20 - camY + bob));
}

const mapView = createMapView(
  document.getElementById('game'),
  document.getElementById('viewport'),
  officeMap,
  (ctx, camX, camY) => {
    const colors = playerColors();
    const t = officeMap.tileSize;
    const props = [...(officeMap.props ?? []), ...decorProps()].filter((p) => {
      const x = p.x * t - camX;
      const y = (p.y + (p.h ?? 1)) * t - camY;
      return x > -80 && x < 1400 && y > -8 && y < 1400;
    });
    // rugs lie on the floor; everything else is depth-sorted with the player by its base line
    props.filter((p) => p.layer === 'floor').forEach((p) => drawProp(ctx, officeMap, p, camX, camY));
    const sorted = props.filter((p) => p.layer !== 'floor').sort((a, b) => propBase(officeMap, a) - propBase(officeMap, b));
    let i = 0;
    for (; i < sorted.length && propBase(officeMap, sorted[i]) <= player.y; i++) drawProp(ctx, officeMap, sorted[i], camX, camY);
    drawPlayer(ctx, player, camX, camY);
    for (; i < sorted.length; i++) drawProp(ctx, officeMap, sorted[i], camX, camY);
    const now = performance.now();
    rewardProps.forEach((p) => {
      const x = p.x * t - camX;
      const y = p.y * t - camY;
      if (x < -40 || x > 1400 || y < -40 || y > 1400) return;
      const unlocked = isCompleted(p.useCaseId);
      drawProp(ctx, officeMap, p, camX, camY, { locked: !unlocked });
      const at = sparkles.get(p.useCaseId);
      if (unlocked && at !== undefined && now - at < SPARKLE_MS) drawSparkle(ctx, officeMap, p, camX, camY, (now - at) / SPARKLE_MS);
    });
    const room = roomAtPixel(officeMap, player.x, player.y - 2);
    if (room && room.id === guide.target()) guide.arrive();
    drawRoomSigns(ctx, camX, camY, colors);
    drawInteractables(ctx, officeMap, objects, active, camX, camY, colors, room, isCompleted);
    drawGuideArrow(ctx, now, camX, camY);
  },
);
loadTheme();
initButtons({ container: document.getElementById('bottom-bar'), map: officeMap, useCases, player, mapView });

let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  if (!gamePanel.hidden) {
    player.update(dt);
    active = nearestInteractable(officeMap, objects, player);
    mapView.setTarget(player.x, player.y - 8);
    mapView.step(dt);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
