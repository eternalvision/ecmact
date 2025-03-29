export const setEventListeners = ({ props, shadowRoot }) => {
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('on') && typeof value === 'function') {
      const event = key.slice(2).toLowerCase();
      shadowRoot.querySelector(props.tag || 'div')?.addEventListener(event, value);
    }
  });
};
