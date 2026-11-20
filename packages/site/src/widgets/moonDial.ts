import { computed, defineWidget, effect, signal, tags, untracked } from 'ecmact';
import { plain, widgetCss } from '@site/widgets/kit';

const { button, div } = tags;

const css = `
  :host {
    display: block;
    max-width: 22rem;
    font-family: var(--w-font, 'Iowan Old Style', 'Palatino Linotype', Palatino, 'URW Palladio L', P052, 'Book Antiqua', serif);
  }
  .sky {
    box-sizing: border-box;
    padding: 20px 18px 18px;
    border-radius: 36px;
    background:
      radial-gradient(80% 60% at 20% 0, #3b1e73 0, transparent 70%),
      radial-gradient(70% 55% at 100% 100%, #1b2a6b 0, transparent 70%),
      radial-gradient(1.2px 1.2px at 12% 22%, #fff 99%, transparent),
      radial-gradient(1.4px 1.4px at 84% 14%, #fff 99%, transparent),
      radial-gradient(1px 1px at 68% 42%, #fff 99%, transparent),
      radial-gradient(1.3px 1.3px at 24% 62%, #fff 99%, transparent),
      radial-gradient(1px 1px at 92% 58%, #fff 99%, transparent),
      radial-gradient(1.2px 1.2px at 42% 8%, #fff 99%, transparent),
      var(--w-bg, #0b1030);
    color: var(--w-fg, #e9e6ff);
    text-align: center;
    overflow: clip;
  }
  .dial { position: relative; width: min(214px, 100%); aspect-ratio: 1; margin: 0 auto; border-radius: 50%; touch-action: none; cursor: pointer; }
  .ticks, .past, .ring { position: absolute; inset: 0; border-radius: 50%; }
  .ring { box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--w-fg, #e9e6ff) 55%, transparent); }
  @supports ((mask: radial-gradient(closest-side, transparent 88%, #000 89%)) or (-webkit-mask: radial-gradient(closest-side, transparent 88%, #000 89%))) {
    .ring { display: none; }
    .ticks {
      background: repeating-conic-gradient(from -1.2deg, color-mix(in srgb, var(--w-fg, #e9e6ff) 70%, transparent) 0 2.4deg, transparent 2.4deg 12.4138deg);
      -webkit-mask: radial-gradient(closest-side, transparent 88%, #000 89%);
      mask: radial-gradient(closest-side, transparent 88%, #000 89%);
    }
    .past {
      background: conic-gradient(var(--w-accent, #ffc857) 0 var(--turn, 0deg), transparent var(--turn, 0deg));
      -webkit-mask: radial-gradient(closest-side, transparent 93%, #000 94%);
      mask: radial-gradient(closest-side, transparent 93%, #000 94%);
    }
  }
  .hand { position: absolute; inset: 0; transform: rotate(var(--turn, 0deg)); }
  .hand::before {
    content: ''; position: absolute; top: -5px; left: 50%; width: 24px; height: 24px; margin-left: -12px; border-radius: 50%;
    background: var(--w-accent, #ffc857); box-shadow: 0 0 0 4px var(--w-bg, #0b1030), 0 0 18px var(--w-accent, #ffc857);
  }
  .disc {
    position: absolute; inset: 16%; border-radius: 50%; overflow: hidden;
    background: linear-gradient(90deg, var(--left, #171a45) 50%, var(--right, #fff4cf) 50%);
    box-shadow: 0 0 44px rgba(255, 244, 207, 0.45);
  }
  .disc::before { content: ''; position: absolute; inset: 0 var(--inset, 20%); border-radius: 50%; background: var(--ellipse, #fff4cf); }
  .disc::after {
    content: ''; position: absolute; inset: 0; border-radius: 50%;
    background:
      radial-gradient(circle at 30% 28%, rgba(170, 145, 80, 0.4) 0 7%, transparent 8%),
      radial-gradient(circle at 48% 64%, rgba(170, 145, 80, 0.32) 0 10%, transparent 11%),
      radial-gradient(circle at 22% 60%, rgba(170, 145, 80, 0.28) 0 5%, transparent 6%),
      radial-gradient(circle at 56% 30%, rgba(170, 145, 80, 0.25) 0 4%, transparent 5%),
      radial-gradient(circle at 30% 26%, rgba(255, 255, 255, 0.55), transparent 55%);
  }
  .name { margin-top: 12px; font-size: 28px; font-style: italic; line-height: 1.1; }
  .day { margin-top: 2px; font-size: 16px; font-style: italic; color: color-mix(in srgb, var(--w-fg, #e9e6ff) 86%, var(--w-bg, #0b1030)); }
  .row { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 14px; }
  .row button {
    min-width: 44px; height: 44px; padding: 0; border: 0; border-radius: 50%;
    background: color-mix(in srgb, var(--w-fg, #e9e6ff) 16%, transparent); color: var(--w-fg, #e9e6ff);
    font: inherit; font-size: 22px; cursor: pointer;
  }
  .row .today { padding: 0 20px; border-radius: 999px; background: var(--w-accent, #ffc857); color: var(--w-on-accent, #0b1030); font-size: 17px; font-style: italic; font-weight: 700; }
  .row .hemi { font-size: 15px; font-style: italic; font-weight: 700; }
  .dial:focus-visible, button:focus-visible { outline: 3px solid var(--w-accent, #ffc857); outline-offset: 3px; }
  @media (prefers-reduced-motion: no-preference) {
    .disc::before { transition: inset 0.5s ease, background 0.5s ease; }
    .hand { transition: transform 0.3s ease; }
    .disc { transition: background 0.5s ease; }
  }
`;

