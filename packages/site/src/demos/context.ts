import {
  computed,
  consume,
  createContext,
  effect,
  em,
  provide,
  signal,
  tags,
  type ReadonlySignal,
} from 'ecmact';

const css = `
  :host, div { display: block; }
  .bar { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.8rem; }
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
  .panel { padding: 0.8rem; border: 1px dashed var(--border); border-radius: 12px; margin-bottom: 0.6rem; }
  .panel .panel { margin: 0.6rem 0 0; }
  p { margin: 0.2rem 0; font-weight: 600; }
  small { color: var(--muted); }
`;

const accent = createContext<ReadonlySignal<string>>('accent');

/**
 * Context. An outer panel provides a color as a signal, an inner panel provides another one, and each label asks
 * the nearest provider above it with `consume`. Changing the outer color recolors only what is under it.
 *
 * @returns The demo.
 */
export const create = () => {
  const outer = signal('#1665e0');
  const inner = signal('#d6336c');

  const label = (text: string) =>
    tags.p({
      shadow: false,
      content: text,
      mounted: (element) => {
        const color = consume(accent, element);
        return color
          ? effect(() => {
              element.style.color = color.value;
            })
          : undefined;
      },
    });

  return em.Context({
    shadow: true,
    css,
    children: [
      tags.div({
        shadow: false,
        class: 'bar',
        children: ['#1665e0', '#2f9e44', '#e67700'].map((color) =>
          tags.button({
            shadow: false,
            type: 'button',
            content: `Outer ${color}`,
            onclick: () => (outer.value = color),
          }),
        ),
      }),
      em.Outer({
        shadow: false,
        class: 'panel',
        provide: [provide(accent, outer)],
        children: [
          label('I read the outer color'),
          label('Me too'),
          em.Inner({
            shadow: false,
            class: 'panel',
            provide: [provide(accent, inner)],
            children: [label('I read the nearest provider: the inner one')],
          }),
          tags.small({
            shadow: false,
            content: computed(() => `outer ${outer.value}, inner ${inner.value}`),
          }),
        ],
      }),
      label('No provider above me, so I keep the default color'),
    ],
  });
};
