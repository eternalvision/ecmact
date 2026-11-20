import fs from 'node:fs';
import pw from 'playwright';
import { CONTROLS, SWITCHES, contrast, focusStops, gather } from './measure.mjs';
import { widgets } from './widgets.mjs';

/*
 * Measures the widgets inside the four host pages, under each host's stylesheet and custom-property values
 * (AC-07). Run from the repository root with a dev server of the site running:
 *
 *   BASE=http://localhost:5173/ecmact OUT=./out ENGINES=chromium,firefox,webkit node docs/sessions/19112026-DocsRedesign/build/hosts.mjs
 *
 * Environment: BASE, OUT, ENGINES, ONLY (ids of hosts), REDUCED=1 (prefers-reduced-motion: reduce), BLOCK=1
 * (requests to other origins are refused). Each widget is put in a stage the width of its place (a block
 * wrapper, so the host layout does not change), driven through the states of `widgets.mjs` and measured with the
 * functions of `measure.mjs`; a state that the host does not offer (the tabs of a feed-lamp with no feeds) is
 * skipped. The whole page is also checked for a horizontal scroll.
 */
const BASE = process.env.BASE ?? 'http://localhost:5173/ecmact';
const OUT = process.env.OUT ?? './out';
const engines = (process.env.ENGINES ?? 'chromium').split(',');
const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
const hosts = {
  cafe: ['proof-clock', 'row-counter', 'moon-dial'],
  terminal: ['feed-lamp', 'moon-dial'],
  zine: ['print-quote', 'proof-clock'],
  kids: ['row-counter', 'feed-lamp', 'print-quote'],
};

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
    for (const [host, tags] of Object.entries(hosts)) {
      if (only && !only.includes(host)) continue;
      for (const tag of tags)
        for (const st of widgets[tag].states) {
          const page = await ctx.newPage();
          await page.goto(`${BASE}/hosts/${host}.html`);
          await page.waitForTimeout(500);
          const page$ = await page.evaluate((t) => {
            const element = document.querySelector(t);
            const wrapper = document.createElement('div');
            wrapper.className = 'stage';
            wrapper.dataset.m = '';
            element.replaceWith(wrapper);
            wrapper.append(element);
            return {
              wide: document.documentElement.scrollWidth - window.innerWidth,
              tabs: !!element.getAttribute('feeds'),
            };
          }, tag);
          if (
            !page$.tabs &&
            /^(slow|missing|malformed|slow-done)$/.test(st.name) &&
            tag === 'feed-lamp'
          ) {
            await page.close();
            continue;
          }
          const stageSel = '.stage[data-m]';
          await page.waitForTimeout(400);
          if (st.go) await st.go(page);
          await page.waitForTimeout(Number(st.wait ?? 700));
          const anims = await page.evaluate(() => {
            const el = document.querySelector('.stage[data-m]').firstElementChild;
            return [...document.getAnimations(), ...el.shadowRoot.getAnimations()]
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
            pageWide: page$.wide,
          };
          const { texts, boundaries } = await contrast(page, stageSel, data);
          rec.boundaries = boundaries.filter(
            (x) => (x.edge !== null && x.edge < 3) || (x.track !== null && x.track < 3),
          );
          rec.lowest = texts.filter((x) => x.ratio < 4.5).sort((a, b) => a.ratio - b.ratio);
          rec.minRatio = texts.length ? Math.min(...texts.map((x) => x.ratio)) : null;
          rec.nText = texts.length;
          if (st.name === 'default') rec.focus = await focusStops(page, stageSel, eng);
          report[`${eng}/${vp}/${host}/${tag}/${st.name}`] = rec;
          await page.close();
        }
    }
    await ctx.close();
  }
  await browser.close();
}
fs.writeFileSync(`${OUT}/hosts-report.json`, JSON.stringify(report, null, 1));
let bad = 0;
for (const [k, v] of Object.entries(report)) {
  const probs = [];
  if (v.overflow.length)
    probs.push(`overflow ${v.overflow.length}: ${JSON.stringify(v.overflow.slice(0, 2))}`);
  if (v.scroll[0] > v.scroll[1] + 1) probs.push(`scroll ${v.scroll}`);
  if (v.pageWide > 0) probs.push(`page scrolls sideways by ${v.pageWide}`);
  if (process.env.REDUCED && v.anims.length) probs.push('anims ' + v.anims);
  if (v.small.length) probs.push(`small ${v.small.length}: ${JSON.stringify(v.small.slice(0, 3))}`);
  if (v.lowest.length)
    probs.push(`contrast<4.5 ${v.lowest.length}: ${JSON.stringify(v.lowest.slice(0, 3))}`);
  if (v.focus) {
    const weak = v.focus.filter((f) => !(f.os !== 'none' && f.ow >= 2));
    if (weak.length) probs.push(`focus weak ${weak.length}: ${JSON.stringify(weak.slice(0, 2))}`);
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
console.log('rows', Object.keys(report).length, 'problem rows', bad);
