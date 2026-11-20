import { computed, defineWidget, effect, signal, tags, untracked } from 'ecmact';
import { widgetCss } from '@site/widgets/kit';

const { b, button, div, i, label, option, select, span } = tags;

const css = `
  :host {
    display: block;
    max-width: 26rem;
    font-family: var(--w-font, Futura, 'Century Gothic', 'Avenir Next', Avenir, 'URW Gothic', sans-serif);
  }
  .card {
    --muted: color-mix(in srgb, var(--w-fg, #1a1a2e) 72%, var(--w-bg, #ffffff));
    --tint: color-mix(in srgb, var(--w-accent, #3b2bff) 9%, var(--w-bg, #ffffff));
    --plain: color-mix(in srgb, var(--w-fg, #1a1a2e) 4%, var(--w-bg, #ffffff));
    --wire: color-mix(in srgb, var(--w-fg, #1a1a2e) 38%, var(--w-bg, #ffffff));
    --fret: color-mix(in srgb, var(--w-fg, #1a1a2e) 22%, var(--w-bg, #ffffff));
    box-sizing: border-box;
    padding: 16px 16px 14px;
    border-radius: 16px;
    background: var(--w-bg, #ffffff);
    color: var(--w-fg, #1a1a2e);
    box-shadow: 0 14px 30px rgba(40, 30, 120, 0.18), 0 2px 4px rgba(40, 30, 120, 0.12);
  }
  .head b { display: block; font-size: 20px; font-weight: 700; line-height: 1.2; }
  .head span { font-size: 13.5px; color: var(--muted); }
  .keys { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0 14px; }
  .keys button {
    width: 34px; height: 34px; padding: 0; border: 0; border-radius: 50%; background: var(--tint); color: var(--w-accent, #3b2bff);
    font: inherit; font-size: 15px; font-weight: 700; cursor: pointer;
  }
  .keys button[aria-pressed='true'] {
    background: var(--w-accent, #3b2bff); color: var(--w-on-accent, #ffffff); transform: translateY(-2px);
    box-shadow: 0 4px 0 color-mix(in srgb, var(--w-accent, #3b2bff) 55%, #000000);
  }
  .scale { position: relative; display: inline-flex; align-items: center; }
  .scale select {
    box-sizing: border-box; height: 34px; padding: 0 30px 0 14px; border: 0; border-radius: 12px; background: var(--tint); color: var(--w-accent, #3b2bff);
    font: inherit; font-size: 15px; font-weight: 700; appearance: none; -webkit-appearance: none; cursor: pointer;
  }
  .scale::after { content: '▾'; position: absolute; inset-inline-end: 11px; color: var(--w-accent, #3b2bff); pointer-events: none; }
  .board {
    display: grid; grid-template-columns: 16px repeat(9, minmax(0, 1fr)); padding: 6px 4px 6px 6px; border-radius: 12px; background: var(--plain);
  }
  .board > span { display: grid; place-items: center; font-size: 12px; font-weight: 700; color: var(--muted); }
  .board > div {
    position: relative; display: grid; place-items: center; height: 30px; border-inline-end: 2px solid var(--fret);
    background: linear-gradient(var(--wire), var(--wire)) center / 100% 2px no-repeat;
  }
  .board > div.nut { border-inline-end: 5px solid var(--w-fg, #1a1a2e); background: none; }
  .board > div.nut::before { content: ''; position: absolute; inset-inline: 0; top: 50%; height: 2px; background: var(--wire); }
  .board > div b {
    position: relative; display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: var(--w-accent, #3b2bff);
    color: var(--w-on-accent, #ffffff); font-size: 12px; font-weight: 700; box-shadow: 0 3px 0 rgba(26, 26, 46, 0.25);
  }
  .board > div b.root { background: var(--w-root, #ff2e93); color: #3a001c; }
  .nums { display: grid; grid-template-columns: 16px repeat(9, minmax(0, 1fr)); padding: 4px 4px 0 6px; font-size: 12px; font-weight: 500; color: var(--muted); text-align: center; }
  .legend { display: flex; flex-wrap: wrap; gap: 4px 16px; margin-top: 10px; font-size: 13.5px; }
  .legend i { display: inline-block; width: 12px; height: 12px; margin-inline-end: 6px; border-radius: 50%; background: var(--w-accent, #3b2bff); vertical-align: -1px; }
  .legend i.root { background: var(--w-root, #ff2e93); }
  button:focus-visible, select:focus-visible { outline: 3px solid var(--w-fg, #1a1a2e); outline-offset: 2px; }
  @media (prefers-reduced-motion: no-preference) {
    .board > div b { animation: pop 0.34s cubic-bezier(0.34, 1.7, 0.5, 1) both; animation-delay: calc(var(--i) * 45ms); }
    @keyframes pop { from { transform: scale(0); opacity: 0; } }
  }
`;

