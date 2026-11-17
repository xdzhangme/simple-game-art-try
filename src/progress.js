// Self-reported progress: completed use case ids persisted in localStorage.
// Completing a case also unlocks its reward (one reward per use case).
export const PROGRESS_KEY = 'progress';
export const PROGRESS_CHANGE = 'progress-change';

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(PROGRESS_KEY));
    return Array.isArray(v) ? v.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function write(ids) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(ids));
  } catch {
    // Storage unavailable (private mode / quota): progress lasts for this page view only.
    memory = ids;
  }
}

let memory = null;
const ids = () => memory ?? read();

function emit(detail) {
  window.dispatchEvent(new CustomEvent(PROGRESS_CHANGE, { detail }));
}

export const completedIds = () => [...ids()];
export const isCompleted = (id) => ids().includes(id);

// Marks a case completed. Returns true when it was newly completed.
export function completeUseCase(id) {
  const current = ids();
  if (current.includes(id)) return false;
  write([...current, id]);
  emit({ type: 'complete', useCaseId: id });
  return true;
}

// Clears all progress (the UI for this is wired in the buttons issue).
export function resetProgress() {
  memory = null;
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch {
    memory = [];
  }
  emit({ type: 'reset' });
}

// Counts for the progress UI: cases completed and rewards unlocked (always equal: one reward per case).
export function progressCounts(useCases) {
  const done = new Set(ids());
  const completed = useCases.filter((u) => done.has(u.id)).length;
  return { completed, rewards: completed, total: useCases.length };
}

export function onProgressChange(fn) {
  window.addEventListener(PROGRESS_CHANGE, (e) => fn(e.detail));
}
