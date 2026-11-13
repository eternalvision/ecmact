import { callout, code, h2, p, table, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** How ECMact differs from Lit, Solid and VanJS, and what the same widget weighs in each. */
export const page: DocPage = {
  slug: 'comparison',
  title: 'Compared with other libraries',
  summary:
    'How ECMact differs from Lit, Solid and VanJS, with the size of the same widget in each.',
  group: 'Start',
  blocks: [
    p(
      'ECMact is built for one job first: an interface that lives inside a page you do not control. This page compares it with three libraries that people consider for the same job, and says where each of them is the better choice.',
    ),
    h2('The same widget in four libraries'),
    p(
      'The widget is a custom element, `<hello-counter label="Clicks">`, with a Shadow DOM, one style rule and a button that counts its clicks and follows the `label` attribute. Each version is built with Vite as one minified script with the library inside, and checked in a browser: all four behave the same and keep the styles of the page out.',
    ),
    table(
      ['Library', 'Minified, kB', 'gzip, kB', 'brotli, kB'],
      ['`vanjs-core` 1.6.2', '2.7', '1.3', '1.2'],
      ['`ecmact` 3.0.0', '9.8', '4.2', '3.7'],
      ['`solid-js` 1.9.19 with `solid-element` 1.9.2', '14.2', '5.3', '4.8'],
      ['`lit` 3.3.3', '14.8', '5.7', '5.2'],
    ),
    callout(
      'note',
      'Measured in November 2026 with Vite 8. The numbers are for this small widget, not for the libraries as a whole, and they change with what a widget uses. `npm run size` in the repository measures ECMact again.',
    ),
    code(
      'ts',
      `
import { defineWidget, signal, tags } from 'ecmact';

defineWidget(
  'hello-counter',
  ({ props }) => {
    const count = signal(0);
    return tags.button({ onclick: () => count.value++ }, () => \`\${props.label}: \${count.value}\`);
  },
  { attributes: { label: 'Clicks' }, css: 'button { font: inherit; }' },
);
`,
      'ECMact',
    ),
    code(
      'ts',
      `
import van from 'vanjs-core';

const { button, style } = van.tags;

customElements.define(
  'hello-counter',
  class extends HTMLElement {
    static observedAttributes = ['label'];
    label = van.state('Clicks');

    attributeChangedCallback(_name, _old, value) {
      this.label.val = value ?? 'Clicks';
    }

    connectedCallback() {
      const count = van.state(0);
      van.add(
        this.attachShadow({ mode: 'open' }),
        style('button { font: inherit; }'),
        button({ onclick: () => ++count.val }, () => \`\${this.label.val}: \${count.val}\`),
      );
    }
  },
);
`,
      'VanJS',
    ),
    code(
      'ts',
      `
import { LitElement, css, html } from 'lit';

class HelloCounter extends LitElement {
  static properties = { label: {}, count: { state: true } };
  static styles = css\`
    button {
      font: inherit;
    }
  \`;

  constructor() {
    super();
    this.label = 'Clicks';
    this.count = 0;
  }

  render() {
    return html\`<button @click=\${() => this.count++}>\${this.label}: \${this.count}</button>\`;
  }
}

customElements.define('hello-counter', HelloCounter);
`,
      'Lit',
    ),
    code(
      'ts',
      `
import { customElement } from 'solid-element';
import { createSignal } from 'solid-js';

customElement('hello-counter', { label: 'Clicks' }, (props) => {
  const [count, setCount] = createSignal(0);
  return (
    <>
      <style>{'button { font: inherit; }'}</style>
      <button onClick={() => setCount(count() + 1)}>
        {props.label}: {count()}
      </button>
    </>
  );
});
`,
      'Solid',
    ),
    h2('Compared with VanJS'),
    p(
      'VanJS is the smallest of the four: five functions and about 1 kB. It has the same idea as `tags`: plain functions that return DOM elements, and state that keeps them up to date. It has no layer for custom elements, so the class, the shadow root, the observed attributes and the stylesheet of the example are written by hand in every widget. Reactive lists and a store come from an extension, VanX.',
    ),
    p(
      'Pick VanJS when size matters most and the widget is small. For about 3 kB more, ECMact brings typed attributes with defaults, a stylesheet for the shadow root, events, cleanup when the widget is removed, keyed lists, two-way binding for form controls, a store, an HTTP client and a router.',
    ),
    h2('Compared with Lit'),
    p(
      'Lit is the closest in purpose: it is a library for web components, and a Lit component is a custom element with a Shadow DOM. A component is a class with reactive properties and a `render` method that returns an `html` template. Server-side rendering exists as a labs package.',
    ),
    p(
      'Pick Lit for a set of components that many teams share, such as a design system. ECMact differs in three ways: markup is function calls with props typed per tag instead of a template string, a plain element needs no component around it, and a store, an HTTP client, async resources and a router are in the same package.',
    ),
    h2('Compared with Solid'),
    p(
      'Solid is a library of reactive primitives with a compiler for JSX, and with SolidStart it covers server-side rendering and full-stack applications. Custom elements come from a separate package, `solid-element`.',
    ),
    p(
      'Pick Solid for an application, and whenever the server has to render the page. ECMact needs no compiler: the code you write is the code that runs, the build of a widget is one library entry in Vite, and a widget with its attributes, styles and events is one call.',
    ),
    h2('When to pick ECMact'),
    ul(
      'The interface is embedded: a widget on other sites, a block in a CMS, a browser extension, a module of an older application.',
      'You want typed attributes, isolated styles and DOM events for a widget without writing the custom element class.',
      'You want signals, a store, an HTTP client and a router from one package, with no dependencies and no compiler.',
    ),
    p(
      'It is not the right tool when the server has to render the page, or for a large application. See [Limitations](/docs/limitations).',
    ),
  ],
};
