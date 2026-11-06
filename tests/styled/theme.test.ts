import { afterEach, describe, expect, it } from 'vitest';
import { signal, ThemeProvider, themeContext, useTheme } from '@em';
import { consume } from '@em/core/context';
import { inner } from '@tests/helpers';

afterEach(() => {
  document.body.replaceChildren();
});

describe('ThemeProvider', () => {
  it('renders a div that does not affect the layout', () => {
    const provider = ThemeProvider({ theme: { a: 1 } });
    document.body.append(provider);
    expect(inner(provider).localName).toBe('div');
    expect(inner(provider).style.display).toBe('contents');
  });

  it('keeps the style of the user next to display contents', () => {
    const provider = ThemeProvider({ theme: {}, style: { color: 'red' } });
    document.body.append(provider);
    expect(inner(provider).style.display).toBe('contents');
    expect(inner(provider).style.color).toBe('red');
  });

  it('renders its children', () => {
    const child = document.createElement('span');
    const provider = ThemeProvider({ theme: {}, children: [child] });
    document.body.append(provider);
    expect(inner(provider).contains(child)).toBe(true);
  });

  it('provides the theme as a signal on the theme context', () => {
    const child = document.createElement('span');
    document.body.append(ThemeProvider({ theme: { a: 1 }, children: [child] }));
    expect(consume(themeContext, child)?.value).toEqual({ a: 1 });
  });

  it('passes a signal of the theme through', () => {
    const theme = signal({ a: 1 });
    const child = document.createElement('span');
    document.body.append(ThemeProvider({ theme, children: [child] }));
    expect(consume(themeContext, child)).toBe(theme);
  });
});

describe('useTheme', () => {
  it('reads the theme above an element', () => {
    const child = document.createElement('span');
    document.body.append(ThemeProvider({ theme: { a: 2 }, children: [child] }));
    expect(useTheme(child)?.value).toEqual({ a: 2 });
  });

  it('is undefined without a provider', () => {
    const child = document.createElement('span');
    document.body.append(child);
    expect(useTheme(child)).toBeUndefined();
  });
});
