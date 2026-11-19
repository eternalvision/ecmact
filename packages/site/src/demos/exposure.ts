import { batch, computed, effect, em, signal, tags, untracked, type Signal } from 'ecmact';

const { b, button, div, em: emphasis, output, small, span } = tags;

const css = `
  :host {
    display: block;
    color-scheme: dark;
    padding: 18px;
    background: #1f2224;
    color: #1c2a1a;
    font-family: ui-monospace, Menlo, Consolas, monospace;
  }
  .glass {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    padding: 12px;
    border-radius: 4px;
    background: linear-gradient(#b9c6a8, #a9b796);
    box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.45);
  }
  small {
    display: block;
    font-size: 10px;
    letter-spacing: 0.14em;
  }
  b, output {
    display: block;
    font: italic 700 clamp(20px, 6vw, 30px) / 1.1 ui-monospace, Menlo, monospace;
    letter-spacing: 0.02em;
  }
  em {
    font-style: normal;
    font-size: 10px;
    opacity: 0.8;
  }
  .ev {
    grid-column: 1 / -1;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: 4px 12px;
    padding-top: 8px;
    border-top: 1px solid rgba(28, 42, 26, 0.5);
  }
  .tape {
    flex-basis: 100%;
    font-size: 11px;
  }
  .keys {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    margin-top: 12px;
  }
  .pair {
    display: flex;
    gap: 4px;
  }
  button {
    flex: 1;
    min-height: 34px;
    padding: 7px 0;
    border: 0;
    border-radius: 3px;
    background: linear-gradient(#4a4f53, #2c3033);
    box-shadow: 0 2px 0 #000;
    color: #e6e6e6;
    font: inherit;
    font-size: 13px;
    cursor: pointer;
  }
  button:active {
    transform: translateY(1px);
    box-shadow: 0 1px 0 #000;
  }
  button:focus-visible {
    outline: 3px solid #ffd54a;
    outline-offset: 2px;
  }
  .lock {
    grid-column: 1 / -1;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .lock[aria-pressed='true'] {
    background: linear-gradient(#e6b422, #b98a10);
    color: #1b1400;
  }
`;

const apertures = ['1.4', '2', '2.8', '4', '5.6', '8', '11', '16'];
const shutters = ['15', '30', '60', '125', '250', '500', '1000'];
const isos = ['100', '200', '400', '800', '1600', '3200'];

/** One value of the camera, and the value that moves the other way while the exposure is locked. */
interface Axis {
  /** The position of the value among its stops. */
  value: Signal<number>;
  /** The number of stops. */
  size: number;
  /** The name of the value that compensates. */
  partner: 'aperture' | 'shutter';
  /** Whether the compensating value moves the same way (1) or the other way (-1). */
  sign: 1 | -1;
}

/**
 * An exposure triangle on the top plate of a camera. Aperture, shutter and ISO are three signals, and the
 * exposure value is computed from them. Beside each readout a counter shows how often its text ran: with the lock
 * on, one key moves two signals in a batch: the exposure value stays the same and its text runs once, not twice.
 *
 * @returns The example.
 */
export const create = () => {
  const aperture = signal(4);
  const shutter = signal(3);
  const iso = signal(2);
  const lock = signal(false);
  const tape = signal<number[]>([]);
  const ev = computed(() => aperture.value + 1 + 4 + shutter.value - iso.value);
  const axes: Record<'aperture' | 'shutter' | 'iso', Axis> = {
    aperture: { value: aperture, size: apertures.length, partner: 'shutter', sign: -1 },
    shutter: { value: shutter, size: shutters.length, partner: 'aperture', sign: -1 },
    iso: { value: iso, size: isos.length, partner: 'shutter', sign: 1 },
  };

  /**
   * Makes a readout: the text, and a signal that counts how often the text was made again.
   *
   * @param read - Makes the text from the signals it reads.
   * @returns The function for the text and the count.
   */
  const counted = (read: () => string) => {
    const runs = signal(0);
    return {
      runs,
      text: () => {
        const text = read();
        untracked(() => {
          runs.value++;
        });
        return text;
      },
    };
  };

  /**
   * Moves one value by a number of stops. With the lock on, the partner value moves the other way in the same
   * batch, so the exposure value is computed once and comes out the same.
   *
   * @param name - Which value.
   * @param delta - The number of stops.
   */
  const press = (name: keyof typeof axes, delta: number) => {
    const axis = axes[name];
    const partner = axes[axis.partner];
    const next = axis.value.peek() + delta;
    if (next < 0 || next >= axis.size) return;
    if (!lock.peek()) {
      axis.value.value = next;
      return;
    }
    const other = partner.value.peek() + delta * axis.sign;
    if (other < 0 || other >= partner.size) return;
    batch(() => {
      axis.value.value = next;
      partner.value.value = other;
    });
  };

  const readouts = {
    aperture: counted(() => `f/${apertures[aperture.value]}`),
    shutter: counted(() => `1/${shutters[shutter.value]}`),
    iso: counted(() => `${isos[iso.value]}`),
    ev: counted(() => `EV ${ev.value.toFixed(1)}`),
  };

  /**
   * Makes a cell of the glass: its label, its readout and the count beside it.
   *
   * @param label - The label.
   * @param name - Which readout.
   * @returns The cell.
   */
  const cell = (label: string, name: keyof typeof readouts) =>
    div(
      small(label),
      b({ 'data-readout': name }, readouts[name].text),
      emphasis({ 'data-runs': name }, () => `x${readouts[name].runs.value}`),
    );

  /**
   * Makes the two keys of a value.
   *
   * @param name - Which value.
   * @param less - The label of the key that lowers it.
   * @param more - The label of the key that raises it.
   * @returns The pair.
   */
  const keys = (name: keyof typeof axes, less: string, more: string) =>
    div(
      { class: 'pair' },
      button({ type: 'button', 'aria-label': less, onclick: () => press(name, -1) }, '-'),
      button({ type: 'button', 'aria-label': more, onclick: () => press(name, 1) }, '+'),
    );

  return em.Exposure(
    {
      css,
      mounted: () => {
        effect(() => {
          const value = ev.value;
          untracked(() => {
            if (tape.value.at(-1) !== value) tape.value = [...tape.value, value].slice(-6);
          });
        });
      },
    },
    div(
      { class: 'glass' },
      cell('APERTURE', 'aperture'),
      cell('SHUTTER', 'shutter'),
      cell('ISO', 'iso'),
      div(
        { class: 'ev' },
        small('EXPOSURE VALUE'),
        output({ 'data-readout': 'ev' }, readouts.ev.text),
        emphasis({ 'data-runs': 'ev' }, () => `x${readouts.ev.runs.value}`),
        span({ class: 'tape', 'data-tape': '' }, () => `TAPE ${tape.value.join(' > ')}`),
      ),
    ),
    div(
      { class: 'keys' },
      keys('aperture', 'Wider aperture', 'Narrower aperture'),
      keys('shutter', 'Slower shutter', 'Faster shutter'),
      keys('iso', 'Lower ISO', 'Higher ISO'),
      button(
        {
          type: 'button',
          class: 'lock',
          'aria-pressed': () => String(lock.value),
          onclick: () => {
            lock.value = !lock.value;
          },
        },
        () => (lock.value ? 'EV lock: on' : 'EV lock: off'),
      ),
    ),
  );
};
