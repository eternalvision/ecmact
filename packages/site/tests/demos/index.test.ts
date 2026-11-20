import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { findDoc } from '@site/content/docs/index';
import { defineAll } from '@site/widgets/index';
import { inventory } from '@tests/inventory';
import { axes, overLimits, tooAlike } from '@tests/looks';
import { cleanSource, demos, findDemo, groups, styleAxes, type Demo } from '@site/demos/index';

/** Every file of `src/demos`, as the bundler reads it: the text that runs. */
const raw = import.meta.glob<string>('/src/demos/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** The twelve ids of the old gallery, with the example that answers for each. */
const oldIds = {
  counter: 'exposure',
  todo: 'setlist',
  styled: 'typecase',
  store: 'fieldbook',
  form: 'customs',
  context: 'gels',
  http: 'switchboard',
  github: 'catalog',
  posts: 'catalog',
  weather: 'departures',
  lifecycle: 'darkroom',
  widget: 'seedpacket',
};

/** The twelve examples of the gallery, in the order of the page. */
const ids = [
  'exposure',
  'setlist',
  'fieldbook',
  'typecase',
  'customs',
  'gels',
  'switchboard',
  'catalog',
  'departures',
  'darkroom',
  'seedpacket',
  'atlas',
];

describe('cleanSource', () => {
  it('removes documentation comments and trims', () => {
    expect(cleanSource('/**\n * Doc.\n */\nexport const a = 1;\n')).toBe('export const a = 1;');
    expect(cleanSource('a /** x */ b')).toBe('a  b');
  });
});

describe('demos', () => {
  it('are the twelve of the concept sheet, and no source of an old demo remains', () => {
    expect(demos.map((demo) => demo.id)).toEqual(ids);
    expect(Object.keys(raw).sort()).toEqual(
      [...ids, 'estimate', 'index'].map((name) => `/src/demos/${name}.ts`).sort(),
    );
  });

  it('have unique ids and point at pages that exist', () => {
    expect(new Set(demos.map((demo) => demo.id)).size).toBe(demos.length);
    demos.forEach((demo) => expect(findDoc(demo.page), demo.id).toBeDefined());
  });

  it('are listed under a task, and every task has an example', () => {
    demos.forEach((demo) => expect(groups, demo.id).toContain(demo.group));
    groups.forEach((group) =>
      expect(
        demos.some((demo) => demo.group === group),
        group,
      ).toBe(true),
    );
  });

  it('create a node and show source that imports from ecmact without comments', () => {
    demos.forEach((demo) => {
      expect(demo.create(), demo.id).toBeInstanceOf(Node);
      expect(demo.files.length, demo.id).toBeGreaterThan(0);
      demo.files.forEach((file) => {
        expect(file.source, demo.id).toContain("from 'ecmact'");
        expect(file.source, demo.id).not.toContain('/**');
      });
      expect(demo.description.length, demo.id).toBeGreaterThan(20);
    });
  });

  it('show every file under its name, equal to the file that runs', () => {
    demos.forEach((demo) => {
      expect(new Set(demo.files.map((file) => file.name)).size, demo.id).toBe(demo.files.length);
      demo.files.forEach((file) => {
        const text = raw[`/src/demos/${file.name}`];
        expect(text, `${demo.id}: ${file.name}`).toBeDefined();
        expect(file.source, file.name).toBe(cleanSource(text!));
      });
      expect(demo.files[0]?.name, demo.id).toBe(`${demo.id}.ts`);
    });
  });
});

describe('findDemo', () => {
  it('finds a demo by id', () => {
    expect(findDemo('exposure')?.title).toBe('Exposure triangle');
    expect(findDemo('nope')).toBeUndefined();
  });

  it('answers for every id of the old gallery with its successor', () => {
    Object.entries(oldIds).forEach(([old, successor]) =>
      expect(findDemo(old)?.id, old).toBe(successor),
    );
    expect(Object.keys(oldIds)).toHaveLength(12);
  });

  it('answers for the ids the guides and the home page ask for', () => {
    ['counter', 'todo', 'styled', 'store', 'form', 'http'].forEach((id) =>
      expect(findDemo(id), id).toBeDefined(),
    );
  });

  it('keeps the page of a demo that answers for an old id, and links only the atlas to a page of its own', () => {
    expect(findDemo('http')?.page).toBe('http');
    expect(demos.filter((demo) => demo.open).map((demo) => [demo.id, demo.open])).toEqual([
      ['atlas', '/examples/atlas'],
    ]);
  });
});

/** An area of the API in the coverage matrix of the concept sheet, and the examples that use it. */
interface Area {
  /** The name of the area. */
  area: string;
  /** What the sources of its users contain: every pattern must be found in at least one of them. */
  patterns: RegExp[];
  /** The examples of the concept sheet that use it. */
  users: string[];
  /** Set while none of the users is registered yet. */
  waiting?: boolean;
}

const areas: Area[] = [
  { area: 'signal', patterns: [/\bsignal\(/], users: ['exposure', 'setlist', 'typecase'] },
  { area: 'computed', patterns: [/\bcomputed\(/], users: ['exposure', 'setlist'] },
  { area: 'effect', patterns: [/\beffect\(/], users: ['exposure', 'catalog', 'darkroom'] },
  { area: 'batch, untracked', patterns: [/\bbatch\(/, /\buntracked\(/], users: ['exposure'] },
  {
    area: 'tags: reactive props, class, style, ref',
    patterns: [/'aria-pressed': \(\) =>/, /class: \{/, /style: \{/, /\bref:/],
    users: ['exposure', 'setlist', 'gels', 'atlas'],
  },
  {
    area: 'em component with shadow css',
    patterns: [/\bem\.[A-Z]\w*\(\s*\{\s*css/],
    users: ['exposure', 'setlist', 'fieldbook', 'customs', 'gels'],
  },
  { area: 'mounted, unmounted', patterns: [/mounted:/], users: ['exposure', 'darkroom'] },
  { area: 'error prop and phases', patterns: [/error:/], users: ['darkroom'] },
  {
    area: 'each, keyed list',
    patterns: [/\beach\(/, /\bby:/, /\bempty:/],
    users: ['setlist', 'fieldbook', 'catalog', 'departures'],
  },
  {
    area: 'bind and native controls',
    patterns: [/\bbind:/],
    users: ['setlist', 'fieldbook', 'customs'],
  },
  {
    area: 'field: true, ElementInternals, FormData',
    patterns: [/field: true/, /new FormData\(/],
    users: ['customs'],
  },
  {
    area: 'createStore: actions, select, watch',
    patterns: [/\bcreateStore\b/, /\.select\(/, /\.watch\(/],
    users: ['setlist', 'fieldbook'],
  },
  {
    area: 'persist, version, migrate, partialize',
    patterns: [/\bpersist:/, /\bversion:/, /\bmigrate\b/, /\bpartialize:/, /\bshallow\b/],
    users: ['fieldbook'],
  },
  { area: 'createContext', patterns: [/\bcreateContext\b/], users: ['gels'] },
  {
    area: 'abort, retry, HttpError',
    patterns: [/\bHttpError\b/, /\bretry\b/],
    users: ['switchboard', 'catalog', 'departures'],
  },
  {
    area: 'interceptors',
    patterns: [/\binterceptors\b/],
    users: ['switchboard', 'catalog'],
  },
  {
    area: 'emit: events out of a widget',
    patterns: [/\bemit\b/],
    users: ['seedpacket'],
  },
  { area: 'custom-property theming', patterns: [/var\(--/], users: ['seedpacket'] },
  { area: 'timeout', patterns: [/\btimeout\b/], users: [], waiting: true },
  { area: 'widget removed and put back', patterns: [/\bremove\(/], users: [], waiting: true },
  {
    area: 'createHttp, with a fetch of its own',
    patterns: [/\bcreateHttp\b/, /\bfetch:/],
    users: ['switchboard', 'catalog'],
  },
  { area: 'resource', patterns: [/\bresource\b/], users: ['departures'] },
  {
    area: 'routes: children, outlet, guard, link (the site calls createRouter with them)',
    patterns: [/\bchildren:/, /\bbeforeEnter:/, /\.outlet\(/, /\.link\(/, /\bRoute\b/],
    users: ['atlas'],
  },
  {
    area: 'styled, css, keyframes',
    patterns: [/\bstyled\./, /\bcss`/, /\bkeyframes`/],
    users: ['typecase'],
  },
  {
    area: 'ThemeProvider, useTheme',
    patterns: [/\bThemeProvider\(/, /\buseTheme\(/],
    users: ['typecase'],
  },
  {
    area: 'defineWidget, emit',
    patterns: [/\bdefineWidget\b/],
    users: ['seedpacket'],
  },
];

/**
 * Joins the files of the registered users of an area.
 *
 * @param area - The area.
 * @returns The users that are registered, and their sources.
 */
const registered = (area: Area): { users: Demo[]; sources: string[] } => {
  const users = demos.filter((demo) => area.users.includes(demo.id));
  return { users, sources: users.flatMap((demo) => demo.files.map((file) => file.source)) };
};

describe('the coverage matrix', () => {
  it('has a user among the registered sources for every area of the API', () => {
    areas.forEach((area) => {
      const { users, sources } = registered(area);
      if (area.waiting) return;
      expect(users.length, `${area.area} has no registered user`).toBeGreaterThan(0);
      area.patterns.forEach((pattern) =>
        expect(
          sources.some((source) => pattern.test(source)),
          `${area.area}: ${pattern}`,
        ).toBe(true),
      );
    });
  });

  it('marks an area as waiting only while none of its users is registered', () => {
    areas
      .filter((area) => area.waiting)
      .forEach((area) => expect(registered(area).users, area.area).toEqual([]));
  });
});

describe('the stages', () => {
  const schemes: Record<string, string> = {
    exposure: 'light',
    setlist: 'light',
    gels: 'dark',
    fieldbook: 'light',
    customs: 'light',
    typecase: 'light',
    switchboard: 'light',
    catalog: 'light',
    departures: 'light',
    darkroom: 'dark',
    seedpacket: 'light',
    atlas: 'light',
  };

  it('declare a color scheme of their own, so the frame does not decide the native controls', () => {
    Object.entries(schemes).forEach(([id, scheme]) =>
      expect(findDemo(id)?.files[0]?.source, id).toContain(`color-scheme: ${scheme};`),
    );
  });
});

/**
 * Names the devices of the first build that must not come back, found in the source of one piece.
 *
 * @param id - The id of the piece.
 * @param source - Its source.
 * @returns What is found and not allowed in this piece.
 */
const forbidden = (id: string, source: string) => {
  const found: string[] = [];
  if (
    id !== 'typecase' &&
    /border(?:-(?:top|bottom)-(?:left|right))?-radius:\s*0(?:px|r?em)?\s*[;}\n]/.test(source)
  )
    found.push('border-radius: 0');
  if (id !== 'typecase' && /text-transform:\s*uppercase/.test(source))
    found.push('text-transform: uppercase');
  if (/monospace|Courier|Menlo|Consolas|Monaco|SF Mono|Liberation Mono/.test(source))
    found.push('a monospace stack');
  if (/(?<![\d.])1px\b[^;{}]*\bsolid\b|\bsolid\b[^;{}]*(?<![\d.])1px\b/.test(source))
    found.push('1px solid');
  if (/@font-face|\burl\(/.test(source)) found.push('a font or an image by address');
  return found;
};

/**
 * Finds the pieces that set small labels in capitals in a monospace face: both devices in one source.
 *
 * @param all - The source of each piece, by id.
 * @returns The ids of the pieces that have both.
 */
const monoLabels = (all: Record<string, string>) =>
  Object.entries(all).flatMap(([id, source]) =>
    /text-transform:\s*uppercase/.test(source) &&
    /monospace|Courier|Menlo|Consolas|Monaco|SF Mono|Liberation Mono/.test(source)
      ? [id]
      : [],
  );

/**
 * Reads one template literal. A `css` or `keyframes` template nested in one of its interpolations is a rule of
 * its own: it is handed to `emit` and left out of the body.
 *
 * @param source - The text.
 * @param start - The index just after the opening backtick.
 * @param emit - Receives the rule that each nested `css` or `keyframes` template makes.
 * @returns The body, with each interpolation replaced by `x`, and the index after the closing backtick.
 */
const readTemplate = (
  source: string,
  start: number,
  emit: (tag: string, body: string) => void,
): { body: string; end: number } => {
  let body = '';
  let at = start;
  while (at < source.length && source[at] !== '`') {
    if (source[at] === '\\') {
      body += source.slice(at, at + 2);
      at += 2;
    } else if (source[at] === '$' && source[at + 1] === '{') {
      let depth = 1;
      at += 2;
      while (depth > 0 && at < source.length) {
        if (source[at] === '`') {
          const tag = /\b(css|keyframes)$/.exec(source.slice(Math.max(0, at - 10), at))?.[1] ?? '';
          const inner = readTemplate(source, at + 1, emit);
          if (tag) emit(tag, inner.body);
          at = inner.end;
        } else {
          if (source[at] === '{') depth++;
          if (source[at] === '}') depth--;
          at++;
        }
      }
      body += 'x';
    } else body += source[at++];
  }
  return { body, end: at + 1 };
};

/**
 * Turns the styled, `css` and `keyframes` templates of a source into plain CSS: the body of a template is
 * wrapped as one rule, a `keyframes` body as an `@keyframes` block, and a `css` or `keyframes` template that
 * sits in an interpolation as a rule of its own, so that the scan reads declarations at the root of a template.
 *
 * @param source - The source of a piece.
 * @returns The source with each such template replaced by the rules that hold its body.
 */
const wrapTemplates = (source: string) => {
  const tag = /\bstyled(?:\.\w+|\([^)\n]*\))(?:<[^`]*?>)?`|\bcss`|\bkeyframes`/g;
  let out = '';
  let last = 0;
  let count = 0;
  const wrap = (kind: string, body: string) =>
    `${kind === 'keyframes' ? '@keyframes x' : `.t${count++}`} {${body}}`;
  for (let match = tag.exec(source); match; match = tag.exec(source)) {
    const nested: string[] = [];
    const { body, end } = readTemplate(source, match.index + match[0].length, (kind, inner) =>
      nested.push(wrap(kind, inner)),
    );
    out += `${source.slice(last, match.index)}${wrap(match[0].startsWith('keyframes') ? 'keyframes' : 'rule', body)}${nested.join('')}`;
    last = end;
    tag.lastIndex = end;
  }
  return out + source.slice(last);
};

const motion = /\b(animation-name|animation|transition-property|transition)\s*:\s*([^;}]*)/g;

/**
 * Names the motion family of a property: `animation` for `animation` and `animation-name`, `transition` for
 * `transition` and `transition-property`.
 *
 * @param property - The property.
 * @returns The family.
 */
const family = (property: string) =>
  property.startsWith('animation') ? 'animation' : 'transition';

/**
 * Lists the motion declarations of a body, every one of them.
 *
 * @param body - The declarations of one rule.
 * @returns Property, family and value of each.
 */
const declarations = (body: string) =>
  [...body.matchAll(motion)].map((match) => ({
    property: match[1]!,
    family: family(match[1]!),
    value: match[2]!.trim(),
  }));

/**
 * Names the families that a body switches off: a declaration with the value `none`.
 *
 * @param body - The declarations of one rule.
 * @returns The families, once each.
 */
const switchedOffFamilies = (body: string) => [
  ...new Set(
    declarations(body)
      .filter((declaration) => /^none\b/.test(declaration.value))
      .map((declaration) => declaration.family),
  ),
];

/**
 * Cuts the blocks of one media query out of a source.
 *
 * @param source - The source of a piece.
 * @param head - The opening of the media query, up to and including its brace.
 * @param mark - What stays in place of a block that is declarations nested in a rule, from the body.
 * @returns The source without the blocks, and the bodies that were cut.
 */
const cutBlocks = (source: string, head: string, mark: (body: string) => string = () => '') => {
  const cut: string[] = [];
  let text = source;
  for (let at = text.indexOf(head); at !== -1; at = text.indexOf(head)) {
    let depth = 1;
    let end = at + head.length;
    while (depth > 0 && end < text.length) {
      const char = text[end++];
      if (char === '{') depth++;
      if (char === '}') depth--;
    }
    const body = text.slice(at + head.length, end - 1);
    cut.push(body);
    text = text.slice(0, at) + (body.includes('{') ? '' : mark(body)) + text.slice(end);
  }
  return { text, cut };
};

/**
 * Splits a source into its rules, each with its own declarations: those of a rule nested in it belong to that
 * nested rule.
 *
 * @param source - The source, or a part of it.
 * @returns The selector and the own declarations of each rule.
 */
const parseRules = (source: string) => {
  const rules: { selector: string; own: string }[] = [];
  const stack: { selector: string; own: string }[] = [{ selector: '', own: '' }];
  let text = '';
  for (const char of source.replace(/\$\{[^{}]*\}/g, 'x')) {
    const top = stack[stack.length - 1]!;
    if (char === '{') {
      const cut = text.lastIndexOf(';') + 1;
      top.own += text.slice(0, cut);
      stack.push({ selector: text.slice(cut).trim(), own: '' });
      text = '';
    } else if (char === '}' && stack.length > 1) {
      const rule = stack.pop()!;
      rules.push({ selector: rule.selector, own: rule.own + text });
      text = '';
    } else text += char;
  }
  return rules;
};

/**
 * Lists the motion that the rules of a source declare, one entry for each declaration, unless the rule marks
 * its family as switched off by a nested block for `reduce`.
 *
 * @param source - The source, or a part of it.
 * @returns Selector, property and family of each declaration.
 */
const motionRules = (source: string) =>
  parseRules(source).flatMap((rule) => {
    const off = [...rule.own.matchAll(/\/\*off:(\w+)\*\//g)].map((match) => match[1]);
    return declarations(rule.own)
      .filter((declaration) => !off.includes(declaration.family))
      .map((declaration) => ({
        selector: rule.selector,
        property: `${declaration.property}:`,
        family: declaration.family,
      }));
  });

/**
 * Finds motion in a source that no media query on the visitor's preference holds back: it is neither inside
 * a block for `no-preference` nor switched off, with the value `none`, in a block for `reduce` for the same
 * selector and the same family (`animation` or `transition`); a rule that is switched off for one family still
 * runs the other.
 *
 * A `keyframes` block alone runs nothing, so it counts only when the source has no `reduce` block at all;
 * what plays it is an `animation` declaration, and that one is scanned like the others.
 *
 * @param text - The source of a piece.
 * @returns The motion that runs for everyone.
 */
const runsAlways = (text: string) => {
  const source = wrapTemplates(text);
  const free = cutBlocks(source, '@media (prefers-reduced-motion: no-preference) {');
  const reduced = cutBlocks(free.text, '@media (prefers-reduced-motion: reduce) {', (body) =>
    switchedOffFamilies(body)
      .map((name) => `/*off:${name}*/`)
      .join(''),
  );
  const off = new Set(
    reduced.cut.flatMap((body) =>
      parseRules(body).flatMap((rule) =>
        switchedOffFamilies(rule.own).map((name) => `${rule.selector}|${name}`),
      ),
    ),
  );
  return [
    ...motionRules(reduced.text)
      .filter((rule) => !off.has(`${rule.selector}|${rule.family}`))
      .map((rule) => rule.property),
    ...(reduced.cut.length === 0 ? (reduced.text.match(/@keyframes/g) ?? []) : []),
  ];
};

const looks = Object.fromEntries(demos.map((demo) => [demo.id, demo.style]));
const sources = Object.fromEntries(
  demos.map((demo) => [demo.id, raw[`/src/demos/${demo.id}.ts`]!]),
);

describe('the looks of the examples', () => {
  it('give every example one value on each of the six axes, from the closed sets', () => {
    demos.forEach((demo) => {
      expect(Object.keys(demo.style).sort(), demo.id).toEqual([...axes].sort());
      axes.forEach((axis) =>
        expect(styleAxes[axis] as readonly string[], `${demo.id}: ${axis}`).toContain(
          demo.style[axis],
        ),
      );
    });
  });

  it('share at most two values between any two examples', () => {
    expect(tooAlike(looks)).toEqual([]);
  });

  it('fail the rule when a thirteenth look is the same as one of them', () => {
    const twin = { ...looks.exposure!, palette: looks.setlist!.palette };
    expect(tooAlike({ ...looks, twin })).toEqual([
      'exposure and twin share shape, type, surface, control, motion',
    ]);
  });

  it('keep sharp corners, dark stages and monospace within the limits', () => {
    const dark = Object.entries(sources).flatMap(([id, source]) =>
      source.includes('color-scheme: dark;') ? [id] : [],
    );
    const labels = monoLabels(sources);
    expect(overLimits(looks, dark, labels)).toEqual([]);
    expect(labels).toEqual([]);
    expect(dark.sort()).toEqual(['darkroom', 'gels']);
    expect(
      overLimits(
        {
          ...looks,
          a: { ...looks.exposure!, shape: 'sharp' },
          b: { ...looks.exposure!, shape: 'sharp' },
        },
        dark,
      ),
    ).toEqual(['sharp corners']);
    expect(overLimits(looks, ['a', 'b', 'c', 'd', 'e', 'f'])).toEqual(['dark stages']);
    expect(
      overLimits(
        {
          ...looks,
          a: { ...looks.exposure!, type: 'mono' },
          b: { ...looks.exposure!, type: 'mono' },
          c: { ...looks.exposure!, type: 'mono' },
        },
        [],
      ),
    ).toEqual(['monospace']);
    expect(overLimits(looks, [], ['a', 'b'])).toEqual([]);
    expect(overLimits(looks, [], ['a', 'b', 'c'])).toEqual(['uppercase monospace labels']);
    expect(
      monoLabels({
        a: 'a { font: 12px ui-monospace, monospace; text-transform: uppercase; }',
        b: 'a { font: 12px monospace; }',
        c: 'a { text-transform: uppercase; }',
      }),
    ).toEqual(['a']);
  });
});

describe('the sources of the examples keep out the devices of the first build', () => {
  it('have none of them, and the scan finds each when it is added', () => {
    Object.entries(sources).forEach(([id, source]) =>
      expect(forbidden(id, source), id).toEqual([]),
    );
    expect(forbidden('atlas', 'a { border-radius: 0; }')).toEqual(['border-radius: 0']);
    expect(forbidden('atlas', 'a { border-radius: 0.5em; }')).toEqual([]);
    ['0', '0px', '0em', '0rem', '0 ', '0;'].forEach((zero) =>
      expect(forbidden('atlas', `a { border-radius: ${zero}; }`), zero).toEqual([
        'border-radius: 0',
      ]),
    );
    expect(forbidden('atlas', 'a { border-top-left-radius: 0; }')).toEqual(['border-radius: 0']);
    expect(forbidden('atlas', 'a { border-bottom-right-radius: 0px; }')).toEqual([
      'border-radius: 0',
    ]);
    expect(forbidden('atlas', 'a { border-radius: 0 8px 8px 0; }')).toEqual([]);
    expect(forbidden('atlas', 'a { border-radius: 10px; }')).toEqual([]);
    expect(forbidden('typecase', 'a { border-radius: 0; text-transform: uppercase; }')).toEqual([]);
    expect(forbidden('atlas', 'a { text-transform: uppercase; }')).toEqual([
      'text-transform: uppercase',
    ]);
    expect(forbidden('atlas', 'a { font: 12px ui-monospace, monospace; }')).toEqual([
      'a monospace stack',
    ]);
    [
      "'SF Mono'",
      'Monaco',
      "'Liberation Mono'",
      'Menlo',
      'Consolas',
      'ui-monospace',
      'monospace',
    ].forEach((face) =>
      expect(forbidden('atlas', `a { font-family: ${face}, serif; }`), face).toEqual([
        'a monospace stack',
      ]),
    );
    expect(forbidden('atlas', 'a { border: 1px solid #000; }')).toEqual(['1px solid']);
    expect(forbidden('atlas', 'a { border: solid 1px #000; }')).toEqual(['1px solid']);
    expect(forbidden('atlas', 'a { border-bottom: #000 solid 1px; }')).toEqual(['1px solid']);
    expect(forbidden('atlas', 'a { border-top: 1px\n    dashed #000; }')).toEqual([]);
    expect(forbidden('atlas', 'a { border: 3px solid #000; }')).toEqual([]);
    expect(forbidden('atlas', 'a { border: 11px solid #000; }')).toEqual([]);
    expect(forbidden('atlas', 'a { border: 2.1px solid #000; }')).toEqual([]);
    expect(forbidden('atlas', 'a { box-shadow: 0 0 0 1px #000; border: 3px solid #000; }')).toEqual(
      [],
    );
    expect(forbidden('atlas', "a { background: url('x.png'); }")).toEqual([
      'a font or an image by address',
    ]);
  });
});

describe('motion in the examples', () => {
  it('runs only when the visitor has not asked for less', () => {
    Object.entries(sources).forEach(([id, source]) => expect(runsAlways(source), id).toEqual([]));
    expect(runsAlways('a { animation: x 1s; }')).toEqual(['animation:']);
    expect(runsAlways('a { transition: x 1s; }')).toEqual(['transition:']);
    expect(
      runsAlways(
        '@media (prefers-reduced-motion: no-preference) { a { animation: x 1s; } @keyframes x { to { top: 0; } } }',
      ),
    ).toEqual([]);
    expect(
      runsAlways(
        '@media (prefers-reduced-motion: no-preference) { a { top: 0; } } b { animation: y 1s; }',
      ),
    ).toEqual(['animation:']);
    expect(
      runsAlways(
        'a { animation: x 1s; } @media (prefers-reduced-motion: reduce) { a { animation: none; } }',
      ),
    ).toEqual([]);
    expect(
      runsAlways(
        'a { animation: x 1s; } @media (prefers-reduced-motion: reduce) { a { animation: none; } } b { transition: color 1s; }',
      ),
    ).toEqual(['transition:']);
    expect(
      runsAlways(
        'a { transition: x 1s; } @media (prefers-reduced-motion: reduce) { b { transition: none; } }',
      ),
    ).toEqual(['transition:']);
    expect(
      runsAlways(
        'a { animation: x 1s; @media (prefers-reduced-motion: reduce) { animation: none; } } b { transition: x 1s; }',
      ),
    ).toEqual(['transition:']);
    expect(runsAlways('a { transition-property: color; } b { animation-name: x; }')).toEqual([
      'transition-property:',
      'animation-name:',
    ]);
    expect(runsAlways('@keyframes x { to { top: 0; } }')).toEqual(['@keyframes']);
  });

  it('switches off a property of a selector, not the selector', () => {
    // a rule that is switched off for one family still runs the other
    expect(
      runsAlways(
        'a { animation: x 1s; transition: color 1s; } @media (prefers-reduced-motion: reduce) { a { animation: none; } }',
      ),
    ).toEqual(['transition:']);
    expect(
      runsAlways(
        'a { animation: x 1s; } @media (prefers-reduced-motion: reduce) { a { transition: none; } }',
      ),
    ).toEqual(['animation:']);
    expect(
      runsAlways(
        'a { animation: x 1s; transition: color 1s; } @media (prefers-reduced-motion: reduce) { a { animation: none; transition: none; } }',
      ),
    ).toEqual([]);
    // every motion property of a rule counts, not only the first
    expect(runsAlways('a { animation: x 1s; transition: color 1s; }')).toEqual([
      'animation:',
      'transition:',
    ]);
    // the value that switches off is `none`
    expect(
      runsAlways(
        'a { animation: x 1s; } @media (prefers-reduced-motion: reduce) { a { animation: y 1s; } }',
      ),
    ).toEqual(['animation:']);
    expect(
      runsAlways(
        'a { animation-name: x; } @media (prefers-reduced-motion: reduce) { a { animation: none; } }',
      ),
    ).toEqual([]);
    expect(
      runsAlways(
        'a { animation: x 1s; transition: color 1s; @media (prefers-reduced-motion: reduce) { animation: none; } }',
      ),
    ).toEqual(['transition:']);
  });

  it('finds the motion that sits next to a switched-off animation, in a styled template', () => {
    const poster = (extra: string, reduce: string) =>
      `const k = keyframes\`to { top: 0; }\`;\nconst P = styled.div\`animation: \${(p) => (p.on ? k : 'none')} 1s;${extra}\n  @media (prefers-reduced-motion: reduce) { ${reduce} }\`;`;
    expect(runsAlways(poster('', 'animation: none;'))).toEqual([]);
    expect(runsAlways(poster(' transition: color 1s;', 'animation: none;'))).toEqual([
      'transition:',
    ]);
    expect(runsAlways(poster('', 'transition: none;'))).toEqual(['animation:']);
    expect(
      runsAlways(poster(' transition: color 1s;', 'animation: none; transition: none;')),
    ).toEqual([]);
  });

  it('reads a css template inside an interpolation as a rule of its own', () => {
    const swatch =
      'const S = styled.button`color: red; ${(p) => p.$on && css`transition: transform 1s;`}`;';
    expect(runsAlways(swatch)).toEqual(['transition:']);
    expect(
      runsAlways('const S = styled.button`color: red; ${(p) => p.$on && css`color: blue;`}`;'),
    ).toEqual([]);
    expect(
      runsAlways(
        'const S = styled.button`color: ${(p) => (p.$on ? `red` : `blue`)};`;\nconst k = keyframes`to { top: 0; }`;',
      ),
    ).toEqual(['@keyframes']);
    expect(
      runsAlways(
        'const S = styled.button`${(p) => p.$on && css`animation: ${k} 1s;`}`;\nconst k = keyframes`to { top: 0; }`;',
      ),
    ).toEqual(['animation:', '@keyframes']);
  });

  it('reads the templates of styled, css and keyframes as rules', () => {
    const swatch =
      'const S = styled.button<{ $on: boolean }>`\n  color: ${(p) => p.x};\n  transition: color 1s;\n`;';
    expect(runsAlways(swatch)).toEqual(['transition:']);
    expect(runsAlways('const S = styled(Base)`animation: x 1s;`;')).toEqual(['animation:']);
    expect(runsAlways('const c = css`transition: color 1s;`;')).toEqual(['transition:']);
    expect(runsAlways('const k = keyframes`to { top: 0; }`;')).toEqual(['@keyframes']);
    expect(
      runsAlways(
        'const k = keyframes`to { top: 0; }`;\nconst P = styled.div`animation: ${(p) => (p.on ? k : `none`)} 1s;\n  @media (prefers-reduced-motion: reduce) { animation: none; }`;',
      ),
    ).toEqual([]);
    expect(
      runsAlways(
        'const k = keyframes`to { top: 0; }`;\nconst P = styled.div`animation: x 1s; @media (prefers-reduced-motion: reduce) { animation: none; }`;\nconst S = styled.b`transition: color 1s;`;',
      ),
    ).toEqual(['transition:']);
    expect(
      runsAlways(
        'const P = styled.div`@media (prefers-reduced-motion: no-preference) { transition: color 1s; }`;',
      ),
    ).toEqual([]);
  });

  it('has an animated example for each of the ones that name a motion', () => {
    const animated = Object.entries(sources).filter(([, source]) =>
      /@keyframes|keyframes`|transition:/.test(source),
    );
    expect(animated.map(([id]) => id).sort()).toEqual(
      [
        'atlas',
        'catalog',
        'customs',
        'darkroom',
        'departures',
        'exposure',
        'fieldbook',
        'gels',
        'seedpacket',
        'setlist',
        'switchboard',
        'typecase',
      ].sort(),
    );
  });
});

describe('focus and the states of the examples', () => {
  it('show a focus outline of 3 px in every source', () => {
    Object.entries(sources).forEach(([id, source]) => {
      expect(source, id).toContain(':focus-visible');
      expect(source, id).toContain('outline: 3px solid');
    });
  });

  it('give the glass of the form a solid card where the blur is not supported', () => {
    const css = sources.customs!;
    const at = css.indexOf('@supports (backdrop-filter: blur(1px))');
    expect(at).toBeGreaterThan(-1);
    const fallback = /\n\s*form \{([^}]*)\}/.exec(css.slice(0, at));
    expect(fallback, 'a form rule before the @supports block').not.toBeNull();
    expect(fallback![1]).toContain('background: #ffffff;');
    expect(fallback![1]).not.toMatch(/background:\s*rgba/);
  });

  it('draw a control of the darkroom that is not available as one that is not available', () => {
    const rule = /button\[aria-disabled='true'\] \{([^}]*)\}/.exec(sources.darkroom!);
    expect(rule, "a rule for button[aria-disabled='true']").not.toBeNull();
    expect(rule![1]).toContain('background: transparent;');
    expect(rule![1]).toMatch(/(?:^|[\s;])color:\s*#[0-9a-f]{3,8};/i);
    const all = [...sources.darkroom!.matchAll(/([^{}]*aria-disabled[^{}]*)\{([^}]*)\}/g)];
    expect(all.length).toBeGreaterThan(0);
    all.forEach((match) =>
      expect(match[2], match[1]!.trim()).not.toMatch(/outline:\s*(?:none|0)\b/),
    );
    expect(rule![1]).not.toContain('opacity');
    expect(sources.darkroom).not.toContain('opacity: 0.45');
  });
});

describe('the sources of the examples', () => {
  it('import only from ecmact', () => {
    demos.forEach((demo) =>
      demo.files.forEach((file) =>
        [...file.source.matchAll(/from '([^']+)'/g)].forEach((match) =>
          expect(match[1], file.name).toBe('ecmact'),
        ),
      ),
    );
  });

  it('name no address on another origin', () => {
    expect(demos).toHaveLength(12);
    demos.forEach((demo) =>
      demo.files.forEach((file) => {
        expect(file.source, file.name).not.toMatch(/https?:\/\//);
        expect(file.source, file.name).not.toMatch(/['"`]\/\/[a-z]/i);
        expect(file.source, file.name).not.toMatch(/\bfetch\(/);
      }),
    );
  });
});

/** Where the tests of the site run: `packages/site`. */
const repo = (path: string) => resolve(process.cwd(), '../..', path);

describe('the compatibility inventory', () => {
  it('lists twelve demo ids and every one still answers', () => {
    expect(inventory.demoIds).toHaveLength(12);
    inventory.demoIds.forEach((id) => expect(findDemo(id), id).toBeDefined());
  });

  it('lists five former widget tags, and the widget that replaced each is registered', () => {
    expect(Object.keys(inventory.widgetTags)).toHaveLength(5);
    defineAll();
    Object.entries(inventory.widgetTags).forEach(([former, successor]) => {
      expect(customElements.get(former), former).toBeUndefined();
      expect(customElements.get(successor), successor).toBeDefined();
    });
  });

  it('lists four host pages and every one is still a file of the site', () => {
    expect(inventory.hosts).toHaveLength(4);
    inventory.hosts.forEach((host) =>
      expect(existsSync(repo(`packages/site/public${host}`)), host).toBe(true),
    );
  });

  it('lists the addresses of the starter and the widget demo, and the Pages workflow still writes each', () => {
    const workflow = readFileSync(repo('.github/workflows/pages.yml'), 'utf8');
    expect(Object.keys(inventory.deployed)).toHaveLength(4);
    Object.entries(inventory.deployed).forEach(([address, step]) =>
      expect(workflow, address).toContain(step),
    );
    expect(existsSync(repo('.github/pages/embed.html'))).toBe(true);
  });
});
