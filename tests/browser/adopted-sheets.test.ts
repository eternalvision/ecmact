import { afterEach, describe, expect, it } from 'vitest';
import { configure, em, signal, tags } from '@em';
import { resetConfig } from '@em/core/config';
import { mount } from '@em/utils/mount';
import { cleanStyles } from '@tests/helpers';

afterEach(() => {
  resetConfig();
  document.body.replaceChildren();
  cleanStyles();
});

const computed = (element: Element, property: string) =>
  getComputedStyle(element).getPropertyValue(property);

describe('styles adopted on a shadow root', () => {
  it('apply: the own css and the shared styles, the own css winning', () => {
    configure({ styles: ['p { color: rgb(255, 0, 0); margin-top: 11px; }'] });
    const paragraph = tags.p('text');
    const host = em.Note({ css: 'p { color: rgb(0, 0, 255); }' }, paragraph);
    mount(document.body, host);
    expect(host.shadowRoot!.adoptedStyleSheets).toHaveLength(2);
    expect(computed(paragraph, 'color')).toBe('rgb(0, 0, 255)');
    expect(computed(paragraph, 'margin-top')).toBe('11px');
  });

  it('do not leak out of the shadow root', () => {
    const host = em.Note({ css: 'p { color: rgb(0, 0, 255); }' }, tags.p('inside'));
    const outside = tags.p('outside');
    mount(document.body, host, outside);
    expect(computed(outside, 'color')).not.toBe('rgb(0, 0, 255)');
  });

  it('follow a css that changes', () => {
    const css = signal('p { padding-top: 3px; }');
    const paragraph = tags.p('text');
    mount(document.body, em.Note({ css }, paragraph));
    expect(computed(paragraph, 'padding-top')).toBe('3px');
    css.value = 'p { padding-top: 9px; }';
    expect(computed(paragraph, 'padding-top')).toBe('9px');
  });
});

describe('@property rules of the shared styles', () => {
  const properties = `
    @property --em-b04-size { syntax: '<length>'; inherits: false; initial-value: 7px; }
    @property --em-b04-sum { syntax: '<length>'; inherits: false; initial-value: 0px; }
    p { margin-left: var(--em-b04-size); --em-b04-sum: calc(1px + 2px); }
  `;

  it('are copied to the document and take effect inside the shadow root', () => {
    configure({ styles: [properties] });
    const paragraph = tags.p('text');
    mount(document.body, em.Note(paragraph));
    expect(document.head.querySelector('style[data-ecmact="properties"]')).not.toBeNull();
    expect(computed(paragraph, '--em-b04-size')).toBe('7px');
    expect(computed(paragraph, 'margin-left')).toBe('7px');
    expect(computed(paragraph, '--em-b04-sum')).toBe('3px');
  });

  it('are copied from a CSSStyleSheet source too', () => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(properties);
    configure({ styles: [sheet] });
    const paragraph = tags.p('text');
    mount(document.body, em.Note(paragraph));
    expect(document.head.querySelector('style[data-ecmact="properties"]')).not.toBeNull();
    expect(computed(paragraph, '--em-b04-size')).toBe('7px');
    expect(computed(paragraph, '--em-b04-sum')).toBe('3px');
  });

  it('stay unregistered when the styles hold none', () => {
    configure({ styles: ['p { margin-left: var(--em-b04-size); }'] });
    const paragraph = tags.p('text');
    mount(document.body, em.Note(paragraph));
    expect(document.head.querySelector('style[data-ecmact="properties"]')).toBeNull();
    expect(computed(paragraph, 'margin-left')).toBe('0px');
  });
});
