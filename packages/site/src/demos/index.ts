import * as atlas from '@site/demos/atlas';
import atlasSource from '@site/demos/atlas.ts?raw';
import * as catalog from '@site/demos/catalog';
import catalogSource from '@site/demos/catalog.ts?raw';
import * as customs from '@site/demos/customs';
import customsSource from '@site/demos/customs.ts?raw';
import * as darkroom from '@site/demos/darkroom';
import darkroomSource from '@site/demos/darkroom.ts?raw';
import * as departures from '@site/demos/departures';
import departuresSource from '@site/demos/departures.ts?raw';
import * as exposure from '@site/demos/exposure';
import exposureSource from '@site/demos/exposure.ts?raw';
import * as fieldbook from '@site/demos/fieldbook';
import fieldbookSource from '@site/demos/fieldbook.ts?raw';
import * as gels from '@site/demos/gels';
import gelsSource from '@site/demos/gels.ts?raw';
import * as seedpacket from '@site/demos/seedpacket';
import seedpacketSource from '@site/demos/seedpacket.ts?raw';
import * as setlist from '@site/demos/setlist';
import setlistSource from '@site/demos/setlist.ts?raw';
import * as switchboard from '@site/demos/switchboard';
import switchboardSource from '@site/demos/switchboard.ts?raw';
import * as typecase from '@site/demos/typecase';
import typecaseSource from '@site/demos/typecase.ts?raw';

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
  /** The path of a page of the site that runs the example, for one that is a branch of the site's routes. The frame links to it. */
  open?: string;
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
    id: 'switchboard',
    title: 'Telephone exchange',
    description: 'Four lines, four fates of a request: answered, cancelled, retried, refused.',
    page: 'http',
    group: 'requests',
    answers: ['http'],
    create: switchboard.create,
    files: single('switchboard', switchboardSource),
  },
  {
    id: 'catalog',
    title: 'Library card catalogue',
    description: 'Search the drawer, borrow a book, and meet a desk that closes and a rate limit.',
    page: 'http',
    group: 'requests',
    answers: ['github', 'posts'],
    create: catalog.create,
    files: single('catalog', catalogSource),
  },
  {
    id: 'departures',
    title: 'Ferry departures',
    description: 'A board that follows the chosen harbour and drops the answer it no longer needs.',
    page: 'data',
    group: 'requests',
    answers: ['weather'],
    create: departures.create,
    files: single('departures', departuresSource),
  },
  {
    id: 'darkroom',
    title: 'Darkroom trays',
    description:
      'A print goes through developer, stop bath and fixer; every hook leaves a line in the log.',
    page: 'lifecycle',
    group: 'lifecycle',
    answers: ['lifecycle'],
    create: darkroom.create,
    files: single('darkroom', darkroomSource),
  },
  {
    id: 'seedpacket',
    title: 'Seed packet',
    description:
      'A custom element that a page configures with attributes and hears through an event.',
    page: 'widgets',
    group: 'lifecycle',
    answers: ['widget'],
    create: seedpacket.create,
    files: single('seedpacket', seedpacketSource),
  },
  {
    id: 'atlas',
    title: 'Pocket atlas',
    description: 'An island with a page per place: nested routes, a guard and a lazy view.',
    page: 'routing',
    group: 'lifecycle',
    answers: [],
    open: '/examples/atlas',
    create: atlas.create,
    files: single('atlas', atlasSource),
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