/** The twelve notes, with sharps. */
export const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** The scales: the name in the title, the name on the chip and the steps from the key in semitones. */
const scales = {
  major: { name: 'major', chip: 'Major', steps: [0, 2, 4, 5, 7, 9, 11] },
  minor: { name: 'minor', chip: 'Minor', steps: [0, 2, 3, 5, 7, 8, 10] },
  pentatonic: { name: 'minor pentatonic', chip: 'Pentatonic', steps: [0, 3, 5, 7, 10] },
  blues: { name: 'blues', chip: 'Blues', steps: [0, 3, 5, 6, 7, 10] },
};

/** The tunings: the name in the subtitle and the open strings from the lowest, as notes of the octave. */
const tunings = {
  standard: { name: 'standard', open: [4, 9, 2, 7, 11, 4] },
  'drop-d': { name: 'drop D', open: [2, 9, 2, 7, 11, 4] },
  dadgad: { name: 'DADGAD', open: [2, 9, 2, 7, 9, 2] },
};

/** A scale of the list. */
type ScaleId = keyof typeof scales;
/** A tuning of the list. */
type TuningId = keyof typeof tunings;

/** Whole presets: a key and a scale that the `preset` attribute sets together. */
const presets: Record<string, { key: number; scale: ScaleId }> = {
  'a-minor-pentatonic': { key: 9, scale: 'pentatonic' },
  'e-blues': { key: 4, scale: 'blues' },
  'c-major': { key: 0, scale: 'major' },
  'd-minor': { key: 2, scale: 'minor' },
};

/** The keys that have a chip of their own. */
const chipKeys = [9, 0, 2, 4, 7];
/** The last fret that is drawn. */
const lastFret = 8;
/** The key, the scale and the tuning that a missing or unknown value gives. */
const fallback = { key: 9, scale: 'pentatonic' as ScaleId, tuning: 'standard' as TuningId };

/**
 * Reads a key: a letter from A to G with an optional sharp or flat (`C#`, `Bb`), in either case.
 *
 * @param value - The attribute value.
 * @returns The note, 0 for C to 11 for B; A when the value is no key.
 */
