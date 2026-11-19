import { mount, signal, tags } from 'ecmact';

/** The file name that the page shows above the entry file, as in the design study. */
export const entryName = 'main.ts';

/** The path of the entry file in a starter, where the paste instructions point. */
export const entryPath = 'src/main.ts';

/** The file name that the page shows above the markup. */
export const markupName = 'index.html';

/** The entry file of the homepage example, as the design study shows it. The test runs it against `create`. */
export const source = `import { mount, signal, tags } from 'ecmact';

const hours = signal(1);
const estimate = () => \`$\${hours.value * 49}\`;

mount('#app',
  tags.button(
    { onclick: () => hours.value++ },
    'Add an hour',
  ),
  tags.output(estimate),
);`;

/** The markup that the entry file needs, as a starter's `index.html` has it: its mount target and the script. */
export const markup = `<div id="app"></div>
<script type="module" src="/${entryPath}"></script>`;

/**
 * Builds the example that `source` shows, mounted into its own container instead of `#app`, so that it can run on a
 * page that already has an element with that id.
 *
 * @returns The container with the running example.
 */
export const create = () => {
  const hours = signal(1);
  const estimate = () => `$${hours.value * 49}`;
  const host = tags.div({ class: 'estimate' });
  mount(host, tags.button({ onclick: () => hours.value++ }, 'Add an hour'), tags.output(estimate));
  return host;
};
