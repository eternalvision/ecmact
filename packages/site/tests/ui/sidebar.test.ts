import { afterEach, describe, expect, it } from 'vitest';
import { docs, groups } from '@site/content/docs/index';
import { disposeRouters, makeRouter } from '@tests/helpers';
import { Sidebar } from '@site/ui/sidebar';

afterEach(() => {
  disposeRouters();
  document.body.replaceChildren();
});

describe('Sidebar', () => {
  it('lists every page under its group', () => {
    const sidebar = Sidebar(makeRouter('/docs/routing'));
    document.body.append(sidebar);
    expect([...sidebar.querySelectorAll('h2')].map((h) => h.textContent)).toEqual(groups);
    expect(sidebar.querySelectorAll('a')).toHaveLength(docs.length);
  });

  it('marks the page that is open', () => {
    const sidebar = Sidebar(makeRouter('/docs/routing'));
    document.body.append(sidebar);
    const current = sidebar.querySelector('a[aria-current="page"]');
    expect(current?.textContent).toBe('Routing');
  });
});
