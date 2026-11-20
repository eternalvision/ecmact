import { batch, computed, effect, em, signal, tags, untracked, type Signal } from 'ecmact';

const { b, button, div, em: emphasis, output, small, span } = tags;

const css = `
  :host {
    display: block;
    color-scheme: light;
    padding: 20px;
    background: #e6eaf0;
    color: #1f2933;
    font-family: ui-rounded, 'SF Pro Rounded', 'Arial Rounded MT Bold', 'Hiragino Maru Gothic ProN', Quicksand, Comfortaa, Manjari, Calibri, sans-serif;
  }
  .glass {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }
  .glass > div:not(.ev) {
    position: relative;
    padding: 14px 6px 12px;
    border-radius: 22px;
    text-align: center;
    background: #e6eaf0;
    box-shadow: 6px 6px 14px #c3cad5, -6px -6px 14px #ffffff;
  }
  small {
    display: block;
    font-size: 12.5px;
    font-weight: 600;
    color: #52606d;
    text-transform: lowercase;
  }
  small::first-letter {
    text-transform: capitalize;
  }
  .glass > div:nth-child(3) small {
    text-transform: none;
  }
  b, output {
    display: block;
    font-weight: 800;
    font-size: clamp(20px, 6.4vw, 25px);
    letter-spacing: -0.02em;
    line-height: 1.25;
  }
  em {
    position: absolute;
    top: -7px;
    right: -5px;
    padding: 1px 7px;
    border-radius: 999px;
    background: #fff;
    color: #b83a00;
    font-style: normal;
    font-size: 12px;
    font-weight: 700;
    box-shadow: 2px 2px 5px #c3cad5;
  }
  .ev {
    grid-column: 1 / -1;
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 2px 12px;
    padding: 12px 20px;
    border-radius: 24px;
    box-shadow: inset 5px 5px 10px #c3cad5, inset -5px -5px 10px #ffffff;
  }
  .ev output {
    font-size: clamp(26px, 8vw, 34px);
    color: #b83a00;
  }
  .ev em {
    position: static;
  }
  .tape {
    flex-basis: 100%;
    font-size: 12.5px;
    font-weight: 600;
    color: #52606d;
    text-transform: lowercase;
    overflow-wrap: anywhere;
  }
  .keys {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 18px;
  }
  .pair {
    display: flex;
    border-radius: 999px;
    box-shadow: 5px 5px 12px #c3cad5, -5px -5px 12px #ffffff;
  }
  .pair button {
    flex: 1;
    min-height: 44px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #1f2933;
    font: inherit;
    font-size: 22px;
    font-weight: 800;
    cursor: pointer;
  }
  .pair button:first-child {
    border-radius: 999px 0 0 999px;
  }
  .pair button:last-child {
    border-radius: 0 999px 999px 0;
    box-shadow: inset 2px 0 0 #d3d9e2;
  }
  .pair button:active {
    box-shadow: inset 4px 4px 8px #c3cad5, inset -4px -4px 8px #ffffff;
  }
  .lock {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 50px;
    padding: 0 10px 0 20px;
    border: 0;
    border-radius: 999px;
    background: #e6eaf0;
    box-shadow: 5px 5px 12px #c3cad5, -5px -5px 12px #ffffff;
    color: #1f2933;
    font: inherit;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
  }
  .lock::after {
    content: '';
    width: 54px;
    height: 30px;
    border-radius: 999px;
    background: radial-gradient(circle closest-side, #fff 76%, transparent 82%) 0 0 / 30px 30px no-repeat #aeb7c4;
    box-shadow: inset 2px 2px 4px rgba(31, 41, 51, 0.28);
  }
  .lock[aria-pressed='true']::after {
    background-position: 24px 0;
    background-color: #ff5b14;
  }
  :focus-visible {
    outline: 3px solid #1f2933;
    outline-offset: 3px;
  }
  @media (prefers-reduced-motion: no-preference) {
    .lock::after {
      transition: background-position 0.2s;
    }
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
