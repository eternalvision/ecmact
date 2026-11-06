import type { Component } from '@em/component';
import type { ErrorHandler } from '@em/config';
import type { Provision } from '@em/context';
import type { ReadonlySignal } from '@em/signals';
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

/** The CSS properties that take a string, with camelCase names, accepting strings and numbers as values. */
type StyleProps = {
  [
    P in keyof CSSStyleDeclaration as P extends string
      ? CSSStyleDeclaration[P] extends string
        ? P
        : never
      : never
  ]?: string | number;
};

/** An `on<event>` handler prop for every DOM event, typed with the right event. */
type EventHandlers = {
  [E in keyof HTMLElementEventMap as `on${E}`]?:
    ((event: HTMLElementEventMap[E]) => void) | undefined;
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
 * Lets each property of an object also be a signal of the same value type.
 *
 * @template T - The object type.
 */
type Reactive<T> = { [P in keyof T]: T[P] | ReadonlySignal<Exclude<T[P], undefined>> };

/** Something that can be a child: a node, text or a number. `false`, `true`, `null` and `undefined` render nothing. */
export type Child = Node | string | number | boolean | null | undefined;

/**
 * Props that decide the shape of the inner element.
 *
 * @template K - The tag.
 */
interface StructureProps<K extends string> {
  /** The tag of the inner element. Defaults to `div`. */
  tag?: K;
}

/** Props that hold values, as they are after signals are unwrapped. */
interface ValueProps {
  /** Text content. Never parsed as HTML. */
  content?: string;
  /** Raw HTML for the inner element. Use it only for trusted markup; `content` is ignored when it is set. */
  html?: string;
  /** Stylesheet text scoped to the shadow root. Ignored without a shadow root. */
  css?: string;
  /** Inline styles, camelCase keys. */
  style?: StyleProps;
}

/** The same props as `ValueProps`, where each value may also be a signal. */
interface ReactiveValueProps {
  /** Text content, or a signal of it. */
  content?: string | ReadonlySignal<string>;
  /** Raw HTML, or a signal of it. */
  html?: string | ReadonlySignal<string>;
  /** Stylesheet text, or a signal of it. */
  css?: string | ReadonlySignal<string>;
  /** Inline styles: an object whose values may be signals, or a signal of such an object. */
  style?: Reactive<StyleProps> | ReadonlySignal<Reactive<StyleProps>>;
}

/**
 * Props that control behavior rather than content, and are never signals.
 *
 * @template K - The tag.
 */
interface BehaviorProps<K extends string> {
  /**
   * Called once with the inner element, right after it is created.
   *
   * @param element - The inner element.
   */
  ref?: (element: ElementOf<K>) => void;
  /** Renders into the light DOM when `false`. Read on the first render only. Defaults to the configured value. */
  shadow?: boolean;
  /** Identifies a component among its siblings, so it is kept when the list changes. */
  key?: string | number;
  /** Receives errors from hooks, event listeners and rendering of this component. */
  error?: ErrorHandler;
  /** Values this component offers to the components below it. */
  provide?: Provision[];
  /**
   * Called when the component is connected to a document. May return a cleanup function.
   *
   * @param element - The inner element.
   * @param component - The component.
   * @returns A cleanup that runs when the component is disconnected.
   */
  mounted?: (element: ElementOf<K>, component: Component<K>) => void | (() => void);
  /**
   * Called when the component is disconnected from a document, after the cleanup.
   *
   * @param element - The inner element.
   * @param component - The component.
   */
  unmounted?: (element: ElementOf<K>, component: Component<K>) => void;
  /**
   * Called before an update. Returning `false` cancels it and the new props are discarded.
   *
   * @param next - The resolved props of the update.
   * @param current - The resolved props now.
   * @param component - The component.
   * @returns `false` to cancel the update.
   */
  beforeUpdate?: (
    next: ResolvedProps<K>,
    current: ResolvedProps<K>,
    component: Component<K>,
  ) => boolean | void;
  /**
   * Called after every render except the first.
   *
   * @param element - The inner element.
   * @param component - The component.
   * @param previous - The resolved props before the update.
   */
  updated?: (element: ElementOf<K>, component: Component<K>, previous: ResolvedProps<K>) => void;
}

/**
 * The props of a component with signals unwrapped, as hooks receive them.
 *
 * @template K - The tag.
 */
export type ResolvedProps<K extends string = string> = StructureProps<K> & {
  children?: Child[];
} & ValueProps &
  BehaviorProps<K> &
  GlobalAttributes &
  EventHandlers &
  TagAttributes<K>;

/**
 * The props of a component, as passed by the user: attributes, events, styles, hooks and values that may be signals.
 *
 * @template K - The tag. Attributes are typed for it.
 */
export type ComponentProps<K extends string = string> = StructureProps<K> & {
  children?: (Child | ReadonlySignal<string | number>)[];
} & ReactiveValueProps &
  BehaviorProps<K> &
  Reactive<GlobalAttributes> &
  EventHandlers &
  Reactive<TagAttributes<K>>;

/** What the renderer remembers about a component between renders. */
export interface RenderState {
  /** The inner element, or `null` before the first render. */
  element: HTMLElement | null;
  /** The attribute names that were set, to remove the stale ones. */
  attributes: Set<string>;
  /** The CSS properties that were applied, to remove the stale ones. */
  styles: Set<string>;
  /** The listeners that were attached, keyed by event name. */
  listeners: Map<string, EventListener>;
  /** The stylesheet created for the `css` prop, when constructable stylesheets are used. */
  ownSheet: CSSStyleSheet | null;
  /** The `css` text of the previous render. */
  sheetText: string | undefined;
  /** A key for the style nodes in the fallback, to tell when they changed. */
  sheetKey: string;
  /** The `<style>` nodes used when constructable stylesheets are not available. */
  sheetNodes: HTMLStyleElement[];
}
