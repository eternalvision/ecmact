import { tags } from 'ecmact';
import { text } from '@site/content/messages';
import { localeStore } from '@site/lib/i18n';

/**
 * A button that switches the language. It names the language it will switch to, and its accessible name repeats
 * that text after what the button does.
 *
 * @returns The button.
 */
export const LanguageToggle = () => {
  const m = text().chrome;
  return tags.button(
    {
      type: 'button',
      class: 'chip',
      lang: m.languageName.toLowerCase(),
      'aria-label': `${m.language}: ${m.languageName}`,
      onclick: localeStore.cycle,
    },
    m.languageName,
  );
};
