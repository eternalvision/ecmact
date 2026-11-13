import { em, tags } from 'ecmact';
import { Counter } from './components/counter';
import { Logo } from './components/logo';

const { a, code, nav, p } = tags;

const appCss = `
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    min-height: 100vh;
    padding: 2rem 1.25rem;
    text-align: center;
  }
  p {
    margin: 0;
    color: var(--muted);
    font-size: 1.1rem;
  }
  nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.4rem 1.6rem;
  }
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
  em.App(
    { css: appCss },
    Logo(),
    p('Edit ', code('src/app.ts'), ' and save to see your changes.'),
    Counter(),
    nav(links.map(({ label, href }) => a({ href, target: '_blank', rel: 'noreferrer' }, label))),
  );
