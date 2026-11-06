import { afterEach, describe, expect, it } from 'vitest';
import { themeStore } from '@site/app/theme';
import { ThemeToggle } from '@site/ui/themeToggle';

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
