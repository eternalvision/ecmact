import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pw from 'playwright';
import { CONTROLS, SWITCHES, contrast, focusStops, gather } from './measure.mjs';

/*
 * Measures and captures the five widgets of the gallery in a browser. Run from the repository root with a dev
 * server of the site running (it serves the widget bundle from source at `/embed/ecmact-widgets.js`):
 *
 *   BASE=http://localhost:5173/ecmact OUT=./out ENGINES=chromium,firefox,webkit node docs/sessions/19112026-DocsRedesign/build/widgets.mjs
 *
 * Environment: BASE (address of the site, with its base path), OUT (folder for captures and report.json),
 * ENGINES, ONLY (tags of widgets), REDUCED=1 (prefers-reduced-motion: reduce), SHOTS=1 (a capture of every
 * state), SHEETS=1 (instead of measuring: one sheet of each widget beside its card of `concepts-v2.html`, and
 * one sheet of the five side by side), BLOCK=1 (requests to other origins are refused), MOCK (path of the
 * mock, default `../concepts-v2.html` beside this script).
 *
 * The widget is put on a page of the site that loads the bundle and has no stylesheet of its own (the host
 * `cafe`, with its styles removed), inside a stage the width of the viewport, and measured with the same
 * functions as the examples (`measure.mjs`): overflow, target size, text contrast, the focus ring of every Tab
 * stop and, with REDUCED, the animations that still run.
 */
const BASE = process.env.BASE ?? 'http://localhost:5173/ecmact';
const OUT = process.env.OUT ?? './out';
const engines = (process.env.ENGINES ?? 'chromium').split(',');
const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
const here = path.dirname(fileURLToPath(import.meta.url));
const MOCK = process.env.MOCK ?? path.resolve(here, '../concepts-v2.html');
const tags = ['print-quote', 'moon-dial', 'proof-clock', 'row-counter', 'feed-lamp'];

/** Runs `fn` on the widget in the page, with a helper that finds elements inside its shadow root. */
const ev = (page, fn, arg) =>
  page.evaluate(
    `(async () => { const host = document.querySelector('.stage[data-m]').firstElementChild; const all = (sel) => [...host.shadowRoot.querySelectorAll(sel)]; return (${fn.toString()})(host, all, ${JSON.stringify(arg ?? null)}); })()`,
  );
const click =
  (selector, index = 0) =>
  (page) =>
    ev(
      page,
      (_h, all, a) => {
        all(a.selector)[a.index].click();
      },
      { selector, index },
    );
const setAttribute = (name, value) => (page) =>
  ev(
    page,
    (h, _all, a) => {
      h.setAttribute(a.name, a.value);
    },
    { name, value },
  );
const key = (selector, name) => (page) =>
  ev(
    page,
    (_h, all, a) => {
      all(a.selector)[0].dispatchEvent(
        new KeyboardEvent('keydown', { key: a.name, bubbles: true, cancelable: true }),
      );
    },
    { selector, name },
  );
const sequence =
  (...steps) =>
  async (page) => {
    for (const step of steps) {
      await step(page);
      await page.waitForTimeout(120);
    }
  };

/** The widgets, each with the markup that puts it on the page and the states to measure. */
const widgets = {
  'print-quote': {
    html: '<print-quote heading="Flyers" base="1.84"></print-quote>',
    states: [
      { name: 'default' },
      { name: 'break-500', go: click('.breaks [role=radio]', 3) },
      { name: 'three-inks-170g', go: sequence(click('.dots [role=radio]', 2)) },
    ],
  },
  'moon-dial': {
    html: '<moon-dial date="2026-11-17"></moon-dial>',
    states: [
      { name: 'default' },
      { name: 'full', go: setAttribute('date', '2026-11-25') },
      { name: 'new', go: setAttribute('date', '2026-11-09') },
      { name: 'waning', go: setAttribute('date', '2026-12-02') },
      { name: 'south', go: click('.hemi') },
      { name: 'key', go: key('.dial', 'ArrowRight') },
    ],
  },
  'proof-clock': {
    html: 'CLOCK',
    states: [
      { name: 'default' },
      {
        name: 'warm',
        go: (page) =>
          ev(page, (_h, all) => {
            const range = all('input[type=range]')[0];
            range.value = '30';
            range.dispatchEvent(new Event('input', { bubbles: true }));
          }),
      },
      {
        name: 'cold',
        go: (page) =>
          ev(page, (_h, all) => {
            const range = all('input[type=range]')[0];
            range.value = '16';
            range.dispatchEvent(new Event('input', { bubbles: true }));
          }),
      },
      { name: 'done', go: setAttribute('to', '2020-01-01T00:00:00') },
      {
        name: 'not-started',
        go: (page) =>
          page.evaluate(() => {
            document
              .querySelector('.stage[data-m]')
              .firstElementChild.setAttribute(
                'to',
                new Date(Date.now() + 40 * 3600000).toISOString(),
              );
          }),
      },
    ],
  },
  'row-counter': {
    html: '<row-counter pattern="Raglan sleeve" repeat="6"></row-counter>',
    states: [
      { name: 'default' },
      { name: 'rows', go: sequence(...Array.from({ length: 27 }, () => click('.big'))) },
      { name: 'no-repeat', go: setAttribute('repeat', '0') },
    ],
  },
  'feed-lamp': {
    html: '<feed-lamp feeds="ok=data/kiln.json, slow=data/kiln.json#lag=3000, missing=data/none.json, malformed=data/broken.txt"></feed-lamp>',
    states: [
      { name: 'default', wait: 900 },
      { name: 'slow', go: click('[role=tab]', 1), wait: 1900 },
      { name: 'slow-done', go: click('[role=tab]', 1), wait: 3600 },
      { name: 'missing', go: click('[role=tab]', 2), wait: 900 },
      { name: 'malformed', go: click('[role=tab]', 3), wait: 900 },
    ],
  },
};

