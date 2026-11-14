import { afterEach, describe, expect, it } from 'vitest';
import { em, styled, tags } from '@em';
import { mount } from '@em/utils/mount';
import { cleanStyles } from '@tests/helpers';

afterEach(() => {
  document.body.replaceChildren();
  cleanStyles();
});

/** The computed value of a property, as the engine reports it. */
const computed = (element: Element, property: string) =>
  getComputedStyle(element).getPropertyValue(property);

const red = 'rgb(255, 0, 0)';
const blue = 'rgb(0, 0, 255)';
const green = 'rgb(0, 128, 0)';

const Card = styled.div`
  color: ${red};
  & span {
    color: ${blue};
  }
  &.active {
    color: ${green};
  }
  &.active span {
    color: ${red};
  }
`;

describe('native CSS nesting produced by styled', () => {
  it('gives the nested selectors the declared computed style in the document', () => {
    const card = Card(tags.span('inner'));
    mount(document.body, card);
    expect(computed(card, 'color')).toBe(red);
    expect(computed(card.querySelector('span')!, 'color')).toBe(blue);
  });

  it('follows a nested selector that starts with &.class once the class is set', () => {
    const card = Card(tags.span('inner'));
    mount(document.body, card);
    card.classList.add('active');
    expect(computed(card, 'color')).toBe(green);
    expect(computed(card.querySelector('span')!, 'color')).toBe(red);
  });

  it('gives the nested selectors the declared computed style inside a shadow root', () => {
    const card = Card(tags.span('inner'));
    const host = em.Panel(card);
    mount(document.body, host);
    expect(card.getRootNode()).toBe(host.shadowRoot);
    expect(computed(card, 'color')).toBe(red);
    expect(computed(card.querySelector('span')!, 'color')).toBe(blue);
    expect(host.shadowRoot!.adoptedStyleSheets).toHaveLength(1);
  });

  it('keeps the nested rule inside one rule of the stylesheet', () => {
    mount(document.body, Card(tags.span('inner')));
    const sheet = document.adoptedStyleSheets.at(-1)!;
    expect(sheet.cssRules).toHaveLength(1);
    expect((sheet.cssRules[0] as CSSStyleRule).cssRules).toHaveLength(3);
  });
});
