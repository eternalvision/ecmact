import type { ComponentProps, RenderState } from './types';
import { render } from './utils';

const Base = typeof HTMLElement === 'undefined' ? (class {} as typeof HTMLElement) : HTMLElement;

export class Component<K extends string = string> extends Base {
  #props: ComponentProps<K>;
  readonly #root: ShadowRoot;
  readonly #state: RenderState = {
    element: null,
    attributes: new Set(),
    styles: new Set(),
    listeners: new Map(),
  };

  constructor(props: ComponentProps<K> = {} as ComponentProps<K>) {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
    this.#props = props;
  }

  connectedCallback() {
    if (!this.#state.element) this.#render();
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

  #render() {
    render(this.#root, this.#props as ComponentProps, this.#state);
  }
}
