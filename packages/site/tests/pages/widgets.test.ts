import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { hosts, properties, widgets } from '@site/content/widgets';
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

const directory = join(process.cwd(), 'public/hosts');

describe('widgets page', () => {
  it('shows a frame for every host page, with a link to open it alone', () => {
    const page = widgetsPage();
    document.body.append(page);
    expect(page.querySelector('h1')?.textContent).toBe('Widgets');
    const frames = [...page.querySelectorAll('iframe')];
    expect(frames.map((frame) => frame.getAttribute('src'))).toEqual(
      hosts.map((host) => `/hosts/${host.file}`),
    );
    expect(frames.every((frame) => frame.getAttribute('title'))).toBe(true);
    expect(frames.every((frame) => frame.getAttribute('scrolling') === 'no')).toBe(true);
    expect(page.querySelectorAll('.host-head a')).toHaveLength(hosts.length);
  });

  it('shows the embed snippet and the references', () => {
    const page = widgetsPage();
    expect(page.querySelector('pre')?.textContent).toContain('ecmact-widgets.js');
    const rows = [...page.querySelectorAll('tbody tr')].map((row) => row.textContent);
    expect(rows.filter((row) => row?.includes('<poll-widget>'))).toHaveLength(1);
    expect(rows).toHaveLength(widgets.length + properties.length);
  });

  it('is in Russian when asked', async () => {
    await useLocale('ru');
    const page = widgetsPage();
    expect(page.querySelector('h1')?.textContent).toBe('Виджеты');
    expect(page.textContent).toContain('Цвет кнопок, полос и акцентов.');
    expect(page.textContent).toContain('Открыть страницу отдельно');
  });
});

describe('host pages', () => {
  const files = readdirSync(directory).filter((file) => file.endsWith('.html'));
  const known = widgets.map((widget) => widget.tag);

  it('has a file for every host of the gallery and no other', () => {
    expect(files.sort()).toEqual(hosts.map((host) => host.file).sort());
  });

  it.each(hosts)('$file loads the bundle and uses only the registered widgets', (host) => {
    const html = readFileSync(join(directory, host.file), 'utf8');
    expect(html).toContain('<script src="../embed/ecmact-widgets.js"></script>');
    const used = [...html.matchAll(/<([a-z]+-[a-z-]+)[\s>]/g)].map((match) => match[1]!);
    expect(used.length).toBeGreaterThan(0);
    used.forEach((name) => expect(known).toContain(name));
    host.widgets.forEach((name) => expect(html).toContain(`<${name}`));
  });
});
