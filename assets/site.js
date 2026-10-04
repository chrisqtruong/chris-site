/* Shared by every page: photos, lightbox, scroll reveals, footer, page accent. */

/* ---------- photos (placeholders until real ones go in /assets/photos) ---------- */
// swap each gradient for a real file: { src: '/assets/photos/harbor.jpg', r: 1.5, cap: '…', cam: '…' }
// (cameras and placeholder captions are examples until the real photos and their details go in)
const GR = 'Ricoh GR IV', A7 = 'Sony a7 III', IP = 'iPhone';
export const PHOTOS = [
  { r: 1.5,  c: ['#f6b48f', '#f35588'], cap: 'Baltimore, 2026', cam: GR },
  { r: .75,  c: ['#0058a3', '#57abdb'], cap: 'Philadelphia', cam: A7 },
  { r: 1,    c: ['#221b44', '#b82356'], cap: 'Houston, home', cam: IP },
  { r: .8,   c: ['#fff591', '#f2aa00'], cap: 'Somewhere in Vietnam', cam: A7 },
  { r: 1.4,  c: ['#2d394d', '#ff7a90'], cap: 'Night walk', cam: GR },
  { r: 1.25, c: ['#7b9c98', '#eaf1f3'], cap: 'Morning', cam: IP },
  { r: .7,   c: ['#011926', '#00e980'], cap: 'Neon', cam: GR },
  { r: 1.5,  c: ['#e1e1e3', '#94294c'], cap: 'Sarah', cam: A7 },
  { r: 1,    c: ['#f37f83', '#fcd23f'], cap: 'Summer', cam: IP },
  { r: .8,   c: ['#132237', '#ebb723'], cap: 'Harbor lights', cam: GR },
  { r: 1.5,  c: ['#ebe1ef', '#8a5bd6'], cap: 'Dusk', cam: A7 },
  { r: 1.2,  c: ['#f2aa00', '#a66b00'], cap: 'Golden hour', cam: GR },
];

function photoInner(p) {
  return p.src
    ? `<img class="ph" src="${p.src}" alt="${p.cap}" loading="lazy" style="aspect-ratio:${p.r}">`
    : `<div class="ph" role="img" aria-label="${p.cap}" style="aspect-ratio:${p.r};background:linear-gradient(160deg, ${p.c[0]}, ${p.c[1]})"></div>`;
}

// Each photo gets the same view-transition name on every page,
// so a thumbnail on the home page flies into its spot in the gallery.
export function renderPhotos(grid, { limit = PHOTOS.length, href = null } = {}) {
  PHOTOS.slice(0, limit).forEach((p, i) => {
    const f = document.createElement(href ? 'a' : 'figure');
    f.className = 'photo';
    if (href) f.href = `${href}#p${i}`;
    f.style.viewTransitionName = `photo-${i}`;
    f.innerHTML = photoInner(p) + `<figcaption>${p.cap}<span>${p.cam}</span></figcaption>`;
    if (!href) f.onclick = () => openLightbox(i, f);
    grid.append(f);
  });
}

