import { notifyAttached } from '@em/core/context';
import { applyStyleSheets } from '@em/render/applyStyleSheets';
import { pause } from '@em/render/bindings';
import { toNodes } from '@em/render/children';
import { owned, signal, type Signal } from '@em/signals/signals';
import type { Child, SheetState } from '@em/types';
import { warn } from '@em/utils/warn';

/** The attributes of a widget with their default values. The type of a default decides how the attribute is read. */
export type WidgetAttributes = Record<string, string | number | boolean>;

/**
 * The props of a widget: one per attribute, with the type of its default.
 *
 * @template A - The attributes with their defaults.
 */
export type WidgetProps<A extends WidgetAttributes> = {
  readonly [P in keyof A]: A[P] extends number ? number : A[P] extends boolean ? boolean : string;
};

/**
 * What a widget's `render` function receives.
 *
 * @template A - The attributes with their defaults.
 */
export interface WidgetContext<A extends WidgetAttributes = WidgetAttributes> {
  /** The custom element itself, the host of the widget. */
  host: HTMLElement;
  /** The attributes as values. Reading one in a reactive function follows the attribute on the page. */
  props: WidgetProps<A>;
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
 * @template A - The attributes with their defaults.
 */
export interface WidgetOptions<A extends WidgetAttributes = WidgetAttributes> {
  /**
   * The attributes to follow, with their default values. A number default reads the attribute as a number, a
   * boolean one as "the attribute is there" (`"false"` switches it off), and text is taken as it is. A camelCase
   * name stands for the attribute in kebab-case: `maxItems` is `max-items`.
   */
  attributes?: A;
  /** Stylesheet text for the shadow root of the widget. */
  css?: string;
  /** Renders into a Shadow DOM, which keeps the widget's styles apart from the page's. Defaults to `true`. */
  shadow?: boolean;
}

/**
 * Turns the name of a prop into the name of its attribute.
 *
 * @param name - The camelCase name.
 * @returns The kebab-case name.
 */
const toAttributeName = (name: string) => name.replace(/([A-Z])/g, '-$1').toLowerCase();

/**
 * Reads an attribute in the type of its default.
 *
 * @param raw - The attribute value, or `null` while it is absent.
 * @param fallback - The default value.
 * @returns The value of the prop.
 */
const convert = (raw: string | null, fallback: string | number | boolean) => {
  if (raw === null) return fallback;
  if (typeof fallback === 'number') return Number(raw);
  if (typeof fallback === 'boolean') return raw !== 'false';
  return raw;
};

/**
 * Registers a custom element that renders a tree of elements, for embedding in pages you do not control.
 * The element is created by the browser, so `<my-widget currency="EUR"></my-widget>` in HTML is enough to use it.
 * `render` runs when the element is put into a page. Effects and resources it creates stop when the element is
 * taken out, and it runs again, from a clean state, if the element is put back.
 *
 * @example
 * defineWidget(
 *   'price-calculator',
 *   ({ props, emit }) => tags.button({ onclick: () => emit('pay') }, () => `Pay in ${props.currency}`),
 *   { attributes: { currency: 'USD' }, css: 'button { font: inherit }' },
 * );
 *
 * @template A - The attributes with their defaults.
 * @param name - The tag name; it must contain a hyphen, like any custom element.
 * @param render - Builds the widget from its context and returns what to show.
 * @param options - The attributes to follow, the stylesheet and whether to use a Shadow DOM.
 * @returns The element class that was registered.
 * @throws {Error} If the name is already registered.
 */
export const defineWidget = <A extends WidgetAttributes = Record<never, never>>(
  name: string,
  render: (context: WidgetContext<A>) => Child,
  { attributes = {} as A, css, shadow = true }: WidgetOptions<A> = {},
): CustomElementConstructor => {
  if (customElements.get(name)) throw new Error(`ecmact: "${name}" is already defined`);
  if (css !== undefined && !shadow) warn('css is ignored when shadow is false');

  const keys = Object.keys(attributes);
  const names = new Map(keys.map((key) => [toAttributeName(key), key]));

  const widget = class extends HTMLElement {
    static readonly observedAttributes: readonly string[] = [...names.keys()];
    readonly #raw = Object.fromEntries(
      keys.map((key) => [key, signal<string | null>(null)]),
    ) as Record<string, Signal<string | null>>;
    readonly #props = Object.defineProperties(
      {},
      Object.fromEntries(
        keys.map((key) => [
          key,
          {
            enumerable: true,
            /**
             * Reads the attribute in the type of its default.
             *
             * @returns The value of the prop.
             */
            get: () => convert(this.#raw[key].value, attributes[key]),
          },
        ]),
      ),
    ) as WidgetProps<A>;
    readonly #sheets: SheetState = {
      ownSheet: null,
      sheetText: undefined,
      sheetKey: '',
      sheetNodes: [],
    };
    #root: Element | ShadowRoot | undefined;
    #dispose: (() => void) | undefined;

    /**
     * Called by the browser when an observed attribute is set, changed or removed.
     *
     * @param attribute - The attribute name.
     * @param _ - The old value, not used.
     * @param value - The new value, or `null` when the attribute was removed.
     */
    attributeChangedCallback(attribute: string, _: string | null, value: string | null) {
      this.#raw[names.get(attribute) as string].value = value;
    }

    /**
     * Called by the browser when the element is added to a document. Renders the widget, unless it is still
     * rendered because it was only moved.
     */
    connectedCallback() {
      if (this.#dispose) return;
      const root = (this.#root ??= shadow ? this.attachShadow({ mode: 'open' }) : this);
      if (root instanceof ShadowRoot) applyStyleSheets(root, css, this.#sheets);
      /**
       * Dispatches a composed event on the host.
       *
       * @param type - The event name.
       * @param detail - The data the event carries.
       * @returns `false` if a listener cancelled the event.
       */
      const emit = (type: string, detail?: unknown) =>
        this.dispatchEvent(
          new CustomEvent(type, { detail, bubbles: true, composed: true, cancelable: true }),
        );
      const [nodes, dispose] = owned(() =>
        toNodes(render({ host: this, props: this.#props, emit })),
      );
      this.#dispose = dispose;
      root.replaceChildren(...this.#sheets.sheetNodes, ...nodes);
      notifyAttached();
    }

    /**
     * Called by the browser when the element is removed from a document. If it is not put back at once, as it
     * is when it is only moved, the widget stops what `render` started and drops its content.
     */
    disconnectedCallback() {
      queueMicrotask(() => {
        if (this.isConnected || !this.#dispose) return;
        this.#dispose();
        this.#dispose = undefined;
        pause(this);
        (this.#root as ParentNode).replaceChildren();
      });
    }
  };

  customElements.define(name, widget);
  return widget;
};
