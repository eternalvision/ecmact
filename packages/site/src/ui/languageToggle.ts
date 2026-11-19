import { tags } from 'ecmact';
import { text } from '@site/content/messages';
import { localeStore } from '@site/lib/i18n';

/**
 * A button that switches the language. It names the language it will switch to. Only that name is marked with
 * its own language, so the accessible name of the button stays in the language of the page.
 *
 * @returns The button.
 */
export const LanguageToggle = () => {
  const m = text().chrome;
  return tags.button(
    {
      type: 'button',
      class: 'chip',
      'aria-label': `${m.language}: ${m.languageName}`,
      onclick: localeStore.cycle,
    },
    tags.span({ lang: m.languageName.toLowerCase() }, m.languageName),
  );
};
