// Makes the link-preview card for each project (assets/og/<project>.png): its name and one-line description from the home page,
// next to the picture from the top of its page. Needs the site running at localhost:4399 (python3 -m http.server 4399).
// Run: node tools/preview-cards.mjs assets/og            (or add a project name to redo just that one)
import { chromium } from '/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright-core/index.mjs';
import fs from 'fs';
const B = 'http://localhost:4399', OUT = process.argv[2];
const DOT = fs.readFileSync(process.env.HOME + '/Developer/chris-site/assets/site.js', 'utf8').match(/const DOT = '([^']+)'/)[1];
const b = await chromium.launch();
const home = await b.newPage(); await home.goto(B + '/', { waitUntil: 'networkidle' });
const rows = await home.evaluate(() => [...document.querySelectorAll('#projects .item')].map(a => ({ href: new URL(a.href).pathname, t: a.querySelector('.t').textContent.trim(), m: a.querySelector('.m').textContent.trim() })));
const shotPage = await b.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 2 });
await shotPage.addInitScript(() => { try { sessionStorage.setItem('mode', 'light'); } catch {} });
const card = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const r of rows.filter(x => !process.argv[3] || x.href.includes(process.argv[3]))) {
  const slug = r.href.split('/').filter(Boolean).pop();
  await shotPage.goto(B + r.href, { waitUntil: 'networkidle' }); await shotPage.waitForTimeout(1200);
  await shotPage.evaluate(() => { document.querySelectorAll('.play-clip').forEach(x => x.remove()); document.querySelectorAll('video').forEach(v => { v.pause(); v.currentTime = (v.duration || 4) * .82; }); });
  await shotPage.waitForTimeout(800);
  const isPair = await shotPage.locator('.case-hero .shot').first().evaluate(e => e.classList.contains('pair'));
  const target = slug === 'weather-dots' ? shotPage.locator('.shot-inline img').first() : isPair ? shotPage.locator('.case-hero .shot').first() : shotPage.locator('.case-hero .shot > :not(.play-clip):not(figcaption)').first();
  const img = slug === 'weather-dots' ? fs.readFileSync(process.env.HOME + '/Developer/chris-site/assets/weather-dots-stripes-centered.jpg').toString('base64') : (await target.screenshot({ omitBackground: true })).toString('base64');
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  await card.setContent(`<style>html,body{margin:0;width:1200px;height:630px;background:#faf8f4;overflow:hidden}
    .t{position:absolute;left:90px;top:0;bottom:0;width:470px;display:flex;flex-direction:column;justify-content:center}
    h1{font:600 72px/1.05 "Iowan Old Style",Georgia,serif;color:#282826;letter-spacing:-.02em;margin:0}
    p{font:400 28px/1.4 "Iowan Old Style",Georgia,serif;color:#6b6b67;margin:20px 0 0}
    .by{font:italic 400 22px/1 "Iowan Old Style",Georgia,serif;color:#8a8984;margin-top:34px;display:flex;align-items:center;gap:10px}
    .by svg{width:18px;height:18px}
    .i{position:absolute;right:70px;top:60px;bottom:60px;width:540px;display:flex;align-items:center;justify-content:center}
    .i img{max-width:100%;max-height:100%;border-radius:10px;box-shadow:0 0 0 1px rgba(0,0,0,.07),0 20px 50px -24px rgba(0,0,0,.35)}</style>
    <div class="t"><h1>${esc(r.t)}</h1><p>${esc(r.m)}</p><div class="by"><svg viewBox="0 0 64 64"><path d="${DOT}" fill="#5a55c9"/></svg>Chris Truong</div></div>
    <div class="i"><img src="data:image/${slug === 'weather-dots' ? 'jpeg' : 'png'};base64,${img}"></div>`);
  await card.waitForTimeout(300);
  await card.screenshot({ path: `${OUT}/${slug}.png` });
  console.log(slug, '✓');
}
await b.close();
