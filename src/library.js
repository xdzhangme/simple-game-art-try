import { renderCard } from './card.js';
import useCases from './data/use-cases.json';
import { onLangChange, t } from './i18n.js';

// Renders every use case from the shared JSON as a card; re-renders on language change.
export function initLibrary(container) {
  function render() {
    container.replaceChildren();
    if (!useCases.length) {
      const empty = document.createElement('p');
      empty.className = 'placeholder';
      empty.textContent = t('library.empty');
      container.append(empty);
      return;
    }
    const list = document.createElement('div');
    list.className = 'uc-list';
    useCases.forEach((uc) => list.append(renderCard(uc)));
    container.append(list);
  }
  render();
  onLangChange(render);
}
