import type { ComponentProps, RenderState } from './types';
import { getConfig } from './config';
import { render } from './utils';

const Base = typeof HTMLElement === 'undefined' ? (class {} as typeof HTMLElement) : HTMLElement;

export class Component<K extends string = string> extends Base {
  #props: ComponentProps<K>;
  #root: ParentNode | null = null;
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
    if (!this.#state.element) this.#render();
    this.#cleanup = this.#hooks.mounted?.(this.#state.element as HTMLElement, this.#self);
  }

  disconnectedCallback() {
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
    const current = this.#props;
    const hooks = newProps as ComponentProps;
    if (
      this.#state.element &&
      hooks.beforeUpdate?.(hooks, current as ComponentProps, this.#self) === false
    ) {
      return;
    }
    this.#props = newProps;
    this.#render(current);
  }

  get #hooks() {
    return this.#props as ComponentProps;
  }

  get #self() {
    return this as unknown as Component;
  }

  #render(previous?: ComponentProps<K>) {
    const wasRendered = this.#state.element !== null;
    this.#root ??=
      (this.#hooks.shadow ?? getConfig().shadow) === false
        ? this
        : this.attachShadow({ mode: 'open' });
    const element = render(this.#root, this.#hooks, this.#state);
    if (wasRendered) this.#hooks.updated?.(element, this.#self, previous as ComponentProps);
  }
}
