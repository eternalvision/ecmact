import { tags } from 'ecmact';
import { themeStore } from '@site/app/theme';
import { text } from '@site/content/messages';

/**
 * A button that cycles the theme: follow the system, light, dark. The visible text is the current mode with its
 * symbol, and the accessible name starts with what the button changes and ends with the same mode word.
 *
 * @returns The button.
 */
export const ThemeToggle = () => {
  const m = text().chrome;
  const modes = {
    system: { symbol: '◐', name: m.themeAuto },
    light: { symbol: '☀', name: m.themeLight },
    dark: { symbol: '☾', name: m.themeDark },
  };

  /**
   * Reads the mode that the store holds now.
   *
   * @returns The symbol and the word of the mode.
   */
  const mode = () => modes[themeStore.mode];

  /**
   * Builds the accessible name: what the button changes, then the mode.
   *
   * @returns The name.
   */
  const label = () => `${m.theme}: ${mode().name}`;

  return tags.button(
    { type: 'button', class: 'chip', 'aria-label': label, onclick: themeStore.cycle },
    () => `${mode().symbol} ${mode().name}`,
  );
};
