import { afterEach, describe, expect, it } from 'vitest';
import { css, keyframes, signal, styled, ThemeProvider, type ReadonlySignal } from '@em';
import { inner } from '@tests/helpers';

const sheet = (component: { props: { css?: unknown } }) =>
  (component.props.css as ReadonlySignal<string>).value;

const text = (css: string) =>
  Object.assign([css], { raw: [css] }) as unknown as TemplateStringsArray;

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

describe('attrs', () => {
  it('sets default props that the passed props override', () => {
    const Field = styled.input.attrs({ type: 'text', placeholder: 'name' })``;
    const field = Field({ placeholder: 'email' });
    document.body.append(field);
    expect(inner(field).getAttribute('type')).toBe('text');
    expect(inner(field).getAttribute('placeholder')).toBe('email');
  });

  it('calls a function with the props it was given', () => {
    const Field = styled.input.attrs<{ $size?: string }>((props) => ({
      type: 'text',
      $size: props.$size ?? '1em',
    }))`
      font-size: ${(props) => props.$size};
    `;
    expect(sheet(Field())).toContain('font-size: 1em;');
    expect(sheet(Field({ $size: '2em' }))).toContain('font-size: 2em;');
  });

  it('chains, with the later attrs winning', () => {
    const Field = styled.input.attrs({ type: 'text', title: 'a' }).attrs({ title: 'b' })``;
    const field = Field();
    document.body.append(field);
    expect(inner(field).getAttribute('type')).toBe('text');
    expect(inner(field).getAttribute('title')).toBe('b');
  });

  it('gives a function the theme prop, or an empty theme', () => {
    const seen: unknown[] = [];
    const Box = styled.div.attrs((props) => {
      seen.push(props.theme);
      return {};
    })``;
    Box();
    Box({ theme: { a: 1 } });
    expect(seen).toEqual([{}, { a: 1 }]);
  });
});

describe('extending', () => {
  it('adds a template to an existing component and keeps its tag, styles and attrs', () => {
    const Button = styled.button.attrs({ type: 'button' })`
      padding: 1px;
      color: red;
    `;
    const Danger = styled(Button)`
      color: darkred;
    `;
    const danger = Danger({ content: 'Delete' });
    document.body.append(danger);
    expect(inner(danger).localName).toBe('button');
    expect(inner(danger).getAttribute('type')).toBe('button');
    const text = sheet(danger);
    expect(text.indexOf('padding: 1px;')).toBeLessThan(text.indexOf('color: darkred;'));
    expect(sheet(Button())).not.toContain('darkred');
  });

  it('keeps declarations apart when a template has no final semicolon', () => {
    const Base = styled.div(text('padding: 1px'));
    const Next = styled(Base)(text('color: red'));
    expect(sheet(Next())).toContain('padding: 1px;\ncolor: red;');
  });

  it('leaves a template that ends in a rule or is empty as it is', () => {
    expect(sheet(styled.div(text('a: b; c { d: e }'))())).toContain('a: b; c { d: e }\n}');
    expect(sheet(styled.div(text(''))())).toContain('[data-styled] {\n\n}');
  });

  it('keeps the transient props of both', () => {
    const Base = styled.div<{ $a: string }>`
      a: ${(props) => props.$a};
    `;
    const Next = styled(Base)<{ $b: string }>`
      b: ${(props) => props.$b};
    `;
    const text = sheet(Next({ $a: 'one', $b: 'two' }));
    expect(text).toContain('a: one;');
    expect(text).toContain('b: two;');
  });

  it('refuses a function that styled did not make', () => {
    expect(() => styled((() => {}) as never)).toThrow(TypeError);
  });
});

describe('as', () => {
  it('renders another tag with the same styles and does not put as on the element', () => {
    const Button = styled.button`
      padding: 1px;
    `;
    const link = Button({ as: 'a', href: '#', content: 'Go' } as never);
    document.body.append(link);
    expect(inner(link).localName).toBe('a');
    expect(inner(link).getAttribute('href')).toBe('#');
    expect(inner(link).hasAttribute('as')).toBe(false);
    expect(sheet(link)).toContain('padding: 1px;');
  });
});

describe('keyframes', () => {
  it('puts the rule next to the styles and the name in the declaration', () => {
    const spin = keyframes`from { rotate: 0deg } to { rotate: 360deg }`;
    const Spinner = styled.div`
      animation: ${spin} 1s linear infinite;
    `;
    const text = sheet(Spinner());
    expect(text).toContain(`@keyframes ${spin.name}`);
    expect(text).toContain(`animation: ${spin.name} 1s linear infinite;`);
  });

  it('adds the rule once however often it is used', () => {
    const fade = keyframes`from { opacity: 0 } to { opacity: 1 }`;
    const Box = styled.div`
      animation: ${fade} 1s;
      transition: ${() => fade};
    `;
    expect(sheet(Box()).split(`@keyframes ${fade.name}`)).toHaveLength(2);
  });
});

describe('theme', () => {
  const Box = styled.div`
    color: ${(props) => String(props.theme.accent ?? 'none')};
  `;

  it('is empty without a provider', () => {
    const box = Box();
    document.body.append(box);
    expect(sheet(box)).toContain('color: none;');
  });

  it('comes from the provider above', () => {
    const box = Box();
    document.body.append(ThemeProvider({ theme: { accent: 'teal' }, children: [box] }));
    expect(sheet(box)).toContain('color: teal;');
  });

  it('follows a theme signal', () => {
    const theme = signal({ accent: 'teal' });
    const box = Box();
    document.body.append(ThemeProvider({ theme, children: [box] }));
    theme.value = { accent: 'crimson' };
    expect(sheet(box)).toContain('color: crimson;');
  });

  it('uses the nearest provider', () => {
    const box = Box();
    const inside = ThemeProvider({ theme: { accent: 'inner' }, children: [box] });
    document.body.append(ThemeProvider({ theme: { accent: 'outer' }, children: [inside] }));
    expect(sheet(box)).toContain('color: inner;');
  });

  it('is overridden by the theme prop, which is not put on the element', () => {
    const box = Box({ theme: { accent: 'prop' } });
    document.body.append(ThemeProvider({ theme: { accent: 'teal' }, children: [box] }));
    expect(sheet(box)).toContain('color: prop;');
    expect(inner(box).hasAttribute('theme')).toBe(false);
  });

  it('keeps the mounted hook of the user, and its cleanup', () => {
    const calls: string[] = [];
    const box = Box({
      mounted: () => {
        calls.push('mounted');
        return () => calls.push('cleanup');
      },
    });
    document.body.append(box);
    box.remove();
    expect(calls).toEqual(['mounted', 'cleanup']);
  });

  it('works for a mounted hook without cleanup', () => {
    const box = Box({ mounted: () => {} });
    document.body.append(box);
    expect(() => box.remove()).not.toThrow();
  });
});
