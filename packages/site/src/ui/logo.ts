import type { Router } from 'ecmact';
import { text } from '@site/content/messages';
import { brand } from '@site/lib/brand';

const svgNamespace = 'http://www.w3.org/2000/svg';

/**
 * Makes an svg element.
 *
 * @param name - The tag name.
 * @param attributes - The attributes.
 * @returns The element.
 */
const svg = (name: string, attributes: Record<string, string>) => {
  const element = document.createElementNS(svgNamespace, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
};

/**
 * Draws the lockup of the mark and the wordmark in the current text color, so that it follows the theme. The
 * letters of the mark are cut out of the block and show the page behind it.
 *
 * @returns The svg element, hidden from assistive technology.
 */
export const lockup = () => {
  const root = svg('svg', {
    class: 'logo-art',
    viewBox: `0 0 ${brand.lockupWidth} ${brand.height}`,
    width: String(brand.lockupWidth),
    height: String(brand.height),
    fill: 'currentColor',
    'aria-hidden': 'true',
    focusable: 'false',
  });
  const word = svg('g', { transform: `translate(${brand.wordOffset} 0)` });
  word.append(
    svg('path', { d: brand.wordFill }),
    svg('path', {
      d: brand.wordStroke,
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': String(brand.strokeWidth),
    }),
  );
  root.append(svg('path', { d: `${brand.block} ${brand.glyph}`, 'fill-rule': 'evenodd' }), word);
  return root;
};

/**
 * The logo as a link to the home page. The drawing is inline markup, not an image file, and the link is named by its label.
 *
 * @param router - The router.
 * @returns The anchor.
 */
export const Logo = (router: Router) =>
  router.link({ to: '/', class: 'logo', 'aria-label': text().chrome.home }, lockup());
