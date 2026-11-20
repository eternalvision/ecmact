import { batch, computed, defineWidget, each, effect, signal, tags, untracked } from 'ecmact';
import { readNumber, widgetCss } from '@site/widgets/kit';

const { b, button, div, i, span } = tags;

const css = `
  :host {
    display: block;
    max-width: 22rem;
    font-family: var(--w-font, ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace);
  }
  .grape {
    --lip: color-mix(in srgb, var(--w-bg, #6d28d9) 60%, #000000);
    box-sizing: border-box;
    padding: 20px 18px 30px;
    border-radius: 28px;
    background: var(--w-bg, #6d28d9);
    color: var(--w-fg, #ffffff);
  }
  .tape {
    display: flex; align-items: center; justify-content: flex-end; gap: 5px; height: 44px; padding: 0 16px; border-radius: 999px;
    background: var(--w-key, #fff6e5); overflow: hidden;
    box-shadow: inset 0 3px 6px rgba(60, 20, 120, 0.35), inset 0 -3px 5px #ffffff;
  }
  .tape i { flex: none; width: 10px; height: 10px; border-radius: 999px; background: var(--w-on-key, #2e1065); }
  .tape i.dash { width: 28px; }
  .tape i.first { margin-inline-start: 9px; }
  .tape i.live { background: var(--w-accent, #ff8a1f); }
  .out {
    display: flex; align-items: baseline; justify-content: center; gap: 4px; margin: 12px 0 2px;
    font-size: 44px; font-weight: 700; letter-spacing: 0.14em; line-height: 1.1; min-height: 1.1em;
  }
  .out i { width: 4px; height: 38px; align-self: center; border-radius: 2px; background: var(--w-fg, #ffffff); }
  .key {
    display: block; width: 100%; height: 76px; margin-top: 10px; padding: 0; border: 0; border-radius: 999px;
    background: var(--w-key, #fff6e5); color: var(--w-on-key, #2e1065); font: inherit; font-size: 17px; font-weight: 700; cursor: pointer;
    touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
    box-shadow: inset 0 -9px 14px rgba(109, 40, 217, 0.22), inset 0 7px 10px #ffffff, 0 12px 0 var(--lip), 0 22px 24px rgba(30, 10, 80, 0.5);
  }
  .key.down {
    transform: translateY(9px);
    box-shadow: inset 0 -9px 14px rgba(109, 40, 217, 0.22), inset 0 7px 10px #ffffff, 0 3px 0 var(--lip), 0 8px 12px rgba(30, 10, 80, 0.5);
  }
  .hint { margin-top: 28px; font-size: 13.5px; font-weight: 600; color: color-mix(in srgb, var(--w-fg, #ffffff) 86%, var(--w-bg, #6d28d9)); text-align: center; }
  .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  button:focus-visible { outline: 3px solid var(--w-fg, #ffffff); outline-offset: 4px; }
  @media (prefers-reduced-motion: no-preference) {
    .tape i.live { animation: enter 0.18s ease-out; }
    @keyframes enter { from { transform: translateX(24px); opacity: 0; } }
    .out i { animation: caret 1s steps(1) infinite; }
    @keyframes caret { 50% { opacity: 0; } }
  }
`;

/** The letters and digits of the International Morse code. */
const code: Record<string, string> = {
  '.-': 'A',
  '-...': 'B',
  '-.-.': 'C',
  '-..': 'D',
  '.': 'E',
  '..-.': 'F',
  '--.': 'G',
  '....': 'H',
  '..': 'I',
  '.---': 'J',
  '-.-': 'K',
  '.-..': 'L',
  '--': 'M',
  '-.': 'N',
  '---': 'O',
  '.--.': 'P',
  '--.-': 'Q',
  '.-.': 'R',
  '...': 'S',
  '-': 'T',
  '..-': 'U',
  '...-': 'V',
  '.--': 'W',
  '-..-': 'X',
  '-.--': 'Y',
  '--..': 'Z',
  '-----': '0',
  '.----': '1',
  '..---': '2',
  '...--': '3',
  '....-': '4',
  '.....': '5',
  '-....': '6',
  '--...': '7',
  '---..': '8',
  '----.': '9',
};

/** The most letters of a message that are kept; older ones fall off the left. */
const mostLetters = 12;
/** The most marks of one letter; the eighth ends the letter at once. */
const mostMarks = 8;
/** The speed when `wpm` is missing or malformed, in words a minute. */
const defaultSpeed = 12;
/** The fastest speed that `wpm` can set. */
const fastest = 40;

/**
 * Reads a pattern of dots and dashes.
 *
 * @param pattern - The marks, `.` and `-`.
 * @returns The letter or digit, or an empty text when the pattern is none.
 */
export const decode = (pattern: string) => code[pattern] ?? '';

/**
 * Works out how long a dot is at a speed. A dash is three units and the pause that ends a letter is three units; the
 * key tells a dash from a dot at two.
 *
 * @param wpm - The speed, in words a minute (the word PARIS is 50 units).
 * @returns The unit, in milliseconds.
 */
export const unitMs = (wpm: number) => 1200 / wpm;

/** One mark that has been sent. */
interface Mark {
  /** The place, so that the mark keeps its node. */
  id: number;
  /** Whether it is a dash. */
  dash: boolean;
  /** Whether it starts a letter. */
  first: boolean;
}

