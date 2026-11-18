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
    'game.placeholder': 'Walk to an object and press E to open its case.',
    'pick.title': 'Where do you work?',
    'pick.body': 'Pick your department and an arrow will show you the way to its room. You can skip this.',
    'pick.skip': 'Skip',
    'panel.idle.title': 'Today',
    'panel.progress': 'Progress',
    'panel.completed': 'completed',
    'panel.rewards': 'Unlocked rewards',
    'panel.rewards.none': 'No rewards yet.',
    'panel.next': 'Next recommended case',
    'panel.next.none': 'All cases completed!',
    'panel.close': 'Close',
    'panel.finish': 'I finished! Unlock reward',
    'panel.finished': 'Finished',
    'panel.unlocked': 'rewards unlocked',
    'library.empty': 'No use cases available.',
    'card.prompt': 'The prompt',
    'card.copy': 'Copy prompt',
    'card.copied': 'Copied!',
    'card.try': 'Try in Cowork',
    'card.openInGame': 'Open in game',
    'card.noObject': 'This case has no object in the office yet.',
    'card.run': 'See it run',
    'card.fit': 'Fit it into your work',
    'card.how': 'How it works',
    'card.why': 'Why Cowork',
    'chip.credits': 'credits',
    'chip.workload.low': 'Low workload',
    'chip.workload.medium': 'Medium workload',
    'chip.workload.high': 'High workload',
    'chip.department.finance': 'Finance',
    'chip.department.hr': 'HR',
    'chip.department.sales': 'Sales',
    'chip.department.marketing': 'Marketing',
    'chip.department.it': 'IT',
    'chip.department.operations': 'Operations',
    'chip.department.legal': 'Legal',
    'chip.department.general': 'General',
    'chip.executionMode.chat': 'Chat',
    'chip.executionMode.local': 'Local',
    'chip.executionMode.cloud': 'Cloud',
    'chip.collaborationScope.individual': 'Individual',
    'chip.collaborationScope.team': 'Team',
    'chip.collaborationScope.organization': 'Organization',
  },
  nl: {
    'disclaimer.button': 'Disclaimer',
    'dialog.close': 'Sluiten',
    'tabs.label': 'Secties',
    'tab.game': 'Tutorialspel',
    'tab.library': 'Use-casebibliotheek',
    'tab.start': 'Hoe te beginnen',
    'tab.rai': 'Verantwoorde AI',
    'game.placeholder': 'Loop naar een object en druk op E om de case te openen.',
    'pick.title': 'Waar werk jij?',
    'pick.body': 'Kies je afdeling en een pijl wijst je de weg naar die ruimte. Je kunt dit overslaan.',
    'pick.skip': 'Overslaan',
    'panel.idle.title': 'Vandaag',
    'panel.progress': 'Voortgang',
    'panel.completed': 'voltooid',
    'panel.rewards': 'Ontgrendelde beloningen',
    'panel.rewards.none': 'Nog geen beloningen.',
    'panel.next': 'Volgende aanbevolen case',
    'panel.next.none': 'Alle cases voltooid!',
    'panel.close': 'Sluiten',
    'panel.finish': 'Klaar! Beloning ontgrendelen',
    'panel.finished': 'Afgerond',
    'panel.unlocked': 'beloningen ontgrendeld',
    'library.empty': 'Geen use cases beschikbaar.',
    'card.prompt': 'De prompt',
    'card.copy': 'Prompt kopiëren',
    'card.copied': 'Gekopieerd!',
    'card.try': 'Probeer in Cowork',
    'card.openInGame': 'Open in game',
    'card.noObject': 'Deze case heeft nog geen object op kantoor.',
    'card.run': 'Zie het draaien',
    'card.fit': 'Pas het toe op je werk',
    'card.how': 'Hoe het werkt',
    'card.why': 'Waarom Cowork',
    'chip.credits': 'credits',
    'chip.workload.low': 'Lage werklast',
    'chip.workload.medium': 'Gemiddelde werklast',
    'chip.workload.high': 'Hoge werklast',
    'chip.department.finance': 'Financiën',
    'chip.department.hr': 'HR',
    'chip.department.sales': 'Sales',
    'chip.department.marketing': 'Marketing',
    'chip.department.it': 'IT',
    'chip.department.operations': 'Operations',
    'chip.department.legal': 'Juridisch',
    'chip.department.general': 'Algemeen',
    'chip.executionMode.chat': 'Chat',
    'chip.executionMode.local': 'Lokaal',
    'chip.executionMode.cloud': 'Cloud',
    'chip.collaborationScope.individual': 'Individueel',
    'chip.collaborationScope.team': 'Team',
    'chip.collaborationScope.organization': 'Organisatie',
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
const listeners = [];

export function onLangChange(fn) {
  listeners.push(fn);
}

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
  listeners.forEach((fn) => fn(lang));
}

export function pick(text) {
  return text[current] ?? text.en;
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
