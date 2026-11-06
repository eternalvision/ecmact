import { text } from '@site/content/messages';
import { tag } from '@site/lib/component';
import { localeStore } from '@site/lib/i18n';

/**
 * A button that switches the language. It names the language it will switch to.
 *
 * @returns The component.
 */
export const LanguageToggle = () => {
  const m = text().chrome;
  return tag('button', {
    type: 'button',
    class: 'chip',
    lang: m.languageName.toLowerCase(),
    'aria-label': m.language,
    content: m.languageName,
    /**
     * Moves to the other language.
     */
    onclick: () => {
      localeStore.getState().cycle();
    },
  });
};