/**
 * Registers `<morse-key>`: one wide telegraph key. Hold it with the pointer or the Space key: a short press is a dot,
 * a long one a dash, and a pause turns the marks into a letter. A pattern that is no letter shows as `?`. The press
 * ends when the pointer leaves the key, when the pointer is cancelled and when the key loses the focus; a key repeat
 * while the key is held is ignored.
 * Attribute: `wpm` (the speed in words a minute, from 1 to 40; `12` when missing or malformed).
 * Event: `letter` with `{ pattern, letter, message }`, when a letter is done (`letter` is `?` for an unknown pattern).
 * Custom properties: `--w-bg`, `--w-fg`, `--w-key`, `--w-on-key`, `--w-accent`, `--w-font`.
 *
 * @returns The registered element class.
 */
export const defineMorseKey = () =>
  defineWidget(
    'morse-key',
    ({ props, emit }) => {
      /**
       * Reads the speed: words a minute, from 1 to 40.
       *
       * @returns The speed.
       */
      const speed = () => Math.min(readNumber(String(props.wpm), defaultSpeed, 1), fastest);
      const sent = signal<Mark[]>([]);
      const pattern = signal('');
      const message = signal('');
      const spoken = signal('');
      const held = signal(false);
      const long = signal(false);
      let counter = 0;
      let pressedAt = 0;
      let holdTimer: ReturnType<typeof setTimeout> | undefined;
      let gapTimer: ReturnType<typeof setTimeout> | undefined;
      effect(() =>
        untracked(() => () => {
          clearTimeout(holdTimer);
          clearTimeout(gapTimer);
        }),
      );
      /** Turns the marks of the letter into the letter, and says so. */
      const finish = () => {
        const marks = pattern.peek();
        const letter = decode(marks);
        const next = (message.peek() + (letter || '?')).slice(-mostLetters);
        batch(() => {
          pattern.value = '';
          message.value = next;
          spoken.value = letter
            ? `Letter ${letter}`
            : `Unknown pattern: ${[...marks].map((mark) => (mark === '.' ? 'dot' : 'dash')).join(' ')}`;
        });
        emit('letter', { pattern: marks, letter: letter || '?', message: next });
      };
      /** Starts a press, unless the key is already held. */
      const begin = () => {
        if (held.peek()) return;
        clearTimeout(gapTimer);
        pressedAt = Date.now();
        batch(() => {
          held.value = true;
          long.value = false;
        });
        holdTimer = setTimeout(
          () => {
            long.value = true;
          },
          2 * unitMs(speed()),
        );
      };
      /** Ends the press that is running: a dot or a dash, and the pause that may end the letter. */
      const end = () => {
        if (!held.peek()) return;
        clearTimeout(holdTimer);
        const dash = Date.now() - pressedAt >= 2 * unitMs(speed());
        counter += 1;
        batch(() => {
          held.value = false;
          long.value = false;
          sent.value = [...sent.peek(), { id: counter, dash, first: pattern.peek() === '' }].slice(
            -30,
          );
          pattern.value += dash ? '-' : '.';
        });
        if (pattern.peek().length >= mostMarks) finish();
        else gapTimer = setTimeout(finish, 3 * unitMs(speed()));
      };
      /**
       * Starts a press from the main button of the pointer.
       *
       * @param event - The pointer press.
       */
      const press = (event: PointerEvent) => {
        if (event.button === 0) begin();
      };
      /**
       * Starts a press from the Space key, once; the repeats of a held key are swallowed.
       *
       * @param event - The key press.
       */
      const down = (event: KeyboardEvent) => {
        if (event.key !== ' ') return;
        event.preventDefault();
        if (!event.repeat) begin();
      };
      /**
       * Ends the press that the Space key started.
       *
       * @param event - The key release.
       */
      const up = (event: KeyboardEvent) => {
        if (event.key !== ' ') return;
        event.preventDefault();
        end();
      };
      /**
       * Stops the menu that a long touch opens, which would end the press.
       *
       * @param event - The event.
       */
      const noMenu = (event: Event) => {
        event.preventDefault();
      };
      /**
       * Makes a mark of the tape.
       *
       * @param mark - The mark.
       * @returns The node.
       */
      const draw = (mark: Mark) => i({ class: { dash: mark.dash, first: mark.first } });
      /**
       * Names a mark by its place.
       *
       * @param mark - The mark.
       * @returns The key.
       */
      const byId = (mark: Mark) => mark.id;
      const hint = computed(() => `${speed()} words a minute · short is a dot, long is a dash`);
      const keyClass = computed(() => ({ key: true, down: held.value }));

      return div(
        { class: 'grape' },
        div(
          { class: 'tape', 'aria-hidden': 'true' },
          each(sent, draw, { by: byId }),
          () =>
            held.value &&
            i({
              class: computed(() => ({
                live: true,
                dash: long.value,
                first: pattern.value === '',
              })),
            }),
        ),
        div({ class: 'out', 'aria-hidden': 'true' }, b(message), i()),
        span({ class: 'sr', role: 'status' }, spoken),
        button(
          {
            type: 'button',
            class: keyClass,
            'aria-describedby': 'hint',
            onpointerdown: press,
            onpointerup: end,
            onpointerleave: end,
            onpointercancel: end,
            onblur: end,
            onkeydown: down,
            onkeyup: up,
            oncontextmenu: noMenu,
          },
          'Hold to send',
        ),
        div({ class: 'hint', id: 'hint' }, hint),
      );
    },
    { attributes: { wpm: defaultSpeed }, css: widgetCss(css) },
  );