/* ---------- lightbox: the photo grows out of the grid (same-page view transition) ---------- */
let lb, current = -1, fromEl = null;
function swap(fn) {
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return fn();
  return document.startViewTransition(fn);
}
export function openLightbox(i, el) {
  lb ??= Object.assign(document.createElement('div'), { className: 'lightbox' });
  if (!lb.isConnected) {
    lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
    lb.onclick = e => { if (!e.target.closest('button')) closeLightbox(); };
    document.body.append(lb);
  }
  const p = PHOTOS[i];
  swap(() => {
    if (fromEl) fromEl.style.viewTransitionName = `photo-${current}`;
    fromEl = el; current = i;
    el.style.viewTransitionName = 'none';
    lb.innerHTML = `<div class="lb-frame" style="view-transition-name:photo-${i}; width:min(90vw, 1100px, ${78 * p.r}vh)">${photoInner(p)}</div>`
      + `<div class="lb-bar"><button data-d="-1" aria-label="Previous">←</button><p>${p.cap} · ${p.cam} · ${i + 1} / ${PHOTOS.length}</p><button data-d="1" aria-label="Next">→</button></div>`;
    lb.querySelectorAll('[data-d]').forEach(b => b.onclick = () => step(+b.dataset.d));
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
}
function step(d) {
  const i = (current + d + PHOTOS.length) % PHOTOS.length;
  const el = document.querySelectorAll('.photo')[i];
  if (el) openLightbox(i, el);
}
export function closeLightbox() {
  if (!lb?.classList.contains('open')) return;
  swap(() => {
    lb.classList.remove('open'); lb.innerHTML = '';
    if (fromEl) fromEl.style.viewTransitionName = `photo-${current}`;
    fromEl = null; current = -1;
    document.body.style.overflow = '';
  });
}
addEventListener('keydown', e => {
  if (current < 0) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') step(1);
  if (e.key === 'ArrowLeft') step(-1);
});

/* ---------- Vox2 themes (palettes from Vox2 / Monkeytype) ---------- */
// [bg, main, sub, line, text, accent]; accent is a version of the theme that reads on the white page
export const THEMES = {
  miami:    ['#f35588', '#05dfd7', '#94294c', '#db4979', '#f0e9ec', '#e0457a'],
  laser:    ['#221b44', '#009eaf', '#b82356', '#2e2560', '#dbe7e8', '#b82356'],
  sweden:   ['#0058a3', '#ffcc02', '#57abdb', '#0a63b0', '#ffffff', '#0058a3'],
  bento:    ['#2d394d', '#ff7a90', '#4a768d', '#36445b', '#fffaf8', '#e0566e'],
  aurora:   ['#011926', '#00e980', '#245c69', '#062636', '#ffffff', '#00a35a'],
  nautilus: ['#132237', '#ebb723', '#1b6d93', '#1b2d45', '#1cbaac', '#c9930a'],
  '8008':   ['#333a45', '#f44c7f', '#939eae', '#2e343d', '#e9ecf0', '#d93a6c'],
  dracula:  ['#282a36', '#bd93f9', '#6272a4', '#20222c', '#f8f8f2', '#7c4dde'],
  carbon:   ['#313131', '#f66e0d', '#616161', '#2b2b2b', '#f5e6c8', '#d95a00'],
};
// Text that reads on a theme's accent color: the theme's own background when the two contrast
// well enough (WCAG 4.5:1), else near-black.
const luminance = hex => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
export const onMain = name => { const [bg, main] = THEMES[name]; return contrast(bg, main) >= 4.5 ? bg : '#1d1a1f'; };
// The same hue, deepened (on the white page) or lifted (on the dark page) only as much as needed
// to read against it (3:1, fine for large text and accents).
const PAPER = { light: '#ffffff', dark: '#131214' };
function readableOn(hex, mode) {
  let [r, g, b] = [0, 8, 16].map(sh => (parseInt(hex.slice(1), 16) >> (16 - sh)) & 255);
  const toHex = () => '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  for (let i = 0; i < 60 && contrast(toHex(), PAPER[mode]) < 3; i++) {
    if (mode === 'light') { r *= 0.94; g *= 0.94; b *= 0.94; }
    else { r += (255 - r) * 0.08; g += (255 - g) * 0.08; b += (255 - b) * 0.08; }
  }
  return toHex();
}

// Colors the Vox2 parts of a page (--v-*) and the page accent. `surface` is which theme color the
// page shows big ('bg' for the hero window, 'main' for the Vox2 card); "Truong" in the nav matches it.
export function applyVoxTheme(name, surface = 'bg') {
  const [bg, main, sub, line, text, accent] = THEMES[name];
  const s = document.documentElement.style;
  s.setProperty('--v-bg', bg); s.setProperty('--v-main', main); s.setProperty('--v-sub', sub);
  s.setProperty('--v-line', line); s.setProperty('--v-text', text);
  s.setProperty('--v-on-main', onMain(name));
  // "Truong" in the nav matches the Vox2 color on the page (light and dark versions; CSS picks one).
  // Everything else keeps the site's one fixed accent, so color stays with the Vox2 parts.
  const big = surface === 'main' ? main : bg;
  setPageColors({ '--name-l': readableOn(big, 'light'), '--name-d': readableOn(big, 'dark') });
  document.querySelectorAll('[data-t]').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === name));
}
// Each theme has its own recording of the real app (a different language in each).
export function showVoxShot(name) {
  document.querySelectorAll('[data-vox-shot]').forEach(img => { img.src = `/assets/vox2/${name}.gif`; });
}
// Little two-tone dots, like the ones in Vox2's settings.
export function themeDots(container, names, onPick) {
  for (const name of names) {
    const [bg, main] = THEMES[name];
    const b = document.createElement('button');
    b.dataset.t = name; b.title = name; b.setAttribute('aria-label', `${name} theme`);
    b.style.backgroundImage = `linear-gradient(135deg, ${bg} 50%, ${main} 50%)`;  // not the `background` shorthand, which would undo the CSS that keeps it inside the ring
    b.onclick = () => onPick(name);
    container.append(b);
  }
}
// The theme picked on the Vox2 page, so its card on the home page matches when you come back.
export function pickedVoxTheme(name) {
  try { if (name) sessionStorage.setItem('voxTheme', name); return sessionStorage.getItem('voxTheme'); } catch { return null; }
}

