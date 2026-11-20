import { computed, defineWidget, effect, signal, tags, untracked } from 'ecmact';
import { widgetCss } from '@site/widgets/kit';

const { b, div, input, label, li, ol, small, span } = tags;

const css = `
  :host {
    display: block;
    max-width: 24rem;
    font-family: var(--w-font, Rockwell, 'Rockwell Nova', 'Roboto Slab', 'DejaVu Serif', 'Sitka Small', serif);
  }
  .dough {
    position: relative;
    box-sizing: border-box;
    padding: 18px 18px 20px;
    border-radius: 32px;
    background: var(--w-bg, #ffd9cf);
    color: var(--w-fg, #3a0d2e);
    overflow: hidden;
  }
  .yolk {
    position: absolute; top: -24px; right: -30px; width: 150px; height: 140px;
    border-radius: 42% 58% 60% 40% / 55% 45% 55% 45%; background: #ffc93c;
  }
  .name { position: relative; margin: 0 0 6px; font-size: 14px; font-weight: 700; }
  .blob {
    position: relative; display: grid; place-content: center; width: 86%; min-height: 150px; box-sizing: border-box;
    margin: 4px 0 0; padding: 18px; border-radius: 62% 38% 46% 54% / 55% 48% 52% 45%;
    background: var(--w-accent, #d81b60); color: var(--w-on-accent, #fff8ec); text-align: center;
  }
  .blob small { font-size: 16px; font-weight: 700; }
  .blob b { font-size: 40px; line-height: 1.05; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
  .blob span { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 13.5px; font-weight: 600; }
  ol { position: relative; display: flex; flex-wrap: wrap; gap: 6px; margin: 16px 0 0; padding: 0; list-style: none; font-size: 14.5px; font-weight: 700; }
  li { padding: 6px 12px; background: #ffffff; border-radius: 48% 52% 55% 45% / 60% 44% 56% 40%; }
  li:nth-child(even) { border-radius: 55% 45% 42% 58% / 46% 58% 42% 54%; }
  li.done { background: var(--w-fg, #3a0d2e); color: var(--w-on-accent, #fff8ec); }
  li.now { background: var(--w-accent, #d81b60); color: var(--w-on-accent, #fff8ec); }
  .temp { position: relative; display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 6px 10px; margin-top: 18px; font-size: 16px; font-weight: 700; }
  .temp b { font-size: 22px; color: var(--w-accent-text, #a3134a); }
  input[type='range'] { grid-column: 1 / -1; appearance: none; -webkit-appearance: none; width: 100%; height: 30px; margin: 0; background: transparent; }
  input[type='range']::-webkit-slider-runnable-track {
    height: 14px; border-radius: 999px; background: linear-gradient(90deg, var(--w-accent, #d81b60) 0 var(--fill, 60%), #ffffff var(--fill, 60%));
  }
  input[type='range']::-moz-range-track {
    height: 14px; border-radius: 999px; background: linear-gradient(90deg, var(--w-accent, #d81b60) 0 var(--fill, 60%), #ffffff var(--fill, 60%));
  }
  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none; width: 32px; height: 30px; margin-top: -8px; box-sizing: border-box; border: 5px solid #ffffff;
    border-radius: 58% 42% 50% 50% / 50% 46% 54% 50%; background: var(--w-fg, #3a0d2e);
  }
  input[type='range']::-moz-range-thumb {
    width: 22px; height: 20px; border: 5px solid #ffffff; border-radius: 58% 42% 50% 50% / 50% 46% 54% 50%; background: var(--w-fg, #3a0d2e);
  }
  input:focus-visible { outline: 3px solid var(--w-fg, #3a0d2e); outline-offset: 3px; }
  @media (prefers-reduced-motion: no-preference) {
    .blob { scale: calc(1 + var(--rise, 0) * 0.015); transition: scale 0.8s ease; animation: rise 5s ease-in-out infinite alternate; }
    @keyframes rise { to { border-radius: 48% 52% 58% 42% / 46% 58% 42% 54%; transform: scale(1.03); } }
    li { transition: background 0.4s ease, color 0.4s ease; }
  }
`;

/** One stage of the schedule: its name, its length at 24 °C in hours, and whether warmth shortens it. */
const stages = [
  { name: 'Autolyse', hours: 0.5, warm: false },
  { name: 'Bulk', hours: 4.5, warm: true },
  { name: 'Shape', hours: 0.5, warm: false },
  { name: 'Proof', hours: 1.5, warm: true },
  { name: 'Bake', hours: 1, warm: false },
];

/** Where the schedule stands at a moment. */
export interface Standing {
  /** The stage that is running, or -1 before the first one starts and `stages.length` once the loaf is out. */
  stage: number;
  /** The seconds until the stage ends (or, before the start, until it starts). */
  left: number;
  /** Whether the loaf is out. */
  done: boolean;
}

/**
 * Reads the moment the loaf comes out. A date without a time, `2027-01-01`, means the start of that day in the
 * visitor's time zone, as a date with a time and no offset does; `Date.parse` alone would read it as UTC.
 *
 * @param value - The attribute value.
 * @param fallback - The moment to use when the value is missing or invalid, in milliseconds.
 * @returns The moment in milliseconds.
 */
export const parseTarget = (value: string | null | undefined, fallback: number) => {
  const text = (value ?? '').trim();
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  const parsed = day
    ? new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3])).getTime()
    : Date.parse(text);
  return Number.isNaN(parsed) ? fallback : parsed;
};

/**
 * Works back from the moment the loaf comes out: the stages follow each other and the last one ends then. A warmer
 * kitchen shortens the stages that rise, a cooler one lengthens them, by a factor of two for each 6 degrees.
 *
 * @param target - When the loaf comes out, in milliseconds.
 * @param now - The current moment, in milliseconds.
 * @param temperature - The temperature of the kitchen, in degrees Celsius.
 * @returns Where the schedule stands.
 */
