import type { Component } from '@em/component';
import type { ErrorHandler } from '@em/config';
import type { Provision } from '@em/context';
import type { ReadonlySignal } from '@em/signals';
import type { AttributeMap, GlobalAttributes } from '@em/types/attributes';

export type TagName = keyof HTMLElementTagNameMap | (string & {});

type ElementOf<K extends string> = K extends keyof HTMLElementTagNameMap
  ? HTMLElementTagNameMap[K]
  : HTMLElement;

type StyleProps = {
  [
    P in keyof CSSStyleDeclaration as P extends string
      ? CSSStyleDeclaration[P] extends string
        ? P
        : never
      : never
  ]?: string | number;
};

type EventHandlers = {
  [E in keyof HTMLElementEventMap as `on${E}`]?:
    ((event: HTMLElementEventMap[E]) => void) | undefined;
};

type TagAttributes<K extends string> = K extends keyof AttributeMap
  ? AttributeMap[K]
  : K extends keyof HTMLElementTagNameMap
    ? unknown
    : Record<string, unknown>;

type Reactive<T> = { [P in keyof T]: T[P] | ReadonlySignal<Exclude<T[P], undefined>> };

interface StructureProps<K extends string> {
  tag?: K;
  children?: Node[];
}

interface ValueProps {
  content?: string;
  html?: string;
  css?: string;
  style?: StyleProps;
}

interface ReactiveValueProps {
  content?: string | ReadonlySignal<string>;
  html?: string | ReadonlySignal<string>;
  css?: string | ReadonlySignal<string>;
  style?: Reactive<StyleProps> | ReadonlySignal<Reactive<StyleProps>>;
}

interface BehaviorProps<K extends string> {
  ref?: (element: ElementOf<K>) => void;
  shadow?: boolean;
  error?: ErrorHandler;
  provide?: Provision[];
  mounted?: (element: ElementOf<K>, component: Component<K>) => void | (() => void);
  unmounted?: (element: ElementOf<K>, component: Component<K>) => void;
  beforeUpdate?: (
    next: ResolvedProps<K>,
    current: ResolvedProps<K>,
    component: Component<K>,
  ) => boolean | void;
  updated?: (element: ElementOf<K>, component: Component<K>, previous: ResolvedProps<K>) => void;
}

export type ResolvedProps<K extends string = string> = StructureProps<K> &
  ValueProps &
  BehaviorProps<K> &
  GlobalAttributes &
  EventHandlers &
  TagAttributes<K>;

export type ComponentProps<K extends string = string> = StructureProps<K> &
  ReactiveValueProps &
  BehaviorProps<K> &
  Reactive<GlobalAttributes> &
  EventHandlers &
  Reactive<TagAttributes<K>>;

export interface RenderState {
  element: HTMLElement | null;
  attributes: Set<string>;
  styles: Set<string>;
  listeners: Map<string, EventListener>;
  ownSheet: CSSStyleSheet | null;
  sheetText: string | undefined;
  sheetKey: string;
  sheetNodes: HTMLStyleElement[];
}
