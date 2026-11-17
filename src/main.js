import { config } from './config.js';
import { applyI18n, setLang } from './i18n.js';
import { loadTheme } from './theme.js';
import officeMap from './data/office-map.json';
import { createMapView } from './tilemap.js';

loadTheme();

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

applyI18n();

const mapView = createMapView(document.getElementById('game'), document.getElementById('viewport'), officeMap);
loadTheme().then(() => mapView.redraw());
