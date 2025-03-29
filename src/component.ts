import type { ComponentProps } from '@types';
import { setEventListeners, generateStyle, render } from '@utils';

export class component extends HTMLElement {
  private _props: ComponentProps;

  constructor(props: ComponentProps = {}) {
    super();
    this.attachShadow({ mode: 'open' });
    this._props = props;
  }

  #setEventListeners() {
    return setEventListeners({
      props: this.props,
      shadowRoot: this.shadowRoot,
    });
  }

  #generateStyle() {
    const { style = {}, tag = 'div' } = this.props;
    return generateStyle({ style, tag });
  }

  #render() {
    return render({
      props: this._props,
      shadowRoot: this.shadowRoot,
      generateStyle: () => this.#generateStyle(),
    });
  }

  connectedCallback() {
    this.#render();
    this.#setEventListeners();
  }

  setState(newProps: Partial<ComponentProps>) {
    this.props = {
      ...this._props,
      ...newProps,
    };
  }

  get props() {
    return this._props;
  }

  set props(newProps: ComponentProps) {
    this._props = newProps;
    this.#render();
    this.#setEventListeners();
  }
}