/** The mean length of a lunar month, in days. */
const month = 29.530588853;

/** A new moon, 6 January 2000 at 18:14 UTC; the phase is counted from it. */
const reference = Date.UTC(2000, 0, 6, 18, 14);

const phaseNames = [
  'New moon',
  'Waxing crescent',
  'First quarter',
  'Waxing gibbous',
  'Full moon',
  'Waning gibbous',
  'Last quarter',
  'Waning crescent',
];

/** What the moon looks like on a day. */
export interface Moon {
  /** The day of the lunar month, from 1 to 29. */
  day: number;
  /** The name of the phase. */
  phase: string;
  /** How much of the disc is lit, from 0 to 1. */
  lit: number;
  /** Whether the moon is growing. */
  waxing: boolean;
  /** How far the terminator is from the middle of the disc, from 0 (a quarter) to 1 (new or full), and which side. */
  cosine: number;
}

/**
 * Works out the phase of the moon on a day, with the mean month: an approximation that is right to within a day
 * or so, which is enough for a picture.
 *
 * @param date - The day, at any time.
 * @returns The phase.
 */
export const moonOn = (date: Date): Moon => {
  const noon = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12).getTime();
  const days = (noon - reference) / 86400000;
  const age = ((days % month) + month) % month;
  const turn = age / month;
  const cosine = Math.cos(2 * Math.PI * turn);
  return {
    day: Math.min(29, Math.floor(age) + 1),
    phase: phaseNames[Math.round(turn * 8) % 8] as string,
    lit: (1 - cosine) / 2,
    waxing: turn < 0.5,
    cosine,
  };
};

/**
 * Reads the day to start from: `2026-11-20`. Anything else means today.
 *
 * @param value - The attribute value.
 * @returns The day, at noon, in the visitor's time zone.
 */
export const parseDay = (value: string | null | undefined) => {
  const found = /^(\d{4})-(\d{2})-(\d{2})$/.exec((value ?? '').trim());
  if (found) {
    const date = new Date(Number(found[1]), Number(found[2]) - 1, Number(found[3]), 12);
    if (date.getMonth() === Number(found[2]) - 1) return date;
  }
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
};

/**
 * Moves a day by a number of days.
 *
 * @param date - The day.
 * @param by - How many days, forward or back.
 * @returns A new date.
 */
const shift = (date: Date, by: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + by, 12);

/**
 * Writes a day as `2026-11-20`.
 *
 * @param date - The day.
 * @returns The text.
 */
const iso = (date: Date) =>
  `${date.getFullYear()}-${plain(date.getMonth() + 1).padStart(2, '0')}-${plain(date.getDate()).padStart(2, '0')}`;

/**
 * Registers `<moon-dial>`: the phase of the moon on a day, a ring of the 29 days of the month and buttons for the
 * day before, today, the day after and the hemisphere. The phase is the mean month, so it can be a day off.
 * Attributes: `date` (the day to start from, `2026-11-20`; today when missing or malformed), `hemisphere` (`north`,
 * or `south` to mirror the moon; `north` when missing or anything else).
 * Event: `change` with `{ date, day, phase }`, when the visitor moves to another day.
 * Custom properties: `--w-bg`, `--w-fg`, `--w-accent`, `--w-on-accent`, `--w-font`.
 *
 * @returns The registered element class.
 */