export const parseKey = (value: string | null | undefined) => {
  const found = /^([a-g])([#b]?)$/i.exec((value ?? '').trim());
  if (!found) return fallback.key;
  const natural = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }[
    (found[1] as string).toLowerCase()
  ] as number;
  const shift = found[2] === '#' ? 1 : found[2] === 'b' ? -1 : 0;
  return (natural + shift + 12) % 12;
};

/**
 * Reads a scale by its id (`pentatonic`) or by the name in the title (`minor pentatonic`).
 *
 * @param value - The attribute value.
 * @returns The scale; the pentatonic when the value is none.
 */
export const parseScale = (value: string | null | undefined): ScaleId => {
  const text = (value ?? '').trim().toLowerCase();
  const found = (Object.keys(scales) as ScaleId[]).find(
    (id) => id === text || scales[id].name === text,
  );
  return found ?? fallback.scale;
};

/**
 * Reads a tuning by its id.
 *
 * @param value - The attribute value.
 * @returns The tuning; the standard one when the value is none.
 */
export const parseTuning = (value: string | null | undefined): TuningId => {
  const text = (value ?? '').trim().toLowerCase();
  return (Object.keys(tunings) as TuningId[]).find((id) => id === text) ?? fallback.tuning;
};

/**
 * Lists the notes of a scale from its key.
 *
 * @param key - The key, 0 for C to 11 for B.
 * @param scale - The scale.
 * @returns The notes, in order from the key.
 */
export const scaleNotes = (key: number, scale: ScaleId) =>
  scales[scale].steps.map((step) => (key + step) % 12);

/** What a visitor chose, and the attributes it was chosen against. */
interface Choice {
  /** The key. */
  key: number;
  /** The scale. */
  scale: ScaleId;
  /** The attributes at that moment: a later change of one of them takes the choice back. */
  from: string;
}

/**
 * Registers `<fret-map>`: a guitar fretboard (frets 0 to 8) with the notes of a key and a scale marked and the root
 * in another colour, key chips above it and a list of scales. The notes pop in fret by fret when they change; where
 * motion is reduced they are there at once.
 * Attributes: `key` (`A`, `C#`, `Bb`; `A` when unknown), `scale` (`major`, `minor`, `pentatonic` or `blues`;
 * `pentatonic` when unknown), `tuning` (`standard`, `drop-d` or `dadgad`; `standard` when unknown), `preset` (a whole
 * key and scale at once: `a-minor-pentatonic`, `e-blues`, `c-major`, `d-minor`; it wins over `key` and `scale`, and an
 * unknown one is ignored). A change of an attribute takes back what a visitor chose.
 * Event: `change` with `{ key, scale, tuning, notes }`, when the visitor chooses another key or scale.
 * Custom properties: `--w-bg`, `--w-fg`, `--w-accent`, `--w-on-accent`, `--w-root`, `--w-font`.
 *
 * @returns The registered element class.
 */
export const defineFretMap = () =>
  defineWidget(
    'fret-map',
    ({ props, emit }) => {
      const chosen = signal<Choice | null>(null);
      /**
       * Names the attributes that a choice is made against.
       *
       * @returns The text.
       */
      const snapshot = () => `${props.key}|${props.scale}|${props.tuning}|${props.preset}`;
      const preset = computed(() => presets[props.preset.trim().toLowerCase()]);
      const current = computed(() => {
        const pick = chosen.value;
        if (pick && pick.from === snapshot()) return pick;
        return {
          key: preset.value?.key ?? parseKey(props.key),
          scale: preset.value?.scale ?? parseScale(props.scale),
        };
      });
      effect(() => {
        snapshot();
        untracked(() => {
          chosen.value = null;
        });
      });
      const tuning = computed(() => parseTuning(props.tuning));
      const notes = computed(() => scaleNotes(current.value.key, current.value.scale));
      /**
       * Chooses a key and a scale, and says so.
       *
       * @param key - The key.
       * @param scale - The scale.
       */
      const choose = (key: number, scale: ScaleId) => {
        chosen.value = { key, scale, from: snapshot() };
        emit('change', {
          key: noteNames[key],
          scale,
          tuning: tuning.peek(),
          notes: scaleNotes(key, scale).map((note) => noteNames[note]),
        });
      };
      const title = computed(
        () => `${noteNames[current.value.key]} ${scales[current.value.scale].name}`,
      );
      const subtitle = computed(
        () => `${tunings[tuning.value].name} tuning · frets 0 to ${lastFret}`,
      );
      const boardLabel = computed(
        () =>
          `${title.value} on frets 0 to ${lastFret}: ${notes.value.map((note) => noteNames[note]).join(', ')}`,
      );
      const chips = computed(() =>
        chipKeys.includes(current.value.key) ? chipKeys : [...chipKeys, current.value.key],
      );
      /**
       * Makes the chip of a key.
       *
       * @param key - The key.
       * @returns The button.
       */
      const chip = (key: number) => {
        /** Chooses the key of the chip. */
        const pick = () => {
          choose(key, current.peek().scale);
        };
        return button(
          {
            type: 'button',
            'aria-pressed': computed(() => String(current.value.key === key)),
            onclick: pick,
          },
          noteNames[key],
        );
      };
      /**
       * Makes the option of a scale.
       *
       * @param id - The scale.
       * @returns The option.
       */
      const scaleOption = (id: ScaleId) => option({ value: id }, scales[id].chip);
      /**
       * Keeps the list on the scale that is in use, after its options are in place.
       *
       * @param list - The list.
       */
      const showScale = (list: HTMLSelectElement) => {
        effect(() => {
          list.value = current.value.scale;
        });
      };
      /**
       * Takes the scale that the list shows, unless it is none of ours.
       *
       * @param event - The change of the list.
       */
      const pickScale = (event: Event) => {
        const id = (event.currentTarget as HTMLSelectElement).value;
        if (id in scales) choose(current.peek().key, id as ScaleId);
      };
      /**
       * Draws the six strings of the board, from the highest, with a label and nine frets each.
       *
       * @returns The cells.
       */
      const strings = () => {
        const { key } = current.value;
        const inScale = new Set(notes.value);
        const open = [...tunings[tuning.value].open].reverse();
        return open.flatMap((base, row) => [
          span(row === 0 ? (noteNames[base] as string).toLowerCase() : (noteNames[base] as string)),
          ...Array.from({ length: lastFret + 1 }, (_, fret) => {
            const note = (base + fret) % 12;
            return div(
              { class: fret === 0 ? 'nut' : undefined },
              inScale.has(note) &&
                b(
                  { class: note === key ? 'root' : undefined, style: { '--i': fret } },
                  noteNames[note],
                ),
            );
          }),
        ]);
      };

      return div(
        { class: 'card' },
        div({ class: 'head' }, b(title), span(subtitle)),
        div(
          { class: 'keys' },
          () => chips.value.map(chip),
          label(
            { class: 'scale' },
            select(
              {
                'aria-label': 'Scale',
                ref: showScale,
                onchange: pickScale,
              },
              (Object.keys(scales) as ScaleId[]).map(scaleOption),
            ),
          ),
        ),
        div({ class: 'board', role: 'img', 'aria-label': boardLabel }, strings),
        div(
          { class: 'nums', 'aria-hidden': 'true' },
          span(),
          Array.from({ length: lastFret + 1 }, (_, fret) => span(String(fret))),
        ),
        div(
          { class: 'legend' },
          span(i({ class: 'root' }), 'root'),
          span(i(), 'note of the scale'),
        ),
      );
    },
    {
      attributes: { key: 'A', scale: 'pentatonic', tuning: 'standard', preset: '' },
      css: widgetCss(css),
    },
  );
