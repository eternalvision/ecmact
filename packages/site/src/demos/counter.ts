import { computed, em, signal, tags } from 'ecmact';

const { button, output, small } = tags;

const css = `
  :host {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  button {
    width: 2.4rem;
    height: 2.4rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    color: var(--text);
    font: inherit;
    font-size: 1.2rem;
    cursor: pointer;
  }
  button:hover {
    border-color: var(--primary);
  }
  output {
    min-width: 3ch;
    text-align: center;
    font-size: 1.6rem;
    font-weight: 700;
  }
  small {
    color: var(--muted);
  }
`;

/**
 * A counter: a signal, a value computed from it, and two texts that follow them. Nothing else is rendered again.
 *
 * @returns The demo.
 */
export const create = () => {
  const count = signal(0);
  const double = computed(() => count.value * 2);

  return em.Counter(
    { css },
    button({ 'aria-label': 'Decrease', onclick: () => count.value-- }, '-'),
    output(count),
    button({ 'aria-label': 'Increase', onclick: () => count.value++ }, '+'),
    small(() => `double is ${double.value}`),
  );
};
