import { createStore } from 'ecmact';

/** How the colors are chosen: by the system, or fixed. */
export type ThemeMode = 'system' | 'light' | 'dark';

const order: ThemeMode[] = ['system', 'light', 'dark'];

/** The theme of the site, kept in `localStorage` so that the choice survives a reload. */
export const themeStore = createStore(
  { mode: 'system' as ThemeMode },
  (set) => ({
    /**
     * Moves to the next mode.
     */
    cycle: () => {
      set((state) => ({
        mode: order[(order.indexOf(state.mode) + 1) % order.length] as ThemeMode,
      }));
    },
  }),
  { persist: { name: 'ecmact-site-theme' } },
);

/**
 * Puts the mode on the document: the stylesheet reads `data-theme`, and without it follows the system.
 *
 * @param mode - The mode.
 */
export const applyTheme = (mode: ThemeMode) => {
  if (mode === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = mode;
};

/**
 * Keeps the document in step with the theme store, starting now.
 *
 * @returns A function that stops it.
 */
export const watchTheme = () =>
  themeStore.watch((state) => state.mode, applyTheme, { fireImmediately: true });
