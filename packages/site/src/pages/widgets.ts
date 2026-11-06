import { hosts, propertyNames, widgets } from '@site/content/widgets';
import { text } from '@site/content/messages';
import { el } from '@site/lib/dom';
import { fitFrame } from '@site/lib/frame';
import { withBase } from '@site/lib/paths';
import { renderTable } from '@site/ui/blocks';
import { CodeBlock } from '@site/ui/codeBlock';
import { outside } from '@site/ui/header';

const embed = `
<script src="https://example.com/ecmact-widgets.js"></script>

<price-calculator currency="EUR" base="45"></price-calculator>
<poll-widget poll="dessert" question="Which dessert?" options="Tarte Tatin, Paris-Brest"></poll-widget>

<style>
  price-calculator { --w-accent: #b8893b; --w-radius: 2px; }
</style>
`;

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
  return el(
    'main',
    { class: 'wrap page-simple' },
    el('h1', {}, m.title),
    el('p', { class: 'lead' }, m.lead),
    ...hosts.map((host) => {
      const copy = m.hosts[host.id];
      const address = withBase(`/hosts/${host.id}.html`);
      const open = outside(address, m.openFull, 'button ghost');
      open.setAttribute('aria-label', `${m.openFull}: ${copy.title}`);
      return el(
        'section',
        { class: 'host' },
        el(
          'header',
          { class: 'host-head' },
          el('div', {}, el('h2', {}, copy.title), el('p', { class: 'muted' }, copy.text)),
          open,
        ),
        fitted(address, copy.title),
      );
    }),
    el('h2', {}, m.embedTitle),
    el('p', { class: 'muted' }, m.embedLead),
    CodeBlock({ code: embed.trim(), language: 'html', title: m.embedCaption }),
    el('h2', {}, m.referenceTitle),
    el('p', { class: 'muted' }, m.referenceLead),
    renderTable({
      type: 'table',
      head: [m.columns.widget, m.columns.attributes, m.columns.events, m.columns.description],
      rows: widgets.map((widget) => [
        `\`<${widget.tag}>\``,
        widget.attributes.map((name) => `\`${name}\``).join(', '),
        widget.events.map((name) => `\`${name}\``).join(', '),
        m.descriptions[widget.tag],
      ]),
    }),
    el('h2', {}, m.themeTitle),
    el('p', { class: 'muted' }, m.themeLead),
    renderTable({
      type: 'table',
      head: [m.columns.property, m.columns.description],
      rows: propertyNames.map((name) => [`\`${name}\``, m.properties[name]]),
    }),
  );
};
