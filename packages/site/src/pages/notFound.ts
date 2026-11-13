import { tags, type Router } from 'ecmact';
import { text } from '@site/content/messages';

const { h1, main, p } = tags;

/**
 * The page for an address that matches nothing.
 *
 * @param router - The router.
 * @returns The page.
 */
export const notFound = (router: Router) => {
  const m = text().notFound;
  return main(
    { class: 'wrap page-simple' },
    h1(m.title),
    p({ class: 'lead' }, m.lead),
    p(
      router.link({ to: '/', class: 'button' }, m.home),
      ' ',
      router.link({ to: '/docs', class: 'button ghost' }, m.docs),
    ),
  );
};
