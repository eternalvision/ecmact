import { themeStore } from '@site/app/theme';
import { text } from '@site/content/messages';
import { tag } from '@site/lib/component';

/**
 * A button that cycles the theme: follow the system, light, dark.
 *
 * @returns The component.
 */
export const ThemeToggle = () => {
  const m = text().chrome;
  const labels = { system: m.themeAuto, light: m.themeLight, dark: m.themeDark };
  return tag('button', {
    type: 'button',
    class: 'chip',
    'aria-label': m.theme,
    content: themeStore.select((state) => labels[state.mode]),
    /**
     * Moves to the next theme.
     */
    onclick: () => {
      themeStore.getState().cycle();
    },
  });
};
