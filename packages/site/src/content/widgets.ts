/** A page that embeds the widgets, in the gallery. */
export interface Host {
  /** The id, which names the page and its texts. */
  id: string;
  /** The file of the page under `/hosts/`. */
  file: string;
  /** The widgets it embeds, by tag. */
  widgets: string[];
}

/** A widget, as the reference lists it. */
export interface WidgetInfo {
  /** The tag. */
  tag: string;
  /** The attributes it reads. */
  attributes: string[];
  /** The events it fires. */
  events: string[];
}

/** The pages of the gallery. */
export const hosts: Host[] = [
  {
    id: 'cafe',
    file: 'cafe.html',
    widgets: ['countdown-timer', 'price-calculator', 'poll-widget'],
  },
  { id: 'terminal', file: 'terminal.html', widgets: ['repo-card', 'weather-now', 'poll-widget'] },
  {
    id: 'zine',
    file: 'zine.html',
    widgets: ['price-calculator', 'countdown-timer', 'poll-widget'],
  },
  { id: 'kids', file: 'kids.html', widgets: ['weather-now', 'countdown-timer', 'poll-widget'] },
];

/** The five widgets. */
export const widgets: WidgetInfo[] = [
  { tag: 'price-calculator', attributes: ['currency', 'base', 'title'], events: ['quote'] },
  { tag: 'weather-now', attributes: ['city', 'unit'], events: ['loaded'] },
  { tag: 'repo-card', attributes: ['repo'], events: ['loaded'] },
  { tag: 'poll-widget', attributes: ['question', 'options', 'poll', 'seed'], events: ['vote'] },
  { tag: 'countdown-timer', attributes: ['to', 'label'], events: ['done'] },
];

/** The custom properties that every widget understands. */
export const properties = [
  ['--w-accent', 'The color of buttons, bars and highlights.'],
  ['--w-bg', 'The background of the card: a color or any CSS background.'],
  ['--w-fg', 'The text color.'],
  ['--w-muted', 'The color of secondary text.'],
  ['--w-border', 'The color of borders and dividers.'],
  ['--w-radius', 'The roundness of the corners.'],
  ['--w-font', 'The font family.'],
] as const;

/** What each custom property does, in Russian, in the order of `properties`. */
export const propertiesRu = [
  'Цвет кнопок, полос и акцентов.',
  'Фон карточки: цвет или любой CSS-фон.',
  'Цвет текста.',
  'Цвет второстепенного текста.',
  'Цвет рамок и разделителей.',
  'Скругление углов.',
  'Семейство шрифтов.',
] as const;
