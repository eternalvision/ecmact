import { computed, signal, tags } from 'ecmact';

/**
 * Creates a button that counts its clicks. The label follows a signal, so no manual updates are needed.
 *
 * @returns The button component.
 */
export const createCounter = () => {
  const count = signal(0);
  return tags.button({
    type: 'button',
    class: 'rounded-lg bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-500',
    content: computed(() => `Clicked ${count.value} times`),
    onclick: () => count.value++,
  });
};
