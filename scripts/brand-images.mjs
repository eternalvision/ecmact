import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { brand } from '../packages/site/src/lib/brand.ts';

/**
 * Renders the brand images from the geometry in `packages/site/src/lib/brand.ts`: the lockup, the mark, the social
 * card and the favicon. Run it with `npm run brand:images` after the geometry changes.
 */
const root = fileURLToPath(new URL('..', import.meta.url));
const ink = '#141414';
const paper = '#ffffff';
/** The one color of the transparent lockup: at least 4.5:1 on white and on black (D37). */
const gray = '#767676';

/**
 * Draws the mark as a block with a glyph.
 *
 * @param {string} block - The color of the block.
 * @param {string} glyph - The color of the letters.
 * @returns {string} The svg markup.
 */
const mark = (block, glyph) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="${brand.block}" fill="${block}"/><path d="${brand.glyph}" fill="${glyph}"/></svg>`;

/**
 * Draws the lockup of the mark and the wordmark in one color.
 *
 * @param {string} color - The color.
 * @returns {string} The svg markup.
 */
const lockup = (color) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${brand.lockupWidth} ${brand.height}" fill="${color}"><path d="${brand.block} ${brand.glyph}" fill-rule="evenodd"/><g transform="translate(${brand.wordOffset} 0)"><path d="${brand.wordFill}"/><path d="${brand.wordStroke}" fill="none" stroke="${color}" stroke-width="${brand.strokeWidth}"/></g></svg>`;

writeFileSync(
  `${root}packages/site/public/favicon.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><style>.b{fill:${ink}}.g{fill:${paper}}@media (prefers-color-scheme:dark){.b{fill:${paper}}.g{fill:${ink}}}</style><path class="b" d="${brand.block}"/><path class="g" d="${brand.glyph}"/></svg>\n`,
);

const browser = await chromium.launch();
/**
 * Renders svg markup to a PNG with the size of the viewport.
 *
 * @param {string} svg - The markup.
 * @param {number} width - The width in pixels.
 * @param {number} height - The height in pixels.
 * @param {string} file - The path of the PNG, relative to the repository.
 * @param {string} [background] - An opaque background; without it the image is transparent.
 */
const render = async (svg, width, height, file, background) => {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(
    `<style>html,body{margin:0;background:${background ?? 'transparent'}}svg{display:block;width:${width}px;height:${height}px}</style>${svg}`,
  );
  await page.screenshot({ path: `${root}${file}`, omitBackground: !background });
  await page.close();
};

const height = 256;
const width = Math.round((height * brand.lockupWidth) / brand.height);
for (const dir of ['public', 'packages/site/public'])
  await render(lockup(gray), width, height, `${dir}/ecmact-logo.png`);
await render(mark(ink, paper), 256, 256, 'public/ecmact-mark.png');
await render(mark(ink, paper), 256, 256, 'packages/site/public/favicon.png');
await render(
  `<div style="width:1024px;height:1024px;display:grid;place-items:center;background:${ink}"><div style="width:800px">${lockup(paper)}</div></div>`.replace(
    '<svg ',
    '<svg style="width:800px;height:auto" ',
  ),
  1024,
  1024,
  'public/ecmact.png',
  ink,
);
await browser.close();
