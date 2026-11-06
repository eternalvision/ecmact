import { themeStore, type ThemeMode } from '@site/app/theme';
import { tag } from '@site/lib/component';

const labels: Record<ThemeMode, string> = {
  system: '◐ Auto',
  light: '☀ Light',
  dark: '☾ Dark',
};

/**
 * A button that cycles the theme: follow the system, light, dark.
 *
 * @returns The component.
 */
export const ThemeToggle = () =>
  tag('button', {
    type: 'button',
    class: 'chip',
    'aria-label': 'Change the color theme',
    content: themeStore.select((state) => labels[state.mode]),
    /**
     * Moves to the next theme.
     */
    onclick: () => {
      themeStore.getState().cycle();
    },
  });
