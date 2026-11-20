import { computed, defineWidget, each, signal, tags } from 'ecmact';
import { money, moveIndex, plain, readNumber, widgetCss } from '@site/widgets/kit';

const { button, div, option, select, span, sup } = tags;

const css = `
  :host {
    display: block;
    max-width: 24rem;
    font-family: var(--w-font, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif);
  }
  .ticket {
    --y: calc(100% - 78px);
    --on: var(--w-on-accent, #0a1466);
    --soft: color-mix(in srgb, var(--w-fg, #ffffff) 86%, var(--w-bg, #1e3bff));
    box-sizing: border-box;
    padding: 20px 20px 0;
    border-radius: var(--w-radius, 22px);
    background: var(--w-bg, #1e3bff);
    color: var(--w-fg, #ffffff);
    box-shadow: inset 0 0 0 3px var(--w-fg, #ffffff);
  }
  @supports ((mask: radial-gradient(13px at 0 0, #0000 97%, #000)) or (-webkit-mask: radial-gradient(13px at 0 0, #0000 97%, #000))) {
    .ticket {
      box-shadow: none;
      -webkit-mask:
        radial-gradient(13px at 0 var(--y), #0000 97%, #000),
        radial-gradient(13px at 100% var(--y), #0000 97%, #000);
      -webkit-mask-composite: source-in;
      mask:
        radial-gradient(13px at 0 var(--y), #0000 97%, #000),
        radial-gradient(13px at 100% var(--y), #0000 97%, #000);
      mask-composite: intersect;
    }
  }
  .top { display: flex; justify-content: space-between; gap: 8px; font-size: 14px; font-weight: 600; }
  .top span:last-child { color: var(--soft); font-weight: 500; }
  .price {
    display: flex; align-items: flex-start; justify-content: center; gap: 6px; margin: 2px 0 -6px;
    font-family: var(--w-display, Didot, 'Bodoni MT', 'Bodoni 72', 'Noto Serif Display', 'URW Palladio L', Sylfaen, serif);
    font-size: 112px; line-height: 1; letter-spacing: -0.02em;
  }
  .price sup { margin-top: 22px; font-family: inherit; font-size: 15px; font-weight: 700; letter-spacing: 0.02em; }
  .price sup { font-family: var(--w-font, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif); }
  .digits { display: flex; overflow: hidden; }
  .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .per { text-align: center; font-size: 14px; color: var(--soft); }
  .breaks { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; margin-top: 14px; }
  .breaks button {
    display: grid; gap: 1px; padding: 9px 2px 8px; border: 0; border-radius: 14px;
    background: var(--w-fg, #ffffff); color: var(--w-bg, #1e3bff); font: inherit; cursor: pointer;
  }
  .breaks b { font-family: var(--w-display, Didot, 'Bodoni MT', 'Bodoni 72', 'Noto Serif Display', 'URW Palladio L', Sylfaen, serif); font-size: 24px; font-weight: 400; line-height: 1; }
  .breaks span { font-size: 12px; font-weight: 600; }
  .breaks button[aria-checked='true'] { background: var(--w-accent, #ffe94a); color: var(--on); transform: translateY(-4px); }
  .opts { display: grid; grid-template-columns: auto 1fr; gap: 8px 12px; align-items: center; margin: 14px 0 16px; font-size: 14.5px; font-weight: 600; }
  .dots { display: flex; align-items: center; gap: 6px; }
  .dots button {
    box-sizing: border-box; width: 24px; height: 24px; padding: 0; border: 0; border-radius: 50% 50% 50% 4px;
    background: color-mix(in srgb, var(--w-fg, #ffffff) 30%, transparent); transform: rotate(-45deg); cursor: pointer;
  }
  .dots button.on { background: var(--w-fg, #ffffff); }
  .dots button.on.hot { background: var(--w-accent, #ffe94a); }
  .dots span { margin-inline-start: 4px; font-weight: 500; color: var(--soft); }
  .opts select {
    justify-self: start; box-sizing: border-box; height: 36px; padding: 0 12px; border: 0; border-radius: 999px;
    background: var(--w-fg, #ffffff); color: var(--w-bg, #1e3bff); font: inherit; font-size: 14px; font-weight: 600;
  }
  .stub { display: flex; align-items: center; height: 78px; margin: 0 -20px; padding: 0 26px; border-top: 3px dashed var(--soft); }
  .stub button {
    flex: 1; min-height: 46px; border: 0; border-radius: 999px; background: var(--w-accent, #ffe94a);
    color: var(--on); font: inherit; font-size: 16px; font-weight: 800; cursor: pointer;
  }
  button:focus-visible, select:focus-visible { outline: 3px solid var(--w-fg, #ffffff); outline-offset: 3px; }
  .breaks button:focus-visible, .opts select:focus-visible { outline-color: var(--w-accent, #ffe94a); }
  @media (prefers-reduced-motion: no-preference) {
    .d { animation: roll 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
    .breaks button { transition: transform 0.2s, background 0.2s; }
    @keyframes roll { from { transform: translateY(-0.6em); opacity: 0; } }
  }
`;

