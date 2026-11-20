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
 * Keeps the section that the address names in view while the page settles. The host frames above the reference grow
 * when their pages have loaded, which would push the section down after the first scroll to it; the page scrolls
 * to it again whenever it changes height. Every scroll of ours is instant (the style sheet makes the others smooth),
 * so each one is a single `scroll` event with the section at the place we put it. It lets go when the visitor takes
 * over: a wheel, touch, key or pointer on the page, or any scroll that leaves the section more than 2 px from that
 * place (a drag of the scrollbar, a wheel over a frame), or after five seconds.
 *
 * @param page - The page.
 */
const holdHash = (page: HTMLElement) => {
  const target = document.getElementById(window.location.hash.slice(1));
  if (!target) return;
  const release = new AbortController();
  let home = 0;
  /** Scrolls to the section, instantly, and notes where it stands. */
  const again = () => {
    scrollToHash(window.location.hash, 'instant');
    home = target.getBoundingClientRect().top;
  };
  const observer = new ResizeObserver(again);
  const limit = setTimeout(() => stop(), 5000);
  /** Stops watching: the visitor has taken over, or the time is up. */
  const stop = () => {
    observer.disconnect();
    release.abort();
    clearTimeout(limit);
  };
  /** Hands the page back when a scroll has moved the section from where we put it. */
  const scrolled = () => {
    if (Math.abs(target.getBoundingClientRect().top - home) > 2) stop();
  };
  again();
  observer.observe(page);
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((type) =>
    window.addEventListener(type, stop, { once: true, passive: true, signal: release.signal }),
  );
  window.addEventListener('scroll', scrolled, { passive: true, signal: release.signal });
};

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
      /**
       * Scrolls to the section that the address names, once the page is in place, and keeps it in view.
       *
       * @param page - The page.
       */
      ref: (page: HTMLElement) => {
        setTimeout(() => holdHash(page));
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
