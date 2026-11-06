import type { Component } from '../component';
import type { AttributeMap, GlobalAttributes } from './attributes';

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

interface BaseProps<K extends string> {
  tag?: K;
  content?: string;
  html?: string;
  style?: StyleProps;
  children?: Node[];
  ref?: (element: ElementOf<K>) => void;
  shadow?: boolean;
  mounted?: (element: ElementOf<K>, component: Component<K>) => void | (() => void);
  unmounted?: (element: ElementOf<K>, component: Component<K>) => void;
  beforeUpdate?: (
    next: ComponentProps<K>,
    current: ComponentProps<K>,
    component: Component<K>,
  ) => boolean | void;
  updated?: (element: ElementOf<K>, component: Component<K>, previous: ComponentProps<K>) => void;
}

type TagAttributes<K extends string> = K extends keyof AttributeMap
  ? AttributeMap[K]
  : K extends keyof HTMLElementTagNameMap
    ? unknown
    : { [attribute: string]: unknown };

export type ComponentProps<K extends string = string> = BaseProps<K> &
  GlobalAttributes &
  EventHandlers &
  TagAttributes<K>;

export interface RenderState {
  element: HTMLElement | null;
  attributes: Set<string>;
  styles: Set<string>;
  listeners: Map<string, EventListener>;
}