/* ---------- "Truong": subpages keep the color the hero was showing ---------- */
function setPageColors(colors) {
  for (const [k, v] of Object.entries(colors)) document.documentElement.style.setProperty(k, v);
  try { sessionStorage.setItem('pageColors', JSON.stringify(colors)); } catch {}
}
try { const c = JSON.parse(sessionStorage.getItem('pageColors')); if (c) setPageColors(c); } catch {}

/* ---------- light / dark mode ---------- */
// The page starts in the visitor's system mode (set before first paint, in each page's <head>);
// the toggle overrides it and is remembered on this device.
const modeBtn = document.getElementById('modeToggle');
const currentMode = () => document.documentElement.dataset.mode;
const labelMode = () => modeBtn?.setAttribute('aria-label', currentMode() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
function setMode(mode) {
  const apply = () => { document.documentElement.dataset.mode = mode; labelMode(); };
  // a quick cross-fade instead of a flash
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('mode-switch');
    document.startViewTransition(apply).finished.finally(() => document.documentElement.classList.remove('mode-switch'));
  } else apply();
}
if (modeBtn) {
  labelMode();
  modeBtn.onclick = () => {
    const mode = currentMode() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('mode', mode); } catch {}
    setMode(mode);
  };
}
// follow the system while the visitor hasn't chosen
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  let chosen = null; try { chosen = localStorage.getItem('mode'); } catch {}
  if (!chosen) setMode(e.matches ? 'dark' : 'light');
});

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ---------- arriving through a page transition: show what's already on screen right away ---------- */
function showOnScreen() {
  document.querySelectorAll('.reveal:not(.in)').forEach(el => {
    if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in');
  });
}
addEventListener('pagereveal', e => { if (e.viewTransition) showOnScreen(); });
if (document.documentElement.dataset.arrived === 'vt') showOnScreen();


/* ---------- highlight any text to translate it, like Vox2's "translate selection" ---------- */
const HL_LANGS = { vi: 'tiếng Việt', es: 'español', fr: 'français', ja: '日本語', ko: '한국어', 'zh-CN': '中文', ar: 'العربية',
  fa: 'فارسی', de: 'Deutsch', it: 'italiano', pt: 'português', tr: 'Türkçe', sw: 'Kiswahili', tl: 'Tagalog', hi: 'हिन्दी', en: 'English' };
