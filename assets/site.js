/* Shared by every page: theme and page colors, the light/dark switch, scroll reveals, the highlight bubble, the footer, the full-size viewer. */

// Chris's call (2026-10-06): the site animates for everyone, even with the phone's Reduce Motion setting on.
// To respect that setting again, set this back to: matchMedia('(prefers-reduced-motion: reduce)').matches
export const REDUCE_MOTION = false;

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

// Colors the Vox2 parts of a page (--v-*) and the page accent. `surface` is which theme color the
// page shows big ('bg' for the hero window, 'main' for the Vox2 card); "Truong" in the nav matches it.
// Light mode keeps one site color whatever the Vox2 theme: an iris that sits between the Vox2 blue and the navy dark mode.
const SITE_ACCENT_L = '#5a55c9', SITE_ACCENT_D = '#a29ff2';   // the same iris, lifted for the dark green page
export let currentVoxTheme = SITE_THEMES[0];   // the theme on screen right now
export function applyVoxTheme(name, surface = 'bg') {
  currentVoxTheme = name;
  const [bg, main, sub, line, text, accent] = THEMES[name];
  const s = document.documentElement.style;
  s.setProperty('--v-bg', bg); s.setProperty('--v-main', main); s.setProperty('--v-sub', sub);
  s.setProperty('--v-line', line); s.setProperty('--v-text', text);
  s.setProperty('--v-on-main', onMain(name));
  // One site color in both modes: iris (the Vox2 theme only colors the Vox2 parts)
  // On the dark page, the theme's bright color carries the accent instead (Sweden: yellow, not blue):
  // a deep hue on navy only scrapes past 3:1 and looks dim, while the bright one glows at 6–11:1.
  const nameL = SITE_ACCENT_L, nameD = SITE_ACCENT_D;
  // text inside a selection: white or near-black, whichever reads better on that color
  const ink = c => (contrast(c, '#ffffff') >= contrast(c, '#131214') ? '#ffffff' : '#131214');
  setPageColors({ '--name-l': nameL, '--name-d': nameD, '--sel-ink-l': ink(nameL), '--sel-ink-d': ink(nameD) });
  setFavicon(nameL);
  document.querySelectorAll('[data-t]').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === name));
}
// Each theme has its own recording of the real app (a different language in each).
// The demo clips are short muted videos (much lighter than GIFs, and played by the graphics chip).
// With reduced motion on, they stay still (each has a poster image, so there's always a picture),
// and tapping a clip plays or pauses it. That also covers phones that block autoplay, like iPhones in Low Power Mode.
const stillClips = REDUCE_MOTION;
// a small play button over the first frame, shown whenever a clip is sitting still (reduced motion, or a phone that won't autoplay)
function playButton(v) {
  const holder = v.parentElement;
  if (!holder || holder.querySelector('.play-clip')) return;
  holder.classList.add('has-play');
  const b = Object.assign(document.createElement('button'), { type: 'button', className: 'play-clip', textContent: '▶ play' });
  b.setAttribute('aria-label', 'Play the clip');
  b.onclick = () => v.play().catch(() => {});
  const sync = () => { b.hidden = !v.paused; };
  v.addEventListener('play', sync); v.addEventListener('pause', sync);
  holder.append(b); sync();
}
document.querySelectorAll('video[autoplay]').forEach(v => {
  v.addEventListener('click', () => (v.paused ? v.play().catch(() => {}) : v.pause()));
  if (stillClips) { v.removeAttribute('autoplay'); v.pause(); playButton(v); }
  // some browsers skip the autoplay attribute; asking directly works for muted clips.
  // If a browser still says no (an iPhone in Low Power Mode), show the play button, and start on the first tap, click or key.
  else v.play().catch(() => {
    playButton(v);
    const go = () => { v.play().catch(() => {}); ['pointerdown', 'keydown', 'touchstart'].forEach(t => removeEventListener(t, go)); };
    ['pointerdown', 'keydown', 'touchstart'].forEach(t => addEventListener(t, go, { passive: true }));
  });
});
export function showVoxShot(name) {
  // swap the poster with the clip, so the new theme shows at once even if the phone won't autoplay
  document.querySelectorAll('[data-vox-shot]').forEach(v => { v.poster = `/assets/vox2/${name}.jpg`; v.src = `/assets/vox2/${name}.mp4`; if (!stillClips) v.play?.().catch(() => {}); });
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
const DOT = 'M58.2 23.4C60.9 29.0 61.0 35.8 58.4 41.4C56.2 46.2 53.8 48.2 50.4 50.6C46.6 53.2 39.2 56.4 33.3 56.7C27.4 56.9 20.0 54.4 15.4 51.5C10.9 48.5 7.7 42.8 5.9 38.9C4.2 35.0 2.8 32.4 4.7 28.2C6.5 23.9 12.2 16.9 17.1 13.2C22.0 9.6 28.6 6.5 34.0 6.2C39.3 5.9 45.0 8.4 49.0 11.3C53.0 14.1 56.6 18.0 58.2 23.4Z';
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
  if (c) { Object.assign(c, { '--name-l': SITE_ACCENT_L, '--sel-ink-l': '#ffffff', '--name-d': SITE_ACCENT_D, '--sel-ink-d': '#131214' }); setPageColors(c); setFavicon(SITE_ACCENT_L); }
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
  if (document.startViewTransition && !REDUCE_MOTION) {
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
    try { sessionStorage.setItem('mode', mode); } catch {}   // for this visit; next time, the time of day decides again
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
  if (!REDUCE_MOTION) {
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
  fa: 'فارسی', de: 'Deutsch', it: 'italiano', pt: 'português', tr: 'Türkçe', sw: 'Kiswahili', tl: 'Tagalog', hi: 'हिन्दी', ur: 'اردو', en: 'English' };
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
    out.dir = ['ar', 'fa', 'ur'].includes(hlLang) ? 'rtl' : 'auto';
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
  // longer passages get a wider bubble (the text scrolls inside it)
  const wide = hlText.length > 220;
  bubble.classList.toggle('wide', wide);
  const bw = Math.min(wide ? 460 : 320, innerWidth - 24);
  // just below where the selection ends (its last line), kept on screen; above that line if there's no room
  const rects = range.getClientRects(), r = rects[rects.length - 1] || range.getBoundingClientRect();
  bubble.style.left = `${Math.max(12, Math.min(r.left, innerWidth - bw - 12))}px`;
  bubble.style.top = r.bottom + 200 < innerHeight ? `${r.bottom + 10}px` : `${Math.max(12, r.top - 210)}px`;
  bubble.classList.add('show');
  bubbleY = scrollY;
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
    if (!where || where.closest('.vox, .hl-bubble, input, textarea, select') || text.length > 4500 || text === hlText) return;
    hlText = text;
    showBubble(sel.getRangeAt(0));
  }, 350);
});
// close it once the page has really scrolled away, not on a trackpad's little bounce at the top or bottom
let bubbleY = 0;
addEventListener('scroll', () => { if (bubble?.classList.contains('show') && Math.abs(scrollY - bubbleY) > 80) hideBubble(); }, { passive: true });
addEventListener('keydown', e => { if (e.key === 'Escape') hideBubble(); });

