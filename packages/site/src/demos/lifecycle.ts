import { effect, em, signal, tags } from 'ecmact';

const { button, div, small } = tags;

/**
 * Reads the time of day. Not `toLocaleTimeString`: its first call loads the locale data and takes tens of milliseconds.
 *
 * @returns The time as `HH:MM:SS`.
 */
const timeOfDay = () => new Date().toTimeString().slice(0, 8);

const css = `
  :host { display: block; }
  button {
    padding: 0.4rem 0.8rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    color: var(--text);
    font: inherit;
    cursor: pointer;
  }
  button:hover { border-color: var(--primary); }
  .stage { display: flex; align-items: center; min-height: 2.8rem; margin: 0.8rem 0 0.4rem; color: var(--muted); }
  small { display: block; color: var(--muted); }
`;

const clockCss = `
  :host { display: block; color: var(--text); font-size: 2rem; font-variant-numeric: tabular-nums; }
`;

/**
 * The lifecycle of a component, on a clock that can be taken out of the page. `mounted` runs every time the
 * component enters the page: the demo starts its timer there and returns the cleanup that stops it. The clock
 * creates an effect in its `mounted`, which needs no cleanup: it stops by itself when the clock leaves, although
 * the time goes on. `unmounted` runs after that.
 *
 * @returns The demo.
 */
export const create = () => {
  const time = signal(timeOfDay());
  const shown = signal(true);
  const mounts = signal(0);
  const unmounts = signal(0);
  const runs = signal(0);

  const clock = em.Clock(
    {
      css: clockCss,
      mounted: () => {
        mounts.value++;
        effect(() => {
          void time.value;
          runs.value = runs.peek() + 1;
        });
      },
      unmounted: () => {
        unmounts.value++;
      },
    },
    time,
  );

  return em.Lifecycle(
    {
      css,
      mounted: () => {
        const timer = setInterval(() => (time.value = timeOfDay()), 1000);
        return () => clearInterval(timer);
      },
    },
    button({ type: 'button', onclick: () => (shown.value = !shown.value) }, () =>
      shown.value ? 'Remove the clock' : 'Add the clock',
    ),
    div({ class: 'stage' }, () => (shown.value ? clock : `No clock, but it is ${time.value}`)),
    small(
      () =>
        `mounted ${mounts.value}, unmounted ${unmounts.value}, the effect in mounted ran ${runs.value} times`,
    ),
  );
};
