import type { ComponentProps, RenderState } from './types';
import { render } from './utils';

const Base = typeof HTMLElement === 'undefined' ? (class {} as typeof HTMLElement) : HTMLElement;

export class Component extends Base {
  #props: ComponentProps;
  readonly #root: ShadowRoot;
  readonly #state: RenderState = {
    element: null,
    attributes: new Set(),
    styles: new Set(),
    listeners: new Map(),
  };

  constructor(props: ComponentProps = {}) {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
    this.#props = props;
  }

  connectedCallback() {
    if (!this.#state.element) this.#render();
  }

  setState(newProps: Partial<ComponentProps>) {
    this.props = { ...this.#props, ...newProps };
  }

  get props() {
    return this.#props;
  }

  set props(newProps: ComponentProps) {
    this.#props = newProps;
    this.#render();
  }

  #render() {
    render(this.#root, this.#props, this.#state);
  }
}
