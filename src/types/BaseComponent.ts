export type TagName = keyof HTMLElementTagNameMap | (string & {});

export type EventHandler = (event: Event) => void;

export interface ComponentProps {
  tag?: TagName;
  content?: string;
  html?: string;
  style?: Partial<CSSStyleDeclaration>;
  children?: Node[];
  ref?: (element: HTMLElement) => void;
  [handler: `on${string}`]: EventHandler | undefined;
  [attribute: string]: unknown;
}

export interface RenderState {
  element: HTMLElement | null;
  attributes: Set<string>;
  styles: Set<string>;
  listeners: Map<string, EventListener>;
}
