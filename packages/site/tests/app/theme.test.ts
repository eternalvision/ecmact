import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { applyTheme, themeStore, watchTheme } from '@site/app/theme';

beforeEach(() => {
  themeStore.setState({ mode: 'system' });
  localStorage.clear();
});

afterEach(() => {
  delete document.documentElement.dataset.theme;
});

describe('themeStore', () => {
  it('starts by following the system and cycles system, light, dark', () => {
    expect(themeStore.mode).toBe('system');
    themeStore.cycle();
    expect(themeStore.mode).toBe('light');
    themeStore.cycle();
    expect(themeStore.mode).toBe('dark');
    themeStore.cycle();
    expect(themeStore.mode).toBe('system');
  });

  it('remembers the choice in localStorage', () => {
    themeStore.cycle();
    expect(JSON.parse(localStorage.getItem('ecmact-site-theme')!).state).toEqual({ mode: 'light' });
  });
});

describe('applyTheme', () => {
  it('sets data-theme for a fixed mode and removes it for the system', () => {
    applyTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    applyTheme('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    applyTheme('system');
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });
});

describe('watchTheme', () => {
  it('applies the mode now and after every change, until stopped', () => {
    themeStore.setState({ mode: 'dark' });
    const stop = watchTheme();
    expect(document.documentElement.dataset.theme).toBe('dark');
    themeStore.setState({ mode: 'light' });
    expect(document.documentElement.dataset.theme).toBe('light');
    stop();
    themeStore.setState({ mode: 'dark' });
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});

describe('stylesheet themes', () => {
  const stylesheet = () =>
    readFileSync(resolve(import.meta.dirname, '../../src/styles/site.css')).toString();

  /**
   * Reads the custom properties declared in the body of the first rule that starts with a selector.
   *
   * @param selector - The text before the opening brace.
   * @returns The properties by name.
   */
  const tokens = (selector: string) => {
    const css = stylesheet();
    const open = css.indexOf(`${selector} {`);
    expect(open).toBeGreaterThan(-1);
    const body = css.slice(open, css.indexOf('}', open));
    return Object.fromEntries(
      [...body.matchAll(/(--[\w-]+):\s*(#[0-9a-f]{6});/g)].map((match) => [match[1], match[2]]),
    ) as Record<string, string>;
  };

  /**
   * Computes the WCAG contrast ratio of two colors.
   *
   * @param a - A color as `#rrggbb`.
   * @param b - Another color.
   * @returns The ratio, from 1 to 21.
   */
  const contrast = (a: string, b: string) => {
    const luminance = (hex: string) => {
      const [r, g, bl] = [1, 3, 5].map((i) => {
        const c = parseInt(hex.slice(i, i + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      }) as [number, number, number];
      return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
    };
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
    return (hi + 0.05) / (lo + 0.05);
  };

  const themes = () => ({
    light: tokens(':root'),
    dark: tokens(":root[data-theme='dark']"),
    system: tokens(":root:not([data-theme='light'])"),
  });

  it('is light by default and follows the system preference until a theme is chosen', () => {
    const { light, dark, system } = themes();
    expect(stylesheet()).toContain(
      "@media (prefers-color-scheme: dark) {\n  :root:not([data-theme='light'])",
    );
    expect(light['--bg']).toBe('#ffffff');
    expect(system).toEqual({ ...dark });
  });

  it('keeps the interface and the code in grayscale', () => {
    const { light, dark } = themes();
    const grays = Object.entries({ ...light, ...dark }).filter(
      ([name]) => !['--danger'].includes(name),
    );
    grays.forEach(([name, hex]) => {
      expect(hex.slice(1, 3), name).toBe(hex.slice(3, 5));
      expect(hex.slice(3, 5), name).toBe(hex.slice(5, 7));
    });
  });

  it.each(['light', 'dark'] as const)(
    'keeps ordinary text at a contrast of 4.5 or more in the %s theme',
    (name) => {
      const theme = themes()[name];
      const surfaces = ['--bg', '--bg-soft', '--surface'] as const;
      surfaces.forEach((surface) => {
        ['--text', '--muted'].forEach((ink) => {
          expect(
            contrast(theme[ink]!, theme[surface]!),
            `${ink} on ${surface}`,
          ).toBeGreaterThanOrEqual(4.5);
        });
      });
      expect(contrast(theme['--on-primary']!, theme['--primary']!)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(theme['--danger']!, theme['--surface']!)).toBeGreaterThanOrEqual(4.5);
      Object.keys(theme)
        .filter((name) => name.startsWith('--tok-') || name === '--code-text')
        .forEach((name) => {
          expect(contrast(theme[name]!, theme['--code-bg']!), name).toBeGreaterThanOrEqual(4.5);
        });
    },
  );

  it('keeps the focus ring and the control outline visible against the page', () => {
    const { light, dark } = themes();
    [light, dark].forEach((theme) => {
      expect(contrast(theme['--focus']!, theme['--bg']!)).toBeGreaterThanOrEqual(3);
      expect(contrast(theme['--muted']!, theme['--bg']!)).toBeGreaterThanOrEqual(3);
    });
  });
});
