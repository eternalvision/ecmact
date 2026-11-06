import { computed, signal, tags } from 'ecmact';

export const createCounter = () => {
  const count = signal(0);
  return tags.button({
    type: 'button',
    content: computed(() => `Clicked ${count.value} times`),
    onclick: () => count.value++,
    style: { padding: '8px 16px', fontSize: '16px', cursor: 'pointer' },
  });
};
