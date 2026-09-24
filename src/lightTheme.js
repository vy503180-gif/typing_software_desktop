// src/lightTheme.js
// Light ("white") theme engine for react-native-web (Electron / browser).
//
// react-native-web renders styles as atomic CSS classes (e.g. `.r-xxxx`), so we
// (1) enumerate the generated stylesheets and inject `!important` overrides that
//     remap known dark *surface / border* colors to light equivalents, and
// (2) watch the DOM (MutationObserver) and flip light *text* colors to dark —
//     but only when the element sits on a surface (accent backgrounds with white
//     text, like teal/orange buttons, keep their white labels).

const SURFACE_PAIRS = [
  ['#0a0e1a', '#D5EEF2'],
  ['#070b14', '#cde6ef'],
  ['#0b1120', '#c9e1eb'],
  ['#0d1424', '#bdd9e6'],
  ['#0f1830', '#ffffff'],
  ['#1a2542', '#f0f8fb'],
  ['#141d36', '#e1f0f6'],
  ['rgba(45,58,82,0.45)', 'rgba(255,255,255,0.8)'],
  ['rgba(13,20,36,0.8)', 'rgba(255,255,255,0.92)'],
  ['rgba(10,16,30,0.6)', 'rgba(230,244,250,0.85)'],
  ['rgba(13,148,136,0.22)', 'rgba(20,184,166,0.18)'],
  ['rgba(45,212,191,0.10)', 'rgba(45,212,191,0.14)'],
  ['rgba(148,163,184,0.65)', 'rgba(71,85,105,0.5)'],
  ['rgba(148,163,184,0.8)', 'rgba(71,85,105,0.65)'],
  ['rgba(148,163,184,0.3)', 'rgba(71,85,105,0.4)'],
  ['rgba(148,163,184,0.45)', 'rgba(71,85,105,0.45)'],
  ['#0a0a0a', '#cde6ef'],
  ['#0e0e0e', '#ffffff'],
  ['#141414', '#ffffff'],
  ['#111', '#ffffff'],
  ['#1a1a1a', '#eef6f9'],
  ['#1e1e1e', '#eef6f9'],
  ['#222', 'rgba(71,85,105,0.45)'],
  ['#2a2a2a', 'rgba(71,85,105,0.5)'],
  ['#3f516c', 'rgba(71,85,105,0.7)'],
  ['#252525', 'rgba(71,85,105,0.45)'],
  ['rgba(13,148,136,0.45)', 'rgba(20,184,166,0.75)'],
  ['rgba(255,255,255,0.07)', 'rgba(15,23,42,0.12)'],
  ['rgba(255,255,255,0.06)', 'rgba(15,23,42,0.09)'],
  ['rgba(255,255,255,0.08)', 'rgba(15,23,42,0.1)'],
  ['rgba(255,255,255,0.05)', 'rgba(15,23,42,0.08)'],
  ['rgba(255,255,255,0.04)', 'rgba(15,23,42,0.06)'],
  ['rgba(30,46,84,0.45)', 'rgba(226,232,242,0.85)'],
  ['rgba(30,46,84,0.5)', 'rgba(226,232,242,0.9)'],
];

const TEXT_PAIRS = [
  ['#ffffff', '#0f172a'],
  ['#dbe4f3', '#1e293b'],
  ['#cdd9f0', '#1e293b'],
  ['#8ea0bf', '#475569'],
  ['#4c5b7a', '#64748b'],
  ['#7d8bb0', '#64748b'],
  ['rgba(205,217,240,0.7)', 'rgba(30,41,59,0.75)'],
];

const PROP_NAMES = [
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
];

// Any opaque, nearly-black, low-saturation color is treated as a dark surface.
const FALLBACK_LUM = 0.14;

