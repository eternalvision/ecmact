import * as counter from '@site/demos/counter';
import counterSource from '@site/demos/counter.ts?raw';
import * as form from '@site/demos/form';
import formSource from '@site/demos/form.ts?raw';
import * as http from '@site/demos/http';
import httpSource from '@site/demos/http.ts?raw';
import * as store from '@site/demos/store';
import storeSource from '@site/demos/store.ts?raw';
import * as styled from '@site/demos/styled';
import styledSource from '@site/demos/styled.ts?raw';
import * as todo from '@site/demos/todo';
import todoSource from '@site/demos/todo.ts?raw';

/** A live demo: a component, and the source that makes it. */
export interface Demo {
  /** The id used by documentation pages. */
  id: string;
  /** The title in the gallery and above the demo. */
  title: string;
  /** What the demo shows, in a sentence. */
  description: string;
  /** Where to read more. */
  page: string;
  /** Creates a fresh instance of the demo. */
  create: () => Node;
  /** The source of the demo, as shown on the page. */
  source: string;
}

/**
 * Prepares the source of a demo for display: the documentation comments that the repository requires are removed,
 * because the page explains the demo itself.
 *
 * @param raw - The text of the file.
 * @returns The source without JSDoc blocks.
 */
export const cleanSource = (raw: string) => raw.replace(/\/\*\*[\s\S]*?\*\/\n?/g, '').trim();

/** Every demo, in the order of the gallery. */
export const demos: Demo[] = [
  {
    id: 'counter',
    title: 'Signals',
    description: 'A signal, a computed value and props bound to them: only two texts update.',
    page: 'signals',
    create: counter.create,
    source: cleanSource(counterSource),
  },
  {
    id: 'todo',
    title: 'Keyed list and store',
    description:
      'A store holds the to-dos, a keyed list shows them, a selected signal counts them.',
    page: 'components',
    create: todo.create,
    source: cleanSource(todoSource),
  },
  {
    id: 'styled',
    title: 'Styled components and themes',
    description: 'Props, keyframes and a theme from a signal: pick a swatch to restyle everything.',
    page: 'styled',
    create: styled.create,
    source: cleanSource(styledSource),
  },
  {
    id: 'store',
    title: 'Persistent store',
    description: 'persist() keeps the notes in localStorage: add one and reload the page.',
    page: 'state',
    create: store.create,
    source: cleanSource(storeSource),
  },
  {
    id: 'http',
    title: 'HTTP client and resource',
    description: 'Retries, aborted requests and loading state against a fake server.',
    page: 'http',
    create: http.create,
    source: cleanSource(httpSource),
  },
  {
    id: 'form',
    title: 'Form fields in a Shadow DOM',
    description: 'Components that take part in native form validation and FormData.',
    page: 'forms',
    create: form.create,
    source: cleanSource(formSource),
  },
];

/**
 * Finds a demo by its id.
 *
 * @param id - The id.
 * @returns The demo, or `undefined`.
 */
export const findDemo = (id: string) => demos.find((demo) => demo.id === id);
