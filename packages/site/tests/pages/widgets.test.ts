import { mount } from 'ecmact';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { hosts, widgets } from '@site/content/widgets';
import { inventory } from '@tests/inventory';
import { widgetsPage } from '@site/pages/widgets';
import { resetLocale, useLocale } from '@tests/helpers';

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(async () => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
  await resetLocale();
});

const directory = join(import.meta.dirname, '../../public/hosts');

describe('widgets page', () => {
  it('shows a frame for every host page, with a link to open it alone', () => {
    const page = widgetsPage();
    mount(document.body, page);
    expect(page.querySelector('h1')?.textContent).toBe('Widgets');
    const frames = [...page.querySelectorAll('iframe')];
    expect(frames.map((frame) => frame.getAttribute('src'))).toEqual(
      hosts.map((host) => `/hosts/${host.id}.html`),
    );
    expect(frames.every((frame) => frame.getAttribute('title'))).toBe(true);
    expect(frames.every((frame) => frame.getAttribute('scrolling') === 'no')).toBe(true);
    expect(page.querySelectorAll('.host-head a')).toHaveLength(hosts.length);
  });

  it('names each link by the page it opens', () => {
    const page = widgetsPage();
    const labels = [...page.querySelectorAll('.host-head a')].map((link) =>
      link.getAttribute('aria-label'),
    );
    expect(new Set(labels).size).toBe(hosts.length);
    expect(labels[0]).toBe('Open the page on its own: A bakery: sage green and white');
  });

  it('shows the embed snippet and, for each widget, one reference table', () => {
    const page = widgetsPage();
    expect(page.querySelector('pre')?.textContent).toContain('ecmact-widgets.js');
    expect(page.textContent).toContain('any page');
    expect(page.querySelectorAll('.widget-reference')).toHaveLength(widgets.length);
    expect(page.querySelectorAll('.table-wrap')).toHaveLength(widgets.length);
    widgets.forEach((widget) => {
      const section = page.querySelector(`.widget-reference:has(#${widget.tag})`) as HTMLElement;
      const rows = [...section.querySelectorAll('tbody tr')].map((row) =>
        [...row.querySelectorAll('td')].map((cell) => cell.textContent),
      );
      expect(rows).toHaveLength(
        widget.attributes.length + widget.events.length + widget.properties.length,
      );
      expect(rows.filter((row) => row[0] === 'attribute').map((row) => row[1])).toEqual(
        widget.attributes.map((attribute) => attribute.name),
      );
      expect(rows.filter((row) => row[0] === 'event').map((row) => row[1])).toEqual(widget.events);
      expect(rows.filter((row) => row[0] === 'custom property').map((row) => row[1])).toEqual(
        widget.properties,
      );
      expect(section.querySelector('h3 code')?.textContent).toBe(`<${widget.tag}>`);
    });
  });

  it('shows the default of an attribute, and the word for an empty one', () => {
    const page = widgetsPage();
    const rows = [...page.querySelectorAll('tbody tr')].map((row) =>
      [...row.querySelectorAll('td')].map((cell) => cell.textContent),
    );
    expect(rows.find((row) => row[1] === 'currency')?.[2]).toBe('EUR');
    expect(rows.find((row) => row[1] === 'src')?.[2]).toBe('empty');
    expect(rows.find((row) => row[1] === 'repeat')?.[2]).toBe('0');
  });

  it('lists the attributes, events and custom properties that the widgets read', () => {
    const text = widgetsPage().textContent;
    ['heading', 'hemisphere', 'quote', 'done', 'change', 'loaded', 'row', '--w-display'].forEach(
      (word) => expect(text).toContain(word),
    );
  });

  it('says that a custom property that breaks the contrast is the choice of the page, in both languages', async () => {
    expect(widgetsPage().textContent).toContain("the page's choice");
    expect(widgetsPage().textContent).toContain('4.5:1');
    await useLocale('ru');
    expect(widgetsPage().textContent).toContain('выбор страницы');
    expect(widgetsPage().textContent).toContain('4.5:1');
  });

  it('keeps an anchor for each former tag, and it lands on the widget that replaced it', () => {
    const page = widgetsPage();
    mount(document.body, page);
    Object.entries(inventory.widgetTags).forEach(([former, successor]) => {
      const anchor = document.getElementById(former) as HTMLElement;
      expect(anchor, former).not.toBeNull();
      const section = anchor.closest('.widget-reference') as HTMLElement;
      expect(section.querySelector('h3')?.id).toBe(successor);
      expect(section.querySelector('h3')?.getAttribute('tabindex')).toBe('-1');
      expect(section.textContent).toContain(`Replaces <${former}>`);
    });
  });

  /** Replaces ResizeObserver with one that records what it observes and lets the test notify it. */
  const stubObserver = () => {
    const log = { targets: [] as unknown[], disconnected: 0, notify: () => {} };
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          log.notify = callback;
        }
        observe(target: unknown) {
          log.targets.push(target);
        }
        disconnect() {
          log.disconnected++;
        }
      },
    );
    return log;
  };

  describe('an address with a hash', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      window.history.replaceState(null, '', '/');
      vi.useRealTimers();
      vi.unstubAllGlobals();
    });

    it('scrolls to the anchor of a former tag once the page is in place', async () => {
      stubObserver();
      const scroll = vi
        .spyOn(Element.prototype, 'scrollIntoView')
        .mockImplementation(() => undefined);
      window.history.replaceState(null, '', '/widgets#price-calculator');
      mount(document.body, widgetsPage());
      await vi.advanceTimersByTimeAsync(0);
      expect(scroll.mock.contexts).toContain(document.getElementById('price-calculator'));
    });

    it('scrolls again when the page changes height, until the visitor scrolls', async () => {
      const log = stubObserver();
      const scroll = vi
        .spyOn(Element.prototype, 'scrollIntoView')
        .mockImplementation(() => undefined);
      window.history.replaceState(null, '', '/widgets#repo-card');
      mount(document.body, widgetsPage());
      await vi.advanceTimersByTimeAsync(0);
      expect(log.targets.filter((target) => (target as Element).localName === 'main')).toHaveLength(
        1,
      );
      const closed = log.disconnected;
      const first = scroll.mock.calls.length;
      log.notify();
      expect(scroll.mock.calls.length).toBe(first + 1);
      window.dispatchEvent(new Event('wheel'));
      expect(log.disconnected).toBe(closed + 1);
      window.dispatchEvent(new Event('keydown'));
      expect(log.disconnected).toBe(closed + 1);
    });

    it('lets go at a scroll that is not ours, such as a drag of the scrollbar, and clears its timers', async () => {
      const log = stubObserver();
      vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => undefined);
      window.history.replaceState(null, '', '/widgets#repo-card');
      mount(document.body, widgetsPage());
      await vi.advanceTimersByTimeAsync(0);
      const timers = vi.getTimerCount();
      const closed = log.disconnected;
      window.dispatchEvent(new Event('scroll'));
      await vi.advanceTimersByTimeAsync(100);
      window.dispatchEvent(new Event('scroll'));
      expect(log.disconnected).toBe(closed);
      await vi.advanceTimersByTimeAsync(400);
      window.dispatchEvent(new Event('scroll'));
      expect(log.disconnected).toBe(closed + 1);
      expect(vi.getTimerCount()).toBe(timers - 2);
    });

    it('lets go after five seconds', async () => {
      const log = stubObserver();
      vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => undefined);
      window.history.replaceState(null, '', '/widgets#poll-widget');
      mount(document.body, widgetsPage());
      await vi.advanceTimersByTimeAsync(4900);
      const closed = log.disconnected;
      await vi.advanceTimersByTimeAsync(200);
      expect(log.disconnected).toBe(closed + 1);
    });

    it('does not watch the page when the address names nothing on it', async () => {
      const log = stubObserver();
      window.history.replaceState(null, '', '/widgets#nothing-here');
      mount(document.body, widgetsPage());
      await vi.advanceTimersByTimeAsync(0);
      expect(log.targets.filter((target) => (target as Element).localName === 'main')).toHaveLength(
        0,
      );
    });
  });

  it('is in Russian when asked, with the same anchors and no English left in the headers and captions', async () => {
    await useLocale('ru');
    const page = widgetsPage();
    expect(page.querySelector('h1')?.textContent).toBe('Виджеты');
    expect(page.textContent).toContain('Цвет билета.');
    expect(page.textContent).toContain('Открыть страницу отдельно');
    const headers = [...page.querySelectorAll('th')].map((cell) => cell.textContent);
    expect(headers).toContain('Имя');
    expect(headers).not.toContain('Name');
    expect(page.textContent).toContain('любая страница');
    expect(page.textContent).not.toContain('any page');
    expect(page.textContent).toContain('Заменяет <price-calculator>');
    expect(page.querySelectorAll('.widget-reference')).toHaveLength(widgets.length);
  });
});

