import { signal } from 'ecmact';
import { copyText } from '@site/lib/clipboard';
import { tag } from '@site/lib/component';

/**
 * A button that copies a text and says so for a moment.
 *
 * @param text - The text to copy.
 * @param className - The class of the button.
 * @returns The component.
 */
export const copyButton = (text: string, className: string) => {
  const label = signal('Copy');
  return tag('button', {
    class: className,
    type: 'button',
    content: label,
    'aria-label': 'Copy to the clipboard',
    /**
     * Copies the text and reports the result on the button for a moment.
     */
    onclick: async () => {
      label.value = (await copyText(text)) ? 'Copied' : 'Failed';
      setTimeout(() => (label.value = 'Copy'), 1500);
    },
  });
};