/* ---------- email: assembled in the browser, so bots that read page code don't find the address ---------- */
document.querySelectorAll('[data-mail]').forEach(a => {
  const [user, domain] = a.dataset.mail.split('|');
  const address = `${user}@${domain}`;
  a.href = `mailto:${address}`;
  a.title = address;   // shows on hover, for people who use webmail
});

/* ---------- back to top: a hand-drawn arrow once you're well down a page (every page; on short ones it never shows) ---------- */
const topMark = ['.toc', '.case-hero', 'main > :first-child'].map(s => document.querySelector(s)).find(Boolean);
if (topMark) {
  const btn = document.createElement('button');
  btn.className = 'to-top';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Back to top');
  // the same hand-drawn marker dot as the tab icon, in the theme color, with a bold arrow
  btn.innerHTML = `<svg viewBox="-4 -4 72 76" overflow="visible"><path d="${DOT}" transform="translate(0 4)" fill="rgba(0,0,0,.16)"/><path class="blob" d="${DOT}"/>`
    + '<path class="up" d="M32 45V20M21 30l11-11 11 11" fill="none" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  btn.onclick = () => scrollTo({ top: 0, behavior: REDUCE_MOTION ? 'auto' : 'smooth' });
  document.body.append(btn);
  // show it once the menu (or, on the home page, the hero) has scrolled away; lift it while the footer is on screen.
  // The browser reports those moments itself, so nothing runs on each scroll frame.
  const mark = topMark, foot = document.querySelector('footer');
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
  const reduce = REDUCE_MOTION;
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

/* ---------- footer: the time where I live, like a postmark ---------- */
const footSmall = document.querySelector('footer small');
if (footSmall) {
  const fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' });
  // the time, then a small ovenbird beside it (a few gray lines, like a doodle in the margin).
  // It keeps Baltimore hours: asleep from 11pm to 7am, awake the rest of the day.
  footSmall.innerHTML = '<span class="pm-time"></span><a class="bird-link" href="https://www.allaboutbirds.org/guide/Ovenbird" target="_blank" rel="noopener" aria-label="Ovenbird, on All About Birds" title="Ovenbird"><svg class="doodle" viewBox="2 5 26 17" aria-hidden="true">'
    + '<g class="bob"><path class="breath" d="M6 10.4C6.6 7.6 9 6.2 11.4 6.6 13.6 7 14.8 8.6 15.6 9.8 18 9.6 21 10 23.4 9.2L27.4 6.4 25.4 11.2C24.4 15.8 20 18.6 14.8 18.6 10 18.6 6.6 16.4 6 12.6"/>'
    + '<path d="M6 10.4 2.4 11.5 6 12.6"/><path class="crown" d="M8.4 7.2Q11 5.9 13.8 7.7"/>'
    + '<g class="open"><circle cx="9.7" cy="9.9" r="1.45"/><circle class="pupil" cx="9.7" cy="9.9" r=".6"/></g><path class="shut" d="M8.3 10q1.4.9 2.8 0"/>'
    + '<path class="streak" d="M8.4 14.1l.7.6M10.6 15.3l.7.6M8.8 16.4l.7.6M12.8 16.3l.7.6M11.4 13.6l.6.5"/><path d="M14.6 12.4Q18.4 15.6 23 12"/></g>'
    + '<path d="M12.4 18.6l-.5 2.7M15.6 18.4l.3 2.8"/>'
    + '<text class="z" x="10" y="5">z</text><text class="z z2" x="12" y="3">z</text><text class="z z3" x="14" y="1">z</text></svg></a>';
  const timeEl = footSmall.querySelector('.pm-time'), bird = footSmall.querySelector('.doodle');
  const hourFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: 'America/New_York' });
  const tick = () => {
    const now = new Date(), h = +hourFmt.format(now);
    timeEl.textContent = `${fmt.format(now).replace(' ', '').toLowerCase()} in Baltimore, Maryland`;
    bird.classList.toggle('asleep', h >= 23 || h < 7);
  };
  tick(); setInterval(tick, 30000);
}

