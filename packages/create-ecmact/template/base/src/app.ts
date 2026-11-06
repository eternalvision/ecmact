import { em, tags } from 'ecmact';
import { Counter } from './components/counter';
import { Logo } from './components/logo';

const appCss = `
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    min-height: 100vh;
    padding: 2rem 1.25rem;
    text-align: center;
  }
`;

const linksCss = `
  nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.4rem 1.6rem;
  }
`;

const linkCss = `
  a {
    color: var(--muted);
    font-weight: 500;
    text-decoration: none;
    transition: color 0.15s;
  }
  a:hover {
    color: var(--primary-bright);
  }
  a:focus-visible {
    outline: 2px solid var(--primary-bright);
    outline-offset: 3px;
    border-radius: 4px;
  }
`;

const links = [
  { label: 'Documentation', href: 'https://github.com/eternalvision/ecmact#readme' },
  { label: 'GitHub', href: 'https://github.com/eternalvision/ecmact' },
  { label: 'npm', href: 'https://www.npmjs.com/package/ecmact' },
];

/**
 * The welcome page: the logo, a hint about where to start, a counter and a few links.
 *
 * @returns The app component.
 */
export const App = () =>
  em.App({
    tag: 'div',
    css: appCss,
    children: [
      Logo(),
      tags.p({
        html: 'Edit <code>src/app.ts</code> and save to see your changes.',
        style: { color: 'var(--muted)', fontSize: '1.1rem' },
      }),
      Counter(),
      em.Links({
        tag: 'nav',
        css: linksCss,
        children: links.map(({ label, href }) =>
          tags.a({ href, target: '_blank', rel: 'noreferrer', content: label, css: linkCss }),
        ),
      }),
    ],
  });
