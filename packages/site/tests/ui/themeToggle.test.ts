import { afterEach, describe, expect, it } from 'vitest';
import { themeStore } from '@site/app/theme';
import { ThemeToggle } from '@site/ui/themeToggle';
import { resetLocale, useLocale } from '@tests/helpers';

afterEach(() => {
  themeStore.setState({ mode: 'system' });
  document.body.replaceChildren();
});

describe('ThemeToggle', () => {
  it('shows the mode and cycles it on click', () => {
    const toggle = ThemeToggle();
    document.body.append(toggle);
    const button = toggle.querySelector('button')!;
    expect(button.textContent).toBe('◐ Auto');
    button.click();
    expect(button.textContent).toBe('☀ Light');
    button.click();
    expect(button.textContent).toBe('☾ Dark');
    button.click();
    expect(button.textContent).toBe('◐ Auto');
  });
});

describe('ThemeToggle in Russian', () => {
  it('shows the modes in Russian', async () => {
    await useLocale('ru');
    const toggle = ThemeToggle();
    document.body.append(toggle);
    const button = toggle.querySelector('button')!;
    expect(button.textContent).toBe('◐ Авто');
    button.click();
    expect(button.textContent).toBe('☀ Светлая');
    button.click();
    expect(button.textContent).toBe('☾ Тёмная');
    await resetLocale();
  });
});
