/** A page that embeds the widgets, in the gallery. */
export interface Host {
  /** The id, which names the page (`/hosts/<id>.html`) and its texts. */
  id: string;
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
  { id: 'cafe', widgets: ['countdown-timer', 'price-calculator', 'poll-widget'] },
  { id: 'terminal', widgets: ['repo-card', 'weather-now', 'poll-widget'] },
  { id: 'zine', widgets: ['price-calculator', 'countdown-timer', 'poll-widget'] },
  { id: 'kids', widgets: ['weather-now', 'countdown-timer', 'poll-widget'] },
];

/** The five widgets. */
export const widgets: WidgetInfo[] = [
  { tag: 'price-calculator', attributes: ['currency', 'base', 'heading'], events: ['quote'] },
  { tag: 'weather-now', attributes: ['city', 'unit'], events: ['loaded'] },
  { tag: 'repo-card', attributes: ['repo'], events: ['loaded'] },
  { tag: 'poll-widget', attributes: ['question', 'options', 'poll', 'seed'], events: ['vote'] },
  { tag: 'countdown-timer', attributes: ['to', 'label'], events: ['done'] },
];

/** The custom properties that every widget understands; what each does is in the messages. */
export const propertyNames = [
  '--w-accent',
  '--w-bg',
  '--w-fg',
  '--w-muted',
  '--w-border',
  '--w-radius',
  '--w-font',
] as const;
