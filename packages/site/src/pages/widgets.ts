import { hosts, properties, propertiesRu, widgets } from '@site/content/widgets';
import { text } from '@site/content/messages';
import { el } from '@site/lib/dom';
import { fitFrame } from '@site/lib/frame';
import { currentLocale } from '@site/lib/i18n';
import { withBase } from '@site/lib/paths';
import { CodeBlock } from '@site/ui/codeBlock';

const embed = `
<script src="https://example.com/ecmact-widgets.js"></script>

<price-calculator currency="EUR" base="45"></price-calculator>
<poll-widget poll="dessert" question="Which dessert?" options="Tarte Tatin, Paris-Brest"></poll-widget>

<style>
  price-calculator { --w-accent: #b8893b; --w-radius: 2px; }
</style>
`;

/**
 * Builds a table.
 *
 * @param head - The column titles.
 * @param rows - The rows of nodes and text.
 * @returns A scrollable table.
 */
const table = (head: string[], rows: (Node | string)[][]) =>
  el(
    'div',
    { class: 'table-wrap' },
    el(
      'table',
      {},
      el('thead', {}, el('tr', {}, ...head.map((cell) => el('th', {}, cell)))),
      el('tbody', {}, ...rows.map((row) => el('tr', {}, ...row.map((cell) => el('td', {}, cell))))),
    ),
  );

/**
 * Creates the frame of a host page, as tall as the page so that it does not scroll.
 *
 * @param address - The address of the page.
 * @param title - The title of the frame.
 * @returns The iframe.
 */
const fitted = (address: string, title: string) => {
  const frame = el('iframe', {
    class: 'host-frame',
    attrs: { src: address, title, loading: 'lazy' },
  });
  fitFrame(frame);
  return frame;
};

/**
 * The gallery of widgets: four unrelated pages that embed the same widgets, each in an iframe, and the reference of
 * attributes, events and custom properties.
 *
 * @returns The page.
 */
export const widgetsPage = () => {
  const m = text().widgets;
  /**
   * Wraps text in a code element.
   *
   * @param value - The text.
   * @returns The element.
   */
  const code = (value: string) => el('code', {}, value);
  return el(
    'main',
    { class: 'wrap page-simple' },
    el('h1', {}, m.title),
    el('p', { class: 'lead' }, m.lead),
    ...hosts.map((host) => {
      const copy = m.hosts[host.id] as { title: string; text: string };
      const address = withBase(`/hosts/${host.file}`);
      return el(
        'section',
        { class: 'host' },
        el(
          'header',
          { class: 'host-head' },
          el('div', {}, el('h2', {}, copy.title), el('p', { class: 'muted' }, copy.text)),
          el(
            'a',
            {
              class: 'button ghost',
              attrs: { href: address, target: '_blank', rel: 'noreferrer' },
            },
            m.openFull,
          ),
        ),
        fitted(address, copy.title),
      );
    }),
    el('h2', {}, m.embedTitle),
    el('p', { class: 'muted' }, m.embedLead),
    CodeBlock({ code: embed.trim(), language: 'html', title: 'any page' }),
    el('h2', {}, m.referenceTitle),
    el('p', { class: 'muted' }, m.referenceLead),
    table(
      [m.columns.widget, m.columns.attributes, m.columns.events, m.columns.description],
      widgets.map((widget) => [
        code(`<${widget.tag}>`),
        widget.attributes.map((name) => `${name}`).join(', '),
        widget.events.join(', '),
        m.descriptions[widget.tag] as string,
      ]),
    ),
    el('h2', {}, m.themeTitle),
    el('p', { class: 'muted' }, m.themeLead),
    table(
      ['Property', m.columns.description],
      properties.map(([name, english], index) => [
        code(name),
        currentLocale() === 'ru' ? (propertiesRu[index] as string) : english,
      ]),
    ),
  );
};
