import { t } from './i18n.js';
import { DEPT_KEY, pickableRooms } from './rooms.js';

const SKIP = 'none';
const ARRIVED_KEY = 'department-arrived';

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: the choice lasts for this page view only.
  }
}

// First-run department pick and the guide arrow state. Picking is optional (Skip).
export function initGuide(map, host) {
  let chosen = read(DEPT_KEY);
  let arrived = read(ARRIVED_KEY) === '1';

  function openPicker() {
    const dialog = document.createElement('dialog');
    dialog.id = 'department-dialog';
    const title = document.createElement('h2');
    title.textContent = t('pick.title');
    const text = document.createElement('p');
    text.textContent = t('pick.body');
    const list = document.createElement('div');
    list.className = 'pick-list';
    const choose = (value) => {
      chosen = value;
      write(DEPT_KEY, value);
      dialog.close();
      dialog.remove();
    };
    pickableRooms(map).forEach((r) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dis';
      b.textContent = r.name;
      b.addEventListener('click', () => choose(r.id));
      list.append(b);
    });
    const skip = document.createElement('button');
    skip.type = 'button';
    skip.className = 'dis';
    skip.textContent = t('pick.skip');
    skip.addEventListener('click', () => choose(SKIP));
    dialog.append(title, text, list, skip);
    host.append(dialog);
    dialog.showModal();
  }

  if (chosen === null) openPicker();

  return {
    // Room id to guide the player to, or null once they arrived or skipped.
    target: () => (chosen && chosen !== SKIP && !arrived ? chosen : null),
    arrive() {
      arrived = true;
      write(ARRIVED_KEY, '1');
    },
  };
}
