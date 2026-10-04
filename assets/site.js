/* Shared by every page: photos, lightbox, scroll reveals, footer, page accent. */

/* ---------- photos, grouped into series (placeholders until real ones go in /assets/photos) ---------- */
// A photo: { src: '/assets/photos/baltimore/harbor.jpg', r: 1.5, cap: '…', cam: '…' }  (r = width / height)
// Until then each one is a soft neutral block. Series, captions and cameras below are examples.
const GR = 'Ricoh GR IV', A7 = 'Sony a7 III', IP = 'iPhone';
const ph = (r, a, b, cap, cam) => ({ r, c: [a, b], cap, cam });
export const SERIES = [
  { slug: 'baltimore', title: 'Baltimore', when: '2026', note: 'Example series. Replace with a line about it.', photos: [
    ph(1.5, '#c9c2b6', '#8f877b', 'Harbor, morning', GR), ph(.8, '#b9b4ab', '#6f6a62', 'Row houses', GR),
    ph(1.5, '#a59f96', '#57524c', 'Night bus', IP), ph(1.25, '#d3cdc3', '#9a9286', 'Market', GR) ] },
  { slug: 'vietnam', title: 'Vietnam', when: '2025', note: 'Example series. Replace with a line about it.', photos: [
    ph(1.5, '#c8c0ae', '#857c68', 'Street, Hội An', A7), ph(.75, '#bdb6a6', '#77705f', 'Grandmother’s house', A7),
    ph(1.5, '#d0c9b9', '#958d7b', 'Ferry', A7) ] },
  { slug: 'everyday', title: 'Everyday', when: 'ongoing', note: 'Example series. Replace with a line about it.', photos: [
    ph(1.25, '#c4c4c0', '#83837e', 'Kitchen light', IP), ph(1, '#b7b6b1', '#6c6b66', 'Sarah', A7),
    ph(1.5, '#cfcdc7', '#908e87', 'Walk home', GR), ph(.8, '#bcbab3', '#75736c', 'Window', GR) ] },
];

function photoInner(p) {
  return p.src
    ? `<img class="ph" src="${p.src}" alt="${p.cap}" loading="lazy" style="aspect-ratio:${p.r}">`
    : `<div class="ph" role="img" aria-label="${p.cap}" style="aspect-ratio:${p.r};background:linear-gradient(160deg, ${p.c[0]}, ${p.c[1]})"></div>`;
}

