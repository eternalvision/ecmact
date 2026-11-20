import { tags } from 'ecmact';
import { text } from '@site/content/messages';
import { hosts, widgets } from '@site/content/widgets';
import { fitFrame } from '@site/lib/frame';
import { scrollToHash } from '@site/lib/links';
import { withBase } from '@site/lib/paths';
import { renderTable } from '@site/ui/blocks';
import { CodeBlock } from '@site/ui/codeBlock';

const { a, div, h1, h2, h3, header, iframe, main, p, section, span } = tags;

const embed = `
<script src="https://example.com/ecmact-widgets.js"></script>

<print-quote currency="EUR" base="1.84" heading="Flyers"></print-quote>
<row-counter pattern="Raglan sleeve" repeat="6"></row-counter>

<style>
  print-quote { --w-bg: #0b6b4f; --w-accent: #ffe94a; }
</style>
`;

/**
 * Creates the frame of a host page, as tall as the page so that it does not scroll.
 *
 * @param address - The address of the page.
 * @param title - The title of the frame.
 * @returns The iframe.
 */
const fitted = (address: string, title: string) =>
  iframe({ class: 'host-frame', src: address, title, loading: 'lazy', ref: fitFrame });

/**
 * Writes a value as inline code for a cell of a table, or the word for an empty one.
 *
 * @param value - The value.
 * @param empty - What to show when the value is empty.
 * @returns The text of the cell.
 */
const code = (value: string, empty: string) => (value === '' ? empty : `\`${value}\``);

/**
 * The gallery of widgets: four unrelated pages that embed the widgets, each in an iframe, and the reference of
 * attributes, events and custom properties of each widget. An address with the old tag of a widget as its hash
 * opens on the widget that replaced it.
 *
 * @returns The page.
 */
export const widgetsPage = () => {
  const m = text().widgets;
  return main(
    {
      class: 'wrap page-simple',
      /** Scrolls to the section that the address names, once the page is in place. */
      ref: () => {
        setTimeout(() => scrollToHash(window.location.hash));
      },
    },
    h1(m.title),
    p({ class: 'lead' }, m.lead),
    hosts.map((host) => {
      const copy = m.hosts[host.id];
      const address = withBase(`/hosts/${host.id}.html`);
      return section(
        { class: 'host' },
        header(
          { class: 'host-head' },
          div(h2(copy.title), p({ class: 'muted' }, copy.text)),
          a(
            {
              class: 'button ghost',
              href: address,
              target: '_blank',
              rel: 'noreferrer',
              'aria-label': `${m.openFull}: ${copy.title}`,
            },
            m.openFull,
          ),
        ),
        fitted(address, copy.title),
      );
    }),
    h2(m.embedTitle),
    p({ class: 'muted' }, m.embedLead),
    CodeBlock({ code: embed.trim(), language: 'html', title: m.embedCaption }),
    h2(m.referenceTitle),
    p({ class: 'muted' }, m.referenceLead),
    widgets.map((widget) =>
      section(
        { class: 'widget-reference' },
        span({ id: widget.former, class: 'anchor', 'aria-hidden': 'true' }),
        h3({ id: widget.tag, tabindex: -1 }, tags.code(`<${widget.tag}>`)),
        p({ class: 'muted' }, m.former.replace('{tag}', widget.former)),
        p(m.descriptions[widget.tag]),
        renderTable({
          type: 'table',
          head: [m.columns.kind, m.columns.name, m.columns.default, m.columns.description],
          rows: [
            ...widget.attributes.map((attribute) => [
              m.kinds.attribute,
              `\`${attribute.name}\``,
              code(attribute.default, m.empty),
              m.attributes[`${widget.tag}.${attribute.name}`],
            ]),
            ...widget.events.map((name) => [
              m.kinds.event,
              `\`${name}\``,
              '',
              m.events[`${widget.tag}.${name}`],
            ]),
            ...widget.properties.map((name) => [
              m.kinds.property,
              `\`${name}\``,
              '',
              m.properties[`${widget.tag}.${name}`],
            ]),
          ],
        }),
      ),
    ),
    h2(m.themeTitle),
    p({ class: 'muted' }, m.themeLead),
  );
};
