import { getConfig } from './config';
import { effect, untracked } from './signals';
import type { ComponentProps, RenderState, ResolvedProps } from './types';
import { propsEqual, render, resolveProps } from './utils';

const Base = typeof HTMLElement === 'undefined' ? (class {} as typeof HTMLElement) : HTMLElement;

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
  }

  connectedCallback() {
    untracked(() => {
      const resolved = resolveProps(this.#props as ComponentProps);
      if (!this.#last || (!propsEqual(resolved, this.#last) && !this.#vetoes(resolved))) {
        this.#paint(resolved);
      }
      this.#watch();
      this.#cleanup = this.#hooks.mounted?.(this.#state.element as HTMLElement, this.#self);
    });
  }

  disconnectedCallback() {
    this.#stop?.();
    this.#stop = null;
    this.#cleanup?.();
    this.#cleanup = undefined;
    this.#hooks.unmounted?.(this.#state.element as HTMLElement, this.#self);
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

  #vetoes(next: ResolvedProps) {
    return next.beforeUpdate?.(next, this.#last as ResolvedProps, this.#self) === false;
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
    this.#root ??=
      (resolved.shadow ?? getConfig().shadow) === false
        ? this
        : this.attachShadow({ mode: 'open' });
    const element = render(this.#root, resolved, this.#state);
    this.#last = resolved;
    if (previous) resolved.updated?.(element, this.#self, previous);
  }
}
