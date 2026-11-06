import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { hosts, propertyNames, widgets } from '@site/content/widgets';
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
    document.body.append(page);
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
    expect(labels[0]).toBe('Open the page on its own: A bistro: serif, cream and gold');
  });

  it('shows the embed snippet and the references as tables', () => {
    const page = widgetsPage();
    expect(page.querySelector('pre')?.textContent).toContain('ecmact-widgets.js');
    expect(page.textContent).toContain('any page');
    const rows = [...page.querySelectorAll('tbody tr')].map((row) => row.textContent);
    expect(rows.filter((row) => row?.includes('<poll-widget>'))).toHaveLength(1);
    expect(rows).toHaveLength(widgets.length + propertyNames.length);
    expect(page.querySelectorAll('.table-wrap')).toHaveLength(2);
    expect(page.querySelector('tbody code')?.textContent).toBe('<price-calculator>');
  });

  it('lists the heading attribute and the events of each widget', () => {
    const text = widgetsPage().textContent;
    expect(text).toContain('heading');
    expect(text).toContain('quote');
    expect(text).toContain('done');
  });

  it('is in Russian when asked, with no English left in the headers and captions', async () => {
    await useLocale('ru');
    const page = widgetsPage();
    expect(page.querySelector('h1')?.textContent).toBe('Виджеты');
    expect(page.textContent).toContain('Цвет кнопок, полос и акцентов.');
    expect(page.textContent).toContain('Открыть страницу отдельно');
    const headers = [...page.querySelectorAll('th')].map((cell) => cell.textContent);
    expect(headers).toContain('Свойство');
    expect(headers).not.toContain('Property');
    expect(page.textContent).toContain('любая страница');
    expect(page.textContent).not.toContain('any page');
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

  it.each(hosts)(
    '$id has no fixed date that can pass, and no title attribute on a widget',
    (host) => {
      const html = readFileSync(join(directory, `${host.id}.html`), 'utf8');
      expect(html).not.toMatch(/\sto="\d{4}/);
      expect(html).not.toMatch(/<price-calculator[^>]*\stitle=/);
    },
  );

  it.each(hosts)('$id is a complete page that works on a phone', (host) => {
    const html = readFileSync(join(directory, `${host.id}.html`), 'utf8');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('name="viewport"');
    expect(html).toMatch(/<title>[^<]+<\/title>/);
  });
});
