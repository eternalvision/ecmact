import { afterEach, describe, expect, it, vi } from 'vitest';
import { styled } from '@em';
import { mount } from '@em/utils/mount';
import { resetWarnings } from '@em/utils/warn';
import { cleanStyles } from '@tests/helpers';

afterEach(() => {
  vi.restoreAllMocks();
  resetWarnings();
  document.body.replaceChildren();
  cleanStyles();
});

const computed = (element: Element, property: string) =>
  getComputedStyle(element).getPropertyValue(property);

/** Closes its rule and opens a second one, so that the whole text is two rules, which `insertRule` refuses. */
const Broken = styled.div`
  color: rgb(255, 0, 0);
  } .smuggled { color: rgb(255, 0, 0);
`;

const Good = styled.div`
  color: rgb(0, 0, 255);
`;

describe('a rule the engine cannot parse', () => {
  it('is skipped with a warning by the real insertRule', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(vi.isMockFunction(CSSStyleSheet.prototype.insertRule)).toBe(false);
    const broken = Broken('text');
    mount(document.body, broken);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('ecmact: a styled rule was ignored');
    expect(computed(broken, 'color')).not.toBe('rgb(255, 0, 0)');
    expect(computed(broken, 'color')).toBe(computed(document.body, 'color'));
  });

  it('does not stop the other rules of the same root from applying', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const broken = Broken('one');
    const good = Good('two');
    mount(document.body, broken, good);
    expect(computed(good, 'color')).toBe('rgb(0, 0, 255)');
    expect(document.adoptedStyleSheets.at(-1)!.cssRules).toHaveLength(1);
  });

  it('warns once for the same rule however many elements use it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mount(document.body, Broken('one'), Broken('two'));
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
