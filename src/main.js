import { config } from './config.js';
import { applyI18n, setLang } from './i18n.js';
import { initLibrary } from './library.js';
import { loadTheme } from './theme.js';
import officeMap from './data/office-map.json';
import { createPlayer, drawPlayer } from './player.js';
import { createMapView } from './tilemap.js';

document.title = config.companyName;
document.getElementById('badge').textContent = config.badge;
document.getElementById('company').textContent = config.companyName;

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

initLibrary(document.getElementById('library-list'));
applyI18n();

const gamePanel = document.getElementById('panel-game');
const player = createPlayer(officeMap, () => !gamePanel.hidden);

function playerColors() {
  const css = getComputedStyle(document.documentElement);
  const v = (name) => css.getPropertyValue(name).trim();
  return { outline: v('--ink'), skin: v('--wall'), body: v('--accent'), legs: v('--accent-dark') };
}

const mapView = createMapView(
  document.getElementById('game'),
  document.getElementById('viewport'),
  officeMap,
  (ctx, camX, camY) => drawPlayer(ctx, player, camX, camY, playerColors()),
);
loadTheme();

let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  if (!gamePanel.hidden) {
    player.update(dt);
    mapView.setTarget(player.x, player.y - 8);
    mapView.step(dt);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);