/** The price breaks: how many copies, and what a copy costs against the base price. */
const breaks = [
  { copies: 50, factor: 1.3 },
  { copies: 100, factor: 1 },
  { copies: 250, factor: 0.6 },
  { copies: 500, factor: 0.47 },
];

/**
 * Names the identity of a drawn digit: its place and its value, so that a digit that did not change keeps its node.
 *
 * @param item - The digit.
 * @param item.id - Its place and value.
 * @returns The key.
 */
const byId = (item: { id: string }) => item.id;

/** One price break. */
type Break = (typeof breaks)[number];

/** The inks that can be printed: one, two or three, each more costly than the last. */
const inkNames = ['One ink', 'Two inks', 'Three inks'];
const inkFactors = [0.85, 1, 1.2];

/** The papers on offer, with what each does to the price. */
const stocks = [
  { weight: 90, label: '90 g uncoated', factor: 0.9 },
  { weight: 120, label: '120 g uncoated', factor: 1 },
  { weight: 170, label: '170 g coated', factor: 1.25 },
];

/** One paper. */
type Stock = (typeof stocks)[number];

/**
 * Registers `<print-quote>`: a print-run quote with the price breaks as radio cards, the inks, the paper and a
 * "Request quote" button.
 * Attributes: `currency` (default `EUR`; an empty value counts as the default, and a code the browser does not know is
 * shown as typed), `base` (the price of a copy at the break of 100, default `1.84`; an empty or malformed value counts as
 * the default), `heading` (the title of the ticket; not `title`, which would also show a tooltip over the whole widget).
 * Event: `quote` with `{ copies, inks, stock, perCopy, total, currency }`.
 * Custom properties: `--w-bg`, `--w-fg`, `--w-accent`, `--w-on-accent`, `--w-font`, `--w-display`, `--w-radius`.
 *
 * @returns The registered element class.
 */
