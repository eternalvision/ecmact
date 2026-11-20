import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pw from 'playwright';

/*
 * Makes the mock sheet of the four hosts (`hosts-mock.html`) from its source (`hosts-mock.src.html`): the real
 * widgets run in a browser on the page of the source, and each one is frozen into static HTML with declarative
 * shadow DOM, so that the sheet needs no script and no server. Then it captures every host at 1280 px and 360 px.
 * Run from the repository root with a dev server of the site running (it serves the widget bundle from source):
 *
 *   BASE=http://localhost:5173/ecmact OUT=docs/sessions/19112026-DocsRedesign/captures/hosts node docs/sessions/19112026-DocsRedesign/build/hosts-mock.mjs
 *
 * Environment: BASE (address of the site, with its base path), OUT (folder for the captures).
 */
const BASE = process.env.BASE ?? 'http://localhost:5173/ecmact';
const here = path.dirname(fileURLToPath(import.meta.url));
const session = path.resolve(here, '..');
const OUT = process.env.OUT ?? path.join(session, 'captures/hosts');
const source = fs.readFileSync(path.join(session, 'hosts-mock.src.html'), 'utf8');

/** Writes a moment some hours from now as a local time without an offset. */
const ahead = (hours) => {
  const date = new Date(Date.now() + hours * 3600000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};
const html = source
  .replace(/@proof-(\d+)h/g, (_, hours) => ahead(Number(hours)))
  .replace('</body>', `<script src="${BASE}/embed/ecmact-widgets.js"></script></body>`);

fs.mkdirSync(OUT, { recursive: true });
const browser = await pw.chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.route(`${BASE}/hosts/__mock.html`, (route) =>
  route.fulfill({ contentType: 'text/html', body: html }),
);
await page.goto(`${BASE}/hosts/__mock.html`);
await page.waitForTimeout(800);
await page.evaluate(async () => {
  document.querySelectorAll('row-counter[data-rows]').forEach((element) => {
    const rows = Number(element.getAttribute('data-rows'));
    for (let n = 0; n < rows; n++) element.shadowRoot.querySelector('.big').click();
  });
  await new Promise((resolve) => setTimeout(resolve, 1400));
});
const frozen = await page.evaluate(() => {
  const tags = 'print-quote,moon-dial,proof-clock,row-counter,feed-lamp';
  document.querySelectorAll(tags).forEach((element) => {
    const root = element.shadowRoot;
    const css = [...root.adoptedStyleSheets]
      .flatMap((sheet) => [...sheet.cssRules].map((rule) => rule.cssText))
      .join('\n');
    element.removeAttribute('data-rows');
    const copy = document.createElement('div');
    copy.innerHTML = root.innerHTML;
    element.dataset.frozen = JSON.stringify({ css, body: copy.innerHTML });
  });
  const parts = [...document.querySelectorAll(tags)].map((element) => element.dataset.frozen);
  document.querySelectorAll('script').forEach((script) => script.remove());
  let out = '<!doctype html>\n' + document.documentElement.outerHTML;
  const names = [...document.querySelectorAll(tags)].map((element) => element.localName);
  // each widget element is written again with its shadow root as a template
  parts.forEach((json, index) => {
    const { css, body } = JSON.parse(json);
    const open = new RegExp(`(<${names[index]}\\b[^>]*?) data-frozen="[^"]*"([^>]*>)`);
    out = out.replace(
      open,
      `$1$2<template shadowrootmode="open"><style>${css.replace(/\$/g, '$$$$')}</style>${body.replace(/\$/g, '$$$$')}</template>`,
    );
  });
  return out;
});
fs.writeFileSync(path.join(session, 'hosts-mock.html'), frozen);
await ctx.close();

for (const width of [1280, 360]) {
  const sheet = await browser.newContext({ viewport: { width, height: 900 } });
  const view = await sheet.newPage();
  await view.goto(`file://${path.join(session, 'hosts-mock.html')}`);
  await view.waitForTimeout(500);
  for (const id of ['cafe', 'terminal', 'zine', 'kids'])
    await view.locator(`#${id} .page`).screenshot({ path: path.join(OUT, `${id}-${width}.png`) });
  await view.screenshot({ path: path.join(OUT, `sheet-${width}.png`), fullPage: true });
  const overflow = await view.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  console.log(width, 'horizontal overflow of the sheet:', overflow);
  await sheet.close();
}
await browser.close();
console.log('captures in', OUT);
