import { config } from './config.js';
import { getLang, pick, t } from './i18n.js';

const ICONS = {
  chart: '📊',
  people: '👥',
  briefcase: '💼',
  mail: '✉️',
};

const FILL_IN = /\{\{\s*([\w-]+)\s*\}\}/g;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function chip(text, variant) {
  return el('span', variant ? `uc-chip uc-chip--${variant}` : 'uc-chip', text);
}

function metaChips(meta) {
  return [
    chip(t(`chip.department.${meta.department}`)),
    chip(meta.role, 'alt'),
    chip(t(`chip.workload.${meta.workload}`), 'mark'),
    chip(`${meta.credits} ${t('chip.credits')}`),
    chip(t(`chip.executionMode.${meta.executionMode}`), 'alt'),
    chip(meta.capability),
    chip(t(`chip.collaborationScope.${meta.collaborationScope}`), 'alt'),
  ];
}

// Plain text is kept as text nodes; {{fields}} become highlighted <mark> elements.
function promptBlock(text) {
  const block = el('p', 'uc-prompt');
  let last = 0;
  for (const m of text.matchAll(FILL_IN)) {
    block.append(text.slice(last, m.index));
    block.append(el('mark', 'uc-fill', m[1]));
    last = m.index + m[0].length;
  }
  block.append(text.slice(last));
  return block;
}

// The prompt as copied: fill-ins stay as readable {{name}} placeholders.
function copyText(text) {
  return text.replace(FILL_IN, '{{$1}}');
}

function section(title, ...body) {
  const details = el('details', 'uc-section');
  details.append(el('summary', '', title), ...body);
  return details;
}

/**
 * Builds a full use case card for the current language. Shared by the Library
 * and the game. Rebuild it (call again) when the language changes.
 * options.actions: extra buttons appended to the button row (e.g. "Open in game").
 */
export function renderCard(useCase, { actions = [] } = {}) {
  const card = el('article', 'uc-card px-panel');
  card.dataset.id = useCase.id;

  const head = el('header', 'uc-head px-title');
  head.append(
    el('span', 'uc-icon', ICONS[useCase.icon] ?? '⭐'),
    el('h3', 'uc-title', pick(useCase.title)),
  );

  const body = el('div', 'uc-body');
  const chips = el('div', 'uc-chips');
  chips.append(...metaChips(useCase.meta));

  const promptText = pick(useCase.prompt);
  const copyBtn = el('button', 'px-btn px-btn--primary', t('card.copy'));
  copyBtn.type = 'button';
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copyText(promptText));
      copyBtn.textContent = t('card.copied');
      setTimeout(() => (copyBtn.textContent = t('card.copy')), 1200);
    } catch {
      // Clipboard unavailable: the prompt stays selectable on screen.
    }
  });

  const tryLink = el('a', 'px-btn', t('card.try'));
  tryLink.href = config.coworkUrl;
  tryLink.target = '_blank';
  tryLink.rel = 'noopener noreferrer';

  const buttons = el('div', 'uc-actions');
  buttons.append(copyBtn, tryLink, ...actions);

  const steps = el('ol', 'uc-steps');
  (useCase.seeItRun[getLang()] ?? useCase.seeItRun.en).forEach((s) =>
    steps.append(el('li', '', s)),
  );

  body.append(
    el('p', 'uc-summary', pick(useCase.summary)),
    chips,
    el('h4', 'uc-label', t('card.prompt')),
    promptBlock(promptText),
    buttons,
    section(t('card.run'), steps),
    section(t('card.fit'), el('p', '', pick(useCase.fitIntoWork))),
    section(t('card.how'), el('p', '', pick(useCase.howItWorks))),
    section(t('card.why'), el('p', '', pick(useCase.whyCowork))),
  );

  card.append(head, body);
  return card;
}
