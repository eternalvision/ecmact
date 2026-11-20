import { batch, computed, defineWidget, effect, signal, tags, untracked } from 'ecmact';
import { widgetCss } from '@site/widgets/kit';

const { button, div, input, p, span } = tags;

const css = `
  :host {
    display: block;
    max-width: 22rem;
    font-family: var(--w-font, Charter, 'Bitstream Charter', 'Sitka Text', Cambria, Georgia, serif);
  }
  .box {
    --muted: color-mix(in srgb, var(--w-fg, #fafafa) 62%, var(--w-bg, #18181b));
    box-sizing: border-box;
    padding: 20px 20px 22px;
    border-radius: 10px;
    background: var(--w-bg, #18181b);
    color: var(--w-fg, #fafafa);
  }
  .kicker { font-size: 14.5px; font-style: italic; color: var(--muted); }
  .clue { margin: 6px 0 18px; font-size: 25px; font-weight: 700; line-height: 1.2; letter-spacing: -0.01em; }
  .clue span { font-weight: 400; color: var(--muted); }
  .cells { container-type: inline-size; display: grid; grid-template-columns: repeat(var(--n), minmax(0, 60px)); gap: 8px; }
  .cells input {
    box-sizing: border-box; width: 100%; aspect-ratio: 1; min-width: 0; padding: 0; border: 0; border-radius: 8px;
    background: var(--w-cell, #2a2a2e); color: var(--w-fg, #fafafa); font: inherit; font-size: 32px; font-weight: 700; text-align: center;
    font-size: min(32px, calc(100cqw / var(--n) * 0.5)); caret-color: var(--w-accent, #facc15);
  }
  .cells input.good { background: var(--w-accent, #facc15); color: var(--w-on-accent, #1c1500); }
  .cells input.wrong { color: var(--w-wrong, #fb7185); box-shadow: inset 0 0 0 3px var(--w-wrong, #fb7185); }
  .acts { display: flex; align-items: center; gap: 18px; margin-top: 20px; }
  .acts button {
    min-height: 44px; padding: 0 22px; border: 0; border-radius: 8px; background: var(--w-accent, #facc15); color: var(--w-on-accent, #1c1500);
    font: inherit; font-size: 17px; font-weight: 700; cursor: pointer;
  }
  .acts button.reveal {
    padding: 0; background: none; color: var(--w-fg, #fafafa); font-weight: 400; font-style: italic; text-decoration: underline; text-underline-offset: 4px;
  }
  .acts button:disabled { opacity: 0.55; cursor: default; }
  .by { margin: 16px 0 0; font-size: 14px; font-style: italic; color: var(--muted); }
  input:focus-visible, button:focus-visible { outline: 3px solid var(--w-accent, #facc15); outline-offset: 3px; }
  @media (prefers-reduced-motion: no-preference) {
    .cells input.good { animation: flip 0.5s ease-out both; animation-delay: calc(var(--i) * 80ms); }
    @keyframes flip { from { transform: rotateX(90deg); } }
    .cells input.wrong { animation: shake 0.32s ease-in-out; }
    @keyframes shake { 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
  }
`;

/** The answer when the attribute holds no letter. */
const defaultAnswer = 'PEAR';
/** The most letters of an answer. */
const mostLetters = 12;
/** What the line under the buttons says until something has happened. */
const idle = 'Set by the host page through two attributes.';

/** How a cell stands after a check. */
type Mark = '' | 'good' | 'wrong';

/**
 * Tells whether a character is a letter.
 *
 * @param char - The character.
 * @returns `true` for a letter of any script.
 */
const isLetter = (char: string) => /^\p{L}$/u.test(char);

/**
 * Reads the answer: its letters in capitals, whatever the script, with spaces, digits and marks left out.
 *
 * @param value - The attribute value.
 * @returns At most twelve letters; `PEAR` when the value has none.
 */
export const parseAnswer = (value: string | null | undefined) => {
  const found = [...(value ?? '')].filter((char) => isLetter(char)).join('');
  return found === ''
    ? defaultAnswer
    : [...found.toLocaleUpperCase()].slice(0, mostLetters).join('');
};