function luminosity(c) {
  return (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255;
}

function isOpaqueDarkSurface(c) {
  if (!c || c.a < 0.95) return false;
  if (luminosity(c) >= FALLBACK_LUM) return false;
  const mx = Math.max(c.r, c.g, c.b);
  const mn = Math.min(c.r, c.g, c.b);
  const range = (255 - mn) / 255;
  return mn <= 4 || (mx - mn) / Math.max(1, mx) < 0.35;
}

let active = false;
let styleTag = null;
let observer = null;
let refreshTimer = null;
let flushTimer = null;
const pendingRoots = [];
const touched = new Set();

function parseColor(s) {
  if (!s || typeof s !== 'string') return null;
  s = s.trim();
  if (s === 'transparent' || s === 'inherit' || s === 'initial' || s === 'unset') return { r: 0, g: 0, b: 0, a: 0 };
  let m = s.match(/^#([0-9a-fA-F]{3,8})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (h.length !== 6 && h.length !== 8) return null;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }
  m = s.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const parts = m[1].split(',').map((x) => parseFloat(x.trim()));
    if (parts.length >= 3 && parts.every((n) => !Number.isNaN(n))) {
      return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
    }
  }
  return null;
}

function sameColor(a, b) {
  if (!a || !b) return false;
  return Math.abs(a.r - b.r) < 2 && Math.abs(a.g - b.g) < 2 && Math.abs(a.b - b.b) < 2 && Math.abs(a.a - b.a) < 0.02;
}

function fmtColor(c) {
  if (c.a >= 0.995) return `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;
  return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${Math.round(c.a * 100) / 100})`;
}

const SPAIRS = SURFACE_PAIRS.map((p) => [parseColor(p[0]), parseColor(p[1])]);
const TPAIRS = TEXT_PAIRS.map((p) => [parseColor(p[0]), p[1]]);

function surfaceIndex(c) {
  for (let i = 0; i < SPAIRS.length; i++) {
    if (sameColor(SPAIRS[i][0], c)) return i;
  }
  if (isOpaqueDarkSurface(c)) return 0;
  return -1;
}

function isSurfaceColor(c) {
  if (!c) return false;
  for (let i = 0; i < SPAIRS.length; i++) {
    if (sameColor(SPAIRS[i][0], c) || sameColor(SPAIRS[i][1], c)) return true;
  }
  if (isOpaqueDarkSurface(c)) return true;
  return false;
}

function injectOverrides() {
  if (!styleTag) styleTag = document.createElement('style');
  const hits = new Map();
  const sheets = Array.from(document.styleSheets || []);
  for (const sheet of sheets) {
    let rules = null;
    try { rules = sheet.cssRules; } catch (e) { continue; }
    if (!rules) continue;
    for (const rule of Array.from(rules)) {
      if (!rule.selectorText) continue;
      if (rule.selectorText.includes(':')) continue;
      const sel = rule.selectorText.trim();
      if (!/^\.[A-Za-z0-9_-]+$/.test(sel)) continue;
      const st = rule.style;
      if (!st) continue;
      let entry = hits.get(sel);
      for (let i = 0; i < st.length; i++) {
        const p = st[i];
        const v = st.getPropertyValue(p).trim();
        if (!v) continue;
        const c = parseColor(v);
        if (!c) continue;
        if (PROP_NAMES.indexOf(p) !== -1) {
          const idx = surfaceIndex(c);
          if (idx >= 0) {
            if (!entry) entry = hits.get(sel) || {};
            if (!entry.s) entry.s = `${p}: ${fmtColor(SPAIRS[idx][1])} !important;`;
          }
        } else if (p === 'color') {
          const t = textDarkFor(c);
          if (t) {
            if (!entry) entry = hits.get(sel) || {};
            if (!entry.t) entry.t = `color: ${t} !important;`;
          }
        }
      }
      if (entry) hits.set(sel, entry);
    }
  }
  const css = Array.from(hits.entries())
    .map(([sel, entry]) => `${sel} { ${entry.s || ''} ${entry.t || ''} }`)
    .join('\n');
  styleTag.id = 'antriksh-light-overrides';
  styleTag.textContent = css;
  if (!document.head.contains(styleTag)) document.head.appendChild(styleTag);
  return css.length;
}

function effectiveSurface(el) {
  let cur = el;
  let depth = 0;
  while (cur && depth < 6) {
    const c = parseColor(getComputedStyle(cur).backgroundColor);
    if (c && c.a > 0.02) return c;
    if (cur === document.body) break;
    cur = cur.parentElement;
    depth += 1;
  }
  const bg = parseColor(getComputedStyle(document.body).backgroundColor);
  return bg || { r: 0, g: 0, b: 0, a: 0 };
}

function textDarkFor(c) {
  for (const [key, dark] of TPAIRS) {
    if (sameColor(key, c)) return dark;
  }
  const lum = (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255;
  if (lum > 0.8) return '#1f2937';
  return null;
}

function walk(root) {
  const stack = [root];
  let count = 0;
  while (stack.length) {
    const el = stack.pop();
    if (!el || el.nodeType !== 1) continue;
    const tag = el.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'HEAD') continue;
    count += 1;
    const cs = getComputedStyle(el);
    const c = parseColor(cs.color);
    if (c && c.a >= 0.7) {
      const surf = effectiveSurface(el);
      if (surf && isSurfaceColor(surf)) {
        const dark = textDarkFor(c);
        if (dark && el.style.color !== dark) {
          el.style.color = dark;
          touched.add(el);
        }
      }
    }
    const children = el.childNodes;
    for (let i = children.length - 1; i >= 0; i--) {
      const ch = children[i];
      if (ch.nodeType === 1) stack.push(ch);
    }
  }
  return count;
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = requestAnimationFrame(() => {
    flushTimer = null;
    let budget = 600;
    while (pendingRoots.length && budget > 0) {
      const root = pendingRoots.shift();
      if (root && root.isConnected) budget -= walk(root);
    }
  });
}

function startObserver() {
  if (observer) return;
  observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type !== 'childList' || !m.addedNodes || !m.addedNodes.length) continue;
      for (const node of m.addedNodes) {
        if (node.nodeType === 1) pendingRoots.push(node);
      }
    }
    scheduleFlush();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

export function applyLightTheme() {
  if (typeof document === 'undefined') return;
  if (active) return;
  active = true;
  document.body.classList.add('antriksh-light');
  document.body.style.backgroundColor = '#D5EEF2';
  injectOverrides();
  walk(document.body); // flip already-mounted text to dark immediately
  startObserver();
  scheduleFlush();
  refreshTimer = setInterval(() => { injectOverrides(); }, 1500);
}

export function removeLightTheme() {
  if (typeof document === 'undefined') return;
  if (!active) return;
  active = false;
  document.body.classList.remove('antriksh-light');
  document.body.style.backgroundColor = '';
  if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
  if (observer) { observer.disconnect(); observer = null; }
  if (flushTimer) { cancelAnimationFrame(flushTimer); flushTimer = null; }
  pendingRoots.length = 0;
  for (const el of touched) {
    try { el.style.removeProperty('color'); } catch (e) {}
  }
  touched.clear();
  if (styleTag) {
    styleTag.textContent = '';
    if (styleTag.parentNode) styleTag.parentNode.removeChild(styleTag);
    styleTag = null;
  }
}