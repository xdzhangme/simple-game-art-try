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
    'bar.tasks': "Today's tasks",
    'bar.map': 'Map',
    'bar.tutorial': 'Tutorial',
    'bar.menu': 'Menu',
    'tasks.department': 'Your department',
    'tasks.department.none': 'Choose...',
    'tasks.required': 'Required',
    'tasks.optional': 'Optional exploration',
    'tasks.required.hint': 'Your department plus the general cases.',
    'tasks.optional.hint': 'Other departments: optional, with bonus rewards.',
    'tasks.none': 'Nothing here yet.',
    'map.jump': 'Go',
    'map.rooms': 'Rooms',
    'map.overview': 'Overview of the whole office map',
    'map.hint': 'Pick a room to jump there. The yellow square is you.',
    'tutorial.back': 'Back',
    'tutorial.next': 'Next',
    'tutorial.done': 'Start playing',
    'tutorial.0.title': 'Walk around',
    'tutorial.0.text': 'Use the arrow keys or WASD to walk through the office.',
    'tutorial.1.title': 'Open a case',
    'tutorial.1.text': 'Walk up to an object with a yellow bubble and press E to open its use case.',
    'tutorial.2.title': 'Try it and finish',
    'tutorial.2.text': 'Copy the prompt, try it in Cowork, then press "I finished" to unlock a reward.',
    'tutorial.3.title': 'Find your way',
    'tutorial.3.text': "Use Today's tasks to see what is left and Map to jump to any room. Reopen this tutorial any time.",
    'menu.language': 'Language',
    'menu.sound': 'Sound',
    'menu.on': 'On',
    'menu.off': 'Off',
    'menu.reset': 'Progress',
    'menu.reset.button': 'Reset progress',
    'reset.title': 'Reset progress?',
    'reset.confirm': 'This removes all completed cases and unlocked rewards. This cannot be undone.',
    'reset.cancel': 'Cancel',
    'reset.ok': 'Yes, reset',
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
    'bar.tasks': 'Taken van vandaag',
    'bar.map': 'Kaart',
    'bar.tutorial': 'Uitleg',
    'bar.menu': 'Menu',
    'tasks.department': 'Jouw afdeling',
    'tasks.department.none': 'Kies...',
    'tasks.required': 'Verplicht',
    'tasks.optional': 'Optioneel verkennen',
    'tasks.required.hint': 'Jouw afdeling plus de algemene cases.',
    'tasks.optional.hint': 'Andere afdelingen: optioneel, met bonusbeloningen.',
    'tasks.none': 'Nog niets hier.',
    'map.jump': 'Ga',
    'map.rooms': 'Ruimtes',
    'map.overview': 'Overzicht van de hele kantoorkaart',
    'map.hint': 'Kies een ruimte om erheen te springen. Het gele vierkant ben jij.',
    'tutorial.back': 'Terug',
    'tutorial.next': 'Volgende',
    'tutorial.done': 'Begin met spelen',
    'tutorial.0.title': 'Loop rond',
    'tutorial.0.text': 'Gebruik de pijltjestoetsen of WASD om door het kantoor te lopen.',
    'tutorial.1.title': 'Open een case',
    'tutorial.1.text': 'Loop naar een object met een gele bel en druk op E om de use case te openen.',
    'tutorial.2.title': 'Probeer het en rond af',
    'tutorial.2.text': 'Kopieer de prompt, probeer hem in Cowork en druk op "Klaar!" om een beloning te ontgrendelen.',
    'tutorial.3.title': 'Vind je weg',
    'tutorial.3.text': 'Gebruik Taken van vandaag om te zien wat er nog is en Kaart om naar elke ruimte te springen. Open deze uitleg altijd opnieuw.',
    'menu.language': 'Taal',
    'menu.sound': 'Geluid',
    'menu.on': 'Aan',
    'menu.off': 'Uit',
    'menu.reset': 'Voortgang',
    'menu.reset.button': 'Voortgang resetten',
    'reset.title': 'Voortgang resetten?',
    'reset.confirm': 'Dit verwijdert alle voltooide cases en ontgrendelde beloningen. Dit kan niet ongedaan worden gemaakt.',
    'reset.cancel': 'Annuleren',
    'reset.ok': 'Ja, resetten',
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
