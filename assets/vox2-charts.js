/* The two testing graphics on the Vox2 page, made interactive.
   Both draw in var(--accent), so they follow the theme picker. Without JS the static versions stay. */

import { markSelected } from '/assets/site.js?v=20261006085202';

/* ---------- the ladder: click a level to see what it would show you for one real kind of mistake ---------- */
// The example: "I can't make it to dinner tonight" → Spanish, with the "not" dropped (meaning reversed).
const LEVELS = [
  { out: 'Puedo ir a la cena esta noche.', back: null,
    verdict: 'What most translation apps give you: a translation and nothing else. It looks fine, so you’d send it, and they’d expect you at dinner.' },
  { out: 'Puedo ir a la cena esta noche.', back: 'I can make it to dinner tonight.', badge: ['high', '96% match'],
    verdict: 'Translate it back and compare meanings. Where Vox2 started. Almost every word came back, so the score looks great, even though the meaning flipped.' },
  { out: 'Puedo ir a la cena esta noche.', back: 'I <u>can</u> make it to dinner tonight.', badge: ['low', 'a “not” went missing'],
    verdict: 'Where Vox2 is now. Checks for the classic mistakes (a flipped “not”, a changed number, a swapped pronoun, text that never got translated) catch it and flag the word behind it.' },
  { out: 'Puedo ir a la cena esta noche.', back: 'I <u>can</u> make it to dinner tonight.', badge: ['low', '2 engines agree: meaning flipped'],
    verdict: 'Next: a second engine reads it back too, so one engine can’t agree with its own mistake, plus an optional AI double-check and every changed word highlighted.' },
  { out: 'Puedo ir a la cena esta noche.', back: 'I <u>can</u> make it to dinner tonight.', badge: ['low', 'a “not” went missing'],
    fix: { out: '<b>No</b> puedo ir a la cena esta noche.', back: 'I can’t make it to dinner tonight.', badge: ['high', 'fix checked · 100% match'] },
    verdict: 'Next after that: a suggested fix, offered only after it passes the same check. You see the proof, and one tap uses it. Nothing is swapped in behind your back.' },
  { out: 'Puedo ir a la cena esta noche.', back: 'I <u>can</u> make it to dinner tonight.', badge: ['low', 'major · meaning reversed'],
    fix: { out: '<b>No</b> puedo ir a la cena esta noche.', back: 'I can’t make it to dinner tonight.', badge: ['high', 'fix checked · 100% match'] },
    verdict: 'The goal: everything above, held to research standards. Errors labeled by type and severity the way professional reviewers grade translations, fixes checked the same way, and the whole system measured on the same test sets as research systems like xCOMET and CometKiwi, while staying small enough to run on a laptop.' },
];

const ladder = document.querySelector('.ladder');
if (ladder) {
  const items = [...ladder.querySelectorAll('li')];
  const demo = document.createElement('div');
  demo.className = 'ladder-demo';
  demo.setAttribute('aria-live', 'polite');
  ladder.append(demo);
  const show = i => {
    items.forEach((li, j) => li.setAttribute('aria-pressed', j === i));
    const L = LEVELS[i];
    demo.innerHTML = `<div class="ld-you"><span>you typed</span>I can’t make it to dinner tonight.</div>
      <div class="ld-box"><div class="ld-lang">Spanish</div><div class="ld-out">${L.out}</div>${
        L.back ? `<div class="ld-back">↩ ${L.back}${L.badge ? ` <i class="ld-badge ${L.badge[0]}">${L.badge[1]}</i>` : ''}</div>` : ''}</div>${
        L.fix ? `<div class="ld-box ld-fix"><div class="ld-lang">suggested fix</div><div class="ld-out">${L.fix.out}</div><div class="ld-back">↩ ${L.fix.back} <i class="ld-badge ${L.fix.badge[0]}">${L.fix.badge[1]}</i></div></div>` : ''}
      <p class="ld-verdict">${L.verdict}</p>`;
  };
  items.forEach((li, i) => {
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.addEventListener('click', () => show(i));
    li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); } });
  });
  ladder.classList.add('live');
  show(items.findIndex(li => li.classList.contains('here')));
  markSelected(ladder.querySelector('ol'), 'li[aria-pressed="true"] b', 'under');   // a hand-drawn underline on the step you're looking at
}

/* ---------- the chart: three measures across the test runs, with details on each point ---------- */
const RUNS = [
  { name: 'run 1', when: 'Oct 3', note: 'Baseline: the match score alone. 40 sentences × 11 languages, mistakes planted on purpose.' },
  { name: 'run 2', when: 'Oct 3', note: 'Targeted checks added (negations, numbers, pronouns, opposites). 80 sentences it had never seen.' },
  { name: 'run 3', when: 'Oct 3', note: 'Fewer false alarms, more opposite word pairs. A fresh set of 80 never-seen sentences.' },
  { name: 'phase 1.2', when: 'Oct 4', note: 'Numbers written differently, more “not” words, inclusive pronouns. Re-scored on runs 2–3, which had already been read, so a little flattering.' },
  { name: 'run 5', when: 'Oct 4', note: 'Fresh sentences nobody had seen, plus a new mistake to catch (a gender you didn’t write). The honest number.' },
];
const MEASURES = {
  caught: { label: 'errors caught', values: [29, 78, 78, 79, 70], min: 0, max: 100, good: 'higher is better', fmt: v => `${v}%` },
  alarms: { label: 'false alarms', values: [4, 7, 5, 4.1, 6.9], min: 0, max: 10, good: 'lower is better', fmt: v => `${v}%` },
  kept:   { label: 'good kept', values: [93, 91, 93, 94, 91], min: 80, max: 100, good: 'higher is better', fmt: v => `${v}%` },
};

