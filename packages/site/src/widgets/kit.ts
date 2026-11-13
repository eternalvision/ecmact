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
 * @returns The formatted amount.
 */
export const money = (amount: number, currency: string) => {
  try {
    return numberFormat({ style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${Math.round(amount)} ${currency}`;
  }
};

/**
 * Formats a count in a short form: 1234 as `1.2K` and 1000000 as `1M`.
 *
 * @param value - The count.
 * @returns The short text.
 */
export const compact = (value: number) =>
  numberFormat({ notation: 'compact', maximumFractionDigits: 1 }).format(value);

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
