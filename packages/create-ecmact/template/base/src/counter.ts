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
    content: computed(() => `Clicked ${count.value} times`),
    onclick: () => count.value++,
    style: { padding: '8px 16px', fontSize: '16px', cursor: 'pointer' },
  });
};
