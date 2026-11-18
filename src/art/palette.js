// Indexed palette: every sprite pixel is a one-letter index that resolves to a theme token,
// so a customer can recolor all art through theme.json (docs/VISUAL-SPEC.md sections 4 and 9).

// index letter -> theme token (camelCase, same names as theme.json / the CSS variables)
export const INDEX = {
  o: 'outline',
  w: 'wall',
  f: 'floor',
  g: 'grid',
  a: 'accent',
  A: 'accentDark',
  p: 'panel',
  P: 'panelDark',
  m: 'marker',
  d: 'done',
  l: 'locked',
  L: 'lockedOutline',
  i: 'ink',
  W: 'onAccent',
  F: 'face',
  b: 'wood',
  B: 'woodDark',
  v: 'leaf',
  V: 'leafDark',
  s: 'skin',
  h: 'hair',
  c: 'screen',
  r: 'red',
};

// Defaults for tokens that are not in the base theme; theme.json may override any of them.
export const DEFAULTS = {
  outline: '#7b88a3',
  wall: '#f2f5f8',
  floor: '#c8d7df',
  grid: '#c3d1da',
  accent: '#6f86a8',
  accentDark: '#4a5d7c',
  panel: '#eaf0f4',
  panelDark: '#c3d1da',
  marker: '#e8b84a',
  done: '#4fa95c',
  locked: '#b2bac6',
  lockedOutline: '#7a8498',
  ink: '#2c3855',
  onAccent: '#ffffff',
  face: '#b4bfcd',
  wood: '#c99a5b',
  woodDark: '#8f6a3c',
  leaf: '#5fa56a',
  leafDark: '#3d7a4b',
  skin: '#f0c8a0',
  hair: '#4a3a38',
  screen: '#9fd0f0',
  red: '#c25a52',
  tintMint: '#c9e8d8',
  tintLavender: '#ddd3f0',
  tintBlush: '#f2cfcf',
  tintSky: '#c4dbf2',
  tintButter: '#f0e2b8',
  tintSage: '#cbe3cf',
  tintPeach: '#f1d9c3',
  tintIce: '#c4e1ec',
  tintSand: '#e0d9bf',
  tintGrey: '#d6dde2',
};

const toVar = (key) => '--' + key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

// Resolves every token from the CSS variables set by theme.json, falling back to the defaults.
export function readPalette(el = document.documentElement) {
  const css = getComputedStyle(el);
  const tokens = {};
  for (const [key, fallback] of Object.entries(DEFAULTS)) {
    tokens[key] = css.getPropertyValue(toVar(key)).trim() || fallback;
  }
  return tokens;
}

// Linear mix of two #rrggbb colors (t = share of b).
export function mix(a, b, t) {
  const full = (hex) => (hex.length === 4 ? '#' + [...hex.slice(1)].map((ch) => ch + ch).join('') : hex);
  const n = (hex) => [1, 3, 5].map((i) => parseInt(full(hex).slice(i, i + 2), 16));
  const [x, y] = [n(a), n(b)];
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
