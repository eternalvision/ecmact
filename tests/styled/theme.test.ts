import { afterEach, describe, expect, it } from 'vitest';
import { signal, ThemeProvider, themeContext, useTheme } from '@em';

afterEach(() => {
  document.body.replaceChildren();
});

describe('ThemeProvider', () => {
  it('renders a div that does not affect the layout', () => {
    const provider = ThemeProvider({ theme: { a: 1 } });
    document.body.append(provider);
    expect(provider.localName).toBe('div');
    expect(provider.style.display).toBe('contents');
  });

  it('keeps the style of the user next to display contents', () => {
    const provider = ThemeProvider({ theme: {}, style: { color: 'red' } });
    document.body.append(provider);
    expect(provider.style.display).toBe('contents');
    expect(provider.style.color).toBe('red');
  });

  it('renders its children', () => {
    const child = document.createElement('span');
    const provider = ThemeProvider({ theme: {} }, child);
    document.body.append(provider);
    expect(provider.contains(child)).toBe(true);
  });

  it('provides the theme as a signal on the theme context', () => {
    const child = document.createElement('span');
    document.body.append(ThemeProvider({ theme: { a: 1 } }, child));
    expect(themeContext.use(child)?.value).toEqual({ a: 1 });
  });

  it('passes a signal of the theme through', () => {
    const theme = signal({ a: 1 });
    const child = document.createElement('span');
    document.body.append(ThemeProvider({ theme }, child));
    expect(themeContext.use(child)).toBe(theme);
  });
});

describe('useTheme', () => {
  it('reads the theme above an element', () => {
    const child = document.createElement('span');
    document.body.append(ThemeProvider({ theme: { a: 2 } }, child));
    expect(useTheme(child)?.value).toEqual({ a: 2 });
  });

  it('is undefined without a provider', () => {
    const child = document.createElement('span');
    document.body.append(child);
    expect(useTheme(child)).toBeUndefined();
  });
});
