import { afterEach, describe, expect, it } from 'vitest';
import { create } from '@site/demos/styled';

afterEach(() => {
  document.body.replaceChildren();
});

const sheet = (component: Element) =>
  (component as unknown as { props: { css: { value: string } } }).props.css.value;

describe('styled demo', () => {
  it('has two buttons, a spinner and four swatches', () => {
    const demo = create() as HTMLElement;
    document.body.append(demo);
    const root = demo.shadowRoot!;
    expect(root.querySelectorAll('em-styled-button')).toHaveLength(2);
    expect(root.querySelector('em-styled-div')).not.toBeNull();
    expect(
      root.querySelector('em-swatches')!.shadowRoot!.querySelectorAll('em-styled-button'),
    ).toHaveLength(4);
  });

  it('restyles the components below the provider when a swatch is picked', () => {
    const demo = create() as HTMLElement;
    document.body.append(demo);
    const root = demo.shadowRoot!;
    const primary = root.querySelector('em-styled-button')!;
    expect(sheet(primary)).toContain('#1665e0');
    const swatches = root
      .querySelector('em-swatches')!
      .shadowRoot!.querySelectorAll('em-styled-button');
    swatches[1]!.shadowRoot!.querySelector('button')!.click();
    expect(sheet(primary)).toContain('#d6336c');
    expect(sheet(root.querySelector('em-styled-div')!)).toContain('#d6336c');
  });
});
