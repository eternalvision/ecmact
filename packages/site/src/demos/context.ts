import { createContext, em, signal, tags, type ReadonlySignal } from 'ecmact';

const { button, div, p, small } = tags;

const css = `
  :host { display: block; }
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

const Accent = createContext<ReadonlySignal<string>>('accent');

/**
 * Context. An outer panel provides a color as a signal, an inner panel provides another one, and each label asks
 * the nearest provider above it with `Accent.use()`. Changing the outer color recolors only what is under it.
 *
 * @returns The demo.
 */
export const create = () => {
  const outer = signal('#1665e0');
  const inner = signal('#d6336c');

  const label = (text: string) => p({ style: { color: () => Accent.use()?.value } }, text);

  return em.Context(
    { css },
    div(
      { class: 'bar' },
      ['#1665e0', '#2f9e44', '#e67700'].map((color) =>
        button({ type: 'button', onclick: () => (outer.value = color) }, `Outer ${color}`),
      ),
    ),
    div(
      { class: 'panel', provide: Accent.provide(outer) },
      label('I read the outer color'),
      label('Me too'),
      div(
        { class: 'panel', provide: Accent.provide(inner) },
        label('I read the nearest provider: the inner one'),
      ),
      small(() => `outer ${outer.value}, inner ${inner.value}`),
    ),
    label('No provider above me, so I keep the default color'),
  );
};
