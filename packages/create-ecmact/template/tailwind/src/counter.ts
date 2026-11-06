import { computed, signal, tags } from 'ecmact';

export const createCounter = () => {
  const count = signal(0);
  return tags.button({
    type: 'button',
    class: 'rounded-lg bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-500',
    content: computed(() => `Clicked ${count.value} times`),
    onclick: () => count.value++,
  });
};
