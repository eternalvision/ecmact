import { computed, em, signal } from 'ecmact';

/**
 * A button that counts its clicks, styled with Tailwind utility classes. The colors come from the
 * CSS variables in `styles.css`, so the button follows the light and the dark color scheme.
 *
 * @returns The button component.
 */
export const Counter = () => {
  const count = signal(0);
  return em.Counter({
    tag: 'button',
    type: 'button',
    class:
      'cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 font-semibold text-[var(--text)] transition hover:border-[var(--primary)] hover:bg-[var(--surface-hover)] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary-bright)]',
    content: computed(() => `count is ${count.value}`),
    onclick: () => {
      count.value += 1;
    },
  });
};
