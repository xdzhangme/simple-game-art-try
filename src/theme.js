// Maps theme.json token names (docs/VISUAL-SPEC.md section 4) to CSS variables.
const toVar = (key) => '--' + key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

export function applyTheme(tokens, el = document.documentElement) {
  for (const [key, value] of Object.entries(tokens)) {
    if (typeof value === 'string') el.style.setProperty(toVar(key), value);
  }
}

// CSS holds the defaults; theme.json (served unbundled) overrides them, then
// `overrides` (e.g. per-customer tokens) win. A missing theme.json keeps the defaults.
export async function loadTheme(overrides = {}) {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}theme.json`, { cache: 'no-cache' });
    if (res.ok) applyTheme(await res.json());
  } catch {
    // keep CSS defaults
  }
  applyTheme(overrides);
}
