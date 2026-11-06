import { tag } from '@site/lib/component';

/**
 * Wraps the markup of a widget with its stylesheet. The widget renders into a Shadow DOM, so the stylesheet cannot
 * leak into the page and the CSS of the page cannot reach it. The inner components render into the light DOM of
 * that shadow root, where this stylesheet applies to them.
 *
 * @param css - The stylesheet of the widget.
 * @param content - The root element of the widget.
 * @returns A fragment for `defineWidget` to render.
 */
export const sheet = (css: string, content: Node) => {
  const style = document.createElement('style');
  style.textContent = css;
  const fragment = document.createDocumentFragment();
  fragment.append(style, content);
  return fragment;
};

/**
 * Creates a container for the markup of a widget.
 *
 * @param name - The tag of the container.
 * @param className - Its class.
 * @param children - What is inside.
 * @returns The component.
 */
export const part = <K extends keyof HTMLElementTagNameMap>(
  name: K,
  className: string,
  ...children: (Node | string)[]
) => tag(name, { class: className, children } as never);

/**
 * Formats an amount of money in a currency, and falls back to plain text for a currency the browser does not know.
 *
 * @param amount - The amount.
 * @param currency - An ISO 4217 code such as `EUR`.
 * @returns The formatted amount.
 */
export const money = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${Math.round(amount)} ${currency}`;
  }
};

/** The custom properties that every widget understands, so that one set of values themes them all. */
export const themeProperties = [
  '--w-accent',
  '--w-bg',
  '--w-fg',
  '--w-muted',
  '--w-border',
  '--w-radius',
  '--w-font',
] as const;
