import { describe, expect, it } from 'vitest';
import { messages } from '@site/content/messages';
import { hosts, widgets } from '@site/content/widgets';
import { demos, styleAxes } from '@site/demos/index';
import { inventory } from '@tests/inventory';
import { axes, overLimits, tooAlike } from '@tests/looks';

describe('widgets content', () => {
  it('uses only known widgets in the hosts, and puts every widget in at least two hosts', () => {
    const known = widgets.map((widget) => widget.tag);
    hosts.forEach((host) => host.widgets.forEach((name) => expect(known).toContain(name)));
    widgets.forEach((widget) =>
      expect(
        hosts.filter((host) => host.widgets.includes(widget.tag)).length,
        widget.tag,
      ).toBeGreaterThanOrEqual(2),
    );
  });

  it('lists each widget once, with a kind of its own and the former tag of the first gallery', () => {
    expect(widgets).toHaveLength(5);
    expect(new Set(widgets.map((widget) => widget.tag)).size).toBe(5);
    expect(new Set(widgets.map((widget) => widget.kind)).size).toBe(5);
    expect(Object.fromEntries(widgets.map((widget) => [widget.former, widget.tag]))).toEqual(
      inventory.widgetTags,
    );
  });

  it('has texts in both languages for every host, widget, attribute, event and custom property', () => {
    (['en', 'ru'] as const).forEach((locale) => {
      const texts = messages[locale].widgets;
      hosts.forEach((host) => {
        expect(texts.hosts[host.id]?.title).toBeTruthy();
        expect(texts.hosts[host.id]?.text).toBeTruthy();
      });
      const keys = {
        attributes: widgets.flatMap((widget) =>
          widget.attributes.map((attribute) => `${widget.tag}.${attribute.name}`),
        ),
        events: widgets.flatMap((widget) => widget.events.map((name) => `${widget.tag}.${name}`)),
        properties: widgets.flatMap((widget) =>
          widget.properties.map((name) => `${widget.tag}.${name}`),
        ),
      };
      widgets.forEach((widget) => expect(texts.descriptions[widget.tag], widget.tag).toBeTruthy());
      (['attributes', 'events', 'properties'] as const).forEach((group) => {
        expect(Object.keys(texts[group]).sort(), `${locale} ${group}`).toEqual(
          [...keys[group]].sort(),
        );
        Object.values(texts[group]).forEach((value) => expect(value).toBeTruthy());
      });
      expect(texts.attributes['print-quote.base'], `${locale} says what base means now`).toContain(
        'price-calculator',
      );
      expect(texts.attributes['print-quote.base']).toContain('100');
      expect(texts.events['print-quote.quote']).toContain('perCopy');
      expect(texts.events['print-quote.quote']).toContain('seats');
      expect(texts.former).toContain('{tag}');
      expect(
        texts.themeLead,
        `${locale} says that a colour that breaks 4.5:1 is the page's choice`,
      ).toContain('4.5:1');
    });
  });

  it('names every custom property with the --w- prefix', () => {
    widgets.forEach((widget) =>
      widget.properties.forEach((name) => expect(name.startsWith('--w-')).toBe(true)),
    );
  });
});

/** Every file of `src/widgets`, as the bundler reads it: the text that runs. */
const raw = import.meta.glob<string>('/src/widgets/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const sources = Object.fromEntries(
  widgets.map((widget) => [
    widget.tag,
    raw[
      `/src/widgets/${widget.tag.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase())}.ts`
    ]!,
  ]),
);

/** The look of every piece of the gallery, widgets and examples together. */
const looks = {
  ...Object.fromEntries(demos.map((demo) => [demo.id, demo.style])),
  ...Object.fromEntries(widgets.map((widget) => [widget.tag, widget.style])),
};

/**
 * Cuts the balanced blocks that start with a head out of a source.
 *
 * @param source - The source.
 * @param head - The opening of the block: its start, up to or including its brace.
 * @returns The source without the blocks.
 */
const without = (source: string, head: string) => {
  let text = source;
  for (let at = text.indexOf(head); at !== -1; at = text.indexOf(head)) {
    let depth = 0;
    let end = text.indexOf('{', at);
    if (end === -1) throw new Error(`no block after head: ${head}`);
    do {
      const char = text[end++];
      if (char === '{') depth++;
      if (char === '}') depth--;
    } while (depth > 0 && end < text.length);
    text = text.slice(0, at) + text.slice(end);
  }
  return text;
};

