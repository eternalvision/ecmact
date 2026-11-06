export interface Context<T> {
  readonly id: symbol;
  readonly name: string;
  readonly type?: T;
}

export interface Provision {
  readonly context: Context<unknown>;
  readonly value: unknown;
}

export interface ContextRequest {
  context: Context<unknown>;
  host: Element;
  respond: (value: unknown) => void;
}

export const contextRequestEvent = 'ecmact:context-request';

export const createContext = <T>(name: string): Context<T> => ({ id: Symbol(name), name });

export const provide = <T>(context: Context<T>, value: T): Provision => ({
  context: context as Context<unknown>,
  value,
});

export const consume = <T>(context: Context<T>, host: Element): T | undefined => {
  let found: { value: T } | undefined;
  const detail: ContextRequest = {
    context: context as Context<unknown>,
    host,
    respond: (value) => (found = { value: value as T }),
  };
  host.dispatchEvent(
    new CustomEvent<ContextRequest>(contextRequestEvent, {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
  return found?.value;
};
