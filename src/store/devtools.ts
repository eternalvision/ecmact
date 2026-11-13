import type { SetState, StateCreator } from '@em/store/store';

/** Options of `devtools`. */
export interface DevtoolsOptions {
  /** The name of the connection in Redux DevTools. */
  name?: string;
  /** Turns the connection off when `false`. Defaults to `true`. */
  enabled?: boolean;
  /** The action name for changes that were not given one. Defaults to `anonymous`. */
  anonymousActionType?: string;
}

/** The part of the Redux DevTools extension that `devtools` uses. */
interface Connection {
  /**
   * Sends the initial state.
   *
   * @param state - The state.
   */
  init(state: unknown): void;
  /**
   * Sends an action and the state after it.
   *
   * @param action - The action.
   * @param state - The state.
   */
  send(action: { type: string }, state: unknown): void;
  /**
   * Listens to the extension, for time travel.
   *
   * @param listener - Receives the messages.
   * @returns A function that stops listening.
   */
  subscribe(
    listener: (message: { type: string; payload?: { type: string }; state?: string }) => void,
  ): () => void;
}

/** The extension as it appears on `window`. */
interface Extension {
  /**
   * Connects to the extension.
   *
   * @param options - Names the connection.
   * @returns The connection.
   */
  connect(options: { name?: string }): Connection;
}

/**
 * Shows the store in the Redux DevTools browser extension: every change is sent as an action, and jumping in
 * time in the extension sets the state. Without the extension the store works as usual.
 *
 * @template T - The state.
 * @param creator - Builds the initial state.
 * @param options - The connection options.
 * @returns A creator for the store.
 */
export const devtools =
  <T>(creator: StateCreator<T>, options: DevtoolsOptions = {}): StateCreator<T> =>
  (set, get, api) => {
    const extension = (globalThis as { __REDUX_DEVTOOLS_EXTENSION__?: Extension })
      .__REDUX_DEVTOOLS_EXTENSION__;
    if (options.enabled === false || !extension) return creator(set, get, api);
    const connection = extension.connect({ name: options.name });
    const named = ((partial: never, replace?: boolean, action?: string) => {
      (set as (...args: unknown[]) => void)(partial, replace);
      connection.send({ type: action ?? options.anonymousActionType ?? 'anonymous' }, get());
    }) as SetState<T>;
    api.setState = named;
    connection.subscribe((message) => {
      if (
        message.type === 'DISPATCH' &&
        (message.payload?.type === 'JUMP_TO_STATE' || message.payload?.type === 'JUMP_TO_ACTION') &&
        message.state
      ) {
        (set as (...args: unknown[]) => void)(JSON.parse(message.state), true);
      }
    });
    const state = creator(named, get, api);
    connection.init(state);
    return state;
  };
