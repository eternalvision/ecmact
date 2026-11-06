import { batch, effect, signal, untracked, type ReadonlySignal } from '@em/signals';

export interface ResourceContext {
  signal: AbortSignal;
}

export interface ResourceOptions<T> {
  initial?: T;
}

export interface Resource<T> {
  readonly data: ReadonlySignal<T | undefined>;
  readonly error: ReadonlySignal<unknown>;
  readonly loading: ReadonlySignal<boolean>;
  refetch(): void;
  mutate(value: T): void;
  dispose(): void;
}

export const resource = <T>(
  fetcher: (context: ResourceContext) => T | Promise<T>,
  options: ResourceOptions<T> = {},
): Resource<T> => {
  const data = signal<T | undefined>(options.initial);
  const error = signal<unknown>(undefined);
  const loading = signal(false);
  let controller: AbortController | undefined;
  let current = 0;

  const load = () => {
    controller?.abort();
    const own = new AbortController();
    controller = own;
    const run = ++current;
    batch(() => {
      loading.value = true;
      error.value = undefined;
    });
    const settle = (apply: () => void) => {
      if (run !== current) return;
      batch(() => {
        apply();
        loading.value = false;
      });
    };
    new Promise<T>((resolve) => resolve(fetcher({ signal: own.signal }))).then(
      (value) => settle(() => (data.value = value)),
      (reason) => settle(() => (error.value = reason)),
    );
  };

  const stop = effect(load);

  return {
    data,
    error,
    loading,
    refetch: () => untracked(load),
    mutate: (value) =>
      batch(() => {
        data.value = value;
        error.value = undefined;
      }),
    dispose: () => {
      stop();
      controller?.abort();
      current++;
      loading.value = false;
    },
  };
};
