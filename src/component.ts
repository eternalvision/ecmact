import type { ComponentProps, RenderState } from './types';
import { render } from './utils';

const Base = typeof HTMLElement === 'undefined' ? (class {} as typeof HTMLElement) : HTMLElement;

export class Component<K extends string = string> extends Base {
  #props: ComponentProps<K>;
  #root: ParentNode | null = null;
  readonly #state: RenderState = {
    element: null,
    attributes: new Set(),
    styles: new Set(),
    listeners: new Map(),
  };

  constructor(props: ComponentProps<K> = {} as ComponentProps<K>) {
    super();
    this.#props = props;
  }

  connectedCallback() {
    if (!this.#state.element) this.#render();
    this.#hooks.mounted?.(this.#state.element as HTMLElement);
  }

  disconnectedCallback() {
    this.#hooks.unmounted?.(this.#state.element as HTMLElement);
  }

  setState(newProps: Partial<ComponentProps<K>>) {
    this.props = { ...this.#props, ...newProps } as ComponentProps<K>;
  }

  get props() {
    return this.#props;
  }

  set props(newProps: ComponentProps<K>) {
    this.#props = newProps;
    this.#render();
  }

  get #hooks() {
    return this.#props as ComponentProps;
  }

  #render() {
    const wasRendered = this.#state.element !== null;
    this.#root ??= this.#hooks.shadow === false ? this : this.attachShadow({ mode: 'open' });
    const element = render(this.#root, this.#hooks, this.#state);
    if (wasRendered) this.#hooks.updated?.(element);
  }
}
