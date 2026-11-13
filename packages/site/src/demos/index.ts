import * as context from '@site/demos/context';
import contextSource from '@site/demos/context.ts?raw';
import * as counter from '@site/demos/counter';
import counterSource from '@site/demos/counter.ts?raw';
import * as form from '@site/demos/form';
import formSource from '@site/demos/form.ts?raw';
import * as github from '@site/demos/github';
import githubSource from '@site/demos/github.ts?raw';
import * as http from '@site/demos/http';
import httpSource from '@site/demos/http.ts?raw';
import * as lifecycle from '@site/demos/lifecycle';
import lifecycleSource from '@site/demos/lifecycle.ts?raw';
import * as posts from '@site/demos/posts';
import postsSource from '@site/demos/posts.ts?raw';
import * as store from '@site/demos/store';
import storeSource from '@site/demos/store.ts?raw';
import * as styled from '@site/demos/styled';
import styledSource from '@site/demos/styled.ts?raw';
import * as todo from '@site/demos/todo';
import todoSource from '@site/demos/todo.ts?raw';
import * as weather from '@site/demos/weather';
import weatherSource from '@site/demos/weather.ts?raw';
import * as widget from '@site/demos/widget';
import widgetSource from '@site/demos/widget.ts?raw';

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
    description:
      'A signal, a value computed from it and two texts that follow them: nothing else updates.',
    page: 'signals',
    create: counter.create,
    source: cleanSource(counterSource),
  },
  {
    id: 'todo',
    title: 'Keyed list and store',
    description: 'A store holds the to-dos, a keyed list shows them, a function child counts them.',
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
    description: 'The persist option keeps the notes in localStorage: add one and reload the page.',
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
  {
    id: 'github',
    title: 'GitHub API',
    description:
      'A repository card from the GitHub API, with a debounced input and a rate-limit interceptor.',
    page: 'http',
    create: github.create,
    source: cleanSource(githubSource),
  },
  {
    id: 'weather',
    title: 'Weather API',
    description:
      'The open-meteo.com API through resource(): a signal picks the city, the old request is aborted.',
    page: 'data',
    create: weather.create,
    source: cleanSource(weatherSource),
  },
  {
    id: 'posts',
    title: 'Create, read, delete',
    description:
      'Optimistic updates against jsonplaceholder, with interceptors that count and time the requests.',
    page: 'http',
    create: posts.create,
    source: cleanSource(postsSource),
  },
  {
    id: 'lifecycle',
    title: 'Lifecycle hooks',
    description:
      'mounted with a cleanup, an effect that stops by itself and unmounted, on a clock you can remove.',
    page: 'lifecycle',
    create: lifecycle.create,
    source: cleanSource(lifecycleSource),
  },
  {
    id: 'context',
    title: 'Context',
    description: 'Nested providers: each label asks the nearest one above it for its color.',
    page: 'context',
    create: context.create,
    source: cleanSource(contextSource),
  },
  {
    id: 'widget',
    title: 'defineWidget',
    description:
      'A custom element configured by attributes, themed by a custom property, speaking through events.',
    page: 'widgets',
    create: widget.create,
    source: cleanSource(widgetSource),
  },
];

/**
 * Finds a demo by its id.
 *
 * @param id - The id.
 * @returns The demo, or `undefined`.
 */
export const findDemo = (id: string) => demos.find((demo) => demo.id === id);
