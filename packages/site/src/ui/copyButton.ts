import { signal, tags } from 'ecmact';
import { text } from '@site/content/messages';
import { announce } from '@site/lib/announce';
import { copyText } from '@site/lib/clipboard';

/**
 * A button that copies a text and says so for a moment.
 *
 * @param content - The text to copy.
 * @param className - The class of the button.
 * @param name - What the text is, so that the buttons of a page have different accessible names.
 * @returns The button.
 */
export const copyButton = (content: string, className: string, name?: string) => {
  const m = text().code;
  const label = signal(m.copy);
  return tags.button(
    {
      class: className,
      type: 'button',
      'aria-label': name ? `${m.copyLabel}: ${name}` : m.copyLabel,
      /**
       * Copies the text and reports the result on the button for a moment.
       */
      onclick: async () => {
        label.value = (await copyText(content)) ? m.copied : m.failed;
        announce(label.value);
        setTimeout(() => (label.value = m.copy), 1500);
      },
    },
    label,
  );
};
