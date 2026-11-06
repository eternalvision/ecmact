/**
 * Copies text to the clipboard. Where the async clipboard is not available it falls back to a hidden text area.
 *
 * @param text - The text to copy.
 * @returns `true` if the text was copied.
 */
export const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const copied = typeof document.execCommand === 'function' && document.execCommand('copy');
    area.remove();
    return copied;
  }
};