/** Opens the bare page, puts the widget in a stage and waits for it. */
const open = async (ctx, tag) => {
  const page = await ctx.newPage();
  await page.goto(`${BASE}/hosts/cafe.html`);
  await page.waitForTimeout(300);
  const html = widgets[tag].html.replace('CLOCK', `<proof-clock to="${'${to}'}"></proof-clock>`);
  await page.evaluate(
    ([markup, hours]) => {
      document.querySelectorAll('style,link[rel=stylesheet]').forEach((node) => node.remove());
      document.body.removeAttribute('style');
      const to = new Date(Date.now() + hours * 3600000);
      const pad = (n) => String(n).padStart(2, '0');
      const local = `${to.getFullYear()}-${pad(to.getMonth() + 1)}-${pad(to.getDate())}T${pad(to.getHours())}:${pad(to.getMinutes())}:${pad(to.getSeconds())}`;
      document.body.innerHTML = `<div class="stage" data-m style="box-sizing:border-box;width:100%;max-width:100%;padding:12px;background:#d9d9d9">${markup.replace('${to}', local)}</div>`;
    },
    [html, 7],
  );
  await page.waitForTimeout(400);
  return page;
};

/** Measures every state of every widget. */
const measure = async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const report = {};
  for (const eng of engines) {
    const browser = await pw[eng].launch();
    for (const vp of [1280, 360]) {
      const ctx = await browser.newContext({
        viewport: { width: vp, height: 900 },
        reducedMotion: process.env.REDUCED ? 'reduce' : 'no-preference',
      });
      if (process.env.BLOCK)
        await ctx.route('**/*', (route) =>
          new URL(route.request().url()).origin === new URL(BASE).origin
            ? route.continue()
            : route.abort(),
        );
      for (const tag of tags) {
        if (only && !only.includes(tag)) continue;
        for (const st of widgets[tag].states) {
          const page = await open(ctx, tag);
          const stageSel = '.stage[data-m]';
          if (st.go) await st.go(page);
          await page.waitForTimeout(Number(process.env.WAIT ?? st.wait ?? 700));
          const anims = await page.evaluate(() => {
            const host = document.querySelector('.stage[data-m]').firstElementChild;
            return [...document.getAnimations(), ...host.shadowRoot.getAnimations()]
              .filter((a) => a.playState === 'running')
              .map(
                (a) =>
                  (a.animationName || a.transitionProperty || '?') +
                  ':' +
                  a.effect?.getTiming().iterations,
              );
          });
          const data = await page.evaluate(gather, {
            stage: stageSel,
            controls: CONTROLS,
            switches: SWITCHES,
          });
          const rec = {
            anims,
            overflow: data.overflow,
            small: data.small,
            scroll: [data.sw, data.cw],
          };
          const { texts, boundaries } = await contrast(page, stageSel, data);
          rec.boundaries = boundaries.filter(
            (x) => (x.edge !== null && x.edge < 3) || (x.track !== null && x.track < 3),
          );
          rec.lowest = texts.filter((x) => x.ratio < 4.5).sort((a, b) => a.ratio - b.ratio);
          rec.minRatio = texts.length ? Math.min(...texts.map((x) => x.ratio)) : null;
          rec.nText = texts.length;
          if (st.name === 'default') rec.focus = await focusStops(page, stageSel, eng);
          if (st.name === 'default' || process.env.SHOTS)
            await page
              .locator(stageSel)
              .screenshot({
                path: `${OUT}/${eng}-${vp}-${tag}-${st.name}.png`,
                animations: 'disabled',
              })
              .catch(() => {});
          report[`${eng}/${vp}/${tag}/${st.name}`] = rec;
          await page.close();
        }
      }
      await ctx.close();
    }
    await browser.close();
  }
  fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
  return report;
};