export const defineMoonDial = () =>
  defineWidget(
    'moon-dial',
    ({ props, emit }) => {
      const moved = signal<Date | null>(null);
      const south = signal(false);
      effect(() => {
        const hemisphere = props.hemisphere.trim().toLowerCase();
        untracked(() => {
          south.value = hemisphere === 'south';
        });
      });
      effect(() => {
        void props.date;
        untracked(() => {
          moved.value = null;
        });
      });
      const date = computed(() => moved.value ?? parseDay(props.date));
      const moon = computed(() => moonOn(date.value));
      /**
       * Moves the view to another day and says so.
       *
       * @param next - The day.
       */
      const go = (next: Date) => {
        moved.value = next;
        const now = moonOn(next);
        emit('change', { date: iso(next), day: now.day, phase: now.phase });
      };
      /**
       * Moves the view by whole days.
       *
       * @param by - How many days.
       */
      const step = (by: number) => {
        go(shift(date.peek(), by));
      };
      /** Goes to today. */
      const today = () => {
        go(parseDay(null));
      };
      /** Goes back a day. */
      const stepBack = () => {
        step(-1);
      };
      /** Goes on a day. */
      const stepForward = () => {
        step(1);
      };
      /** Mirrors the moon. */
      const flip = () => {
        south.value = !south.value;
      };
      /**
       * Starts to set the day from the pointer.
       *
       * @param event - The pointer press.
       */
      const press = (event: PointerEvent) => {
        point(event, event.currentTarget as HTMLElement);
      };
      /**
       * Follows the pointer while a button is held.
       *
       * @param event - The pointer move.
       */
      const drag = (event: PointerEvent) => {
        if (event.buttons === 1) point(event, event.currentTarget as HTMLElement);
      };
      /**
       * Sets the day of the month that a point of the ring means, on the nearest day that has it.
       *
       * @param event - The pointer, in page coordinates.
       * @param ring - The ring.
       */
      const point = (event: PointerEvent, ring: HTMLElement) => {
        const box = ring.getBoundingClientRect();
        const x = event.clientX - (box.left + box.width / 2);
        const y = event.clientY - (box.top + box.height / 2);
        const angle = ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360;
        const target = (Math.round((angle / 360) * 29) % 29) + 1;
        const diff = ((((target - moon.peek().day + 14) % 29) + 29) % 29) - 14;
        if (diff !== 0) step(diff);
      };
      /**
       * Takes the keys of the slider: arrows step a day, Home goes to today.
       *
       * @param event - The key press.
       */
      const keys = (event: KeyboardEvent) => {
        const by = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[event.key];
        if (by !== undefined) step(by);
        else if (event.key === 'Home') today();
        else return;
        event.preventDefault();
      };
      const valueNow = computed(() => String(moon.value.day));
      const valueText = computed(() => `${moon.value.phase}, day ${moon.value.day} of 29`);
      const turn = computed(() => `${((moon.value.day - 1) / 29) * 360}deg`);
      const hemisphereLabel = computed(
        () => `Hemisphere, now ${south.value ? 'southern' : 'northern'}`,
      );
      const colours = computed(() => {
        const { cosine, waxing } = moon.value;
        const litRight = waxing !== south.value;
        const dark = '#171a45';
        const lit = '#fff4cf';
        return {
          left: litRight ? dark : lit,
          right: litRight ? lit : dark,
          inset: `${((1 - Math.abs(cosine)) / 2) * 100}%`,
          ellipse: cosine > 0 ? dark : lit,
        };
      });

      return div(
        { class: 'sky' },
        div(
          {
            class: 'dial',
            role: 'slider',
            tabindex: 0,
            'aria-label': 'Day of the lunar month',
            'aria-valuemin': '1',
            'aria-valuemax': '29',
            'aria-valuenow': valueNow,
            'aria-valuetext': valueText,
            style: { '--turn': turn },
            onkeydown: keys,
            onpointerdown: press,
            onpointermove: drag,
          },
          div({ class: 'ticks' }),
          div({ class: 'past' }),
          div({ class: 'ring' }),
          div({
            class: 'disc',
            style: {
              '--left': computed(() => colours.value.left),
              '--right': computed(() => colours.value.right),
              '--inset': computed(() => colours.value.inset),
              '--ellipse': computed(() => colours.value.ellipse),
            },
          }),
          div({ class: 'hand' }),
        ),
        div({ class: 'name' }, () => moon.value.phase),
        div(
          { class: 'day' },
          () =>
            `day ${moon.value.day} of 29 · ${plain(Math.round(moon.value.lit * 100))}% lit · approximate`,
        ),
        div(
          { class: 'row' },
          button(
            {
              type: 'button',
              'aria-label': 'Previous day',
              onclick: stepBack,
            },
            '‹',
          ),
          button({ type: 'button', class: 'today', onclick: today }, 'Today'),
          button(
            {
              type: 'button',
              'aria-label': 'Next day',
              onclick: stepForward,
            },
            '›',
          ),
          button(
            {
              type: 'button',
              class: 'hemi',
              'aria-label': hemisphereLabel,
              onclick: flip,
            },
            () => (south.value ? 'S' : 'N'),
          ),
        ),
      );
    },
    { attributes: { date: '', hemisphere: 'north' }, css: widgetCss(css) },
  );
