import {
  batch,
  effect,
  resource,
  signal,
  type ComponentProps,
  type ReadonlySignal,
  type Resource,
  type ResourceContext,
} from 'ecmact';
import { view } from '@site/lib/component';

/**
 * What every widget stylesheet starts with: the page around the widget cannot restyle the host through inheritance
 * (`all: initial` leaves `direction` alone, so right-to-left pages still mirror the widget), and the `hidden`
 * attribute wins over the `display` rules of the widget.
 */
const baseCss = `
  :host { all: initial; }
  :host([hidden]) { display: none; }
  [hidden] { display: none !important; }
`;

const sheets = new Map<string, CSSStyleSheet>();

/**
 * Tells whether a shadow root can adopt constructable stylesheets.
 *
 * @param root - The shadow root.
 * @returns `true` if `adoptedStyleSheets` and `CSSStyleSheet#replaceSync` exist.
 */
const canAdopt = (root: ShadowRoot) =>
  'adoptedStyleSheets' in root &&
  typeof CSSStyleSheet === 'function' &&
  'replaceSync' in CSSStyleSheet.prototype;

/**
 * Gives the shadow root of a widget its stylesheet. A constructable stylesheet is shared by all instances and is not
 * blocked by a `style-src` Content Security Policy without `'unsafe-inline'`; where those are unavailable, a `style`
 * element goes into the root next to the content. The widget renders into a Shadow DOM, so the stylesheet cannot leak
 * into the page and the CSS of the page cannot reach it.
 *
 * @param host - The host element of the widget; its shadow root already exists when `render` runs.
 * @param css - The stylesheet of the widget.
 * @param content - The root element of the widget.
 * @returns What `defineWidget` should render: the content, with a `style` element in front when nothing was adopted.
 */
export const sheet = (host: HTMLElement, css: string, content: Node) => {
  const text = `${baseCss}${css}`;
  const root = host.shadowRoot;
  if (root && canAdopt(root)) {
    let adopted = sheets.get(text);
    if (!adopted) {
      adopted = new CSSStyleSheet();
      adopted.replaceSync(text);
      sheets.set(text, adopted);
    }
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, adopted];
    return content;
  }
  const style = document.createElement('style');
  style.textContent = text;
  const fragment = document.createDocumentFragment();
  fragment.append(style, content);
  return fragment;
};

/**
 * Creates a component for a standard tag. The components of the widgets are registered under their own names
 * (`em-widgetdiv`, not `em-div`), because custom element names are global: a page that runs another copy or version
 * of ECMact would otherwise hand the widgets its own elements.
 *
 * @param name - The tag of the inner element.
 * @param props - The props of the component.
 * @returns The component.
 */
export const tag = <K extends keyof HTMLElementTagNameMap>(
  name: K,
  props = {} as ComponentProps<K>,
) =>
  view<K>(`Widget${name[0]?.toUpperCase()}${name.slice(1)}`, {
    ...props,
    tag: name,
  } as ComponentProps<K>);

/**
 * Creates a container for the markup of a widget.
 *
 * @param name - The tag of the container.
 * @param className - Its class.
 * @param children - What is inside.
 * @returns The component.
 */
export const part = <K extends keyof HTMLElementTagNameMap>(
  name: K,
  className: string,
  ...children: (Node | string)[]
) => tag(name, { class: className, children } as never);

const formats = new Map<string, Intl.NumberFormat>();

/**
 * Reads the language of the page around the widget, so that numbers are written the way that page writes them.
 *
 * @returns The `lang` of the document, or `en`.
 */
const pageLocale = () => document.documentElement.lang || 'en';

/**
 * Finds a number formatter for the language of the page, creating it once. A language tag the browser rejects falls
 * back to English.
 *
 * @param options - The formatting options.
 * @returns The formatter.
 * @throws {RangeError} If the options are invalid, for example an unknown currency code.
 */
const numberFormat = (options: Intl.NumberFormatOptions) => {
  const locale = pageLocale();
  const id = `${locale}|${JSON.stringify(options)}`;
  const known = formats.get(id);
  if (known) return known;
  let format: Intl.NumberFormat;
  try {
    format = new Intl.NumberFormat(locale, options);
  } catch {
    format = new Intl.NumberFormat('en', options);
  }
  formats.set(id, format);
  return format;
};

/**
 * Formats an amount of money in a currency, and falls back to plain text for a currency the browser does not know.
 *
 * @param amount - The amount.
 * @param currency - An ISO 4217 code such as `EUR`.
 * @returns The formatted amount.
 */
export const money = (amount: number, currency: string) => {
  try {
    return numberFormat({ style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${Math.round(amount)} ${currency}`;
  }
};

/**
 * Formats a count in a short form: 1234 as `1.2K` and 1000000 as `1M`.
 *
 * @param value - The count.
 * @returns The short text.
 */
export const compact = (value: number) =>
  numberFormat({ notation: 'compact', maximumFractionDigits: 1 }).format(value);

/**
 * Reads a number from an attribute. An absent, empty or malformed value gives the fallback.
 *
 * @param value - The attribute value.
 * @param fallback - The number to use instead.
 * @param min - The smallest allowed number.
 * @returns A finite number that is not below `min`.
 */
export const readNumber = (value: string | null | undefined, fallback: number, min = 0) => {
  const parsed = value === null || value === undefined || value.trim() === '' ? NaN : Number(value);
  return Number.isFinite(parsed) && parsed >= min ? parsed : fallback;
};

/** A resource that runs only while the widget is in the document. */
export interface AttachedResource<T> {
  /** The latest result; it stays while a newer request runs and after a request fails. */
  readonly data: ReadonlySignal<T | undefined>;
  /** The reason of the latest failure, or `undefined`. */
  readonly error: ReadonlySignal<unknown>;
  /** `true` while a request is in flight. */
  readonly loading: ReadonlySignal<boolean>;
  /** Runs the request again, while attached. */
  refetch(): void;
  /**
   * Starts the request and follows the signals it reads. Call it from `mounted`.
   *
   * @returns A function that aborts the request and stops following; call it from the cleanup of `mounted`.
   */
  attach(): () => void;
}

/**
 * Creates a resource that starts when the widget is mounted and is disposed when it is removed, so that a widget that
 * leaves the page stops its requests, and one that comes back loads again.
 *
 * @template T - The type of the result.
 * @param fetcher - Starts a request.
 * @returns The signals and the `attach` function.
 */
export const attachedResource = <T>(
  fetcher: (context: ResourceContext) => T | Promise<T>,
): AttachedResource<T> => {
  const data = signal<T | undefined>(undefined);
  const error = signal<unknown>(undefined);
  const loading = signal(false);
  let current: Resource<T> | undefined;
  return {
    data,
    error,
    loading,
    /** Runs the request again if the resource is attached. */
    refetch: () => {
      current?.refetch();
    },
    /**
     * Starts a resource and mirrors its signals.
     *
     * @returns The function that disposes it.
     */
    attach: () => {
      const inner = resource(fetcher);
      current = inner;
      const mirror = effect(() => {
        batch(() => {
          if (inner.data.value !== undefined) data.value = inner.data.value;
          error.value = inner.error.value;
          loading.value = inner.loading.value;
        });
      });
      return () => {
        mirror();
        inner.dispose();
        loading.value = false;
        if (current === inner) current = undefined;
      };
    },
  };
};
