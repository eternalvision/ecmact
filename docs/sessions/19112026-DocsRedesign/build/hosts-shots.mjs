import fs from 'node:fs';
import pw from 'playwright';

/*
 * Captures the four built host pages at 1280 px and 360 px, full page, in Chromium. Run from the repository root
 * with a dev server of the site running:
 *
 *   BASE=http://localhost:5173/ecmact OUT=docs/sessions/19112026-DocsRedesign/captures/hosts-built node docs/sessions/19112026-DocsRedesign/build/hosts-shots.mjs
 */
const BASE = process.env.BASE ?? 'http://localhost:5173/ecmact';
const OUT = process.env.OUT ?? './out';
fs.mkdirSync(OUT, { recursive: true });
const browser = await pw.chromium.launch();
for (const width of [1280, 360]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  for (const host of ['cafe', 'terminal', 'zine', 'kids']) {
    const page = await ctx.newPage();
    await page.goto(`${BASE}/hosts/${host}.html`);
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: `${OUT}/${host}-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    });
    await page.close();
  }
  await ctx.close();
}
await browser.close();
console.log('captures in', OUT);
