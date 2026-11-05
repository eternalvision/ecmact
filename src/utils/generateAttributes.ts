import type { ComponentProps } from '../types';

const reservedKeys = ['content', 'tag', 'style', 'children'];

export const generateAttributes = ({ props }: { props: ComponentProps }) =>
  Object.entries(props)
    .filter(([key]) => !reservedKeys.includes(key) && !key.startsWith('on'))
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
