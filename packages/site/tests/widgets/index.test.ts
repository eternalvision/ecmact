import { describe, expect, it } from 'vitest';
import { widgets } from '@site/content/widgets';
import { defineAll } from '@site/widgets/index';

describe('defineAll', () => {
  it('registers every widget of the reference, and does nothing the second time', () => {
    defineAll();
    widgets.forEach(({ tag }) => expect(customElements.get(tag)).toBeDefined());
    expect(() => defineAll()).not.toThrow();
  });

  it('observes the attributes that the reference lists, in the same order', () => {
    defineAll();
    widgets.forEach(({ tag, attributes }) => {
      const element = customElements.get(tag) as unknown as { observedAttributes: string[] };
      expect(element.observedAttributes).toEqual(attributes);
    });
  });
});
