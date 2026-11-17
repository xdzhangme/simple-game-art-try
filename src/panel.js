import { renderCard } from './card.js';
import { onLangChange, pick, t } from './i18n.js';
import { completeUseCase, completedIds, isCompleted, onProgressChange, progressCounts } from './progress.js';
import { OPEN_USE_CASE } from './rules.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// "plant-fern" -> "Plant fern"
function rewardName(id) {
  const s = id.replace(/-/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Right-side game panel: idle state (progress, unlocked rewards, next recommended case)
 * or the full shared use case card after pressing E near an object. Closing returns to idle.
 */
export function initCardPanel(container, useCases, target = window) {
  let openId = null;

  function idleView() {
    const done = new Set(completedIds());
    const counts = progressCounts(useCases);
    const cases = useCases.filter((u) => done.has(u.id));
    const next = useCases.find((u) => !done.has(u.id));
    const view = el('div', 'gp-idle');
    const head = el('header', 'uc-head px-title');
    head.append(el('h3', 'uc-title', t('panel.idle.title')));
    const body = el('div', 'uc-body');

    body.append(
      el('h4', 'uc-label', t('panel.progress')),
      el('p', 'gp-progress', `${counts.completed} / ${counts.total} ${t('panel.completed')}`),
      el('p', 'gp-progress', `${counts.rewards} / ${counts.total} ${t('panel.unlocked')}`),
      el('h4', 'uc-label', t('panel.rewards')),
    );
    if (cases.length) {
      const list = el('ul', 'gp-rewards');
      cases.forEach((u) => list.append(el('li', '', rewardName(u.rewardId))));
      body.append(list);
    } else {
      body.append(el('p', 'placeholder', t('panel.rewards.none')));
    }
    body.append(el('h4', 'uc-label', t('panel.next')));
    body.append(next ? el('p', 'gp-next', pick(next.title)) : el('p', 'placeholder', t('panel.next.none')));
    body.append(el('p', 'placeholder', t('game.placeholder')));
    view.append(head, body);
    return view;
  }

  function render() {
    container.replaceChildren();
    const useCase = useCases.find((u) => u.id === openId);
    if (!useCase) {
      openId = null;
      container.append(idleView());
      return;
    }
    const close = el('button', 'px-btn', t('panel.close'));
    close.type = 'button';
    close.addEventListener('click', closeCard);
    const finish = el('button', 'px-btn px-btn--primary');
    finish.type = 'button';
    if (isCompleted(useCase.id)) {
      finish.textContent = t('panel.finished');
      finish.disabled = true;
    } else {
      finish.textContent = t('panel.finish');
      finish.addEventListener('click', () => completeUseCase(useCase.id));
    }
    container.append(renderCard(useCase, { actions: [finish, close] }));
  }

  function closeCard() {
    openId = null;
    render();
    container.focus();
  }

  target.addEventListener(OPEN_USE_CASE, (e) => {
    openId = e.detail.useCaseId;
    render();
    container.scrollTop = 0;
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openId && !document.querySelector('dialog[open]')) closeCard();
  });
  onLangChange(render);
  onProgressChange(render);
  render();
  return { close: closeCard };
}