// A series, one big photo per row with a small caption underneath; click for full screen.
let PHOTOS = [];
export function renderSeries(container, series) {
  PHOTOS = series.photos;
  series.photos.forEach((p, i) => {
    const f = document.createElement('figure');
    f.className = 'plate';
    f.style.viewTransitionName = `photo-${i}`;
    f.innerHTML = `<div class="frame">${photoInner(p)}</div><figcaption>${p.cap}<span>${p.cam}</span></figcaption>`;
    f.querySelector('.frame').onclick = () => openLightbox(i, f);
    container.append(f);
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
  const el = document.querySelectorAll('.plate')[i];
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
// the themes the site offers right now (the others stay defined for later); the first is the default
export const SITE_THEMES = ['sweden', 'bento', 'miami'];
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
const PAPER = { light: '#faf8f4', dark: '#171c28' };
function readableOn(hex, mode) {
  // work in hue / saturation / lightness, so only lightness moves and the color keeps its character
  const n = parseInt(hex.slice(1), 16);
  let [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map(v => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, sat = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  const toHex = (L, S) => {
    const q = L < 0.5 ? L * (1 + S) : L + S - L * S, p = 2 * L - q;
    const ch = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return '#' + [ch(h + 1 / 3), ch(h), ch(h - 1 / 3)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
  };
  // lifting a very dark color also needs a little more saturation, or it drifts toward grey
  const S = mode === 'dark' ? Math.min(1, Math.max(sat, 0.45)) : sat;
  for (let i = 0; i < 100 && contrast(toHex(l, S), PAPER[mode]) < 3; i++) l += mode === 'light' ? -0.01 : 0.01;
  return toHex(l, mode === 'dark' && contrast(hex, PAPER[mode]) < 3 ? S : sat);
}

// Colors the Vox2 parts of a page (--v-*) and the page accent. `surface` is which theme color the
// page shows big ('bg' for the hero window, 'main' for the Vox2 card); "Truong" in the nav matches it.
// vivid = not too dark and not greyish (so a dark navy or slate hero falls back to the theme's bright color)
function isVivid(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map(v => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  const sat = max === min ? 0 : (max - min) / (l > 0.5 ? 2 - max - min : max + min);
  return l >= 0.3 && sat >= 0.5;
}
export let currentVoxTheme = SITE_THEMES[0];   // the theme on screen right now
export function applyVoxTheme(name, surface = 'bg') {
  currentVoxTheme = name;
  const [bg, main, sub, line, text, accent] = THEMES[name];
  const s = document.documentElement.style;
  s.setProperty('--v-bg', bg); s.setProperty('--v-main', main); s.setProperty('--v-sub', sub);
  s.setProperty('--v-line', line); s.setProperty('--v-text', text);
  s.setProperty('--v-on-main', onMain(name));
  // "Truong" in the nav matches the Vox2 color on the page (light and dark versions; CSS picks one).
  // Everything else keeps the site's one fixed accent, so color stays with the Vox2 parts.
  // the hero's own color when it's vivid enough to notice, else the theme's bright accent color
  const big = surface === 'main' || !isVivid(bg) ? main : bg;
  // On the dark page, the theme's bright color carries the accent instead (Sweden: yellow, not blue):
  // a deep hue on navy only scrapes past 3:1 and looks dim, while the bright one glows at 6–11:1.
  const nameL = readableOn(big, 'light'), nameD = readableOn(main, 'dark');
  // text inside a selection: white or near-black, whichever reads better on that color
  const ink = c => (contrast(c, '#ffffff') >= contrast(c, '#131214') ? '#ffffff' : '#131214');
  setPageColors({ '--name-l': nameL, '--name-d': nameD, '--sel-ink-l': ink(nameL), '--sel-ink-d': ink(nameD) });
  setFavicon(nameL);
  document.querySelectorAll('[data-t]').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === name));
}
// Each theme has its own recording of the real app (a different language in each).
// The demo clips are short muted videos (much lighter than GIFs, and played by the graphics chip).
// With reduced motion on, they stay on their first frame.
const stillClips = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('video[autoplay]').forEach(v => {
  if (stillClips) { v.removeAttribute('autoplay'); v.pause(); }
  // some browsers skip the autoplay attribute; asking directly works for muted clips.
  // If a browser still says no until the visitor interacts, start on the first tap, click or key.
  else v.play().catch(() => {
    const go = () => { v.play().catch(() => {}); ['pointerdown', 'keydown', 'touchstart'].forEach(t => removeEventListener(t, go)); };
    ['pointerdown', 'keydown', 'touchstart'].forEach(t => addEventListener(t, go, { passive: true }));
  });
});
export function showVoxShot(name) {
  document.querySelectorAll('[data-vox-shot]').forEach(v => { v.src = `/assets/vox2/${name}.mp4`; if (!stillClips) v.play?.().catch(() => {}); });
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
// The browser-tab icon: a hand-drawn dot in the current theme color (same shape as /favicon.svg).
const DOT = 'M58.2 23.4C59.3 28.3 57.0 36.1 55.8 40.6C54.5 45.0 54.4 47.4 50.7 50.1C46.9 52.8 39.2 56.4 33.3 56.7C27.4 56.9 20.0 54.4 15.4 51.5C10.9 48.5 7.7 42.8 5.9 38.9C4.2 35.0 2.8 32.4 4.7 28.2C6.5 23.9 12.2 16.9 17.1 13.2C22.0 9.6 28.6 6.5 34.0 6.2C39.3 5.9 45.0 8.4 49.0 11.3C53.0 14.1 57.0 18.5 58.2 23.4Z';
// (Chrome and Firefox update it live; Safari may keep showing the first one it loaded.)
function setFavicon(color) {
  // a hand-drawn dot: lopsided like one dab of a big marker, with a smooth edge (a rough one reads as pixelated)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="${DOT}" fill="${color}"/></svg>`;
  let link = document.querySelector('link[rel="icon"]');
  if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.append(link); }
  link.type = 'image/svg+xml';
  link.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
}
try {
  const c = JSON.parse(sessionStorage.getItem('pageColors'));
  if (c) { setPageColors(c); if (c['--name-l']) setFavicon(c['--name-l']); }
} catch {}

/* ---------- while the page is scrolling, things that animate on their own wait (so scrolling stays smooth) ---------- */
let lastScroll = 0;
addEventListener('scroll', () => { lastScroll = performance.now(); }, { passive: true });
export const isScrolling = () => performance.now() - lastScroll < 200;
// resolves once scrolling has been still for a moment
export const scrollIdle = () => (isScrolling() ? new Promise(r => { const t = setInterval(() => { if (!isScrolling()) { clearInterval(t); r(); } }, 100); }) : null);

/* ---------- the top bar's real height, so the hero (and anything else) can sit just below it ---------- */
const navEl = document.querySelector('nav');
if (navEl) {
  const setNavH = () => document.documentElement.style.setProperty('--nav-h', `${navEl.offsetHeight}px`);
  setNavH();
  new ResizeObserver(setNavH).observe(navEl);
  document.fonts?.ready.then(setNavH);
  // once the page moves, the bar turns see-through with a hairline under it, so content glides beneath.
  // Watched with an IntersectionObserver on a 1px marker at the top: no work on each scroll frame.
  const top = document.createElement('div');
  top.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none';
  top.setAttribute('aria-hidden', 'true');
  document.body.prepend(top);
  new IntersectionObserver(([e]) => navEl.classList.toggle('scrolled', !e.isIntersecting)).observe(top);
}

/* ---------- light / dark mode ---------- */
// The site opens in the visitor's system setting, light or dark (set before first paint, in each page's <head>);
// the toggle switches and is remembered on this device.
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
  // the same hand-drawn dot as the tab icon and the back-to-top arrow, kept quiet until you hover
  modeBtn.insertAdjacentHTML('afterbegin', `<svg class="mode-blob" viewBox="0 0 64 64" aria-hidden="true"><path d="${DOT}"/></svg>`);
  labelMode();
  modeBtn.onclick = () => {
    const mode = currentMode() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('mode', mode); } catch {}
    setMode(mode);
  };
}


/* ---------- footer: "Say hi, in ___" cycles through greetings, resting on English ---------- */
// [hi, the language in its own words, lang code, script class]
const HELLOS = [
  ['ciao', 'italiano', 'it'], ['hola', 'español', 'es'], ['سلام', 'فارسی', 'fa', 'ar'], ['jambo', 'Kiswahili', 'sw'],
  ['xin chào', 'tiếng Việt', 'vi', 'vi'], ['salut', 'français', 'fr'], ['안녕', '한국어', 'ko', 'ko'], ['你好', '中文', 'zh', 'zh'],
  ['مرحبا', 'العربية', 'ar', 'ar'], ['hallo', 'Deutsch', 'de'], ['olá', 'português', 'pt'], ['merhaba', 'Türkçe', 'tr'],
];
const LAST = ['hi', 'English', 'en'];
const sayHi = document.getElementById('sayHi');
if (sayHi) {
  const word = sayHi.querySelector('.hi-word'), name = sayHi.querySelector('.hi-lang');
  const show = ([hi, lang, code, script = ''], ms) => {
    for (const [el, text] of [[word, hi], [name, lang]]) {
      el.innerHTML = `<bdi lang="${code}">${text}</bdi>`;
      el.className = el.className.split(' ')[0] + (script ? ` s-${script}` : '');
      el.style.animation = 'none'; void el.offsetWidth;
      el.style.animation = `hi-in ${ms}ms ease-out`;
    }
  };
  // A calm loop: one greeting at a time, a longer rest on English, then a new order.
  const STEP = 1600, REST = 6000;
  let queue = [], timer = null, visible = false;
  const next = () => {
    if (isScrolling()) { timer = setTimeout(next, 250); return; }   // wait until the page is still
    if (!queue.length) queue = [...HELLOS].sort(() => Math.random() - 0.5).concat([LAST]);
    const item = queue.shift();
    show(item, 450);
    timer = visible ? setTimeout(next, item === LAST ? REST : STEP) : null;
  };
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // only runs while the line is on screen; starts after a short rest on English
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      clearTimeout(timer);
      timer = visible ? setTimeout(next, 1200) : null;
    }, { threshold: .6 }).observe(sayHi);
  }
}