describe('the looks of the widgets', () => {
  it('give every widget one value on each of the six axes, from the closed sets', () => {
    widgets.forEach((widget) => {
      expect(Object.keys(widget.style).sort(), widget.tag).toEqual([...axes].sort());
      axes.forEach((axis) =>
        expect(styleAxes[axis] as readonly string[], `${widget.tag}: ${axis}`).toContain(
          widget.style[axis],
        ),
      );
    });
  });

  it('are the rows of the style matrix', () => {
    expect(Object.fromEntries(widgets.map((widget) => [widget.tag, widget.style.control]))).toEqual(
      {
        'print-quote': 'radio cards',
        'moon-dial': 'dial',
        'proof-clock': 'slider',
        'row-counter': 'big round button',
        'feed-lamp': 'underline tabs',
      },
    );
  });

  it('share at most two values with any other widget or example: the pairwise check of AC-24', () => {
    expect(Object.keys(looks)).toHaveLength(17);
    expect(tooAlike(looks)).toEqual([]);
  });

  it('fail the rule when a widget is the same as an example', () => {
    const twin = { ...looks.exposure!, palette: looks['print-quote']!.palette };
    expect(tooAlike({ ...looks, twin })).toContain(
      'exposure and twin share shape, type, surface, control, motion',
    );
  });

  it('keep sharp corners, dark stages and monospace within the limits of the matrix', () => {
    const dark = [
      ...demos.flatMap((demo) =>
        demo.files[0]!.source.includes('color-scheme: dark;') ? [demo.id] : [],
      ),
      ...widgets.flatMap((widget) => (widget.style.palette.includes('dark') ? [widget.tag] : [])),
    ];
    expect(dark.sort()).toEqual(['darkroom', 'gels', 'moon-dial']);
    expect(overLimits(looks, dark)).toEqual([]);
  });
});

describe('the sources of the widgets keep out the devices of the first build', () => {
  const monospace = /monospace|Courier|Menlo|Consolas|Monaco|SF Mono|Liberation Mono/;

  it('have no sharp corners, no capitals, no 1px rule, no font or image by address', () => {
    Object.entries(sources).forEach(([tag, source]) => {
      expect(source, tag).not.toMatch(
        /border(?:-(?:top|bottom)-(?:left|right))?-radius:\s*0(?:px|r?em)?\s*[;}\n]/,
      );
      expect(source, tag).not.toMatch(/text-transform:\s*uppercase/);
      expect(source, tag).not.toMatch(
        /(?<![\d.])1px\b[^;{}]*\bsolid\b|\bsolid\b[^;{}]*(?<![\d.])1px\b/,
      );
      expect(source, tag).not.toMatch(/@font-face|\burl\(/);
    });
  });

  it('use a monospace stack only in feed-lamp', () => {
    expect(
      Object.entries(sources)
        .filter(([, source]) => monospace.test(source))
        .map(([tag]) => tag),
    ).toEqual(['feed-lamp']);
  });

  it('name no address on another origin and ask for nothing outside the site', () => {
    Object.entries(sources).forEach(([tag, source]) => {
      expect(source, tag).not.toMatch(/https?:\/\//);
      expect(source, tag).not.toMatch(/['"`]\/\/[a-z]/i);
      expect(source, tag).not.toMatch(/\bfetch\(/);
    });
  });

  it('import only from ecmact and the site', () => {
    Object.entries(sources).forEach(([tag, source]) =>
      [...source.matchAll(/from '([^']+)'/g)].forEach((match) =>
        expect(match[1], tag).toMatch(/^(ecmact|@site\/widgets\/[a-zA-Z]+)$/),
      ),
    );
  });

  it('move only inside a block for no-preference: no animation, transition or keyframes outside it', () => {
    Object.entries(sources).forEach(([tag, source]) => {
      const outside = without(source, '@media (prefers-reduced-motion: no-preference) {');
      expect(outside, tag).not.toMatch(
        /\banimation(?:-name)?\s*:|\btransition(?:-property)?\s*:|@keyframes/,
      );
    });
    expect(sources['feed-lamp']).toContain('@media (prefers-reduced-motion: no-preference)');
    expect(
      without('a { transition: x 1s; }', '@media (prefers-reduced-motion: no-preference) {'),
    ).toContain('transition');
    expect(
      without(
        '@media (prefers-reduced-motion: no-preference) { a { transition: x 1s; } } b { top: 0; }',
        '@media (prefers-reduced-motion: no-preference) {',
      ),
    ).not.toContain('transition');
  });

  it('refuse a head that has no block after it, instead of looping for ever', () => {
    expect(() => without('a { x: y } @supports (', '@supports (')).toThrow('no block after head');
  });

  it('cut a block that starts with a head without a brace, and keep what follows it', () => {
    expect(without('@supports (x) { a { mask: x } } b { mask: y }', '@supports (')).toBe(
      ' b { mask: y }',
    );
  });

  it('draw masks only inside @supports, so that a browser without them shows a plain card and a plain ring', () => {
    ['print-quote', 'moon-dial'].forEach((tag) => {
      const source = sources[tag]!;
      expect(source, tag).toContain('@supports');
      expect(without(source, '@supports ('), tag).not.toMatch(/\bmask(?:-composite)?\s*:/);
    });
    expect(sources['print-quote']).toContain('box-shadow: inset 0 0 0 3px');
    expect(sources['moon-dial']).toMatch(/\.ring \{ box-shadow: inset 0 0 0 2px/);
  });
});
