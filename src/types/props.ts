import type { Component } from '@em/core/component';
import type { ErrorHandler } from '@em/core/config';
import type { Provision } from '@em/core/context';
import type { ReadonlySignal, Signal } from '@em/signals/signals';
import type { AttributeMap, GlobalAttributes } from '@em/types/attributes';

/** A tag name: any HTML tag (with autocompletion) or a custom element name. */
export type TagName = keyof HTMLElementTagNameMap | (string & {});

/**
 * The DOM element type for a tag: `HTMLInputElement` for `input`, `HTMLElement` for custom tags.
 *
 * @template K - The tag.
 */
export type ElementOf<K extends string> = K extends keyof HTMLElementTagNameMap
  ? HTMLElementTagNameMap[K]
  : HTMLElement;

/**
 * A value, or nothing: `false`, `null` and `undefined` switch an attribute, a style or a text off.
 *
 * @template T - The type of the value.
 */
export type Optional<T> = T | false | null | undefined;

/**
 * Something that is read again when it changes: a signal, or a function that reads signals.
 *
 * @template T - The type of the value.
 */
export type Getter<T> = ReadonlySignal<T> | (() => T);

/**
 * A value that may be given as it is, as a signal, or as a function that reads signals.
 *
 * @template T - The type of the value.
 */
export type Reactive<T> = Optional<T> | Getter<Optional<T>>;

/**
 * The `class` prop: class names as text, a list of them (empty items are left out), or an object whose keys are
 * the names and whose values switch them on. Signals and functions may stand anywhere in it.
 */
export type ClassValue =
  | string
  | false
  | null
  | undefined
  | readonly ClassValue[]
  | ReadonlySignal<ClassValue>
  | (() => ClassValue)
  | Readonly<Record<string, Reactive<boolean>>>;

/**
 * Lets each property of an object be reactive.
 *
 * @template T - The object type.
 */
type ReactiveMap<T> = { [P in keyof T]: Reactive<T[P]> };

/** The CSS properties that take a string, with camelCase names, accepting strings and numbers as values, and custom properties such as `--gap`. */
export type Styles = {
  [
    P in keyof CSSStyleDeclaration as P extends string
      ? CSSStyleDeclaration[P] extends string
        ? P
        : never
      : never
  ]?: Optional<string | number>;
} & Partial<Record<`--${string}`, Optional<string | number>>>;

/**
 * A handler with listener options.
 *
 * @template E - The event type.
 */
export interface EventHandlerOptions<E extends Event = Event> {
  /**
   * Called when the event fires.
   *
   * @param event - The event.
   */
  handler: (event: E) => void;
  /** Listens in the capture phase. */
  capture?: boolean;
  /** Promises not to call `preventDefault`, which lets the browser scroll without waiting. */
  passive?: boolean;
  /** Removes the listener after the first event. */
  once?: boolean;
}

/** An `on<event>` handler prop for every DOM event, typed with the right event. */
type EventHandlers = {
  [E in keyof HTMLElementEventMap as `on${E}`]?:
    | ((event: HTMLElementEventMap[E]) => void)
    | EventHandlerOptions<HTMLElementEventMap[E]>
    | false
    | null
    | undefined;
};

/**
 * The attributes of a tag: the table entry for known tags, any for custom tags, none beyond the global ones for other standard tags.
 *
 * @template K - The tag.
 */
type TagAttributes<K extends string> = K extends keyof AttributeMap
  ? AttributeMap[K]
  : K extends keyof HTMLElementTagNameMap
    ? unknown
    : Record<string, unknown>;

/**
 * Something that can be a child: a node, text, a number, a list of children, or a signal or a function that
 * returns any of these and is rendered again when it changes. `false`, `true`, `null` and `undefined` render nothing.
 */
export type Child =
  | Node
  | string
  | number
  | boolean
  | null
  | undefined
  | ReadonlySignal<Child>
  | (() => Child)
  | readonly Child[];

/**
 * The props that are not attributes.
 *
 * @template E - The element they are applied to.
 */
