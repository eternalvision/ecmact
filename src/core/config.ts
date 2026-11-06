import type { Component } from '@em/core/component';

/** Where shared styles come from: CSS text or a stylesheet object. */
export type StyleSource = string | CSSStyleSheet;

/** Where an error happened: rendering, an event listener, or one of the lifecycle hooks (`cleanup` is the function returned by `mounted`). */
export type ErrorPhase =
  'render' | 'event' | 'mounted' | 'cleanup' | 'unmounted' | 'beforeUpdate' | 'updated';

/** Describes where an error came from, for error handlers. */
export interface ErrorInfo {
  /** The component the error came from. */
  component: Component;
  /** Where it happened. */
  phase: ErrorPhase;
  /** The lowercase event name, for the `event` phase. */
  event?: string;
}

/**
 * Receives errors from hooks, event listeners and rendering. Set per component (`error` prop) or globally (`onError`).
 *
 * @param error - The error that was thrown.
 * @param info - Where it came from.
 */
export type ErrorHandler = (error: unknown, info: ErrorInfo) => void;

/** Application-wide defaults, set with `configure`. */
export interface Config {
  /** Whether components render into a shadow root by default. A component's own `shadow` prop wins. */
  shadow: boolean;
  /** Stylesheets adopted by every shadow component, before its own `css`. */
  styles: StyleSource[];
  /** Whether development warnings are logged to the console. */
  warnings: boolean;
  /** The error handler used by components that have no `error` prop. Without any handler, errors are rethrown. */
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
