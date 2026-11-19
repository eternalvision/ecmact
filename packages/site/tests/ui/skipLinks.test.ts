import { afterEach, describe, expect, it, vi } from 'vitest';
import { SkipLinks } from '@site/ui/skipLinks';

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

const setup = () => {
  const target = document.createElement('h1');
  target.id = 'here';
  target.tabIndex = -1;
  document.body.append(SkipLinks([{ label: 'Go there', target: 'here' }]), target);
  return { target, link: document.querySelector<HTMLAnchorElement>('.skip-link')! };
};

describe('SkipLinks', () => {
  it('lists the links with the address of their target', () => {
    document.body.append(
      SkipLinks([
        { label: 'One', target: 'a' },
        { label: 'Two', target: 'b' },
      ]),
    );
    const links = [...document.querySelectorAll('.skip-links a')];
    expect(links.map((link) => link.textContent)).toEqual(['One', 'Two']);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['#a', '#b']);
  });

  it('moves the focus to the target and scrolls it into view', () => {
    const { target, link } = setup();
    const scroll = vi.fn();
    target.scrollIntoView = scroll;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(target);
    expect(scroll).toHaveBeenCalledWith({ block: 'start' });
  });

  it('leaves the click to the browser when the target is gone', () => {
    const { target, link } = setup();
    target.remove();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});