/** Makes the sheets: each widget beside its card of the mock, and the five side by side. */
const sheets = async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await pw.chromium.launch();
  const data = (buf) => `data:image/png;base64,${buf.toString('base64')}`;
  const mockCtx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  const mock = await mockCtx.newPage();
  await mock.goto(`file://${MOCK}`);
  const cards = {};
  for (const tag of tags)
    cards[tag] = await mock.locator(`figure.piece#${tag} .stage`).screenshot();
  await mockCtx.close();
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  const built = {};
  for (const tag of tags) {
    const page = await open(ctx, tag);
    await page.waitForTimeout(tag === 'feed-lamp' ? 900 : 500);
    built[tag] = await page.locator('.stage[data-m] > *').screenshot({ animations: 'disabled' });
    await page.close();
  }
  const out = await ctx.newPage();
  for (const [n, tag] of tags.entries()) {
    await out.setContent(
      `<style>body{margin:0;padding:16px;background:#888;font:13px system-ui;color:#fff}.row{display:flex;gap:16px;align-items:flex-start}figure{margin:0;flex:1 1 0;min-width:0}img{display:block;max-width:100%;height:auto}figcaption{padding:4px 0}</style><div class="row"><figure><img src="${data(cards[tag])}"><figcaption>W${n + 1} ${tag} - card of the mock</figcaption></figure><figure><img src="${data(built[tag])}"><figcaption>built</figcaption></figure></div>`,
    );
    await out.waitForTimeout(100);
    await out.screenshot({
      path: path.join(OUT, `${String(n + 1).padStart(2, '0')}-${tag}.png`),
      fullPage: true,
    });
  }
  await out.setContent(
    `<style>body{margin:0;padding:16px;background:#888;font:13px system-ui;color:#fff}.row{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap}figure{margin:0;width:300px}img{display:block;width:100%;height:auto}figcaption{padding:4px 0}</style><div class="row">${tags.map((tag) => `<figure><img src="${data(built[tag])}"><figcaption>${tag}</figcaption></figure>`).join('')}</div>`,
  );
  await out.waitForTimeout(100);
  await out.screenshot({ path: path.join(OUT, 'widgets-five.png'), fullPage: true });
  await browser.close();
  console.log('sheets in', OUT);
};

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.env.SHEETS) await sheets();
  else {
    const report = await measure();
    let bad = 0;
    for (const [k, v] of Object.entries(report)) {
      const probs = [];
      if (v.overflow.length)
        probs.push(`overflow ${v.overflow.length}: ${JSON.stringify(v.overflow.slice(0, 2))}`);
      if (v.scroll[0] > v.scroll[1] + 1) probs.push(`scroll ${v.scroll}`);
      if (process.env.REDUCED && v.anims.length) probs.push('anims ' + v.anims);
      if (v.small.length)
        probs.push(`small ${v.small.length}: ${JSON.stringify(v.small.slice(0, 3))}`);
      if (v.lowest.length)
        probs.push(`contrast<4.5 ${v.lowest.length}: ${JSON.stringify(v.lowest.slice(0, 3))}`);
      if (v.focus) {
        const weak = v.focus.filter((f) => !(f.os !== 'none' && f.ow >= 2));
        if (weak.length)
          probs.push(`focus weak ${weak.length}: ${JSON.stringify(weak.slice(0, 2))}`);
        const low = v.focus.filter((f) => f.ring != null && f.ring < 3);
        if (low.length)
          probs.push(`focus outline under 3:1 ${low.length}: ${JSON.stringify(low.slice(0, 2))}`);
      }
      if (v.boundaries?.length)
        probs.push(
          `boundary under 3:1 ${v.boundaries.length}: ${JSON.stringify(v.boundaries.slice(0, 3))}`,
        );
      console.log(
        k,
        `min=${v.minRatio} n=${v.nText}${v.focus ? ` focusStops=${v.focus.length}` : ''}`,
        probs.length ? 'PROBLEMS' : 'ok',
        ...probs.map((p) => '\n   ' + p),
      );
      if (probs.length) bad++;
    }
    console.log('problem rows', bad);
  }
}
