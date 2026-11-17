import { renderPages } from './pages.js';

const STORAGE_KEY = 'lang';
export const LANGS = ['en', 'nl'];

const strings = {
  en: {
    'disclaimer.button': 'Disclaimer',
    'dialog.close': 'Close',
    'tabs.label': 'Sections',
    'tab.game': 'Tutorial Game',
    'tab.library': 'Use Case Library',
    'tab.start': 'How to start',
    'tab.rai': 'Responsible AI',
    'game.placeholder': 'The tutorial game will appear here.',
    'library.placeholder': 'The use case library will appear here.',
  },
  nl: {
    'disclaimer.button': 'Disclaimer',
    'dialog.close': 'Sluiten',
    'tabs.label': 'Secties',
    'tab.game': 'Tutorialspel',
    'tab.library': 'Use-casebibliotheek',
    'tab.start': 'Hoe te beginnen',
    'tab.rai': 'Verantwoorde AI',
    'game.placeholder': 'Het tutorialspel verschijnt hier.',
    'library.placeholder': 'De use-casebibliotheek verschijnt hier.',
  },
};

function readStored() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return LANGS.includes(v) ? v : null;
  } catch {
    return null;
  }
}

let current = readStored() || 'en';

export function getLang() {
  return current;
}

export function setLang(lang) {
  if (!LANGS.includes(lang)) return;
  current = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Storage unavailable: the choice just won't persist.
  }
  applyI18n();
}

export function t(key) {
  return strings[current][key] ?? strings.en[key] ?? key;
}

// Swaps every [data-i18n] text and [data-i18n-aria] aria-label in the DOM.
export function applyI18n(root = document) {
  document.documentElement.lang = current;
  renderPages(current, root);
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
  root.querySelectorAll('.lang button').forEach((b) => {
    const on = b.dataset.lang === current;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
  });
}
