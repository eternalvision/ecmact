import { getConfig, type ErrorPhase } from '@em/config';
import { contextRequestEvent, type ContextRequest } from '@em/context';
import { effect, untracked } from '@em/signals';
import type { ComponentProps, RenderState, ResolvedProps } from '@em/types';
import { propsEqual, render, resolveProps, warn } from '@em/utils';

const Base =
  typeof HTMLElement === 'undefined' ? (Object as unknown as typeof HTMLElement) : HTMLElement;

export class Component<K extends string = string> extends Base {
  #props: ComponentProps<K>;
  #last: ResolvedProps | null = null;
  #root: ParentNode | null = null;
  #stop: (() => void) | null = null;
  #cleanup: (() => void) | void = undefined;
  readonly #state: RenderState = {
    element: null,
    attributes: new Set(),
    styles: new Set(),
    listeners: new Map(),
    ownSheet: null,
    sheetText: undefined,
    sheetKey: '',
    sheetNodes: [],
  };

  constructor(props: ComponentProps<K> = {} as ComponentProps<K>) {
    super();
    this.#props = props;
    this.addEventListener(contextRequestEvent, this.#answer);
  }

  connectedCallback() {
    untracked(() => {
      const resolved = resolveProps(this.#props as ComponentProps);
      if (!this.#last || (!propsEqual(resolved, this.#last) && !this.#vetoes(resolved))) {
        this.#paint(resolved);
      }
      this.#watch();
      this.#cleanup = this.#guard('mounted', () =>
        this.#hooks.mounted?.(this.#element, this.#self),
      );
    });
  }

  disconnectedCallback() {
    this.#stop?.();
    this.#stop = null;
    const cleanup = this.#cleanup;
    this.#cleanup = undefined;
    if (cleanup) this.#guard('cleanup', cleanup);
    this.#guard('unmounted', () => this.#hooks.unmounted?.(this.#element, this.#self));
  }

  setState(newProps: Partial<ComponentProps<K>>) {
    this.props = { ...this.#props, ...newProps } as ComponentProps<K>;
  }

  get props() {
    return this.#props;
  }

  set props(newProps: ComponentProps<K>) {
    untracked(() => {
      const resolved = resolveProps(newProps as ComponentProps);
      if (this.#last && this.#vetoes(resolved)) return;
      this.#props = newProps;
      this.#paint(resolved);
      if (this.#stop) this.#watch();
    });
  }

  get #hooks() {
    return this.#props as unknown as ResolvedProps;
  }

  get #self() {
    return this as unknown as Component;
  }

  get #element() {
    return this.#state.element as HTMLElement;
  }

  readonly #answer = (event: Event) => {
    const { context, host, respond } = (event as CustomEvent<ContextRequest>).detail;
    if (host === this) return;
    const provision = this.#hooks.provide?.find((candidate) => candidate.context === context);
    if (!provision) return;
    event.stopPropagation();
    respond(provision.value);
  };

  #report(error: unknown, phase: ErrorPhase, event?: string) {
    const handler = this.#hooks.error ?? getConfig().onError;
    if (!handler) throw error;
    handler(error, { component: this.#self, phase, event });
  }

  #guard<T>(phase: ErrorPhase, fn: () => T) {
    try {
      return fn();
    } catch (error) {
      this.#report(error, phase);
      return undefined;
    }
  }

  #vetoes(next: ResolvedProps) {
    const current = this.#last as ResolvedProps;
    return (
      this.#guard('beforeUpdate', () => next.beforeUpdate?.(next, current, this.#self)) === false
    );
  }

  #watch() {
    this.#stop?.();
    let initial = true;
    this.#stop = effect(() => {
      const resolved = resolveProps(this.#props as ComponentProps);
      if (initial) {
        initial = false;
        return;
      }
      untracked(() => {
        if (!this.#vetoes(resolved)) this.#paint(resolved);
      });
    });
  }

  #paint(resolved: ResolvedProps) {
    const previous = this.#last;
    const wantsShadow = (resolved.shadow ?? getConfig().shadow) !== false;
    this.#root ??= wantsShadow ? this.attachShadow({ mode: 'open' }) : this;
    if (previous && wantsShadow !== (this.#root !== this)) {
      warn('shadow cannot change after the first render');
    }
    const root = this.#root;
    const element = this.#guard('render', () =>
      render(root, resolved, this.#state, (error, event) => this.#report(error, 'event', event)),
    );
    this.#last = resolved;
    if (previous && element) {
      this.#guard('updated', () => resolved.updated?.(element, this.#self, previous));
    }
  }
}
