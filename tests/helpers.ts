import type { RenderState } from '../src/types';

export const createState = (): RenderState => ({
  element: null,
  attributes: new Set(),
  styles: new Set(),
  listeners: new Map(),
  ownSheet: null,
  sheetText: undefined,
  sheetKey: '',
  sheetNodes: [],
});

export const createRoot = () => document.createElement('div').attachShadow({ mode: 'open' });

export const inner = (component: HTMLElement) =>
  component.shadowRoot!.firstElementChild as HTMLElement;
