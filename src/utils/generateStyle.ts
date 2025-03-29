export const generateStyle = ({ style, tag }) => {
  if (Object.keys(style).length === 0) return '';

  const css = Object.entries(style)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
    .join(' ');

  return `<style>${tag} { ${css} }</style>`;
};
