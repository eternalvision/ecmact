import type { Component } from '@em/component';

export type StyleSource = string | CSSStyleSheet;

export type ErrorPhase =
  'render' | 'event' | 'mounted' | 'cleanup' | 'unmounted' | 'beforeUpdate' | 'updated';

export interface ErrorInfo {
  component: Component;
  phase: ErrorPhase;
  event?: string;
}

export type ErrorHandler = (error: unknown, info: ErrorInfo) => void;

export interface Config {
  shadow: boolean;
  styles: StyleSource[];
  warnings: boolean;
  onError?: ErrorHandler;
}

/**
 * Creates the default configuration.
 *
 * @returns A new configuration object.
 */
const defaults = (): Config => ({ shadow: true, styles: [], warnings: true });

let current = defaults();

/**
 * Sets application-wide defaults. Options are merged with the ones set before.
 * Call it before the first component is created.
 *
 * @example
 * configure({ shadow: false, styles: [tailwind] });
 *
 * @param options - The options to change.
 */
export const configure = (options: Partial<Config>) => {
  current = { ...current, ...options };
};

/**
 * Reads the current configuration.
 *
 * @returns The current configuration.
 */
export const getConfig = () => current;

/**
 * Restores the default configuration. Meant for tests.
 */
export const resetConfig = () => {
  current = defaults();
};
