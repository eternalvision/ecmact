import { afterEach, describe, expect, it } from 'vitest';
import { currentLocale } from '@site/lib/i18n';
import { LanguageToggle } from '@site/ui/languageToggle';
import { resetLocale, useLocale } from '@tests/helpers';

afterEach(async () => {
  document.body.replaceChildren();
  await resetLocale();
});

describe('LanguageToggle', () => {
  it('names the language it will switch to and switches on click', () => {
    const toggle = LanguageToggle();
    document.body.append(toggle);
    const button = toggle.querySelector('button')!;
    expect(button.textContent).toBe('RU');
    expect(button.lang).toBe('ru');
    expect(button.getAttribute('aria-label')).toBe('Switch the language');
    button.click();
    expect(currentLocale()).toBe('ru');
  });

  it('is in the language it offers to leave', async () => {
    await useLocale('ru');
    const toggle = LanguageToggle();
    expect(toggle.querySelector('button')?.textContent).toBe('EN');
    expect(toggle.querySelector('button')?.getAttribute('aria-label')).toBe('Сменить язык');
  });
});
