import { tags } from 'ecmact';
import { themeStore } from '@site/app/theme';
import { text } from '@site/content/messages';

/**
 * A button that cycles the theme: follow the system, light, dark.
 *
 * @returns The button.
 */
export const ThemeToggle = () => {
  const m = text().chrome;
  const labels = { system: m.themeAuto, light: m.themeLight, dark: m.themeDark };
  return tags.button(
    { type: 'button', class: 'chip', 'aria-label': m.theme, onclick: themeStore.cycle },
    () => labels[themeStore.mode],
  );
};