// the visitor's own language if it isn't English, else Vietnamese
let hlLang = (() => {
  try { const saved = localStorage.getItem('hlLang'); if (HL_LANGS[saved]) return saved; } catch {}
  const nav = (navigator.language || 'en').toLowerCase();
  const code = nav.startsWith('zh') ? 'zh-CN' : nav.split('-')[0];
  return HL_LANGS[code] && code !== 'en' ? code : 'vi';
})();
let bubble, hlCtl, hlTimer, hlText = '';
function hideBubble() { bubble?.classList.remove('show'); hlCtl?.abort(); hlText = ''; }
async function hlTranslate() {
  const out = bubble.querySelector('.hl-out');
  hlCtl?.abort(); hlCtl = new AbortController();
  out.classList.add('pending');
  try {
    const res = await fetch(`https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=${hlLang}`,
      { method: 'POST', body: new URLSearchParams({ q: hlText }), signal: hlCtl.signal });
    const j = await res.json();
    const first = Array.isArray(j) ? j[0] : '';
    out.textContent = (Array.isArray(first) ? first[0] : first) || '';
    out.dir = ['ar', 'fa'].includes(hlLang) ? 'rtl' : 'auto';
  } catch (e) { if (e.name !== 'AbortError') out.textContent = 'couldn’t reach the translator'; }
  out.classList.remove('pending');
}
function showBubble(range) {
  if (!bubble) {
    bubble = document.createElement('div');
    bubble.className = 'hl-bubble';
    bubble.setAttribute('role', 'dialog');
    bubble.innerHTML = `<div class="hl-head"><span>→</span><select aria-label="Translate to">${
      Object.entries(HL_LANGS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select><button aria-label="Close">×</button></div><div class="hl-out"></div>`;
    bubble.querySelector('select').onchange = e => { hlLang = e.target.value; try { localStorage.setItem('hlLang', hlLang); } catch {} hlTranslate(); };
    bubble.querySelector('button').onclick = hideBubble;
    document.body.append(bubble);
  }
  bubble.querySelector('select').value = hlLang;
  bubble.querySelector('.hl-out').textContent = '…';
  // just below the selection, kept on screen (above it if there's no room)
  const r = range.getBoundingClientRect();
  bubble.style.left = `${Math.max(12, Math.min(r.left, innerWidth - 332))}px`;
  bubble.style.top = r.bottom + 160 < innerHeight ? `${r.bottom + 10}px` : `${Math.max(12, r.top - 150)}px`;
  bubble.classList.add('show');
  hlTranslate();
}
document.addEventListener('selectionchange', () => {
  clearTimeout(hlTimer);
  hlTimer = setTimeout(() => {
    const sel = getSelection();
    const text = sel.toString().trim();
    if (!text || sel.isCollapsed) { if (!bubble?.matches(':focus-within')) hideBubble(); return; }
    const where = sel.anchorNode?.parentElement;
    // not inside the translator itself, form fields, or the bubble
    if (!where || where.closest('.vox, .hl-bubble, input, textarea, select') || text.length > 600 || text === hlText) return;
    hlText = text;
    showBubble(sel.getRangeAt(0));
  }, 350);
});
addEventListener('scroll', () => { if (bubble?.classList.contains('show')) hideBubble(); }, { passive: true });
addEventListener('keydown', e => { if (e.key === 'Escape') hideBubble(); });

/* ---------- a small kitty peeks over the footer line when you reach the bottom ---------- */
const links = document.querySelector('footer .links');
if (links) {
  const kitty = document.createElement('span');
  kitty.className = 'kitty';
  kitty.setAttribute('aria-hidden', 'true');
  kitty.innerHTML = `<svg viewBox="0 0 64 40">
    <path d="M9 24 13 2 29 13Z" fill="#9b6842"/><path d="M14 17 16 8 24 13Z" fill="#f0a3a0"/>
    <path d="M55 24 51 2 35 13Z" fill="#9b6842"/><path d="M50 17 48 8 40 13Z" fill="#f0a3a0"/>
    <ellipse cx="32" cy="36" rx="26" ry="23" fill="#9b6842"/>
    <g class="k-eyes"><ellipse cx="22.5" cy="31" rx="5" ry="5.6" fill="#fffaf2"/><circle cx="23" cy="32" r="3.1" fill="#2a1a12"/>
      <ellipse cx="41.5" cy="31" rx="5" ry="5.6" fill="#fffaf2"/><circle cx="42" cy="32" r="3.1" fill="#2a1a12"/></g>
    <g class="k-happy" fill="none" stroke="#2a1a12" stroke-width="2" stroke-linecap="round"><path d="M18 33q4.5-5 9 0"/><path d="M37 33q4.5-5 9 0"/></g>
  </svg>`;
  links.append(kitty);
  // she only moves (and blinks) while she's on screen
  new IntersectionObserver(([e]) => kitty.classList.toggle('peek', e.isIntersecting), { threshold: 1 }).observe(kitty);
}
