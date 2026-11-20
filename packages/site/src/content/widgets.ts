import type { DemoStyle } from '@site/demos/index';

/** A page that embeds the widgets, in the gallery. */
export interface Host {
  /** The id, which names the page (`/hosts/<id>.html`) and its texts. */
  id: string;
  /** The widgets it embeds, by tag. */
  widgets: string[];
}

/** An attribute of a widget, as the reference lists it. */
export interface AttributeInfo {
  /** The name. */
  name: string;
  /** The value it has when the attribute is missing; an empty text is shown as "empty". */
  default: string;
}

/** A widget, as the reference lists it. */
export interface WidgetInfo {
  /** The tag. */
  tag: string;
  /** The job it does, in a word: the registry holds one widget for each. */
  kind: string;
  /** The look of the widget: its row of the style matrix. */
  style: DemoStyle;
  /** The tag of the widget of the first gallery that this one replaced; the reference keeps an anchor for it. A new widget has none. */
  former?: string;
  /** The attributes it reads, in the order the element observes them. */
  attributes: AttributeInfo[];
  /** The events it fires. */
  events: string[];
  /** The custom properties it reads. */
  properties: string[];
}

/** The pages of the gallery. Every widget is in at least two of them. */
export const hosts: Host[] = [
  { id: 'cafe', widgets: ['proof-clock', 'row-counter', 'clue-box', 'moon-dial'] },
  { id: 'terminal', widgets: ['feed-lamp', 'morse-key', 'fret-map', 'moon-dial'] },
  { id: 'zine', widgets: ['print-quote', 'proof-clock', 'clue-box', 'morse-key'] },
  { id: 'kids', widgets: ['row-counter', 'fret-map', 'feed-lamp', 'print-quote'] },
];

/** The eight widgets. */
export const widgets: WidgetInfo[] = [
  {
    tag: 'print-quote',
    kind: 'estimate',
    former: 'price-calculator',
    style: {
      shape: 'notch',
      palette: 'saturated',
      type: 'didone',
      surface: 'flat',
      control: 'radio cards',
      motion: 'odometer',
    },
    attributes: [
      { name: 'currency', default: 'EUR' },
      { name: 'base', default: '1.84' },
      { name: 'heading', default: 'Print quote' },
    ],
    events: ['quote'],
    properties: [
      '--w-bg',
      '--w-fg',
      '--w-accent',
      '--w-on-accent',
      '--w-font',
      '--w-display',
      '--w-radius',
    ],
  },
  {
    tag: 'moon-dial',
    kind: 'calendar',
    former: 'weather-now',
    style: {
      shape: 'circle',
      palette: 'night dark',
      type: 'old-style italic',
      surface: 'gradient mesh',
      control: 'dial',
      motion: 'terminator sweep',
    },
    attributes: [
      { name: 'date', default: '' },
      { name: 'hemisphere', default: 'north' },
    ],
    events: ['change'],
    properties: ['--w-bg', '--w-fg', '--w-accent', '--w-on-accent', '--w-font'],
  },
  {
    tag: 'proof-clock',
    kind: 'countdown',
    former: 'countdown-timer',
    style: {
      shape: 'blob',
      palette: 'pastel',
      type: 'slab',
      surface: 'flat',
      control: 'slider',
      motion: 'blob rise',
    },
    attributes: [
      { name: 'to', default: '' },
      { name: 'label', default: 'Sourdough' },
    ],
    events: ['done'],
    properties: ['--w-bg', '--w-fg', '--w-accent', '--w-on-accent', '--w-accent-text', '--w-font'],
  },
  {
    tag: 'row-counter',
    kind: 'tally',
    former: 'poll-widget',
    style: {
      shape: 'circle',
      palette: 'saturated',
      type: 'rounded',
      surface: 'pattern',
      control: 'big round button',
      motion: 'spring bounce',
    },
    attributes: [
      { name: 'pattern', default: 'Pattern' },
      { name: 'repeat', default: '0' },
    ],
    events: ['row'],
    properties: ['--w-bg', '--w-fg', '--w-accent', '--w-font'],
  },
  {
    tag: 'feed-lamp',
    kind: 'status',
    former: 'repo-card',
    style: {
      shape: 'radius-sm',
      palette: 'mono-accent light',
      type: 'mono',
      surface: 'glossy',
      control: 'underline tabs',
      motion: 'breathing lamp',
    },
    attributes: [
      { name: 'src', default: '' },
      { name: 'feeds', default: '' },
      { name: 'retries', default: '2' },
      { name: 'slow', default: '1500' },
      { name: 'timeout', default: '8000' },
    ],
    events: ['loaded'],
    properties: ['--w-bg', '--w-fg', '--w-font', '--w-radius'],
  },
  {
    tag: 'morse-key',
    kind: 'signal',
    style: {
      shape: 'pill',
      palette: 'saturated',
      type: 'mono',
      surface: 'clay',
      control: 'hold key',
      motion: 'tape slide',
    },
    attributes: [{ name: 'wpm', default: '12' }],
    events: ['letter'],
    properties: ['--w-bg', '--w-fg', '--w-key', '--w-on-key', '--w-accent', '--w-font'],
  },
  {
    tag: 'fret-map',
    kind: 'chart',
    style: {
      shape: 'radius-md',
      palette: 'duotone',
      type: 'geometric',
      surface: 'layered',
      control: 'tap grid',
      motion: 'stagger pop',
    },
    attributes: [
      { name: 'key', default: 'A' },
      { name: 'scale', default: 'pentatonic' },
      { name: 'tuning', default: 'standard' },
      { name: 'preset', default: '' },
    ],
    events: ['change'],
    properties: ['--w-bg', '--w-fg', '--w-accent', '--w-on-accent', '--w-root', '--w-font'],
  },
  {
    tag: 'clue-box',
    kind: 'puzzle',
    style: {
      shape: 'radius-sm',
      palette: 'mono-accent dark',
      type: 'transitional serif',
      surface: 'flat',
      control: 'letter cells',
      motion: 'flip wave',
    },
    attributes: [
      { name: 'clue', default: 'Fruit that sounds like a couple' },
      { name: 'answer', default: 'PEAR' },
    ],
    events: ['solved'],
    properties: [
      '--w-bg',
      '--w-fg',
      '--w-accent',
      '--w-on-accent',
      '--w-cell',
      '--w-wrong',
      '--w-font',
    ],
  },
];