/* ---------- "Updated" date: when this page was last published ---------- */
const updated = document.getElementById('updated');
if (updated) {
  const d = new Date(document.lastModified);
  // a freshly loaded local file reports "now"; only trust a date that isn't in the future
  if (!isNaN(d) && d <= new Date()) updated.textContent = 'Updated ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ---------- small animated figures: play only while on screen ---------- */
const figs = document.querySelectorAll('.fx');
if (figs.length) {
  const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('play', e.isIntersecting)), { threshold: .3 });
  figs.forEach(f => io.observe(f));
}

/* ---------- tap an image marked data-full to see it at full size over a darkened page ----------
   With more than one on the page, ← and → (or the arrow buttons) step through them in order. */
const zoomables = [...document.querySelectorAll('img[data-full]')];
if (zoomables.length) {
  const many = zoomables.length > 1;
  const box = document.createElement('dialog');
  box.className = 'zoombox';
  box.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure><button type="button" class="lb-close" aria-label="Close">×</button>'
    + (many ? '<button type="button" class="zb-step prev" aria-label="Previous picture">←</button><button type="button" class="zb-step next" aria-label="Next picture">→</button>' : '');
  document.body.append(box);
  const big = box.querySelector('img'), cap = box.querySelector('figcaption');
  let at = 0;
  const show = i => {
    at = (i + zoomables.length) % zoomables.length;
    const img = zoomables[at];
    big.src = img.currentSrc || img.src;                     // the small one shows at once…
    big.alt = img.alt;
    const full = new Image();                                  // …then the full one swaps in when it's loaded
    full.onload = () => { if (box.open && zoomables[at] === img) big.src = img.dataset.full; };
    full.src = img.dataset.full;
    const words = img.dataset.caption || img.closest('figure')?.querySelector('figcaption')?.textContent.trim() || '';
    cap.textContent = many ? (words ? `${words} · ` : '') + `${at + 1} / ${zoomables.length}` : words;
    // warm up the neighbours so stepping feels instant
    if (many) [at + 1, at - 1].forEach(k => { new Image().src = zoomables[(k + zoomables.length) % zoomables.length].dataset.full; });
  };
  box.addEventListener('click', e => { if (!e.target.closest('.zb-step')) box.close(); });   // anywhere else closes it, picture included
  box.querySelectorAll('.zb-step').forEach(b => b.addEventListener('click', () => show(at + (b.classList.contains('next') ? 1 : -1))));
  box.addEventListener('keydown', e => {
    if (!many) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); show(at + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(at - 1); }
  });
  box.addEventListener('close', () => { big.removeAttribute('src'); zoomables[at]?.focus({ preventScroll: true }); });
  zoomables.forEach((img, i) => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', (img.alt ? img.alt + '. ' : '') + 'Open full size');
    const open = () => { show(i); box.showModal(); };
    img.addEventListener('click', open);
    img.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
}


