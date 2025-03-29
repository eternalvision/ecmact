export const generateAttributes = ({ props }) =>
  Object.entries(props)
    .filter(
      ([key]) => !['content', 'tag', 'style', 'children'].includes(key) && !key.startsWith('on'),
    )
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
