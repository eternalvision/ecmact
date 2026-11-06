import { signal, type ReadonlySignal, type Signal } from '@em/signals';

/**
 * What a widget's `render` function receives.
 *
 * @template A - The names of the observed attributes.
 */
export interface WidgetContext<A extends string = string> {
  /** The custom element itself, the host of the widget. */
  host: HTMLElement;
  /** The observed attributes as signals: the attribute value, or `null` while it is absent. */
  props: Record<A, ReadonlySignal<string | null>>;
  /**
   * Dispatches a `CustomEvent` on the host that crosses the shadow boundary, so the page around the widget can listen to it.
   *
   * @param type - The event name, for example `submit`.
   * @param detail - The data the event carries.
   * @returns `false` if a listener cancelled the event.
   */
  emit: (type: string, detail?: unknown) => boolean;
}

/**
 * Options of `defineWidget`.
 *
 * @template A - The names of the observed attributes.
 */
export interface WidgetOptions<A extends string = string> {
  /** The attributes to follow. Changing one on the page updates the matching signal in `props`. */
  attributes?: readonly A[];
  /** Renders into a Shadow DOM, which keeps the widget's styles apart from the page's. Defaults to `true`. */
  shadow?: boolean;
}

/**
 * Registers a custom element that renders a component tree, for embedding in pages you do not control.
 * The element is created by the browser, so `<my-widget currency="EUR"></my-widget>` in HTML is enough to use it.
 * `render` runs once, when the element is first connected.
 *
 * @example
 * defineWidget('price-calculator', ({ props, emit }) =>
 *   tags.button({
 *     content: computed(() => `Pay in ${props.currency.value ?? 'USD'}`),
 *     onclick: () => emit('pay'),
 *   }),
 * { attributes: ['currency'] });
 *
 * @template A - The names of the observed attributes.
 * @param name - The tag name; it must contain a hyphen, like any custom element.
 * @param render - Builds the widget from its context and returns the node to show.
 * @param options - The attributes to follow and whether to use a Shadow DOM.
 * @returns The element class that was registered.
 * @throws {Error} If the name is already registered.
 */
export const defineWidget = <A extends string = never>(
  name: string,
  render: (context: WidgetContext<A>) => Node,
  { attributes = [], shadow = true }: WidgetOptions<A> = {},
): CustomElementConstructor => {
  if (customElements.get(name)) throw new Error(`ecmact: "${name}" is already defined`);

  const widget = class extends HTMLElement {
    static readonly observedAttributes: readonly string[] = attributes;
    readonly #props = Object.fromEntries(
      attributes.map((attribute) => [attribute, signal<string | null>(null)]),
    ) as Record<A, Signal<string | null>>;
    #rendered = false;

    /**
     * Called by the browser when an observed attribute is set, changed or removed.
     *
     * @param attribute - The attribute name.
     * @param _ - The old value, not used.
     * @param value - The new value, or `null` when the attribute was removed.
     */
    attributeChangedCallback(attribute: string, _: string | null, value: string | null) {
      this.#props[attribute as A].value = value;
    }

    /**
     * Called by the browser when the element is added to a document. Renders the widget the first time.
     */
    connectedCallback() {
      if (this.#rendered) return;
      this.#rendered = true;
      const root = shadow ? this.attachShadow({ mode: 'open' }) : this;
      /**
       * Dispatches a composed event on the host.
       *
       * @param type - The event name.
       * @param detail - The data the event carries.
       * @returns `false` if a listener cancelled the event.
       */
      const emit = (type: string, detail?: unknown) =>
        this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
      root.replaceChildren(render({ host: this, props: this.#props, emit }));
    }
  };

  customElements.define(name, widget);
  return widget;
};
