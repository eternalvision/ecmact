import * as customs from '@site/demos/customs';
import customsSource from '@site/demos/customs.ts?raw';
import * as exposure from '@site/demos/exposure';
import exposureSource from '@site/demos/exposure.ts?raw';
import * as fieldbook from '@site/demos/fieldbook';
import fieldbookSource from '@site/demos/fieldbook.ts?raw';
import * as gels from '@site/demos/gels';
import gelsSource from '@site/demos/gels.ts?raw';
import * as github from '@site/demos/github';
import githubSource from '@site/demos/github.ts?raw';
import * as http from '@site/demos/http';
import httpSource from '@site/demos/http.ts?raw';
import * as lifecycle from '@site/demos/lifecycle';
import lifecycleSource from '@site/demos/lifecycle.ts?raw';
import * as posts from '@site/demos/posts';
import postsSource from '@site/demos/posts.ts?raw';
import * as setlist from '@site/demos/setlist';
import setlistSource from '@site/demos/setlist.ts?raw';
import * as typecase from '@site/demos/typecase';
import typecaseSource from '@site/demos/typecase.ts?raw';
import * as weather from '@site/demos/weather';
import weatherSource from '@site/demos/weather.ts?raw';
import * as widget from '@site/demos/widget';
import widgetSource from '@site/demos/widget.ts?raw';

/** The tasks that the gallery groups its examples by, in the order of the page. */
export const groups = ['state', 'interface', 'requests', 'lifecycle'] as const;

/** One of the tasks of the gallery. */
export type DemoGroup = (typeof groups)[number];

/** A file of an example, as shown on the page. */
export interface DemoFile {
  /** The name on the tab and above the code. */
  name: string;
  /** The text of the file, as it runs. */
  source: string;
}

/** A live demo: a component, and the files that make it. */
export interface Demo {
  /** The id used by documentation pages. */
  id: string;
  /** The title in the gallery and above the demo. */
  title: string;
  /** What the demo shows, in a sentence. */
  description: string;
  /** Where to read more. */
  page: string;
  /** The task it is listed under in the gallery. */
  group: DemoGroup;
  /** The ids of earlier demos that this one answers for, so that old links and guides keep working. */
  answers: string[];
  /** Creates a fresh instance of the demo. */
  create: () => Node;
  /** The files of the demo, as shown on the page: one tab each. The first is the entry. */
  files: DemoFile[];
}

/**
 * Prepares the source of a demo for display: the documentation comments that the repository requires are removed,
 * because the page explains the demo itself.
 *
 * @param raw - The text of the file.
 * @returns The source without JSDoc blocks.
 */
export const cleanSource = (raw: string) => raw.replace(/\/\*\*[\s\S]*?\*\/\n?/g, '').trim();

/**
 * Makes the list of files of a demo that is one file, named after its id.
 *
 * @param id - The id of the demo.
 * @param raw - The text of the file.
 * @returns The list.
 */
const single = (id: string, raw: string): DemoFile[] => [
  { name: `${id}.ts`, source: cleanSource(raw) },
];

/** Every demo, in the order of the gallery. */
export const demos: Demo[] = [
  {
    id: 'exposure',
    title: 'Exposure triangle',
    description:
      'Aperture, shutter and ISO are three signals; the exposure value is computed from them.',
    page: 'signals',
    group: 'state',
    answers: ['counter'],
    create: exposure.create,
    files: single('exposure', exposureSource),
  },
  {
    id: 'setlist',
    title: 'Setlist for tonight',
    description: "A band's running order: reorder the songs and keep an eye on the curfew.",
    page: 'components',
    group: 'state',
    answers: ['todo'],
    create: setlist.create,
    files: single('setlist', setlistSource),
  },
  {
    id: 'fieldbook',
    title: 'Field notebook',
    description: "A bird-watcher's tally that is still there after a reload.",
    page: 'state',
    group: 'state',
    answers: ['store'],
    create: fieldbook.create,
    files: single('fieldbook', fieldbookSource),
  },
  {
    id: 'typecase',
    title: 'Wood-type poster',
    description: 'Set a headline, choose the ink and the stock, pull a proof.',
    page: 'styled',
    group: 'interface',
    answers: ['styled'],
    create: typecase.create,
    files: single('typecase', typecaseSource),
  },
  {
    id: 'customs',
    title: 'Customs declaration',
    description: 'Shadow DOM fields that a native form validates, submits and resets.',
    page: 'forms',
    group: 'interface',
    answers: ['form'],
    create: customs.create,
    files: single('customs', customsSource),
  },
  {
    id: 'gels',
    title: 'Lighting plot',
    description: 'Nested zones of a stage, each able to put a gel in front of its lamps.',
    page: 'context',
    group: 'interface',
    answers: ['context'],
    create: gels.create,
    files: single('gels', gelsSource),
  },
  {
    id: 'http',
    title: 'HTTP client and resource',
    description: 'Retries, aborted requests and loading state against a fake server.',
    page: 'http',
    group: 'requests',
    answers: [],
    create: http.create,
    files: single('http', httpSource),
  },
  {
    id: 'github',
    title: 'GitHub API',
    description:
      'A repository card from the GitHub API, with a debounced input and a rate-limit interceptor.',
    page: 'http',
    group: 'requests',
    answers: [],
    create: github.create,
    files: single('github', githubSource),
  },
  {
    id: 'posts',
    title: 'Create, read, delete',
    description:
      'Optimistic updates against jsonplaceholder, with interceptors that count and time the requests.',
    page: 'http',
    group: 'requests',
    answers: [],
    create: posts.create,
    files: single('posts', postsSource),
  },
  {
    id: 'weather',
    title: 'Weather API',
    description:
      'The open-meteo.com API through resource(): a signal picks the city, the old request is aborted.',
    page: 'data',
    group: 'requests',
    answers: [],
    create: weather.create,
    files: single('weather', weatherSource),
  },
  {
    id: 'lifecycle',
    title: 'Lifecycle hooks',
    description:
      'mounted with a cleanup, an effect that stops by itself and unmounted, on a clock you can remove.',
    page: 'lifecycle',
    group: 'lifecycle',
    answers: [],
    create: lifecycle.create,
    files: single('lifecycle', lifecycleSource),
  },
  {
    id: 'widget',
    title: 'defineWidget',
    description:
      'A custom element configured by attributes, themed by a custom property, speaking through events.',
    page: 'widgets',
    group: 'lifecycle',
    answers: [],
    create: widget.create,
    files: single('widget', widgetSource),
  },
];

/**
 * Finds a demo by its id, or by the id of an earlier demo that it answers for.
 *
 * @param id - The id.
 * @returns The demo, or `undefined`.
 */
export const findDemo = (id: string) =>
  demos.find((demo) => demo.id === id || demo.answers.includes(id));