const trend = document.querySelector('.trend');
if (trend) {
  const svg = trend.querySelector('svg');
  const X = [60, 140, 220, 300, 380], TOP = 30, BOT = 180;
  const yOf = (m, v) => BOT - (v - m.min) / (m.max - m.min) * (BOT - TOP);

  // tabs above the chart
  const tabs = document.createElement('div');
  tabs.className = 'trend-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.innerHTML = Object.entries(MEASURES).map(([k, m]) => `<button role="tab" data-m="${k}">${m.label}</button>`).join('');
  svg.before(tabs);
  const hint = document.createElement('span');
  hint.className = 'trend-good';
  tabs.append(hint);

  // the tooltip
  const tip = document.createElement('div');
  tip.className = 'trend-tip';
  trend.style.position = 'relative';
  trend.append(tip);

  const line = svg.querySelector('.line'), area = svg.querySelector('.area');
  const pts = [...svg.querySelectorAll('.pts circle')], vals = [...svg.querySelectorAll('.vals text')];
  const axis = [...svg.querySelectorAll('.axis text')];
  let current = 'caught', ys = X.map((_, i) => yOf(MEASURES.caught, MEASURES.caught.values[i])), anim;

  const draw = (yy, m) => {
    const d = X.map((x, i) => `${i ? 'L' : 'M'}${x} ${yy[i].toFixed(1)}`).join(' ');
    line.setAttribute('d', d);
    area.setAttribute('d', `${d} L${X.at(-1)} ${BOT} L${X[0]} ${BOT} Z`);
    pts.forEach((c, i) => c.setAttribute('cy', yy[i]));
    hits.forEach((c, i) => c.setAttribute('cy', yy[i]));
    vals.forEach((t, i) => t.setAttribute('y', yy[i] - 12));
  };
  const select = key => {
    const m = MEASURES[key];
    current = key;
    tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', b.dataset.m === key));
    hint.textContent = m.good;
    axis[0].textContent = `${m.max}%`; axis[1].textContent = `${(m.max + m.min) / 2}%`; axis[2].textContent = `${m.min}%`;
    svg.setAttribute('aria-label', `${m.label}: ` + RUNS.map((r, i) => `${r.name} ${m.fmt(m.values[i])}`).join(', '));
    vals.forEach((t, i) => { t.textContent = m.fmt(m.values[i]); });
    // glide from the old line to the new one (or jump straight there if the tab isn't visible)
    const from = ys.slice(), to = X.map((_, i) => yOf(m, m.values[i])), t0 = performance.now();
    cancelAnimationFrame(anim);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden;
    if (reduce) { ys = to; draw(ys, m); return; }
    const step = now => {
      const p = reduce ? 1 : Math.min(1, (now - t0) / 450), e = 1 - (1 - p) ** 3;
      ys = from.map((f, i) => f + (to[i] - f) * e);
      draw(ys, m);
      if (p < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
    tip.classList.remove('show');
  };
  tabs.addEventListener('click', e => { const b = e.target.closest('button[data-m]'); if (b) select(b.dataset.m); });

  // details on hover, tap or keyboard focus
  const showTip = i => {
    const m = MEASURES[current], r = RUNS[i];
    pts.forEach((c, j) => c.classList.toggle('on', j === i));
    tip.innerHTML = `<b>${r.name} · ${r.when}</b><span class="v">${m.label}: ${m.fmt(m.values[i])}</span>${r.note}`;
    const box = svg.getBoundingClientRect(), host = trend.getBoundingClientRect();
    const px = box.left - host.left + X[i] / 420 * box.width, py = box.top - host.top + ys[i] / 230 * box.height;
    tip.style.left = `${Math.max(0, Math.min(px - 120, host.width - 240))}px`;
    tip.style.top = `${py + 14}px`;
    tip.classList.add('show');
  };
  const hideTip = () => { tip.classList.remove('show'); pts.forEach(c => c.classList.remove('on')); };
  // each point gets an invisible larger circle on top, so it's easy to tap (44pt, per Apple's guidelines)
  // in their own group, so the dots' styles (fill, stroke, hover size) never touch them
  const hitLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  hitLayer.setAttribute('class', 'hits');
  svg.append(hitLayer);
  const hits = pts.map(c => {
    const h = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    h.setAttribute('cx', c.getAttribute('cx')); h.setAttribute('cy', c.getAttribute('cy')); h.setAttribute('r', 15);
    h.setAttribute('fill', 'transparent'); h.setAttribute('aria-hidden', 'true'); h.style.cursor = 'pointer';
    hitLayer.append(h);
    return h;
  });
  hits.forEach((h, i) => {
    h.addEventListener('mouseenter', () => showTip(i));
    h.addEventListener('click', () => showTip(i));
    h.addEventListener('mouseleave', hideTip);
  });
  pts.forEach((c, i) => {
    c.setAttribute('tabindex', '0');
    c.setAttribute('role', 'button');
    c.setAttribute('aria-label', RUNS[i].name);
    c.addEventListener('mouseenter', () => showTip(i));
    c.addEventListener('focus', () => showTip(i));
    c.addEventListener('click', () => showTip(i));
    c.addEventListener('mouseleave', hideTip);
    c.addEventListener('blur', hideTip);
  });
  trend.classList.add('live');
  select('caught');
  markSelected(tabs, 'button[aria-selected="true"]', 'loop');   // circled by hand, like picking one off a list
}
