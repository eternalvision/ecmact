import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { findDoc } from '@site/content/docs/index';
import { defineAll } from '@site/widgets/index';
import { inventory } from '@tests/inventory';
import { cleanSource, demos, findDemo, groups, type Demo } from '@site/demos/index';

/** Every file of `src/demos`, as the bundler reads it: the text that runs. */
const raw = import.meta.glob<string>('/src/demos/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** The ids that the six examples of this story answer for, with the twelve ids of the old gallery. */
const oldIds = {
  counter: 'exposure',
  todo: 'setlist',
  styled: 'typecase',
  store: 'fieldbook',
  form: 'customs',
  context: 'gels',
  http: 'http',
  github: 'github',
  posts: 'posts',
  weather: 'weather',
  lifecycle: 'lifecycle',
  widget: 'widget',
};

/** Demos that the next story replaces. They may still call a server, until then. */
const legacy = ['http', 'github', 'posts', 'weather', 'lifecycle', 'widget'];

describe('cleanSource', () => {
  it('removes documentation comments and trims', () => {
    expect(cleanSource('/**\n * Doc.\n */\nexport const a = 1;\n')).toBe('export const a = 1;');
    expect(cleanSource('a /** x */ b')).toBe('a  b');
  });
});

describe('demos', () => {
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
    ['counter', 'todo', 'styled', 'store', 'form'].forEach((id) =>
      expect(findDemo(id), id).toBeDefined(),
    );
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
  { area: 'error prop and phases', patterns: [/error:/], users: ['darkroom'], waiting: true },
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
    area: 'abort, timeout, retry, HttpError',
    patterns: [/\bHttpError\b/, /\bretry\b/],
    users: ['switchboard', 'catalog', 'departures'],
    waiting: true,
  },
  {
    area: 'interceptors',
    patterns: [/\binterceptors\b/],
    users: ['switchboard', 'catalog'],
    waiting: true,
  },
  {
    area: 'emit: events out of a widget',
    patterns: [/\bemit\b/],
    users: ['seedpacket'],
    waiting: true,
  },
  { area: 'custom-property theming', patterns: [/var\(--/], users: ['seedpacket'], waiting: true },
  { area: 'widget removed and put back', patterns: [/\bremove\(/], users: [], waiting: true },
  {
    area: 'createHttp',
    patterns: [/\bcreateHttp\b/],
    users: ['switchboard', 'catalog'],
    waiting: true,
  },
  { area: 'resource', patterns: [/\bresource\b/], users: ['departures'], waiting: true },
  { area: 'createRouter', patterns: [/\bcreateRouter\b/], users: ['atlas'], waiting: true },
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
    waiting: true,
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
    exposure: 'dark',
    setlist: 'dark',
    gels: 'dark',
    fieldbook: 'light',
    customs: 'light',
    typecase: 'light',
  };

  it('declare a color scheme of their own, so the frame does not decide the native controls', () => {
    Object.entries(schemes).forEach(([id, scheme]) =>
      expect(findDemo(id)?.files[0]?.source, id).toContain(`color-scheme: ${scheme};`),
    );
  });

  it('pad the stage of the old demos that have no padding of their own, and no other', () => {
    expect(demos.filter((demo) => demo.padded).map((demo) => demo.id)).toEqual(legacy);
  });
});

describe('the sources of the examples', () => {
  const current = demos.filter((demo) => !legacy.includes(demo.id));

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
    expect(current.length).toBeGreaterThanOrEqual(6);
    current.forEach((demo) =>
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
