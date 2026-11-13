import { createContext } from '@em/core/context';
import { tags } from '@em/core/tags';
import { isSignal, signal, type ReadonlySignal } from '@em/signals/signals';
import type { Child, Props } from '@em/types';

/**
 * The theme that styled components read as `props.theme`: any object, usually design tokens such as colors and spacing.
 */
export type Theme = Record<string, unknown>;

/** The context that carries the theme down the tree, as a signal. */
export const themeContext = createContext<ReadonlySignal<Theme>>('ecmact:theme');

/** Props of `ThemeProvider`: the props of a div, plus the theme. */
export type ThemeProviderProps = Omit<Props<'div'>, 'provide'> & {
  /** The theme, or a signal of it to change the theme at runtime. */
  theme: Theme | ReadonlySignal<Theme>;
};

/**
 * Offers a theme to every styled component below it. A provider inside another one replaces the theme for its
 * own subtree. The provider is a `div` with `display: contents`, so it does not affect the layout.
 *
 * @example
 * mount('#app', ThemeProvider({ theme: { accent: '#1665e0' } }, Button('Save')));
 *
 * @param props - The theme and the usual props of a div.
 * @param children - The children.
 * @returns The provider element.
 */
export const ThemeProvider = (
  { theme, style, ...props }: ThemeProviderProps,
  ...children: Child[]
) =>
  tags.div(
    {
      ...props,
      style: { display: 'contents', ...(style as object) },
      provide: themeContext.provide(isSignal(theme) ? theme : signal(theme)),
    },
    ...children,
  );

/**
 * Reads the theme that applies to an element, as a signal.
 *
 * @param host - An element that is inside the document, below the provider.
 * @returns The theme signal, or `undefined` when no `ThemeProvider` is above the element.
 */
export const useTheme = (host: Element) => themeContext.use(host);
