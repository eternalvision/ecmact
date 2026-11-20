/**
 * What every widget stylesheet starts with: the page around the widget cannot restyle the host through inheritance
 * (`all: initial` leaves `direction` alone, so right-to-left pages still mirror the widget), and the `hidden`
 * attribute wins over the `display` rules of the widget.
 */
const baseCss = `
  :host { all: initial; }
  :host([hidden]) { display: none; }
  [hidden] { display: none !important; }
`;

/**
 * Makes the stylesheet of a widget, for the `css` option of `defineWidget`: the reset that every widget starts
 * with, then its own rules. The widget renders into a Shadow DOM, so the stylesheet cannot leak into the page and
 * the CSS of the page cannot reach it.
 *
 * @param css - The rules of the widget.
 * @returns The stylesheet text.
 */
export const widgetCss = (css: string) => `${baseCss}${css}`;

const formats = new Map<string, Intl.NumberFormat>();

/**
 * Reads the language of the page around the widget, so that numbers are written the way that page writes them.
 *
 * @returns The `lang` of the document, or `en`.
 */
const pageLocale = () => document.documentElement.lang || 'en';

/**
 * Finds a number formatter for the language of the page, creating it once. A language tag the browser rejects falls
 * back to English.
 *
 * @param options - The formatting options.
 * @returns The formatter.
 * @throws {RangeError} If the options are invalid, for example an unknown currency code.
 */
const numberFormat = (options: Intl.NumberFormatOptions) => {
  const locale = pageLocale();
  const id = `${locale}|${JSON.stringify(options)}`;
  const known = formats.get(id);
  if (known) return known;
  let format: Intl.NumberFormat;
  try {
    format = new Intl.NumberFormat(locale, options);
  } catch {
    format = new Intl.NumberFormat('en', options);
  }
  formats.set(id, format);
  return format;
};

/**
 * Formats an amount of money in a currency, and falls back to plain text for a currency the browser does not know.
 *
 * @param amount - The amount.
 * @param currency - An ISO 4217 code such as `EUR`.
 * @param digits - How many decimals to show.
 * @returns The formatted amount.
 */
export const money = (amount: number, currency: string, digits = 0) => {
  try {
    return numberFormat({
      style: 'currency',
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(amount);
  } catch {
    return `${amount.toFixed(digits)} ${currency}`;
  }
};

/**
 * Formats a plain number the way the language of the page writes it, with no unit.
 *
 * @param value - The number.
 * @param digits - How many decimals to show.
 * @returns The text.
 */
export const plain = (value: number, digits = 0) =>
  numberFormat({ minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);

/**
 * Chooses the item that an arrow key, Home or End moves to in a group of radios, tabs or other items that take
 * turns: the next and the previous wrap around.
 *
 * @param key - The `key` of the keyboard event.
 * @param index - The current item.
 * @param count - How many items there are.
 * @returns The new index, or `undefined` for a key that moves nothing.
 */
export const moveIndex = (key: string, index: number, count: number) => {
  if (key === 'ArrowRight' || key === 'ArrowDown') return (index + 1) % count;
  if (key === 'ArrowLeft' || key === 'ArrowUp') return (index + count - 1) % count;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  return undefined;
};

/**
 * Reads a number from an attribute. An absent, empty or malformed value gives the fallback.
 *
 * @param value - The attribute value.
 * @param fallback - The number to use instead.
 * @param min - The smallest allowed number.
 * @returns A finite number that is not below `min`.
 */
export const readNumber = (value: string | null | undefined, fallback: number, min = 0) => {
  const parsed = value === null || value === undefined || value.trim() === '' ? NaN : Number(value);
  return Number.isFinite(parsed) && parsed >= min ? parsed : fallback;
};
