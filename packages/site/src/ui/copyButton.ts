import { signal } from 'ecmact';
import { copyText } from '@site/lib/clipboard';
import { text } from '@site/content/messages';
import { tag } from '@site/lib/component';

/**
 * A button that copies a text and says so for a moment.
 *
 * @param content - The text to copy.
 * @param className - The class of the button.
 * @returns The component.
 */
export const copyButton = (content: string, className: string) => {
  const m = text().code;
  const label = signal(m.copy);
  return tag('button', {
    class: className,
    type: 'button',
    content: label,
    'aria-label': m.copyLabel,
    /**
     * Copies the text and reports the result on the button for a moment.
     */
    onclick: async () => {
      label.value = (await copyText(content)) ? m.copied : m.failed;
      setTimeout(() => (label.value = m.copy), 1500);
    },
  });
};
