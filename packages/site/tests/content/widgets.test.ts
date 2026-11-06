import { describe, expect, it } from 'vitest';
import { hosts, propertyNames, widgets } from '@site/content/widgets';
import { messages } from '@site/content/messages';

describe('widgets content', () => {
  it('uses only known widgets in the hosts', () => {
    const known = widgets.map((widget) => widget.tag);
    hosts.forEach((host) => host.widgets.forEach((name) => expect(known).toContain(name)));
  });

  it('has texts in both languages for every host, widget and custom property', () => {
    (['en', 'ru'] as const).forEach((locale) => {
      const texts = messages[locale].widgets;
      hosts.forEach((host) => {
        expect(texts.hosts[host.id]?.title).toBeTruthy();
        expect(texts.hosts[host.id]?.text).toBeTruthy();
      });
      widgets.forEach((widget) => expect(texts.descriptions[widget.tag]).toBeTruthy());
      propertyNames.forEach((name) => expect(texts.properties[name]).toBeTruthy());
      expect(Object.keys(texts.properties)).toEqual([...propertyNames]);
    });
  });

  it('names every custom property with the --w- prefix', () => {
    expect(propertyNames.every((name) => name.startsWith('--w-'))).toBe(true);
  });
});