/* ---------- in-page nav links (like "Say hi"): show everything first, so nothing is still fading in on arrival ---------- */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href*="#"]');
  if (!a || new URL(a.href).pathname !== location.pathname) return;
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
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

/* ---------- a small cat peeks over the footer line when you reach the bottom ---------- */
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

/* ---------- email: assembled in the browser, so bots that read page code don't find the address ---------- */
document.querySelectorAll('[data-mail]').forEach(a => {
  const [user, domain] = a.dataset.mail.split('|');
  const address = `${user}@${domain}`;
  a.href = `mailto:${address}`;
  a.title = address;   // shows on hover, for people who use webmail
});

/* ---------- back to top: a hand-drawn arrow once you're well down a page (long pages and the home page) ---------- */
if (document.querySelector('.toc') || document.getElementById('vox')) {
  const btn = document.createElement('button');
  btn.className = 'to-top';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Back to top');
  // the same hand-drawn marker dot as the tab icon, in the theme color, with a bold arrow
  btn.innerHTML = `<svg viewBox="-4 -4 72 76" overflow="visible"><path d="${DOT}" transform="translate(0 4)" fill="rgba(0,0,0,.16)"/><path class="blob" d="${DOT}"/>`
    + '<path class="up" d="M32 45V20M21 30l11-11 11 11" fill="none" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  btn.onclick = () => scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  document.body.append(btn);
  // show it once the menu (or, on the home page, the hero) has scrolled away; lift it while the footer is on screen.
  // The browser reports those moments itself, so nothing runs on each scroll frame.
  const mark = document.querySelector('.toc') || document.getElementById('vox'), foot = document.querySelector('footer');
  new IntersectionObserver(([e]) => btn.classList.toggle('show', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(mark);
  if (foot) new IntersectionObserver(([e]) => btn.classList.toggle('lift', e.isIntersecting)).observe(foot);
}

/* ---------- hand-drawn marker: circles or underlines whatever is selected ----------
   One wobbly stroke, like a thick marker going around a word: it overshoots where it closes and is never quite even.
   Each item keeps its own wobble (seeded by its label), so it doesn't change shape on every redraw. */
const SVGNS = 'http://www.w3.org/2000/svg';
function seeded(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
}
// smooth curve through points (Catmull-Rom as cubic Béziers)
const smooth = pts => pts.reduce((d, p, i) => {
  if (!i) return `M${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  const p0 = pts[i - 2] || pts[i - 1], p1 = pts[i - 1], p3 = pts[i + 1] || p;
  const c1 = [p1[0] + (p[0] - p0[0]) / 6, p1[1] + (p[1] - p0[1]) / 6], c2 = [p[0] - (p3[0] - p1[0]) / 6, p[1] - (p3[1] - p1[1]) / 6];
  return `${d} C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
}, '');
function loopPath(w, h, pad, rnd, round = false) {
  // a rounded-rectangle-ish loop that starts top left, goes once around, and overshoots past where it began
  const cx = w / 2, cy = h / 2, rx = w / 2 + pad, ry = h / 2 + pad * .8;
  const start = Math.PI * (1.1 + rnd() * .15), sweep = Math.PI * 2 * (1.09 + rnd() * .05), n = 30;
  const ph = [rnd() * 6, rnd() * 6], drift = 2 + rnd() * 2.5;   // drift: the loop doesn't land back on itself
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = start + sweep * t;
    const c = Math.cos(a), s = Math.sin(a);
    const sq = p => Math.sign(p) * Math.abs(p) ** (round ? 1 : .62);   // a pill gets a squarer loop that hugs it; a dot gets a circle
    const wob = 1 + .025 * Math.sin(a * 2 + ph[0]) + .02 * Math.sin(a * 3 + ph[1]);
    pts.push([cx + rx * sq(c) * wob, cy + ry * sq(s) * wob - drift * t + drift / 2]);
  }
  return smooth(pts);
}
function underPath(w, h, rnd) {
  const y = h + 4, tilt = (rnd() - .5) * 3, pts = [];
  for (let i = 0; i <= 6; i++) { const t = i / 6; pts.push([-3 + (w + 8) * t, y + tilt * t + Math.sin(t * Math.PI) * (1 + rnd()) + (rnd() - .5) * .8]); }
  pts.push([w + 8, y + tilt - 3 - rnd() * 2]);   // the little flick up at the end
  return smooth(pts);
}
function drawMarker(el, shape) {
  el.querySelector(':scope > svg.marker')?.remove();
  const w = el.offsetWidth, h = el.offsetHeight;
  if (!w || !h) return;
  const rnd = seeded(el.textContent + el.dataset.t + shape), pad = shape === 'ring' ? 5 : 6, m = 14;
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('class', `marker ${shape}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('viewBox', `${-m} ${-m} ${w + m * 2} ${h + m * 2}`);
  Object.assign(svg.style, { left: `${-m}px`, top: `${-m}px`, width: `${w + m * 2}px`, height: `${h + m * 2}px` });
  const path = document.createElementNS(SVGNS, 'path');
  path.setAttribute('d', shape === 'under' ? underPath(w, h, rnd) : loopPath(w, h, pad, rnd, shape === 'ring'));
  svg.append(path);
  el.append(svg);
  return path;
}
// Keeps a marker on the selected item inside `container`. `selector` finds the selected one, e.g. '[aria-selected="true"]'.
export function markSelected(container, selector, shape = 'loop') {
  if (!container) return;
  let current = null, drawn = '';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const update = (animate) => {
    const el = container.querySelector(selector);
    const key = el && `${el.offsetWidth}x${el.offsetHeight}`;
    if (el === current && key === drawn) return;
    if (current && current !== el) current.querySelector(':scope > svg.marker')?.remove();
    current = el; drawn = key;
    if (!el) return;
    const path = drawMarker(el, shape);
    if (path && animate && !reduce) {   // drawn in, like a quick stroke of the pen
      const len = path.getTotalLength();
      path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
      path.getBoundingClientRect();
      path.style.transition = 'stroke-dashoffset .38s cubic-bezier(.4, 0, .2, 1)';
      path.style.strokeDashoffset = 0;
    }
  };
  // fonts arriving or the window resizing changes the item's size, so redraw to fit
  const ro = new ResizeObserver(() => update(false));
  new MutationObserver(() => { update(true); if (current) ro.observe(current); }).observe(container, { subtree: true, attributes: true, attributeFilter: ['aria-selected', 'aria-pressed'] });
  update(false);
  if (current) ro.observe(current);
  document.fonts?.ready.then(() => update(false));
}
