import { em } from '@em/core/em';
import { consume, createContext, provide } from '@em/core/context';
import { isSignal, signal, type ReadonlySignal } from '@em/signals/signals';
import type { Component } from '@em/core/component';
import type { ComponentProps } from '@em/types';

/**
 * The theme that styled components read as `props.theme`: any object, usually design tokens such as colors and spacing.
 */
export type Theme = Record<string, unknown>;

/** The context that carries the theme down the tree, as a signal. */
export const themeContext = createContext<ReadonlySignal<Theme>>('ecmact:theme');

/** Props of `ThemeProvider`: the props of a div, plus the theme. */
export type ThemeProviderProps = Omit<ComponentProps<'div'>, 'tag' | 'provide'> & {
  /** The theme, or a signal of it to change the theme at runtime. */
  theme: Theme | ReadonlySignal<Theme>;
};

/**
 * Offers a theme to every styled component below it. A provider inside another one replaces the theme for its
 * own subtree. The provider is a `div` with `display: contents`, so it does not affect the layout.
 *
 * @example
 * mount('#app', ThemeProvider({ theme: { accent: '#1665e0' }, children: [Button({ content: 'Save' })] }));
 *
 * @param props - The theme and the usual component props.
 * @returns The provider component.
 */
export const ThemeProvider = ({ theme, style, ...props }: ThemeProviderProps) => {
  const source = isSignal(theme) ? theme : signal(theme);
  return em.ThemeProvider({
    ...props,
    tag: 'div',
    style: { display: 'contents', ...(style as object) },
    provide: [provide(themeContext, source)],
  } as never) as Component<'div'>;
};

/**
 * Reads the theme that applies to an element, as a signal.
 *
 * @param host - An element that is inside the document, below the provider.
 * @returns The theme signal, or `undefined` when no `ThemeProvider` is above the element.
 */
export const useTheme = (host: Element) => consume(themeContext, host);
