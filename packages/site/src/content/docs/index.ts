import { page as api } from '@site/content/docs/api';
import { page as comparison } from '@site/content/docs/comparison';
import { page as components } from '@site/content/docs/components';
import { page as context } from '@site/content/docs/context';
import { page as data } from '@site/content/docs/data';
import { page as forms } from '@site/content/docs/forms';
import { page as gettingStarted } from '@site/content/docs/getting-started';
import { page as http } from '@site/content/docs/http';
import { page as lifecycle } from '@site/content/docs/lifecycle';
import { page as limitations } from '@site/content/docs/limitations';
import { page as routing } from '@site/content/docs/routing';
import { page as security } from '@site/content/docs/security';
import { page as signals } from '@site/content/docs/signals';
import { page as state } from '@site/content/docs/state';
import { page as styled } from '@site/content/docs/styled';
import { page as styling } from '@site/content/docs/styling';
import { page as tooling } from '@site/content/docs/tooling';
import { page as typescript } from '@site/content/docs/typescript';
import { page as widgets } from '@site/content/docs/widgets';
import { russian } from '@site/content/docs/ru/index';
import { localize } from '@site/content/localize';
import type { DocGroup, DocPage } from '@site/content/types';
import type { Locale } from '@site/lib/i18n';

/** Every documentation page, in reading order. */
export const docs: DocPage[] = [
  gettingStarted,
  comparison,
  components,
  signals,
  styling,
  styled,
  lifecycle,
  context,
  forms,
  routing,
  state,
  http,
  data,
  widgets,
  tooling,
  typescript,
  security,
  limitations,
  api,
];

/** The groups of the sidebar, in order. */
export const groups: DocGroup[] = ['Start', 'Core', 'Application', 'Delivery', 'Reference'];

/** The pages in Russian: the same blocks, with the text translated. */
const translated: DocPage[] = docs.map((page) => localize(page, russian[page.slug] as string[]));

/**
 * Lists the pages in a language.
 *
 * @param locale - The language.
 * @returns The pages, in reading order.
 */
export const docsFor = (locale: Locale = 'en') => (locale === 'ru' ? translated : docs);

/**
 * Finds a page by its slug.
 *
 * @param slug - The last part of the URL.
 * @param locale - The language of the page.
 * @returns The page, or `undefined`.
 */
export const findDoc = (slug: string, locale: Locale = 'en') =>
  docsFor(locale).find((page) => page.slug === slug);

/**
 * Finds the page before and after one, for the links at the bottom of a page.
 *
 * @param slug - The slug of the current page.
 * @param locale - The language of the pages.
 * @returns The neighbours; either is `undefined` at the ends.
 */
export const neighbours = (slug: string, locale: Locale = 'en') => {
  const pages = docsFor(locale);
  const index = pages.findIndex((page) => page.slug === slug);
  return { previous: pages[index - 1], next: pages[index + 1] };
};
