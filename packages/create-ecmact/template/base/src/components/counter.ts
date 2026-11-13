import { em, signal, tags } from 'ecmact';

const counterCss = `
  button {
    padding: 0.7rem 1.4rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
    color: var(--text);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s, transform 0.05s;
  }
  button:hover {
    border-color: var(--primary);
    background: var(--surface-hover);
  }
  button:active {
    transform: translateY(1px);
  }
  button:focus-visible {
    outline: 2px solid var(--primary-bright);
    outline-offset: 3px;
  }
`;

/**
 * A button that counts its clicks. The label is a function that reads a signal, so it updates by itself.
 *
 * @returns The counter component.
 */
export const Counter = () => {
  const count = signal(0);
  return em.Counter(
    { css: counterCss },
    tags.button({ type: 'button', onclick: () => count.value++ }, () => `count is ${count.value}`),
  );
};