export const standing = (target: number, now: number, temperature: number): Standing => {
  const scale = 2 ** ((24 - temperature) / 6);
  const lengths = stages.map((stage) => stage.hours * 3600000 * (stage.warm ? scale : 1));
  if (now >= target) return { stage: stages.length, left: 0, done: true };
  const start = target - lengths.reduce((sum, length) => sum + length, 0);
  if (now < start) return { stage: -1, left: Math.ceil((start - now) / 1000), done: false };
  const ends = lengths.map(
    (_, index) => start + lengths.slice(0, index + 1).reduce((sum, length) => sum + length, 0),
  );
  /* The last stage ends at the target itself, so that rounding cannot leave a moment that no stage holds. */
  ends[ends.length - 1] = target;
  const stage = ends.findIndex((end) => now < end);
  return { stage, left: Math.ceil(((ends[stage] as number) - now) / 1000), done: false };
};

/**
 * Writes seconds as `02:14:09`; the hours go past 24 instead of turning into days.
 *
 * @param seconds - The seconds.
 * @returns The text.
 */
export const clockText = (seconds: number) =>
  [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');

/** The clocks that have announced the end of their schedule, so that one that is put back does not say it again. */
const announced = new WeakSet<HTMLElement>();

/**
 * Registers `<proof-clock>`: the schedule of a sourdough loaf, worked back from the moment it comes out of the oven,
 * with a slider for the temperature of the kitchen. The clock ticks only while the tab is visible and before the
 * loaf is out.
 * Attributes: `to` (when the loaf comes out: a date such as `2027-01-01T18:00:00` or `2027-01-01`, or a moment with
 * an offset such as `2027-01-01T18:00:00Z`; ten hours from now when missing or invalid, and a moment in the past
 * shows the loaf as out), `label` (the title above the clock).
 * Event: `done`, when the loaf is out; again if `to` is changed to a later moment and that passes too.
 * Custom properties: `--w-bg`, `--w-fg`, `--w-accent`, `--w-on-accent`, `--w-accent-text`, `--w-font`.
 *
 * @returns The registered element class.
 */
export const defineProofClock = () =>
  defineWidget(
    'proof-clock',
    ({ host, props, emit }) => {
      const now = signal(Date.now());
      const fallback = Date.now() + 10 * 3600000;
      const temperature = signal(24);
      const target = computed(() => parseTarget(props.to, fallback));
      const state = computed(() => standing(target.value, now.value, temperature.value));
      /**
       * Names the moment the loaf comes out, as a time of day.
       *
       * @returns The text.
       */
      const outAt = () =>
        new Date(target.value).toLocaleTimeString(document.documentElement.lang || 'en', {
          hour: '2-digit',
          minute: '2-digit',
        });
      /**
       * Names what the big shape says is running.
       *
       * @returns The text.
       */
      const heading = () => {
        const { stage, done } = state.value;
        if (done) return 'Out of the oven';
        return stage < 0 ? 'Starts in' : (stages[stage] as { name: string }).name;
      };

      let timer: ReturnType<typeof setInterval> | undefined;
      /** Moves the clock to the current moment. */
      const tick = () => {
        now.value = Date.now();
      };
      /** Runs the timer only while the tab is visible and the loaf is not out. */
      const sync = () => {
        const run = !document.hidden && !state.peek().done;
        if (run && timer === undefined) {
          timer = setInterval(tick, 1000);
          tick();
        } else if (!run && timer !== undefined) {
          clearInterval(timer);
          timer = undefined;
        }
      };
      effect(() =>
        untracked(() => {
          document.addEventListener('visibilitychange', sync);
          return () => {
            clearInterval(timer);
            timer = undefined;
            document.removeEventListener('visibilitychange', sync);
          };
        }),
      );
      effect(() => {
        const { done } = state.value;
        sync();
        if (!done) {
          announced.delete(host);
        } else if (!announced.has(host)) {
          announced.add(host);
          emit('done');
        }
      });

      const rise = computed(() => Math.max(0, state.value.stage));
      const timeLeft = computed(() => clockText(state.value.left));
      const outText = computed(() => `loaf out at ${outAt()}`);
      const fill = computed(() => `${((temperature.value - 16) / 14) * 100}%`);
      const degrees = computed(() => `${temperature.value} °C`);
      /**
       * Makes the pill of a stage: done, running or still to come.
       *
       * @param stage - The stage.
       * @param index - Its place in the schedule.
       * @returns The pill.
       */
      const pill = (stage: { name: string }, index: number) =>
        li(
          {
            class: computed(() => ({
              done: index < state.value.stage,
              now: index === state.value.stage,
            })),
            'aria-current': computed(() => (index === state.value.stage ? 'step' : undefined)),
          },
          stage.name,
        );

      return div(
        { class: 'dough' },
        div({ class: 'yolk', 'aria-hidden': 'true' }),
        div({ class: 'name' }, () => props.label),
        div(
          { class: 'blob', style: { '--rise': rise } },
          small(heading),
          b({ role: 'timer' }, timeLeft),
          span(outText),
        ),
        ol({ 'aria-label': 'Stages' }, stages.map(pill)),
        label(
          { class: 'temp' },
          span('Kitchen'),
          b(degrees),
          input({
            type: 'range',
            min: 16,
            max: 30,
            bind: temperature,
            'aria-label': 'Kitchen temperature',
            style: { '--fill': fill },
          }),
        ),
      );
    },
    { attributes: { to: '', label: 'Sourdough' }, css: widgetCss(css) },
  );
