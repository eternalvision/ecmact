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
