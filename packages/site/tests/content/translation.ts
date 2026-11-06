import { docs } from '@site/content/docs/index';
import { russian } from '@site/content/docs/ru/index';
import { localize, texts } from '@site/content/localize';
import { validatePage } from '@tests/content/validate';

const allowed = new Set(
  [
    'ECMact',
    'create',
    'ecmact',
    'Shadow',
    'TypeScript',
    'JavaScript',
    'Vite',
    'Prettier',
    'ESLint',
    'Tailwind',
    'Chromium',
    'Firefox',
    'Safari',
    'Chrome',
    'GitHub',
    'DevTools',
    'Redux',
    'React',
    'Webflow',
    'WordPress',
    'DOMPurify',
    'Pages',
    'Node',
    'Vitest',
    'happy',
    'zustand',
    'axios',
    'styled',
    'components',
    'Middleware',
    'Refs',
    'Content',
    'children',
    'Layout',
    'layout',
    'Custom',
    'Elements',
    'Components',
    'CSS',
    'HTML',
    'JSON',
    'DOM',
    'URL',
    'API',
    'IIFE',
    'CMS',
    'Web',
    'Light',
    'light',
    'outlet',
    'Attrs',
    'attrs',
    'hook',
    'popup',
    'script',
    'props',
    'runtime',
    'tree',
    'shaking',
    'push',
    'fetch',
    'Basic',
    'cookie',
    'origin',
    'idempotent',
    'Map',
    'Set',
    'Promise',
    'Safe',
    'bundle',
    'Bundle',
    'happy',
    'dom',
    'Hello',
    'router',
    'store',
    'span',
    'Object',
    'Signals',
    'Signal',
  ].map((word) => word.toLowerCase()),
);

export const proseWords = (text: string) =>
  text
    .replace(/`[^`]*`/g, '')
    .replace(/\]\([^)]*\)/g, ']')
    .match(/[A-Za-z]{4,}/g)
    ?.filter((word) => !allowed.has(word.toLowerCase())) ?? [];

export const checkTranslation = (slug: string) => {
  const page = docs.find((candidate) => candidate.slug === slug)!;
  const translation = russian[slug]!;
  const translated = localize(page, translation);
  const original = texts(page);
  const leftovers: string[] = [];
  texts(translated).forEach((text, index) => {
    const words = proseWords(text);
    if (words.length > 0 && text === original[index])
      leftovers.push(`${index}: ${text.slice(0, 60)}`);
  });
  return { page, translated, problems: [...validatePage(translated, slug), ...leftovers] };
};
