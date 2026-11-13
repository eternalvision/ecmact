import { mount } from '@em/utils/mount';
import type { SheetState } from '@em/types';

export const createState = (): SheetState => ({
  ownSheet: null,
  sheetText: undefined,
  sheetKey: '',
  sheetNodes: [],
});

export const createRoot = () => document.createElement('div').attachShadow({ mode: 'open' });

export const tick = () => new Promise<void>((resolve) => queueMicrotask(resolve));

export const sheet = (element: Element) => {
  if (!element.isConnected) mount(document.body, element);
  const name = Array.from(element.classList).find((item) => item.startsWith('em-'));
  return Array.from(
    document.head.querySelectorAll('style[data-ecmact="styled"]'),
    (node) => node.textContent ?? '',
  )
    .filter((text) => text.startsWith('@keyframes') || text.startsWith(`.${name} `))
    .join('\n');
};