/* ---------- project pages: a quiet list of sections in the left margin (like benji.org) ----------
   Built from each page's section labels; the one you're reading darkens; only on wide screens (CSS). */
const chapters = [...document.querySelectorAll('.chapter')].filter(c => c.querySelector('.num'));
const projectTitle = document.querySelector('.case-hero h1');
if (chapters.length > 1 && projectTitle) {
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const aside = document.createElement('aside');
  aside.className = 'sections'; aside.setAttribute('aria-label', 'On this page');
  const items = chapters.map(c => { const label = c.querySelector('.num').textContent.trim(); if (!c.id) c.id = slug(label); return `<li><a href="#${c.id}">${label}</a></li>`; }).join('');
  aside.innerHTML = `<a class="sec-back" href="/#projects"><span aria-hidden="true">↩</span> Index</a><a class="sec-title" href="#top">${projectTitle.textContent.trim()}</a><ol>${items}</ol>`;
  document.body.append(aside);
  const links = [...aside.querySelectorAll('ol a')];
  const mark = () => {
    const line = innerHeight * 0.35; let cur = -1;
    chapters.forEach((c, i) => { if (c.getBoundingClientRect().top <= line) cur = i; });
    links.forEach((a, i) => a.toggleAttribute('aria-current', i === cur));
    aside.classList.toggle('at-top', cur < 0);
  };
  addEventListener('scroll', mark, { passive: true }); addEventListener('resize', mark); mark();
  aside.querySelector('.sec-title').addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: REDUCE_MOTION ? 'auto' : 'smooth' }); });
}
