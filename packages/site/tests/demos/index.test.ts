import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { findDoc } from '@site/content/docs/index';
import { defineAll } from '@site/widgets/index';
import { inventory } from '@tests/inventory';
import {
  cleanSource,
  demos,
  findDemo,
  groups,
  styleAxes,
  type Demo,
  type DemoStyle,
  type StyleAxis,
} from '@site/demos/index';

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

/** The six axes of a look, in the order of the style matrix. */
const axes = Object.keys(styleAxes) as StyleAxis[];

/**
 * Finds the pairs of looks that share more than two values.
 *
 * @param looks - The looks, by the id of the piece.
 * @returns The pairs that are too alike, with what they share.
 */
const tooAlike = (looks: Record<string, DemoStyle>) => {
  const ids = Object.keys(looks);
  return ids.flatMap((a, index) =>
    ids.slice(index + 1).flatMap((b) => {
      const same = axes.filter((axis) => looks[a]![axis] === looks[b]![axis]);
      return same.length > 2 ? [`${a} and ${b} share ${same.join(', ')}`] : [];
    }),
  );
};

/**
 * Counts the pieces that use a value, and says which limit of the matrix a count breaks.
 *
 * @param looks - The looks, by the id of the piece.
 * @param dark - The ids of the pieces whose stage is dark.
 * @returns The limits that are broken.
 */
const overLimits = (looks: Record<string, DemoStyle>, dark: string[]) => {
  const all = Object.values(looks);
  const broken: string[] = [];
  if (all.filter((look) => look.shape === 'sharp').length > 2) broken.push('sharp corners');
  if (dark.length > 5) broken.push('dark stages');
  if (all.filter((look) => look.type === 'mono').length > 2) broken.push('monospace');
  return broken;
};

/**
 * Names the devices of the first build that must not come back, found in the source of one piece.
 *
 * @param id - The id of the piece.
 * @param source - Its source.
 * @returns What is found and not allowed in this piece.
 */
const forbidden = (id: string, source: string) => {
  const found: string[] = [];
  if (id !== 'typecase' && /border-radius:\s*0\s*[;}\n]/.test(source))
    found.push('border-radius: 0');
  if (id !== 'typecase' && /text-transform:\s*uppercase/.test(source))
    found.push('text-transform: uppercase');
  if (/monospace|Courier|Menlo|Consolas/.test(source)) found.push('a monospace stack');
  if (/\b1px solid/.test(source)) found.push('1px solid');
  if (/@font-face|\burl\(/.test(source)) found.push('a font or an image by address');
  return found;
};

/**
 * Removes the blocks that run only without a request for less motion.
 *
 * @param source - The source of a piece.
 * @returns The source without them.
 */
const unguarded = (source: string) => {
  const head = '@media (prefers-reduced-motion: no-preference) {';
  let text = source;
  for (let at = text.indexOf(head); at !== -1; at = text.indexOf(head)) {
    let depth = 1;
    let end = at + head.length;
    while (depth > 0 && end < text.length) {
      const char = text[end++];
      if (char === '{') depth++;
      if (char === '}') depth--;
    }
    text = text.slice(0, at) + text.slice(end);
  }
  return text;
};

/**
 * Finds motion in a source that no media query on the visitor's preference holds back.
 *
 * @param source - The source of a piece.
 * @returns The motion that runs for everyone.
 */
const runsAlways = (source: string) =>
  source.includes('(prefers-reduced-motion: reduce)')
    ? []
    : (unguarded(source).match(/\b(animation|transition)\s*:|@keyframes/g) ?? []);

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
    expect(overLimits(looks, dark)).toEqual([]);
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
  });
});

describe('the sources of the examples keep out the devices of the first build', () => {
  it('have none of them, and the scan finds each when it is added', () => {
    Object.entries(sources).forEach(([id, source]) =>
      expect(forbidden(id, source), id).toEqual([]),
    );
    expect(forbidden('atlas', 'a { border-radius: 0; }')).toEqual(['border-radius: 0']);
    expect(forbidden('atlas', 'a { border-radius: 0.5em; }')).toEqual([]);
    expect(forbidden('typecase', 'a { border-radius: 0; text-transform: uppercase; }')).toEqual([]);
    expect(forbidden('atlas', 'a { text-transform: uppercase; }')).toEqual([
      'text-transform: uppercase',
    ]);
    expect(forbidden('atlas', 'a { font: 12px ui-monospace, monospace; }')).toEqual([
      'a monospace stack',
    ]);
    expect(forbidden('atlas', 'a { border: 1px solid #000; }')).toEqual(['1px solid']);
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
    expect(css).toContain('@supports (backdrop-filter: blur(1px))');
    expect(css.indexOf('background: #ffffff;')).toBeLessThan(css.indexOf('@supports'));
  });

  it('draw a control of the darkroom that is not available as one that is not available', () => {
    expect(sources.darkroom).toContain("button[aria-disabled='true'] {");
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

  it('lists five widget tags and every one is still registered', () => {
    expect(inventory.widgetTags).toHaveLength(5);
    defineAll();
    inventory.widgetTags.forEach((tag) => expect(customElements.get(tag), tag).toBeDefined());
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