describe('host pages', () => {
  const files = readdirSync(directory).filter((file) => file.endsWith('.html'));
  const known = widgets.map((widget) => widget.tag);

  it('has a file for every host of the gallery and no other', () => {
    expect(files.sort()).toEqual(hosts.map((host) => `${host.id}.html`).sort());
  });

  it.each(hosts)('$id loads the bundle and uses only the registered widgets', (host) => {
    const html = readFileSync(join(directory, `${host.id}.html`), 'utf8');
    expect(html).toContain('<script src="../embed/ecmact-widgets.js"></script>');
    const used = [...html.matchAll(/<([a-z]+-[a-z-]+)[\s>]/g)].map((match) => match[1]!);
    expect(used.length).toBeGreaterThan(0);
    used.forEach((name) => expect(known).toContain(name));
    host.widgets.forEach((name) => expect(html).toContain(`<${name}`));
  });

  it.each(hosts)('$id embeds exactly the widgets of its row, and no other tag', (host) => {
    const html = readFileSync(join(directory, `${host.id}.html`), 'utf8');
    const used = new Set([...html.matchAll(/<([a-z]+-[a-z-]+)[\s>]/g)].map((match) => match[1]));
    expect([...used].sort()).toEqual([...host.widgets].sort());
  });

  it('gives every widget its own custom-property values in each host that embeds it', () => {
    const rule = (html: string, tag: string) =>
      [...html.matchAll(new RegExp(`\\n\\s*${tag}\\s*\\{([^}]*)\\}`, 'g'))]
        .map((match) => match[1]!.replace(/\s+/g, ' ').trim())
        .join(' ');
    widgets.forEach((widget) => {
      const values = hosts
        .filter((host) => host.widgets.includes(widget.tag))
        .map((host) => rule(readFileSync(join(directory, `${host.id}.html`), 'utf8'), widget.tag));
      values.forEach((text) => expect(text, widget.tag).toContain('--w-'));
      expect(new Set(values).size, widget.tag).toBe(values.length);
    });
  });

  it('keeps the feeds that the status lamps read beside the pages', () => {
    expect(JSON.parse(readFileSync(join(directory, 'data/kiln.json'), 'utf8'))).toHaveProperty(
      'title',
    );
    expect(() => JSON.parse(readFileSync(join(directory, 'data/broken.txt'), 'utf8'))).toThrow();
  });

  it.each(hosts)(
    '$id has no fixed date that can pass, and no title attribute on a widget',
    (host) => {
      const html = readFileSync(join(directory, `${host.id}.html`), 'utf8');
      expect(html).not.toMatch(/\sto="\d{4}/);
      expect(html).not.toMatch(/<print-quote[^>]*\stitle=/);
    },
  );

  it.each(hosts)('$id is a complete page that works on a phone', (host) => {
    const html = readFileSync(join(directory, `${host.id}.html`), 'utf8');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('name="viewport"');
    expect(html).toMatch(/<title>[^<]+<\/title>/);
  });
});
