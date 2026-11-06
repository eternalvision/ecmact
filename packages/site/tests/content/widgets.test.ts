import { describe, expect, it } from 'vitest';
import { hosts, properties, propertiesRu, widgets } from '@site/content/widgets';
import { messages } from '@site/content/messages';

describe('widgets content', () => {
  it('uses only known widgets in the hosts', () => {
    const known = widgets.map((widget) => widget.tag);
    hosts.forEach((host) => host.widgets.forEach((name) => expect(known).toContain(name)));
  });

  it('has texts in both languages for every host and widget', () => {
    (['en', 'ru'] as const).forEach((locale) => {
      const texts = messages[locale].widgets;
      hosts.forEach((host) => expect(texts.hosts[host.id]).toBeDefined());
      widgets.forEach((widget) => expect(texts.descriptions[widget.tag]).toBeDefined());
    });
  });

  it('translates every custom property', () => {
    expect(propertiesRu).toHaveLength(properties.length);
    expect(properties.every(([name]) => name.startsWith('--w-'))).toBe(true);
  });
});