interface ElementProps<E> {
  /** Raw HTML for the element. Use it only for trusted markup; children are ignored when it is set. */
  html?: Reactive<string>;
  /** Inline styles, camelCase keys: an object whose values may be reactive, or a signal or a function that returns such an object. */
  style?: { [P in keyof Styles]: Reactive<Styles[P]> } | Getter<Optional<Styles>>;
  /**
   * Called once with the element, right after it is created and filled.
   *
   * @param element - The element.
   */
  ref?: (element: E) => void;
  /** What this element offers to the elements below it: the result of `Context.provide`, or a list of them. */
  provide?: Provision | Provision[];
  /** Receives errors from the event listeners and the lifecycle hooks of this element and of the ones below it. */
  error?: ErrorHandler;
}

/**
 * The `bind` prop, which only form controls take.
 *
 * @template K - The tag.
 */
type BindProps<K extends string> = K extends 'input' | 'select' | 'textarea'
  ? {
      /**
       * Ties the control to a signal both ways. A checkbox takes a signal of a boolean, a multiple select a
       * signal of the selected values, a number input a signal of a number or of text, and the rest a signal of text.
       */
      bind?: Signal<string> | Signal<number> | Signal<boolean> | Signal<string[]>;
    }
  : unknown;

/**
 * The props of an element made with `tags`: attributes, events, styles and values that may be reactive.
 *
 * @template K - The tag. Attributes are typed for it.
 */
export type Props<K extends string = string> = ElementProps<ElementOf<K>> &
  ReactiveMap<GlobalAttributes> &
  EventHandlers &
  ReactiveMap<TagAttributes<K>> &
  BindProps<K>;

/** The props that only a component made with `em` takes. */
interface HostProps {
  /** Stylesheet text scoped to the shadow root of the component. Ignored without a shadow root. */
  css?: Reactive<string>;
  /** Renders the children into the component itself, without a shadow root, when `false`. Defaults to the configured value. */
  shadow?: boolean;
  /**
   * Makes the component a field of the form around it: its `name`, `disabled` and the value and validity of the
   * first `input`, `select` or `textarea` inside it reach the form, which a control inside a Shadow DOM does not do by itself.
   */
  field?: boolean;
  /** The name of the field in the form, see `field`. */
  name?: Reactive<string>;
  /** Disables the field, see `field`. */
  disabled?: Reactive<boolean>;
  /**
   * Called when the component is connected to a document. May return a cleanup function.
   *
   * @param host - The component.
   * @returns A cleanup that runs when the component is disconnected.
   */
  mounted?: (host: Component) => void | (() => void);
  /**
   * Called when the component is disconnected from a document, after the cleanup.
   *
   * @param host - The component.
   */
  unmounted?: (host: Component) => void;
}

/** The props of a component made with `em`: the props of its custom element, plus styles, hooks and the shadow root. */
export type ComponentProps = HostProps &
  ElementProps<Component> &
  ReactiveMap<GlobalAttributes> &
  EventHandlers;

/**
 * Creates an element from optional props followed by children.
 *
 * @template P - The props.
 * @template E - The element that is created.
 */
export interface Factory<P, E> {
  /**
   * Creates the element with props and children.
   *
   * @param props - The props.
   * @param children - The children.
   * @returns The element.
   */
  (props: P, ...children: Child[]): E;
  /**
   * Creates the element with children only.
   *
   * @param children - The children.
   * @returns The element.
   */
  (...children: Child[]): E;
}

/** What a component remembers about its stylesheets. */
export interface SheetState {
  /** The stylesheet created for the `css` prop, when constructable stylesheets are used. */
  ownSheet: CSSStyleSheet | null;
  /** The `css` text that was applied last. */
  sheetText: string | undefined;
  /** A key for the style nodes in the fallback, to tell when they changed. */
  sheetKey: string;
  /** The `<style>` nodes used when constructable stylesheets are not available. */
  sheetNodes: HTMLStyleElement[];
}
