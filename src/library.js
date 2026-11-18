import { renderCard } from './card.js';
import useCases from './data/use-cases.json';
import { onLangChange, t } from './i18n.js';

// Renders every use case from the shared JSON as a card; re-renders on language change.
// options.onOpenInGame(id) returns false when the case has no map object; hasObject(id) tells up front.
export function initLibrary(container, { onOpenInGame, hasObject = () => true } = {}) {
  function openButton(uc) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'px-btn';
    btn.textContent = t('card.openInGame');
    const note = document.createElement('p');
    note.className = 'placeholder uc-note';
    note.setAttribute('role', 'status');
    btn.addEventListener('click', () => {
      if (hasObject(uc.id) && onOpenInGame?.(uc.id)) return;
      note.textContent = t('card.noObject');
    });
    return [btn, note];
  }

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
    useCases.forEach((uc) => {
      const [btn, note] = openButton(uc);
      const card = renderCard(uc, { actions: [btn] });
      card.querySelector('.uc-actions').after(note);
      list.append(card);
    });
    container.append(list);
  }
  render();
  onLangChange(render);
}
