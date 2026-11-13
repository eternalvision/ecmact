import { computed, defineWidget, effect, signal, tags, untracked } from 'ecmact';
import { createFlipCard, flipCss, type FlipCard } from '@site/widgets/flip';
import { widgetCss } from '@site/widgets/kit';

const { div, p, span } = tags;

const css = `
  :host {
    display: block;
    max-width: 30rem;
    font-family: var(--w-font, 'SF Mono', 'Roboto Mono', ui-monospace, monospace);
  }
  .clock {
    padding: 1.2rem 1.3rem 1.4rem;
    border-radius: var(--w-radius, 14px);
    background: var(--w-bg, #111114);
    color: var(--w-fg, #f5f5f7);
    border: 1px solid var(--w-border, #2a2a30);
  }
  .label { margin: 0 0 0.9rem; font-size: 0.8rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--w-muted, #8e8e99); }
  .tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.6rem; }
  .tile { text-align: center; }
  .digit {
    --flip-bg: color-mix(in srgb, var(--w-fg, #f5f5f7) 11%, var(--w-tile, var(--w-bg, #111114)));
    --flip-bg-low: color-mix(in srgb, var(--w-fg, #f5f5f7) 7%, var(--w-tile, var(--w-bg, #111114)));
    --flip-edge: color-mix(in srgb, var(--w-fg, #f5f5f7) 12%, transparent);
    --flip-gap: var(--w-tile, var(--w-bg, #111114));
    --flip-r: var(--w-radius, 10px);
    color: var(--w-fg, #f5f5f7);
  }
  .tile .name { display: block; margin-top: 0.4rem; font-size: 0.68rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--w-muted, #8e8e99); }
  .tile.sec .digit { color: var(--w-accent, #ff9f0a); }
${flipCss}`;

/** The time that is left, split into units. */
export interface Remaining {
  /** Whole days. */
  days: number;
  /** Hours of the last day. */
  hours: number;
  /** Minutes of the last hour. */
  minutes: number;
  /** Seconds of the last minute. */
  seconds: number;
  /** Whether the time has run out. */
  done: boolean;
}

/**
 * Splits the time between two moments into days, hours, minutes and seconds.
 *
 * @param target - The moment to count down to, in milliseconds.
 * @param now - The current moment, in milliseconds.
 * @returns The time that is left; all zeros once it has run out.
 */
export const remaining = (target: number, now: number): Remaining => {
  const left = Math.max(0, Math.ceil((target - now) / 1000));
  return {
    days: Math.floor(left / 86400),
    hours: Math.floor((left % 86400) / 3600),
    minutes: Math.floor((left % 3600) / 60),
    seconds: left % 60,
    done: left === 0,
  };
};

/**
 * Reads the moment to count down to. A date without a time, `2027-01-01`, means the start of that day in the
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

/** The timers that have announced the end of their countdown, so that one that is put back does not say it again. */
const announced = new WeakSet<HTMLElement>();

/**
 * Registers `<countdown-timer>`: a flip-clock style countdown to a moment. The clock ticks only while it is on
 * screen, in a visible tab and before the time has run out.
 * Attributes: `to` (a date, such as `2027-01-01T00:00:00` or `2027-01-01`, or a moment with an offset such as
 * `2027-01-01T00:00:00Z`; three days from now when missing or invalid), `label`.
 * Event: `done`, when the time runs out; again if `to` is changed to a later moment and that runs out too.
 * Custom properties: `--w-accent`, `--w-bg`, `--w-fg`, `--w-muted`, `--w-border`, `--w-radius`, `--w-font`, and
 * `--w-tile`, the plain color of the flip cards, which defaults to `--w-bg` and is needed when `--w-bg` is a gradient.
 *
 * @returns The registered element class.
 */
export const defineCountdownTimer = () =>
  defineWidget(
    'countdown-timer',
    ({ host, props, emit }) => {
      const now = signal(Date.now());
      const fallback = Date.now() + 3 * 86400000;
      const left = computed(() => remaining(parseTarget(props.to, fallback), now.value));
      const cards: FlipCard[] = [];
      /**
       * Builds one tile: a flip card and the name of its unit under it.
       *
       * @param name - The name of the unit.
       * @param read - Picks the unit out of the time that is left.
       * @param className - An extra class for the tile.
       * @returns The tile.
       */
      const unit = (name: string, read: (value: Remaining) => number, className?: string) => {
        const card = createFlipCard(computed(() => String(read(left.value)).padStart(2, '0')));
        cards.push(card);
        return div({ class: ['tile', className] }, card.element, span({ class: 'name' }, name));
      };
      const clock = div(
        { class: 'clock' },
        p({ class: 'label' }, () => props.label),
        div(
          { class: 'tiles' },
          unit('days', (value) => value.days),
          unit('hours', (value) => value.hours),
          unit('min', (value) => value.minutes),
          unit('sec', (value) => value.seconds, 'sec'),
        ),
      );

      let timer: ReturnType<typeof setInterval> | undefined;
      let visible = true;
      /** Moves the clock to the current moment. */
      const tick = () => {
        now.value = Date.now();
      };
      /** Runs the timer only while the clock is on screen, the tab is visible and the time has not run out. */
      const sync = () => {
        const run = visible && !document.hidden && !left.peek().done;
        if (run && timer === undefined) {
          tick();
          timer = setInterval(tick, 1000);
        } else if (!run && timer !== undefined) {
          clearInterval(timer);
          timer = undefined;
        }
      };
      /**
       * Starts what a signal does not drive: the watchers of visibility and the flip cards.
       *
       * @returns The cleanup that stops them and the timer; the widget runs it when it leaves the page.
       */
      const watch = () => {
        const observer =
          typeof IntersectionObserver === 'function'
            ? new IntersectionObserver((entries) => {
                visible = entries[entries.length - 1]?.isIntersecting ?? true;
                sync();
              })
            : undefined;
        observer?.observe(clock);
        document.addEventListener('visibilitychange', sync);
        const stopCards = cards.map((card) => card.start());
        return () => {
          clearInterval(timer);
          observer?.disconnect();
          document.removeEventListener('visibilitychange', sync);
          stopCards.forEach((stop) => stop());
        };
      };
      effect(() => untracked(watch));
      effect(() => {
        const { done } = left.value;
        sync();
        if (!done) {
          announced.delete(host);
        } else if (!announced.has(host)) {
          announced.add(host);
          emit('done');
        }
      });
      return clock;
    },
    { attributes: { to: '', label: 'Countdown' }, css: widgetCss(css) },
  );
