import { config } from './config.js';
import { applyI18n, setLang } from './i18n.js';
import { initLibrary } from './library.js';
import { loadTheme } from './theme.js';

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

initLibrary(document.getElementById('library-list'));
applyI18n();

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function frame() {
  ctx.fillStyle = '#333c57';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f4f4f4';
  ctx.font = '16px monospace';
  ctx.fillText('Pixel Office', 100, 124);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
