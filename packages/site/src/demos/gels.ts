import {
  computed,
  createContext,
  em,
  signal,
  tags,
  type Child,
  type ReadonlySignal,
  type Signal,
} from 'ecmact';

const { button, div, span } = tags;

const css = `
  :host {
    display: block;
    color-scheme: dark;
    --c: #9aa0b5;
    padding: 10px;
    border: 1px dashed #5b5f73;
    border-radius: 10px;
    background: radial-gradient(
      ellipse at 50% 0,
      color-mix(in srgb, var(--c) 32%, transparent),
      transparent 72%
    );
    color: #e9e9f2;
    font: 11px/1.4 ui-monospace, Menlo, Consolas, monospace;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  button {
    padding: 3px 10px;
    border: 1px solid currentColor;
    border-radius: 999px;
    background: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
  button:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  button:focus-visible {
    outline: 3px solid #ffffff;
    outline-offset: 2px;
  }
  .actor {
    display: inline-block;
    margin: 8px 6px 0 0;
    padding: 3px 9px;
    border-radius: 3px;
    background: var(--c);
    color: #0c0c12;
    font-weight: 700;
  }
`;

const stageCss = `
  :host {
    display: block;
    color-scheme: dark;
    padding: 18px;
    background: #0c0c12;
  }
`;

/** A gel: a colour put in front of the lamps of a zone. */
interface Gel {
  /** The name on the button. */
  name: string;
  /** The colour. */
  color: string;
}

const gels: Gel[] = [
  { name: 'rose', color: '#ff5d73' },
  { name: 'sky', color: '#57c7ff' },
  { name: 'amber', color: '#ffd166' },
  { name: 'mint', color: '#8aff9c' },
];

const Light = createContext<ReadonlySignal<string | undefined>>('light');

/**
 * Makes a zone of the stage. It offers the colour of its lamps to everything below it: its own gel, or the colour
 * it receives from the zone above when it has none. Its actors, and the zones inside it, ask the nearest zone.
 *
 * @param name - The name of the zone.
 * @param gel - Which gel the zone has, as a position in `gels`, or `-1` for none.
 * @param actor - The actor that stands in the zone.
 * @param inner - A zone inside this one.
 * @returns The zone.
 */
const Zone = (name: string, gel: Signal<number>, actor: string, inner?: Child) => {
  const self = signal<Element | undefined>(undefined);
  const light = computed(
    () => gels[gel.value]?.color ?? (self.value ? Light.use(self.value)?.value : undefined),
  );

  return em.Zone(
    {
      css,
      provide: Light.provide(light),
      ref: (element) => {
        self.value = element;
      },
      style: { '--c': () => light.value ?? '#9aa0b5' },
    },
    div(
      { class: 'head' },
      span(name),
      button(
        {
          type: 'button',
          'aria-label': () =>
            `Change the ${name.toLowerCase()} gel, now ${gels[gel.value]?.name ?? 'no gel'}`,
          onclick: () => {
            gel.value = gel.value >= gels.length - 1 ? -1 : gel.value + 1;
          },
        },
        () => gels[gel.value]?.name ?? 'no gel',
      ),
    ),
    span({ class: 'actor', style: { '--c': () => Light.use()?.value ?? '#9aa0b5' } }, actor),
    inner,
  );
};

/**
 * A lighting plot: three zones nested in each other, each able to put a gel in front of its lamps. A context
 * carries the colour as a signal, so every actor takes the colour of the nearest zone that has one, across the
 * shadow roots of the zones. Take a gel away and the actor falls back to the next zone without being rebuilt.
 *
 * @returns The example.
 */
export const create = () => {
  const house = signal(2);
  const stage = signal(-1);
  const spot = signal(1);

  return em.Stage(
    { css: stageCss },
    Zone('House', house, 'Usher', Zone('Stage', stage, 'Chorus', Zone('Spot', spot, 'Soloist'))),
  );
};
