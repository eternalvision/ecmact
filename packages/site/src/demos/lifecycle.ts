import { computed, effect, em, signal, tags } from 'ecmact';

/**
 * Reads the time of day. Not `toLocaleTimeString`: its first call loads the locale data and takes tens of milliseconds.
 *
 * @returns The time as `HH:MM:SS`.
 */
const timeOfDay = () => new Date().toTimeString().slice(0, 8);

const css = `
  :host, div { display: block; }
  .bar { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; margin-bottom: 0.8rem; }
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
  label { display: inline-flex; gap: 0.4rem; align-items: center; color: var(--muted); }
  output { display: block; font-size: 2rem; font-variant-numeric: tabular-nums; min-height: 2.8rem; }
  small { display: block; color: var(--muted); }
`;

/**
 * The four lifecycle hooks on one clock. `mounted` starts a timer and returns its cleanup, `unmounted` counts the
 * removals, `beforeUpdate` vetoes the repaint while "Freeze" is on, and `updated` counts the repaints that happened.
 *
 * @returns The demo.
 */
export const create = () => {
  const time = signal(timeOfDay());
  const frozen = signal(false);
  const mounts = signal(0);
  const unmounts = signal(0);
  const repaints = signal(0);
  const shown = signal(true);

  const clock = em.Clock({
    shadow: false,
    tag: 'output',
    content: time,
    mounted: () => {
      mounts.value++;
      const timer = setInterval(() => (time.value = timeOfDay()), 1000);
      return () => clearInterval(timer);
    },
    unmounted: () => {
      unmounts.value++;
    },
    beforeUpdate: () => !frozen.value,
    updated: () => {
      repaints.value++;
    },
  });

  const stage = tags.div({ shadow: false, children: [clock] });

  return em.Lifecycle({
    shadow: true,
    css,
    mounted: () => effect(() => stage.setState({ children: shown.value ? [clock] : [] })),
    children: [
      tags.div({
        shadow: false,
        class: 'bar',
        children: [
          tags.button({
            shadow: false,
            type: 'button',
            content: computed(() => (shown.value ? 'Remove the clock' : 'Add the clock')),
            onclick: () => (shown.value = !shown.value),
          }),
          tags.label({
            shadow: false,
            children: [
              tags.input({
                shadow: false,
                type: 'checkbox',
                onchange: (event) => (frozen.value = (event.target as HTMLInputElement).checked),
              }),
              'Freeze (veto in beforeUpdate)',
            ],
          }),
        ],
      }),
      stage,
      tags.small({
        shadow: false,
        content: computed(
          () =>
            `mounted ${mounts.value}, unmounted ${unmounts.value}, repainted ${repaints.value} times`,
        ),
      }),
    ],
  });
};
