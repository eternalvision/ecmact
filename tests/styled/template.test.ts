import { describe, expect, it } from 'vitest';
import { css, keyframes, styled, type ReadonlySignal } from '@em';
import { join } from '@em/styled/template';

const sheet = (component: { props: { css?: unknown } }) =>
  (component.props.css as ReadonlySignal<string>).value;

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

describe('keyframes', () => {
  it('names the animation after its frames', () => {
    const a = keyframes`from { opacity: 0 }`;
    const b = keyframes`from { opacity: 0 }`;
    const c = keyframes`from { opacity: 1 }`;
    expect(a.name).toBe(b.name);
    expect(a.name).not.toBe(c.name);
    expect(a.rule).toBe(`@keyframes ${a.name} {\nfrom { opacity: 0 }\n}`);
  });

  it('puts static values into the frames', () => {
    const grow = keyframes`to { width: ${10}px; color: ${'red'} }`;
    expect(grow.rule).toContain('to { width: 10px; color: red }');
  });
});

describe('join', () => {
  it('joins strings and values, leaving nothing for a missing value', () => {
    expect(join(['a', 'b', 'c'], [1], undefined as never, new Set())).toBe('a1bc');
  });
});