export const definePrintQuote = () =>
  defineWidget(
    'print-quote',
    ({ props, emit }) => {
      const chosen = signal(1);
      const inks = signal(1);
      const stock = signal(1);
      /**
       * Reads the currency: the attribute, or euros when it is empty.
       *
       * @returns The code.
       */
      const currency = () => props.currency.trim() || 'EUR';
      /**
       * Reads the price of a copy at the break of 100.
       *
       * @returns The price.
       */
      const base = () => readNumber(props.base, 1.84);
      const perCopy = computed(
        () =>
          base() *
          (breaks[chosen.value] as Break).factor *
          (inkFactors[inks.value] as number) *
          (stocks[stock.value] as Stock).factor,
      );
      const copies = computed(() => (breaks[chosen.value] as Break).copies);
      const total = computed(() => Math.round(perCopy.value * copies.value * 100) / 100);
      const digits = computed(() =>
        [...plain(Math.round(total.value))].map((digit, index) => ({
          digit,
          index,
          id: `${index}:${digit}`,
        })),
      );
      const spoken = computed(() => money(total.value, currency(), 2));
      const summary = computed(
        () =>
          `${money(perCopy.value, currency(), 2)} a copy · ${inkNames[inks.value]?.toLowerCase()} · ${stocks[stock.value]?.weight} g`,
      );
      const inkText = computed(() => `${inkNames[inks.value]?.toLowerCase()}`);
      /**
       * Moves the choice of a group of radios with the arrow keys and gives the new radio the focus.
       *
       * @param event - The key press.
       * @param current - The signal that holds the choice.
       * @param count - How many radios the group has.
       */
      const steer = (event: KeyboardEvent, current: { value: number }, count: number) => {
        const next = moveIndex(event.key, current.value, count);
        if (next === undefined) return;
        event.preventDefault();
        current.value = next;
        const radios = (event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(
          '[role="radio"]',
        );
        radios[next]?.focus();
      };
      /**
       * Steers the price breaks.
       *
       * @param event - The key press.
       */
      const steerBreaks = (event: KeyboardEvent) => {
        steer(event, chosen, breaks.length);
      };
      /**
       * Steers the inks.
       *
       * @param event - The key press.
       */
      const steerInks = (event: KeyboardEvent) => {
        steer(event, inks, inkNames.length);
      };
      /**
       * Makes the handler that chooses an item of a group.
       *
       * @param current - The signal that holds the choice.
       * @param index - The item.
       * @returns The handler.
       */
      const choose = (current: { value: number }, index: number) => () => {
        current.value = index;
      };
      /**
       * Chooses the paper.
       *
       * @param event - The change.
       */
      const pickStock = (event: Event) => {
        stock.value = Number((event.target as HTMLSelectElement).value);
      };
      /** Announces the quote. */
      const ask = () => {
        emit('quote', {
          copies: copies.value,
          inks: inks.value + 1,
          stock: stocks[stock.value]?.weight,
          perCopy: Math.round(perCopy.value * 100) / 100,
          total: total.value,
          currency: currency(),
        });
      };
      /**
       * Makes the radio card of a price break.
       *
       * @param item - The price break.
       * @param index - Its place in the list.
       * @returns The card.
       */
      const card = (item: Break, index: number) =>
        button(
          {
            type: 'button',
            role: 'radio',
            'aria-checked': computed(() => String(chosen.value === index)),
            tabindex: computed(() => (chosen.value === index ? 0 : -1)),
            onclick: choose(chosen, index),
          },
          tags.b(String(item.copies)),
          span(() => plain(base() * item.factor, 2)),
        );
      /**
       * Makes the radio that chooses a number of inks.
       *
       * @param name - What the radio is called.
       * @param index - How many inks, less one.
       * @returns The radio.
       */
      const dot = (name: string, index: number) =>
        button({
          type: 'button',
          role: 'radio',
          'aria-label': name,
          'aria-checked': computed(() => String(inks.value === index)),
          tabindex: computed(() => (inks.value === index ? 0 : -1)),
          class: computed(() => ({
            on: index <= inks.value,
            hot: index === inks.value && index > 0,
          })),
          onclick: choose(inks, index),
        });

      return div(
        { class: 'ticket' },
        div(
          { class: 'top' },
          span(() => props.heading),
          span('Print-run quote'),
        ),
        div(
          { class: 'price' },
          sup(currency),
          span(
            { class: 'digits', 'aria-hidden': 'true' },
            each(
              digits,
              ({ digit, index }) => span({ class: 'd', style: { '--i': index } }, digit),
              { by: byId },
            ),
          ),
          span({ class: 'sr' }, spoken),
        ),
        div({ class: 'per' }, summary),
        div(
          { class: 'breaks', role: 'radiogroup', 'aria-label': 'Copies', onkeydown: steerBreaks },
          breaks.map(card),
        ),
        div(
          { class: 'opts' },
          span('Inks'),
          div(
            { class: 'dots', role: 'radiogroup', 'aria-label': 'Inks', onkeydown: steerInks },
            inkNames.map(dot),
            span(inkText),
          ),
          span('Stock'),
          select(
            { 'aria-label': 'Stock', onchange: pickStock },
            stocks.map((item, index) =>
              option({ value: String(index), selected: index === stock.peek() }, item.label),
            ),
          ),
        ),
        div({ class: 'stub' }, button({ type: 'button', onclick: ask }, 'Request quote')),
      );
    },
    { attributes: { currency: 'EUR', base: '1.84', heading: 'Print quote' }, css: widgetCss(css) },
  );
