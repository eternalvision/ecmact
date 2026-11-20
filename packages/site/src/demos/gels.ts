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
    margin-top: 14px;
    padding: 14px 14px 16px;
    border-radius: 1em;
    font-size: 0.75em;
    line-height: 1.3;
    background:
      radial-gradient(
        120% 90% at 50% 0,
        color-mix(in srgb, var(--c) 24%, transparent),
        transparent 72%
      ),
      #0e0e18;
    box-shadow:
      0 0 0 2.5px color-mix(in srgb, var(--c) 80%, transparent),
      0 0 26px color-mix(in srgb, var(--c) 50%, transparent),
      inset 0 0 26px color-mix(in srgb, var(--c) 16%, transparent);
    color: #f4f4ff;
    font-family: Futura, 'Century Gothic', 'Avenir Next', Avenir, 'URW Gothic', sans-serif;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-left: 8px;
  }
  .head span {
    font-size: 17px;
    font-weight: 500;
    letter-spacing: 0.03em;
  }
  button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 34px;
    padding: 0 14px 0 10px;
    border: 0;
    border-radius: 999px;
    background: var(--c);
    color: #07070d;
    font: inherit;
    font-size: 14.5px;
    font-weight: 600;
    cursor: pointer;
  }
  button::before {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #07070d;
  }
  button[aria-label$='no gel'] {
    background: #23232f;
    box-shadow: inset 0 0 0 2px #9aa0b5;
    color: #f4f4ff;
  }
  button[aria-label$='no gel']::before {
    background: transparent;
    box-shadow: inset 0 0 0 2px #9aa0b5;
  }
  .actor {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    margin: 10px 0 0 8px;
    color: var(--c);
    font-size: 15.5px;
    font-weight: 500;
    text-shadow: 0 0 14px color-mix(in srgb, var(--c) 80%, transparent);
  }
  .actor::before {
    content: '';
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--c);
    box-shadow: 0 0 16px var(--c);
  }
  :focus-visible {
    outline: 3px solid #f4f4ff;
    outline-offset: 3px;
  }
  @media (prefers-reduced-motion: no-preference) {
    :host {
      transition:
        box-shadow 0.4s,
        background 0.4s;
    }
  }
`;

const stageCss = `
  :host {
    display: block;
    color-scheme: dark;
    padding: 4px 18px 20px;
    background: #07070d;
    font-size: 53.34px;
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
