import { computed, em, signal, tags } from 'ecmact';

const css = `
  div {
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
 * A counter: a signal, a value computed from it, and props bound to both. Nothing re-renders but the two texts.
 *
 * @returns The demo.
 */
export const create = () => {
  const count = signal(0);
  const double = computed(() => count.value * 2);

  return em.Counter({
    shadow: true,
    css,
    children: [
      tags.button({
        shadow: false,
        content: '-',
        'aria-label': 'Decrease',
        onclick: () => count.value--,
      }),
      tags.output({ shadow: false, content: computed(() => String(count.value)) }),
      tags.button({
        shadow: false,
        content: '+',
        'aria-label': 'Increase',
        onclick: () => count.value++,
      }),
      tags.small({ shadow: false, content: computed(() => `double is ${double.value}`) }),
    ],
  });
};
