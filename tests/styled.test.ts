import { afterEach, describe, expect, it } from 'vitest';
import { css, signal, styled, type ReadonlySignal } from '@em';
import { inner } from '@tests/helpers';

const sheet = (component: { props: { css?: unknown } }) =>
  (component.props.css as ReadonlySignal<string>).value;

afterEach(() => {
  document.body.replaceChildren();
});

describe('styled', () => {
  it('creates a component of the tag with the styles attached', () => {
    const Button = styled.button`
      padding: 1px;
    `;
    const button = Button({ content: 'Save' });
    document.body.append(button);
    expect(inner(button).localName).toBe('button');
    expect(inner(button).textContent).toBe('Save');
    expect(inner(button).hasAttribute('data-styled')).toBe(true);
    expect(sheet(button)).toContain('[data-styled] {');
    expect(sheet(button)).toContain('padding: 1px;');
    expect(button.shadowRoot!.adoptedStyleSheets).toHaveLength(1);
  });

  it('works as a function call too', () => {
    const Box = styled('section')`
      margin: 0;
    `;
    const box = Box();
    document.body.append(box);
    expect(inner(box).localName).toBe('section');
  });

  it('passes the props of the tag on to the element', () => {
    const Field = styled.input``;
    const field = Field({ type: 'email', placeholder: 'a@b.c' });
    document.body.append(field);
    expect(inner(field).getAttribute('type')).toBe('email');
  });

  it('inserts values, and nothing for false, null and undefined', () => {
    const Box = styled.div`
      a: ${1};
      b: ${'x'};
      c: ${false};
      d: ${null};
      e: ${undefined};
    `;
    const text = sheet(Box());
    expect(text).toContain('a: 1;');
    expect(text).toContain('b: x;');
    expect(text).toMatch(/c: ;\s+d: ;\s+e: ;/);
  });

  it('calls functions with the props, transient ones included', () => {
    const Button = styled.button<{ $primary?: boolean }>`
      background: ${(props) => (props.$primary ? 'blue' : 'gray')};
    `;
    expect(sheet(Button({ $primary: true }))).toContain('background: blue;');
    expect(sheet(Button())).toContain('background: gray;');
  });

  it('does not put transient props on the element', () => {
    const Button = styled.button<{ $primary?: boolean }>``;
    const button = Button({ $primary: true });
    document.body.append(button);
    expect(inner(button).getAttributeNames()).toEqual(['data-styled']);
  });

  it('follows signals in props and in the template', () => {
    const color = signal('red');
    const size = signal(1);
    const Box = styled.div<{ $color: string }>`
      color: ${(props) => props.$color};
      width: ${size}px;
    `;
    const box = Box({ $color: color });
    document.body.append(box);
    expect(sheet(box)).toContain('color: red;');
    color.value = 'green';
    size.value = 2;
    expect(sheet(box)).toContain('color: green;');
    expect(sheet(box)).toContain('width: 2px;');
  });

  it('accepts a function that returns a fragment or another function', () => {
    const bold = css`
      font-weight: 700;
    `;
    const Box = styled.div<{ $bold?: boolean }>`
      ${(props) => (props.$bold ? bold : '')}
      ${() => () => 'nested: 1;'}
    `;
    expect(sheet(Box({ $bold: true }))).toContain('font-weight: 700;');
    expect(sheet(Box({ $bold: true }))).toContain('nested: 1;');
    expect(sheet(Box())).not.toContain('font-weight');
  });

  it('appends the css prop of the user', () => {
    const Box = styled.div`
      margin: 0;
    `;
    const text = sheet(Box({ css: 'p { color: red; }' }));
    expect(text).toContain('margin: 0;');
    expect(text).toContain('p { color: red; }');
  });

  it('defines one element per tag', () => {
    const A = styled.span``;
    const B = styled.span``;
    expect(A().localName).toBe(B().localName);
    expect(A().localName).toBe('em-styled-span');
  });

  it('is not confused by symbols and then', () => {
    expect((styled as unknown as { then?: unknown }).then).toBeUndefined();
    expect((styled as unknown as Record<symbol, unknown>)[Symbol.iterator]).toBeUndefined();
  });
});

describe('css', () => {
  it('keeps the text and the interpolations of a template', () => {
    const fragment = css`
      a: ${1};
    `;
    expect(fragment.strings).toHaveLength(2);
    expect(fragment.values).toEqual([1]);
  });

  it('can be shared between components and read the props', () => {
    const accent = css<{ $accent: string }>`
      outline: 2px solid ${(props) => props.$accent};
    `;
    const Button = styled.button<{ $accent: string }>`
      &:focus-visible {
        ${accent}
      }
    `;
    expect(sheet(Button({ $accent: 'hotpink' }))).toContain('outline: 2px solid hotpink;');
  });
});
