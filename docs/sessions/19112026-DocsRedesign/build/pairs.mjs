import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pw from 'playwright';

/*
 * Builds the pairs of AC-01: for each of the twelve examples, the card of the mock (`E1` to `E12` of
 * `concepts-v2.html`) beside the built stage, with the frame of the site in each theme. Run from the repository
 * root with a dev server of the site running:
 *
 *   BASE=http://localhost:5173/ecmact OUT=docs/sessions/19112026-DocsRedesign/captures/pairs node docs/sessions/19112026-DocsRedesign/build/pairs.mjs
 *
 * Environment: BASE (address of the site, with its base path), OUT (folder for the sheets), WIDTH (viewport,
 * default 1280), MOCK (path of the mock, default `../concepts-v2.html` beside this script).
 */
const BASE = process.env.BASE ?? 'http://localhost:5173/ecmact';
const OUT = process.env.OUT ?? './pairs';
const WIDTH = Number(process.env.WIDTH ?? 1280);
const here = path.dirname(fileURLToPath(import.meta.url));
const MOCK = process.env.MOCK ?? path.resolve(here, '../concepts-v2.html');
const ids = [
  'exposure',
  'setlist',
  'typecase',
  'fieldbook',
  'switchboard',
  'customs',
  'catalog',
  'departures',
  'darkroom',
  'gels',
  'seedpacket',
  'atlas',
];
const titles = {
  exposure: 'Exposure triangle',
  setlist: 'Setlist for tonight',
  fieldbook: 'Field notebook',
  typecase: 'Wood-type poster',
  customs: 'Customs declaration',
  gels: 'Lighting plot',
  switchboard: 'Telephone exchange',
  catalog: 'Library card catalogue',
  departures: 'Ferry departures',
  darkroom: 'Darkroom trays',
  seedpacket: 'Seed packet',
  atlas: 'Pocket atlas',
};

fs.mkdirSync(OUT, { recursive: true });
const browser = await pw.chromium.launch();
const shot = (buf) => `data:image/png;base64,${buf.toString('base64')}`;

// the cards of the mock, once
const mockCtx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
});
const mock = await mockCtx.newPage();
await mock.goto(`file://${MOCK}`);
const cards = {};
for (const id of ids) cards[id] = await mock.locator(`figure.piece#${id} .stage`).screenshot();
await mockCtx.close();

const built = { light: {}, dark: {} };
const locked = { light: {}, dark: {} };
for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({
    viewport: { width: WIDTH, height: 900 },
    colorScheme: theme,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/examples`);
  await page.waitForSelector('.stage');
  await page.evaluate((t) => {
    document.documentElement.dataset.theme = t;
  }, theme);
  await page.addStyleTag({ content: '*{scroll-behavior:auto!important}' });
  await page.waitForTimeout(800);
  for (const id of ids) {
    const section = page.locator(`section.demo[aria-label="${titles[id]}"]`);
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    built[theme][id] = await section.locator('.stage').screenshot({ animations: 'disabled' });
    if (id === 'exposure') {
      // the start state shows the off track of the lock; the second capture shows it switched on
      await section.locator('.stage').evaluate((stage) => {
        const walk = (root) => {
          for (const element of root.querySelectorAll('*')) {
            if (element.matches('button.lock')) return element;
            const found = element.shadowRoot && walk(element.shadowRoot);
            if (found) return found;
          }
          return null;
        };
        const host = stage.firstElementChild;
        walk(host.shadowRoot ?? host)?.click();
      });
      await page.waitForTimeout(400);
      locked[theme][id] = await section.locator('.stage').screenshot({ animations: 'disabled' });
    }
  }
  await ctx.close();
}

const sheet = await browser.newContext({
  viewport: { width: 1600, height: 600 },
  deviceScaleFactor: 1,
});
const out = await sheet.newPage();
for (const [n, id] of ids.entries()) {
  const row = (theme) =>
    `<div class="row"><figure><img src="${shot(cards[id])}"><figcaption>E${n + 1} ${id} - card of the mock</figcaption></figure><figure><img src="${shot(built[theme][id])}"><figcaption>built, frame ${theme}</figcaption></figure>${locked[theme][id] ? `<figure><img src="${shot(locked[theme][id])}"><figcaption>built, frame ${theme}, lock on</figcaption></figure>` : ''}</div>`;
  await out.setContent(
    `<style>body{margin:0;padding:16px;background:#888;font:13px system-ui;color:#fff}.row{display:flex;gap:16px;align-items:flex-start;margin-bottom:16px}figure{margin:0;flex:1 1 0;min-width:0}img{display:block;max-width:100%;height:auto}figcaption{padding:4px 0}</style>${row('light')}${row('dark')}`,
  );
  await out.waitForTimeout(100);
  await out.screenshot({
    path: path.join(OUT, `${String(n + 1).padStart(2, '0')}-${id}.png`),
    fullPage: true,
  });
}
await browser.close();
console.log('sheets', ids.length, 'in', OUT);
