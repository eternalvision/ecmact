import { computed, defineWidget, effect, each, signal, tags, untracked } from 'ecmact';
import { widgetCss } from '@site/widgets/kit';

const { b, button, div, i, span } = tags;

const css = `
  :host {
    display: block;
    max-width: 20rem;
    font-family: var(--w-font, ui-rounded, 'SF Pro Rounded', 'Arial Rounded MT Bold', 'Hiragino Maru Gothic ProN', Quicksand, Comfortaa, Manjari, Calibri, sans-serif);
  }
  .rows {
    --k: rgba(255, 255, 255, 0.16);
    --lip: color-mix(in srgb, var(--w-fg, #06302c) 55%, var(--w-bg, #12b5a6));
    box-sizing: border-box;
    padding: 16px 18px 20px;
    border-radius: 30px;
    background:
      linear-gradient(135deg, var(--k) 25%, transparent 25%) -10px 0 / 20px 20px,
      linear-gradient(225deg, var(--k) 25%, transparent 25%) -10px 0 / 20px 20px,
      linear-gradient(315deg, var(--k) 25%, transparent 25%) 0 0 / 20px 20px,
      linear-gradient(45deg, var(--k) 25%, transparent 25%) 0 0 / 20px 20px,
      var(--w-bg, #12b5a6);
    color: var(--w-fg, #06302c);
    text-align: center;
  }
  .top { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 15.5px; font-weight: 800; text-align: start; }
  .undo {
    flex: none; width: 44px; height: 44px; padding: 0; border: 0; border-radius: 50%; background: #fff9ee; color: var(--w-fg, #06302c);
    font: inherit; font-size: 22px; font-weight: 900; box-shadow: 0 4px 0 var(--lip); cursor: pointer;
  }
  .big {
    position: relative; display: grid; place-content: center; width: min(172px, 100%); aspect-ratio: 1; margin: 6px auto 0; padding: 0; border: 0;
    border-radius: 50%; background: #fff9ee; color: var(--w-fg, #06302c); font: inherit; cursor: pointer;
    box-shadow: 0 10px 0 var(--lip), 0 22px 26px rgba(4, 60, 54, 0.4);
  }
  .big::before { content: ''; position: absolute; inset: 10px; border: 3px dashed var(--w-accent, #ff6b57); border-radius: 50%; }
  .big b { font-size: 76px; font-weight: 900; line-height: 0.95; letter-spacing: -0.03em; }
  .big span { font-size: 16px; font-weight: 800; }
  .repeat { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 28px 0 8px; }
  .repeat i { box-sizing: border-box; width: 20px; height: 20px; border-radius: 50%; background: rgba(255, 249, 238, 0.5); }
  .repeat i.on { background: #fff9ee; box-shadow: inset 0 0 0 5px var(--w-accent, #ff6b57); }
  .next { font-size: 16px; font-weight: 800; }
  button:focus-visible { outline: 3px solid var(--w-fg, #06302c); outline-offset: 4px; }
  @media (prefers-reduced-motion: no-preference) {
    .big { transition: transform 0.35s cubic-bezier(0.34, 1.9, 0.5, 1), box-shadow 0.35s cubic-bezier(0.34, 1.9, 0.5, 1); }
    .big:active { transform: translateY(8px); box-shadow: 0 2px 0 var(--lip), 0 8px 12px rgba(4, 60, 54, 0.4); }
  }
`;

/** The most dots that a repeat shows. */
const mostRepeat = 24;

/**
 * Reads the count that is kept for a pattern. A storage that throws, and a value that is not a whole number, give 0.
 *
 * @param key - The name the count is kept under.
 * @returns The count.
 */
const readCount = (key: string) => {
  try {
    const count = Number.parseInt(localStorage.getItem(key) ?? '', 10);
    return Number.isFinite(count) && count >= 0 ? count : 0;
  } catch {
    return 0;
  }
};

