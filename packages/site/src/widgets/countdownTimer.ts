import { computed, defineWidget, effect, signal } from 'ecmact';
import { tag } from '@site/lib/component';
import { part, sheet } from '@site/widgets/kit';

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
  .tile b {
    position: relative; display: block; padding: 0.7rem 0; border-radius: 10px; font-size: 2.1rem; font-weight: 700; font-variant-numeric: tabular-nums;
    background: linear-gradient(
      color-mix(in srgb, var(--w-fg, #f5f5f7) 11%, var(--w-bg, #111114)) 50%,
      color-mix(in srgb, var(--w-fg, #f5f5f7) 7%, var(--w-bg, #111114)) 50%
    );
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--w-fg, #f5f5f7) 12%, transparent);
  }
  .tile b::after { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: var(--w-bg, #111114); }
  .tile span { display: block; margin-top: 0.4rem; font-size: 0.68rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--w-muted, #8e8e99); }
  .tile.sec b { color: var(--w-accent, #ff9f0a); }
  .done { margin: 0; font-size: 1.4rem; font-weight: 700; color: var(--w-accent, #ff9f0a); }
`;

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
  const left = Math.max(0, Math.floor((target - now) / 1000));
  return {
    days: Math.floor(left / 86400),
    hours: Math.floor((left % 86400) / 3600),
    minutes: Math.floor((left % 3600) / 60),
    seconds: left % 60,
    done: left === 0,
  };
};

/**
 * Registers `<countdown-timer>`: a flip-clock style countdown to a moment.
 * Attributes: `to` (a date, such as `2027-01-01T00:00:00`; three days from now when missing or invalid), `label`.
 * Event: `done` once, when the time runs out.
 * Custom properties: `--w-accent`, `--w-bg`, `--w-fg`, `--w-muted`, `--w-border`, `--w-radius`, `--w-font`.
 *
 * @returns The registered element class.
 */
export const defineCountdownTimer = () =>
  defineWidget(
    'countdown-timer',
    ({ props, emit }) => {
      const now = signal(Date.now());
      const fallback = Date.now() + 3 * 86400000;
      const target = computed(() => {
        const parsed = Date.parse(props.to.value ?? '');
        return Number.isNaN(parsed) ? fallback : parsed;
      });
      const left = computed(() => remaining(target.value, now.value));
      const two = (value: number) => String(value).padStart(2, '0');
      const unit = (name: string, read: (value: Remaining) => number, className = '') =>
        part(
          'div',
          `tile ${className}`.trim(),
          tag('b', { content: computed(() => two(read(left.value))) }),
          tag('span', { content: name }),
        );

      const root = tag('div', {
        class: 'clock',
        mounted: () => {
          const timer = setInterval(() => {
            now.value = Date.now();
          }, 1000);
          let finished = false;
          const stop = effect(() => {
            if (left.value.done && !finished) {
              finished = true;
              emit('done');
            }
          });
          return () => {
            clearInterval(timer);
            stop();
          };
        },
        children: [
          tag('p', { class: 'label', content: computed(() => props.label.value ?? 'Countdown') }),
          part(
            'div',
            'tiles',
            unit('days', (value) => value.days),
            unit('hours', (value) => value.hours),
            unit('min', (value) => value.minutes),
            unit('sec', (value) => value.seconds, 'sec'),
          ),
        ],
      });
      return sheet(css, root);
    },
    { attributes: ['to', 'label'] },
  );
