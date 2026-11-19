import { mount, signal, tags } from 'ecmact';

/** The file name that the page shows above the entry file. */
export const entryName = 'src/main.ts';

/** The file name that the page shows above the markup. */
export const markupName = 'index.html';

/** The entry file of the homepage example, as a visitor pastes it into a starter. The test runs it against `create`. */
export const source = `import { mount, signal, tags } from 'ecmact';

const hours = signal(1);
const estimate = () => \`$\${hours.value * 49}\`;

mount(
  '#app',
  tags.button(
    { type: 'button', onclick: () => hours.value++ },
    'Add an hour',
  ),
  tags.output(
    { 'aria-label': 'Sample estimate', 'aria-live': 'polite' },
    estimate,
  ),
);`;

/** The markup that the entry file needs: its mount target and the script that loads it. */
export const markup = `<div id="app"></div>
<script type="module" src="/src/main.ts"></script>`;

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
  mount(
    host,
    tags.button({ type: 'button', onclick: () => hours.value++ }, 'Add an hour'),
    tags.output({ 'aria-label': 'Sample estimate', 'aria-live': 'polite' }, estimate),
  );
  return host;
};
