/** Where shared styles come from: CSS text or a stylesheet object. */
export type StyleSource = string | CSSStyleSheet;

/** Where an error happened: an event listener, or one of the lifecycle hooks (`cleanup` is the function returned by `mounted`). */
export type ErrorPhase = 'event' | 'mounted' | 'cleanup' | 'unmounted';

/** Describes where an error came from, for error handlers. */
export interface ErrorInfo {
  /** The element the error came from: the one with the listener, or the component with the hook. */
  element: Element;
  /** Where it happened. */
  phase: ErrorPhase;
  /** The lowercase event name, for the `event` phase. */
  event?: string;
}

/**
 * Receives errors from event listeners and lifecycle hooks. Set on an element (`error` prop), for it and everything below it, or globally (`onError`).
 *
 * @param error - The error that was thrown.
 * @param info - Where it came from.
 */
export type ErrorHandler = (error: unknown, info: ErrorInfo) => void;

/** Application-wide defaults, set with `configure`. */
export interface Config {
  /** Whether components made with `em` render into a shadow root by default. A component's own `shadow` prop wins. */
  shadow: boolean;
  /**
   * The prefix of the custom element of a component whose name is one word: `em.Card` is `<em-card>` by default.
   * A name of two words needs none, `em.UserCard` is `<user-card>`. With an empty prefix every name must have two words.
   */
  prefix: string;
  /** Stylesheets adopted by every shadow component, before its own `css`. */
  styles: StyleSource[];
  /** Whether development warnings are logged to the console. */
  warnings: boolean;
  /** The error handler used where no `error` prop applies. Without any handler, errors are rethrown. */
  onError?: ErrorHandler;
}

/**
 * Creates the default configuration.
 *
 * @returns A new configuration object.
 */
const defaults = (): Config => ({ shadow: true, prefix: 'em', styles: [], warnings: true });

let current = defaults();

/**
 * Sets application-wide defaults. Options are merged with the ones set before.
 * Call it before the first component is created.
 *
 * @example
 * configure({ prefix: 'my', styles: [tailwind] });
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