/**
 * Registers `<clue-box>`: one crossword clue with a cell for each letter. A letter goes into the cell in capitals and
 * the focus moves on; the arrows, Home and End move between the cells and Backspace clears one, and from an empty cell
 * goes back. Anything that is no letter is ignored. The right word solves it as soon as it is typed. Check marks each
 * letter that is typed as right (yellow) or wrong (rose, with a text for a screen reader); it never shows the right
 * letter of a wrong one. Reveal fills the answer in and locks the cells; that is not a solution.
 * Attributes: `clue` (the text of the clue), `answer` (its letters; at most twelve, anything else is dropped; `PEAR`
 * when none is left). A change of either starts again.
 * Event: `solved` with `{ answer }`, when the typed word becomes the answer; again only if it stops being right and
 * becomes right again.
 * Custom properties: `--w-bg`, `--w-fg`, `--w-accent`, `--w-on-accent`, `--w-cell`, `--w-wrong`, `--w-font`.
 *
 * @returns The registered element class.
 */
export const defineClueBox = () =>
  defineWidget(
    'clue-box',
    ({ props, emit }) => {
      const answer = computed(() => parseAnswer(props.answer));
      const typed = signal<string[]>([]);
      const marks = signal<Mark[]>([]);
      const note = signal('');
      const solved = signal(false);
      const shown = signal(false);
      effect(() => {
        const letters = answer.value.length;
        untracked(() => {
          batch(() => {
            typed.value = Array.from({ length: letters }, () => '');
            marks.value = Array.from({ length: letters }, (): Mark => '');
            note.value = '';
            solved.value = false;
            shown.value = false;
          });
        });
      });
      /**
       * Lists the letters of the answer, one for each cell.
       *
       * @returns The letters.
       */
      const wanted = () => [...answer.peek()];
      /**
       * Moves the focus to a cell of the same row.
       *
       * @param from - A cell.
       * @param to - The place to go to; a place outside the row is the nearest end.
       */
      const go = (from: HTMLElement, to: number) => {
        const cells = [...(from.parentElement as HTMLElement).children] as HTMLElement[];
        cells[Math.max(0, Math.min(cells.length - 1, to))]?.focus();
      };
      /**
       * Writes a letter, or none, in a cell. A word that is right solves it; one that stops being right takes the
       * marks and the solution back.
       *
       * @param index - The cell.
       * @param letter - The letter in capitals, or an empty text to clear the cell.
       */
      const put = (index: number, letter: string) => {
        const next = typed.peek().map((old, place) => (place === index ? letter : old));
        const right = next.join('') === answer.peek();
        const was = solved.peek();
        batch(() => {
          typed.value = next;
          note.value = right ? 'Solved.' : '';
          solved.value = right;
          marks.value = right
            ? next.map((): Mark => 'good')
            : marks.peek().map((old, place): Mark => (was || place === index ? '' : old));
        });
        if (right && !was) emit('solved', { answer: answer.peek() });
      };
      /**
       * Takes the keys of a cell: letters, Backspace and the keys that move.
       *
       * @param index - The cell.
       * @returns The handler.
       */
      const keys = (index: number) => (event: KeyboardEvent) => {
        const cell = event.currentTarget as HTMLInputElement;
        const { key } = event;
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        const moves: Record<string, number> = {
          ArrowLeft: index - 1,
          ArrowRight: index + 1,
          Home: 0,
          End: typed.peek().length - 1,
        };
        if (key in moves) {
          event.preventDefault();
          go(cell, moves[key] as number);
        } else if (key === 'Backspace') {
          event.preventDefault();
          if (shown.peek()) return;
          if (typed.peek()[index]) {
            put(index, '');
          } else if (index > 0) {
            put(index - 1, '');
            go(cell, index - 1);
          }
        } else if ([...key].length === 1) {
          event.preventDefault();
          if (shown.peek() || !isLetter(key)) return;
          put(index, key.toLocaleUpperCase());
          go(cell, index + 1);
        }
      };
      /**
       * Takes a letter that came in as text, as a phone keyboard or a paste sends it: the last letter of what is in the
       * cell. The cell shows only what is kept.
       *
       * @param index - The cell.
       * @returns The handler.
       */
      const typedIn = (index: number) => (event: Event) => {
        const cell = event.currentTarget as HTMLInputElement;
        const letter = [...cell.value].reverse().find((char) => isLetter(char));
        if (!shown.peek() && (letter !== undefined || cell.value === '')) {
          put(index, letter === undefined ? '' : letter.toLocaleUpperCase());
          if (letter !== undefined) go(cell, index + 1);
        }
        cell.value = typed.peek()[index] as string;
      };
      /** Marks each typed letter as right or wrong, and says which are wrong and not what they should be. */
      const check = () => {
        if (solved.peek()) {
          note.value = 'Solved.';
          return;
        }
        const want = wanted();
        const next = typed.peek().map((letter, place): Mark => {
          if (letter === '') return '';
          return letter === want[place] ? 'good' : 'wrong';
        });
        const wrong = next.flatMap((mark, place) => (mark === 'wrong' ? [place + 1] : []));
        const filled = typed.peek().filter((letter) => letter !== '').length;
        batch(() => {
          marks.value = next;
          if (filled === 0) note.value = 'Type a letter first.';
          else if (wrong.length === 1) note.value = `Letter ${wrong[0]} is wrong.`;
          else if (wrong.length > 1) note.value = `Letters ${wrong.join(', ')} are wrong.`;
          else note.value = `${filled} of ${want.length} letters filled, none wrong so far.`;
        });
      };
      /** Fills the answer in and locks the cells. */
      const showAnswer = () => {
        batch(() => {
          typed.value = wanted();
          marks.value = wanted().map((): Mark => 'good');
          note.value = 'The answer is shown.';
          shown.value = true;
        });
      };
      /**
       * Makes the cell of a letter.
       *
       * @param _ - Nothing; the places only count the cells.
       * @param index - The place.
       * @returns The input.
       */
      const cell = (_: unknown, index: number) =>
        input({
          type: 'text',
          autocomplete: 'off',
          autocapitalize: 'characters',
          spellcheck: false,
          maxlength: 2,
          readonly: shown,
          class: computed(() => marks.value[index] as Mark),
          value: computed(() => typed.value[index] as string),
          'aria-label': computed(() => {
            const mark = marks.value[index];
            const tail = mark === 'good' ? ', right' : mark === 'wrong' ? ', wrong' : '';
            return `Letter ${index + 1} of ${answer.value.length}${tail}`;
          }),
          'aria-invalid': computed(() => (marks.value[index] === 'wrong' ? 'true' : undefined)),
          style: { '--i': index },
          onkeydown: keys(index),
          oninput: typedIn(index),
        });
      const count = computed(() => answer.value.length);
      const kicker = computed(
        () => `Crossword clue · ${count.value} ${count.value === 1 ? 'letter' : 'letters'}`,
      );

      return div(
        { class: 'box' },
        div({ class: 'kicker' }, kicker),
        p(
          { class: 'clue' },
          () => props.clue,
          ' ',
          span(() => `(${count.value})`),
        ),
        () =>
          div(
            {
              class: 'cells',
              role: 'group',
              'aria-label': `Answer, ${count.value} letters`,
              style: { '--n': count.value },
            },
            Array.from({ length: count.value }, cell),
          ),
        div(
          { class: 'acts' },
          button({ type: 'button', disabled: shown, onclick: check }, 'Check'),
          button(
            { type: 'button', class: 'reveal', disabled: shown, onclick: showAnswer },
            'Reveal',
          ),
        ),
        p({ class: 'by', role: 'status' }, () => note.value || idle),
      );
    },
    {
      attributes: { clue: 'Fruit that sounds like a couple', answer: defaultAnswer },
      css: widgetCss(css),
    },
  );