/**
 * Keeps the count of a pattern. A storage that throws is ignored, so that the count still works for the visit.
 *
 * @param key - The name to keep the count under.
 * @param count - The count.
 */
const writeCount = (key: string, count: number) => {
  try {
    localStorage.setItem(key, String(count));
  } catch {
    /* The count stays for this visit only. */
  }
};

/**
 * Registers `<row-counter>`: one big round button that counts the rows of a knitting pattern, a button to take a row
 * back, and the position in a repeat. The count is kept in the browser for each `pattern`, so a reload goes on from
 * it; where the storage is blocked it still counts for the visit.
 * Attributes: `pattern` (the name of the pattern, which the count is kept under; `Pattern` when empty), `repeat` (how
 * many rows make a repeat, up to 24; `0`, a negative or malformed value, and the default, show no repeat).
 * Event: `row` with `{ pattern, count }`, when the count changes.
 * Custom properties: `--w-bg`, `--w-fg`, `--w-accent`, `--w-font`.
 *
 * @returns The registered element class.
 */
export const defineRowCounter = () =>
  defineWidget(
    'row-counter',
    ({ props, emit }) => {
      /**
       * Reads the name of the pattern: the attribute, or `Pattern` when it is empty.
       *
       * @returns The name.
       */
      const pattern = () => props.pattern.trim() || 'Pattern';
      /**
       * Names the place the count is kept under.
       *
       * @returns The key.
       */
      const key = () => `ecmact-row-counter:${pattern()}`;
      const count = signal(0);
      effect(() => {
        const name = key();
        untracked(() => {
          count.value = readCount(name);
        });
      });
      /**
       * Reads the length of the repeat: a whole number from 1 to 24, or 0 for none.
       *
       * @returns The number of rows.
       */
      const repeat = () => {
        const rows = Math.floor(props.repeat);
        return rows >= 1 ? Math.min(rows, mostRepeat) : 0;
      };
      const position = computed(() => count.value % repeat());
      /**
       * Changes the count, keeps it and says so.
       *
       * @param next - The new count.
       */
      const set = (next: number) => {
        count.value = next;
        writeCount(key(), next);
        emit('row', { pattern: pattern(), count: next });
      };
      const dots = computed(() => Array.from({ length: repeat() }, (_, index) => index));
      const shown = computed(() => String(count.value));
      const label = computed(() => `Add a row, now row ${count.value}`);
      const none = computed(() => count.value === 0);
      const place = computed(() => `Row ${position.value} of a repeat of ${repeat()}`);
      const nextText = computed(() => {
        const turn = Math.floor(count.value / repeat()) + 1;
        return `Repeat ${turn} · next starts at row ${turn * repeat() + 1}`;
      });
      /** Takes a row back. */
      const back = () => {
        set(count.value - 1);
      };
      /** Adds a row. */
      const add = () => {
        set(count.value + 1);
      };
      /**
       * Names a dot of the repeat by its place, so that every dot keeps its node.
       *
       * @param index - The place.
       * @returns The key.
       */
      const byIndex = (index: number) => index;
      /**
       * Makes a dot of the repeat, which is filled up to the position.
       *
       * @param index - The place of the dot.
       * @returns The dot.
       */
      const dot = (index: number) => i({ class: computed(() => ({ on: index < position.value })) });

      return div(
        { class: 'rows' },
        div(
          { class: 'top' },
          span(pattern),
          button(
            {
              type: 'button',
              class: 'undo',
              'aria-label': 'Undo one row',
              disabled: none,
              onclick: back,
            },
            '↩',
          ),
        ),
        button(
          { type: 'button', class: 'big', 'aria-label': label, onclick: add },
          b(shown),
          span('tap for a row'),
        ),
        () =>
          repeat() > 0 && [
            div(
              { class: 'repeat', role: 'img', 'aria-label': place },
              each(dots, dot, { by: byIndex }),
            ),
            div({ class: 'next' }, nextText),
          ],
      );
    },
    { attributes: { pattern: 'Pattern', repeat: 0 }, css: widgetCss(css) },
  );
