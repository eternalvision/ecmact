<p align="center">
  <img src="https://raw.githubusercontent.com/eternalvision/ecmact/main/public/ecmact-logo.png" alt="ECMact" width="360" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ecmact"><img src="https://img.shields.io/npm/v/ecmact?logo=npm&color=CB3837&label=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/ecmact"><img src="https://img.shields.io/npm/dm/ecmact?logo=npm&color=CB3837" alt="npm downloads" /></a>
  <a href="https://www.npmjs.com/package/create-ecmact"><img src="https://img.shields.io/npm/v/create-ecmact?logo=npm&color=CB3837&label=create-ecmact" alt="create-ecmact version" /></a>
  <a href="https://github.com/eternalvision/ecmact/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/eternalvision/ecmact/ci.yml?branch=main&logo=github&label=CI" alt="CI" /></a>
  <a href="https://github.com/eternalvision/ecmact/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/ecmact" alt="license" /></a>
  <a href="https://eternalvision.github.io/ecmact/"><img src="https://img.shields.io/badge/website-docs%20and%20demos-1e7bff" alt="website" /></a>
</p>

# ECMact

Reactive interfaces in plain TypeScript that you can embed into any site.

ECMact is a small component library built on native Web Components. The [website](https://eternalvision.github.io/ecmact/) has the same documentation with live, editable-by-reading examples. Every component is a custom element, rendered into an open Shadow DOM by default (or into the light DOM with `shadow: false`), created through a single factory, `em`. There is no virtual DOM, no template language and no build-time step: components are plain function calls that return real DOM elements.

- Zero runtime dependencies
- Content, attributes and styles are written through DOM APIs, never through `innerHTML` (unless you ask for it)
- In-place updates: `setState` reuses the DOM node, so focus and input state survive
- Full TypeScript support, with attributes, events, styles, `ref` and lifecycle hooks typed per HTML tag
- Signals, computed values and effects; props can be bound to them and update the DOM on their own
- Styled components: CSS in tagged templates, with props, signals, themes and animations, scoped to the component
- A zustand-style store (`persist`, `devtools`, selectors as signals) and an axios-style HTTP client on `fetch` (interceptors, retries, cancellation), both built in
- Optional light DOM rendering and lifecycle hooks (`mounted` with cleanup, `unmounted`, `beforeUpdate`, `updated`)
- ES and CommonJS builds, bundled type declarations, `sideEffects: false`

## What it is for

ECMact fits best where an interface has to live inside something else: a page you do not control, an existing application, a browser extension. Components are custom elements with an isolated Shadow DOM, there are no runtime dependencies, and nothing needs a framework on the host page.

| Task                            | How ECMact is used                                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| Widgets for other sites         | Price calculators, request forms, service pickers and small configurators dropped into any page.   |
| Interactive blocks in a CMS     | Extra functionality for Webflow, WordPress or any existing site, without a build step on its side. |
| Browser utilities               | File converters, JSON editors, document generators, data viewers.                                  |
| Internal tools                  | Small admin panels, service monitors, API front ends, working dashboards.                          |
| Browser extensions              | Popups, options pages, side panels and interfaces on top of a page.                                |
| Modules of an older application | New screens or components added one at a time, without rewriting the whole project.                |

Widgets come first. Shadow DOM keeps the widget's styles apart from the host page's, which is its main purpose, and the router, `resource()`, signals and context cover the logic of a small self-contained app. Because components are real custom elements, they can talk to the page with ordinary DOM events.

### When it is not the right tool

ECMact is young, and a large application would have to build part of the infrastructure itself.

- **Server-side rendering and hydration are not included.** If the server has to deliver ready content for search engines or first paint, use something else (see [Server-side rendering](#server-side-rendering)).
- **The router is small.** Nested routes and guards exist, but there is no route-level data loading, transitions or scroll restoration (see [Routing](#routing)).
- **Shadow DOM needs care with forms.** `field: true` connects a control to the form around it. Labels, `for`/`id` links and outer stylesheets still do not cross the boundary; `shadow: false` removes the problem where it matters.
- **No virtualization.** Keyed lists are measured (see [Performance of large lists](#performance-of-large-lists)): a thousand rows are fine, ten thousand take about a second to create. Beyond that, paginate or render only the rows in view.

See [Limitations](#limitations) for the full list.

## Table of contents

- [What it is for](#what-it-is-for)
- [Quick start](#quick-start)
- [Install](#install)
- [First component](#first-component)
- [How it works](#how-it-works)
- [Creating components](#creating-components)
- [Tag factories](#tag-factories)
- [Props reference](#props-reference)
- [Content and children](#content-and-children)
- [Lists and keys](#lists-and-keys)
  - [Performance of large lists](#performance-of-large-lists)
- [Attributes](#attributes)
  - [Form controls](#form-controls)
  - [Fields inside a form](#fields-inside-a-form)
- [Styles](#styles)
- [Stylesheets and Tailwind CSS](#stylesheets-and-tailwind-css)
- [Styled components](#styled-components)
- [Global configuration](#global-configuration)
- [Warnings](#warnings)
- [Events](#events)
- [Refs](#refs)
- [Lifecycle](#lifecycle)
- [Shadow DOM and light DOM](#shadow-dom-and-light-dom)
- [State and updates](#state-and-updates)
- [Signals](#signals)
- [State management](#state-management)
- [HTTP client](#http-client)
- [Context](#context)
- [Error handling](#error-handling)
- [Routing](#routing)
- [Data fetching](#data-fetching)
- [Recipes](#recipes)
- [Mounting](#mounting)
- [Embedding as a widget](#embedding-as-a-widget)
- [Composition](#composition)
- [TypeScript](#typescript)
- [Security model](#security-model)
- [Server-side rendering](#server-side-rendering)
- [Browser support](#browser-support)
- [Limitations](#limitations)
- [Migrating from 1.x](#migrating-from-1x)
- [Development](#development)
- [Release](#release)
- [License](#license)

## Quick start

```bash
npm create ecmact@latest my-app
cd my-app
npm install
npm run dev
```

With pnpm:

```bash
pnpm create ecmact my-app
cd my-app
pnpm install
pnpm dev
```

`yarn create ecmact` and `bun create ecmact` work too. The printed next steps use the package manager that started the scaffolder. Run it without arguments to be asked for the name, the template and, for an app, for Tailwind.

There are two templates: an `app` (the default, [live starter](https://eternalvision.github.io/ecmact/)) and a `widget` ([live demo](https://eternalvision.github.io/ecmact/widget/)), an embeddable custom element, see [Embedding as a widget](#embedding-as-a-widget):

```bash
npm create ecmact@latest my-widget -- --template widget
```

### What you get

A [Vite](https://vite.dev) project in TypeScript with a small welcome page, like the starters of Vite, React and Next.js: the ECMact logo, a hint about where to start, a counter built from a signal and a few links. It follows the colors of the logo, in the dark scheme or the light one, depending on the system.

- **Few files.** `src/app.ts` is the page, `src/components/` holds the logo and the counter (a function that returns an element and a signal that drives its label), `src/main.ts` mounts the app.
- **A test.** The counter has a Vitest test (happy-dom), so `npm test` has something to run.
- **Prettier and ESLint, configured in detail.** Prettier options, `.editorconfig` and VS Code settings; ESLint with the strict, type-aware `typescript-eslint` rule sets plus rules for correctness, safety (no `innerHTML`) and style. `npm run check` runs the type check, lint, format check and tests in one go.

The `ecmact` dependency is pinned to the version that the scaffolder was released with. The generated `README.md` lists the scripts and explains the lint setup.

| Option           | Description                                                   |
| ---------------- | ------------------------------------------------------------- |
| `[directory]`    | Where to create the project. `.` uses the current directory.  |
| `-t, --template` | What to create: `app` (default) or `widget`.                  |
| `--tailwind`     | Add Tailwind CSS, wired in as a shared stylesheet (app only). |
| `--no-tailwind`  | Skip the Tailwind question.                                   |
| `-y, --yes`      | Use the defaults (`my-ecmact-app`, no Tailwind), ask nothing. |
| `-f, --force`    | Write into a directory that is not empty.                     |
| `-h, --help`     | Show the options.                                             |

With `--tailwind` the project gets `tailwindcss` and `@tailwindcss/vite`, a `src/tailwind.css`, and `src/setup.ts` passes the compiled CSS to `configure({ styles })`, so utility classes work inside the shadow roots of components (see [Tailwind CSS](#tailwind-css)). The counter then uses utility classes instead of its own CSS, as an example.

The `widget` template is a different starting point: `src/widget.ts` defines `<price-widget>` with `defineWidget`, `index.html` is a demo page that uses it twice (the second one themed from the outside), and `npm run build` also writes the embeddable script to `dist/widget/price-widget.js`. It has the same tests, Prettier and ESLint setup as the app, and no Tailwind.

All variants are checked by CI on every push: the scaffolder generates each of them, installs the dependencies (the library from the current build), and runs `npm run check` and `npm run build` in the result. They were also loaded in Chromium and installed with pnpm.

The scaffolder asks for nothing beyond the name and Tailwind, installs nothing and does not touch git. Requires Node 20.19 or newer.

## Install

```bash
npm install ecmact
```

Requires a browser (or DOM implementation) with Custom Elements v1 and Shadow DOM. The package ships modern, unminified ES and CommonJS code that is not transpiled down; see [Browser support](#browser-support).

```ts
import { em, mount } from 'ecmact';
```

CommonJS is supported as well:

```js
const { em, mount } = require('ecmact');
```

## First component

```ts
import { em, mount } from 'ecmact';

let count = 0;

const card = em.Card({
  content: 'Click me',
  style: { padding: '20px', backgroundColor: '#cceeff', cursor: 'pointer' },
  onclick: () => {
    count++;
    card.setState({ content: `Clicked ${count} time${count === 1 ? '' : 's'}` });
  },
});

mount('body', card);
```

## How it works

`em.Card(props)` does three things:

1. On first access of the name `Card`, registers a custom element `em-card` (once per lowercase name).
2. Creates an `<em-card>` element.
3. Assigns `props`, which renders one inner element (a `div` by default) into the element's Shadow DOM, or directly into the element when `shadow: false`.

```
<em-card>                  custom element (the host, returned by em.Card)
  #shadow-root (open)
    <div style="...">      inner element, rendered from props
      text content
      ...children
    </div>
</em-card>
```

The returned value is a real `HTMLElement`. You can append it anywhere, query it, add your own listeners to it and read `element.shadowRoot`. The inner element is `element.shadowRoot.firstElementChild` (or `element.firstElementChild` with `shadow: false`, see [Shadow DOM and light DOM](#shadow-dom-and-light-dom)).

Rendering is synchronous. Setting props, or calling `setState`, updates the DOM immediately; there is no scheduler and no batching.

## Creating components

```ts
const card = em.Card({ content: 'Hello' });
const title = em.Title({ tag: 'h1', content: 'Welcome' });
const link = em.Link({ tag: 'a', href: '/docs', content: 'Docs' });
```

`em` is a Proxy: any property name is a component factory. The name only decides the custom element name; what is rendered is decided by `tag`.

- `em.Card`, `em.card` and `em.CARD` all produce `<em-card>` elements of the same class.
- A name must match `/^[A-Za-z][A-Za-z0-9_-]*$/`, otherwise a `TypeError` is thrown.
- `em.then` and symbol properties return `undefined`, so `await em` and `String(em)` are safe.
- Factories can be called with no arguments: `em.Card()` renders an empty `div`.

Use a distinct name per kind of component. Names are a convention for your own readability and for devtools; they do not carry props or behavior.

## Tag factories

`em.<Name>` needs a `tag` prop to render anything other than a `div`, and the name carries no meaning. `tags` is the shorter form when you just want an element: the property is the tag, and the tag is fixed.

```ts
import { tags, mount } from 'ecmact';

const form = tags.form({
  onsubmit: (event) => event.preventDefault(),
  children: [
    tags.input({ type: 'email', name: 'email', placeholder: 'you@example.com', required: true }),
    tags.button({ type: 'submit', content: 'Subscribe' }),
  ],
});

mount('#app', form);
```

- `tags.a(...)`, `tags.input(...)`, `tags.section(...)` and so on exist for every tag in `HTMLElementTagNameMap`, with the same props as `em`, minus `tag`.
- Types are exact without writing `tag`: `tags.a({ src })` and `tags.input({ type: 'bogus' })` are compile errors, `ref` and the lifecycle hooks receive the right element type, and the result is a `Component<'a'>`, `Component<'input'>` and so on.
- Each call returns a regular component: `setState`, hooks, `shadow`, `css` and everything else work as described below.
- `tags.<name>` renders into an `<em-<name>>` host. It shares the custom element class with `em.<Name>`, so `tags.button` and `em.Button` produce the same host element.

Use `em.<Name>` for components that deserve their own name in devtools (`em.UserCard({ ... })`), and `tags` for plain elements.

## Props reference

| Prop           | Type                                                           | Default | Description                                                                        |
| -------------- | -------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------- |
| `tag`          | `string`                                                       | `'div'` | Tag name of the inner element.                                                     |
| `content`      | `string`                                                       | `''`    | Text content. Never parsed as HTML.                                                |
| `html`         | `string`                                                       | -       | Raw HTML for the inner element. Opt-in, trusted input only.                        |
| `children`     | `(Node \| string \| number \| boolean \| null \| undefined)[]` | `[]`    | Nodes and text appended after the content. Empty values are skipped.               |
| `key`          | `string \| number`                                             | -       | Identity of a component among its siblings, see [Lists and keys](#lists-and-keys). |
| `style`        | object of CSS properties                                       | -       | Inline styles, camelCase keys.                                                     |
| `css`          | `string`                                                       | -       | Stylesheet text scoped to this component's shadow root.                            |
| `ref`          | `(element) => void`                                            | -       | Called once, when the inner element is created.                                    |
| `shadow`       | `boolean`                                                      | `true`  | `false` renders into the light DOM. Read on the first render.                      |
| `mounted`      | `(element, component) => void \| (() => void)`                 | -       | Called when connected to the document; may return a cleanup.                       |
| `unmounted`    | `(element, component) => void`                                 | -       | Called when the component is disconnected from the document.                       |
| `beforeUpdate` | `(next, current, component) => boolean \| void`                | -       | Return `false` to cancel an update.                                                |
| `updated`      | `(element, component, previous) => void`                       | -       | Called after every render except the first.                                        |
| `error`        | `(error, info) => void`                                        | -       | Receives errors from hooks, handlers and rendering.                                |
| `provide`      | `Provision[]`                                                  | -       | Values this component offers to the components below it.                           |
| `field`        | `boolean`                                                      | `false` | Makes an `input`, `select` or `textarea` a field of the form around it.            |
| `on<event>`    | `(event) => void`                                              | -       | Event listener on the inner element, lowercase, e.g. `onclick`.                    |
| any other      | `string \| number \| boolean`                                  | -       | Set as an HTML attribute on the inner element.                                     |

All props except `shadow`, `field`, `error`, `provide` and the lifecycle hooks apply to the inner element, not to the `<em-*>` host.

## Content and children

`content` is always inserted as a text node, so markup in it is shown literally:

```ts
em.Card({ content: '<b>not bold</b>' });
```

`children` is an array of DOM nodes and text, appended after the content. Strings and numbers become text nodes, so text and elements can be mixed freely:

```ts
em.Paragraph({
  tag: 'p',
  children: ['See ', tags.a({ href: '/docs', content: 'the docs' }), ' for ', 3, ' examples.'],
});
```

`false`, `true`, `null` and `undefined` are skipped, which makes conditional rendering a plain expression:

```ts
tags.div({
  children: [
    tags.h2({ content: 'Inbox' }),
    unread > 0 && tags.span({ content: `${unread} new` }),
    loading ? 'Loading...' : null,
  ],
});
```

A signal among the children is read for its current value, so text can follow state. The array itself is not a signal:

```ts
const name = signal('Ada');

tags.p({ children: ['Hello, ', name, '!'] });
```

`content` is a shorthand for a first text child: `content: 'a', children: ['b']` renders `ab`.

`html` replaces the inner element's contents with parsed HTML. Children are appended after it. Use it only for trusted markup (see [Security model](#security-model)):

```ts
em.Card({ html: '<strong>trusted</strong> markup', children: [em.Card({ content: 'after' })] });
```

When `html` is set, `content` is ignored.

Nodes passed to `children` are moved, not cloned: a node can have only one parent.

On every update the children are reconciled against what is already rendered rather than thrown away:

- Text nodes are reused by position and only rewritten when the text changed.
- Elements that are the same node as before stay where they are, and unchanged runs of nodes are not moved.
- Components with a `key` are matched to their previous instance, see [Lists and keys](#lists-and-keys).
- Everything else that was rendered before and is no longer in the list is removed.

With `html`, the inner element's contents are replaced by the parsed HTML on every update, and the children are appended after it as plain nodes.

## Lists and keys

A component created in `children` is a new instance every time the list is built, so without further help every update replaces all of them: focus, typed input and any other state inside list items would be lost. Give each item a `key` that identifies it among its siblings, and ECMact keeps the existing instance instead:

```ts
const todos = signal([
  { id: 1, title: 'Write docs' },
  { id: 2, title: 'Ship it' },
]);

const list = tags.ul({
  mounted: (_, component) =>
    effect(() =>
      component.setState({
        children: todos.value.map((todo) => tags.li({ key: todo.id, content: todo.title })),
      }),
    ),
});
```

When a new child has the same `key` and the same component name as one that is already rendered:

- the existing instance stays in the DOM, with its inner element, focus, selection, typed input and subscriptions;
- it receives the new props, like `component.props = newProps`, so `beforeUpdate`, `updated` and the usual diffing apply to it;
- the new instance you created is discarded and never connected;
- if the new props include a `ref`, it is called with the element that survived, so a map of refs by key stays correct.

Items are matched by key, so reordering, inserting and removing are cheap: only nodes that are out of order are moved, the rest are untouched. Items that are new get inserted, and items whose key is gone are removed (their `unmounted` hooks run).

Rules and limits:

- Keys only have to be unique among siblings. Use stable ids from your data, not array indexes, unless the list never reorders.
- `1` and `'1'` are different keys.
- A duplicate key in the same list logs a warning, and the duplicates are rendered as separate items.
- Children without a key (and plain DOM elements) are never reused: they are replaced by the new ones.
- A moved node is re-inserted in the DOM, and browsers drop focus from an element that is re-inserted. Keep items in the order the user sees them if focus must survive a reorder.
- `key` is not rendered as an attribute and is not reactive.
- The new instance is created and rendered before it is discarded, so creating items has a cost even when they are reused. For very large lists, build only the items that changed.

### Performance of large lists

Measured in Chromium 153 on a shared cloud CPU, with `npm run bench` (the script needs `playwright`, which is not a dependency of the repository). Every row is a `tr` component with two `td` components, 3 components per row, median of 5 runs, in milliseconds, including the time until the next frame:

| rows  | rows are | create | update 1 in 10 | swap two | remove one | append 10% | clear |
| ----- | -------- | ------ | -------------- | -------- | ---------- | ---------- | ----- |
| 1000  | rebuilt  | 93     | 25             | 127      | 108        | 121        | 18    |
| 1000  | reused   | 96     | 27             | 18       | 20         | 35         | 15    |
| 10000 | rebuilt  | 946    | 213            | 1327     | 1340       | 1882       | 187   |
| 10000 | reused   | 898    | 212            | 180      | 150        | 204        | 138   |

- "Rebuilt" creates new row components on every update, as in the examples above; "reused" keeps one component per key and passes the same instances again. Keyed reconciliation then only moves nodes, which is 6 to 8 times cheaper than recreating and discarding them. For lists of hundreds of rows or more, keep the components in a `Map` by key.
- The Shadow DOM made no consistent difference in these runs.
- A thousand rows is fine. Ten thousand take about a second to create and are better paginated or virtualized in the application, for example by rendering only the rows in view. The library does not virtualize.
- Updating a label through a signal costs about 0.2 ms per cell here, so a table that changes a few hundred cells at once is fine.
- These numbers come from one machine and will differ on yours; use them to compare options, not as a promise.

## Attributes

Any prop that is not a reserved key (`tag`, `content`, `html`, `style`, `css`, `children`, `ref`, `shadow`, `key`, `mounted`, `unmounted`, `beforeUpdate`, `updated`, `error`, `provide`, `field`) and does not start with `on` is set on the inner element with `setAttribute`.

| Value                            | Result                              |
| -------------------------------- | ----------------------------------- |
| `string`, `number`               | `setAttribute(key, String(value))`  |
| `true`                           | empty attribute, e.g. `disabled=""` |
| `false`, `null`, `undefined`     | attribute not set / removed         |
| anything else (object, function) | ignored                             |

```ts
em.Field({
  tag: 'input',
  type: 'email',
  placeholder: 'you@example.com',
  required: true,
  maxlength: 64,
  'data-testid': 'email',
  'aria-label': 'Email',
});
```

Attribute names are HTML attribute names, not DOM property names: use `class`, not `className`, and `for`, not `htmlFor`. Names are written as given; HTML treats them case-insensitively.

On `setState`, attributes that are no longer present, or whose value became `false`, `null` or `undefined`, are removed from the element.

Values are set through the DOM, so quotes and markup inside a value cannot break out of the attribute.

### Form controls

`value`, `checked`, `selected` and `indeterminate` are also written as DOM properties, so they keep working after the user has interacted with the control (an attribute only sets the default). The attribute is still set for `value`, `checked` and `selected`, so selectors such as `[checked]` match.

```ts
const name = signal('');

tags.input({
  value: name,
  oninput: (event) => (name.value = (event.target as HTMLInputElement).value),
});
tags.input({
  type: 'checkbox',
  checked: agreed,
  onchange: (event) => (agreed.value = event.target.checked),
});
```

- A property is written when its prop changes, not on every update. An update caused by something else does not reset what the user typed.
- To clear a field, change the prop. A prop that was never updated is not rewritten: if you do not track the value in a signal, clear it through a `ref`.
- `value` also reaches elements that have such a property but are not inputs (`select`, `textarea`, `option`, `progress`, `meter`). Properties are applied after the children, so `select` can take a `value` that matches one of its options.
- Elements without the property (`div`, `a`) only get the attribute.

### Fields inside a form

A control inside a Shadow DOM does not take part in the submission or validation of the `<form>` around it. Set `field: true` on a component with an `input`, `select` or `textarea` tag and it becomes a form-associated custom element: the form sees its `name`, its value and its validity.

```ts
const email = em.Field({ tag: 'input', type: 'email', name: 'email', required: true, field: true });
const agree = em.Field({
  tag: 'input',
  type: 'checkbox',
  name: 'agree',
  value: 'yes',
  field: true,
});

form.append(email, agree);
form.checkValidity();
new FormData(form);
```

- `name` and `disabled` are copied to the host element, where forms look for them. `required`, `pattern`, `minlength` and the other constraints are evaluated on the inner control, and the form reports them (and focuses the control) as for a native one.
- The value is handed to the form after every render and on every `input` and `change` event. A checkbox or radio contributes its value only while checked; a multiple `select` contributes every selected option.
- `form.reset()` puts the inner control back to its default, and a disabled `<fieldset>` or form disables it.
- It is the right tool when the field lives in a form you do not own. A form built from components entirely inside one shadow root already works without it, and `shadow: false` avoids the problem as well.
- `field` is read on the first render and needs `ElementInternals`; without it the prop has no effect. For `select`, give the options through `html`, because the options of a native `select` must be real `option` elements.
- Labels (`<label for>`) still do not cross the shadow boundary; put the control inside the label or use `aria-label`.

## Styles

`style` takes an object of CSS properties in camelCase. Keys are converted to kebab-case and applied through the CSSOM (`element.style.setProperty`).

```ts
em.Card({
  style: {
    display: 'flex',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    zIndex: 2,
  },
});
```

- Values must be strings or numbers. Numbers are passed as is, without units: `zIndex: 2` works, `width: 10` does not mean `10px`. Use strings for lengths.
- Other values (`undefined`, objects) are skipped.
- On `setState`, properties that are no longer in `style` are removed; the rest are updated.
- Styles apply to the inner element only. There are no selectors, pseudo-classes or media queries in `style`. For those, use the `css` prop or shared stylesheets, see [Stylesheets and Tailwind CSS](#stylesheets-and-tailwind-css).

Because the content lives in a Shadow DOM, global stylesheets do not reach it.

## Stylesheets and Tailwind CSS

The `style` prop sets inline properties. For everything inline styles cannot express - `:hover`, `:focus-visible`, media queries, pseudo-elements, animations, `:host` - use a stylesheet.

### The `css` prop

`css` takes stylesheet text that applies inside the component's shadow root:

```ts
em.Button({
  tag: 'button',
  content: 'Save',
  css: `
    button { padding: 8px 16px; border-radius: 6px; }
    button:hover { background: #eef; }
    @media (max-width: 600px) { button { width: 100%; } }
  `,
});
```

- Selectors target the inner element and anything inside it. `:host` targets the `<em-*>` element itself.
- The stylesheet is attached with constructable stylesheets (`adoptedStyleSheets`), one per component. Where those are not available, a `<style>` element is placed in the shadow root instead.
- `setState({ css })` replaces the text in place; `css: undefined` removes it.
- `css` has no effect with `shadow: false`, because there is no shadow root: use a regular stylesheet in the page.
- The text is not sanitized or scoped further. Treat it as code you wrote, not as user input.

### Shared stylesheets

`configure({ styles })` adds stylesheets to every shadow component. They are applied before the component's own `css`, so a component can override them.

```ts
import { configure } from 'ecmact';
import base from './base.css?inline';

configure({ styles: [base] });
```

Sources can be strings or `CSSStyleSheet` objects. Strings are converted once and the resulting sheet is shared by all components.

### Tailwind CSS

Global CSS does not reach a shadow root, so Tailwind utilities do nothing inside components by default. There are two ways to use it:

1. **Light DOM.** Render components with `shadow: false` (or `configure({ shadow: false })`) and load Tailwind in the page as usual. Nothing else is needed.
2. **Shared stylesheet.** Build Tailwind to a CSS file and pass it as a shared stylesheet. Utilities, theme values and variants then work inside every shadow root:

```ts
import { configure, tags } from 'ecmact';
import tailwind from './tailwind.out.css?inline';

configure({ styles: [tailwind] });

tags.button({ class: 'rounded-lg bg-red-500 px-4 py-2 text-white md:px-8', content: 'Delete' });
```

Tailwind must see the class names in your source (`@source` in Tailwind 4, or the `content` globs in earlier versions); the build is independent of this library.

Tailwind 4 registers custom properties with `@property`, and browsers only honor `@property` in the document, not in a shadow root. Without them, utilities that rely on those properties (`border`, `shadow-*`, `ring-*`, `translate-*` and other transforms) silently do nothing. ECMact handles this for you: when a shared stylesheet contains `@property` rules, they are copied once into a `<style data-ecmact="properties">` element in `document.head`.

This was checked against Tailwind 4.3.4 in Chromium: with the shared stylesheet, padding, colors, radius, flex, gap, font weight, `border`, `shadow-lg`, `ring-2`, `translate-x-4` and the `md:` variant resolve to the same computed values as in a light DOM component. Other browsers and Tailwind versions were not checked.

## Events

Props starting with `on` whose value is a function (or an object with a `handler`) become event listeners on the inner element. The event name is the rest of the key, lowercased.

```ts
em.Field({
  tag: 'input',
  oninput: (event) => console.log((event.target as HTMLInputElement).value),
  onkeydown: (event) => event.key === 'Enter' && submit(),
});
```

- Other `on*` values are ignored (an `onclick` string is never evaluated).
- Listeners are replaced on every update: old ones are removed, current ones are added. There are no duplicate handlers, and removing the prop removes the listener.
- To listen in the capture phase or passively, pass an object with a `handler` instead of a function:

```ts
em.Card({
  onwheel: { handler: (event) => scrollBy(event.deltaY), passive: true },
  onclick: { handler: logClick, capture: true },
});
```

- There is no `once`, because listeners are re-attached on every update. For `once` or for custom events, add the listener yourself in a `ref`:

```ts
em.Card({
  ref: (element) => element.addEventListener('ready', onReady, { once: true }),
});
```

- Events bubble out of the Shadow DOM according to normal rules (`click`, `input` and other composed events reach listeners on the `<em-*>` host and its ancestors, with the event target retargeted to the host).

## Refs

`ref` receives the inner element once, right after it is created. It is called again only if the element is recreated (when `tag` changes).

```ts
let input!: HTMLInputElement;

const field = em.Field({
  tag: 'input',
  ref: (element) => (input = element),
});

input.focus();
```

Refs are the escape hatch for anything the props do not cover: listener options, live form values, focus, measurements, third-party widgets.

## Lifecycle

Four optional hooks run at defined points. All of them receive the host component, typed by tag, so a hook can call `component.setState(...)` without closing over a variable.

| Hook           | Signature                                       | When                                                                                                  |
| -------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `mounted`      | `(element, component) => void \| (() => void)`  | The component is connected to a document. Runs after the first render. May return a cleanup function. |
| `unmounted`    | `(element, component) => void`                  | The component is disconnected from a document. Runs after the cleanup function.                       |
| `beforeUpdate` | `(next, current, component) => boolean \| void` | Before an update. Return `false` to cancel it. Does not run for the first render.                     |
| `updated`      | `(element, component, previous) => void`        | After every render caused by `setState` or by assigning `props`, except the first one.                |

`element` is the inner element. `next`, `current` and `previous` are full props objects.

```ts
const chart = em.Chart({
  mounted: (element, component) => {
    const observer = new ResizeObserver(() => component.setState({ content: size(element) }));
    observer.observe(element);
    return () => observer.disconnect();
  },
  beforeUpdate: (next, current) => next.content !== current.content,
  updated: (element, _component, previous) => redraw(element, previous),
});
```

**Cleanup.** If `mounted` returns a function, it is called when the component is disconnected, before `unmounted`. Each connect gets its own cleanup, so a component that is moved in the DOM sets up and tears down once per move.

**Cancelling updates.** `beforeUpdate` is a veto: when it returns `false`, the new props are discarded entirely. The DOM and `component.props` stay as they were, and `updated` does not run. This means a skipped `setState` is lost, not deferred. Use it to drop updates that cannot change the output:

```ts
em.Label({
  content: 'x',
  beforeUpdate: (next, current) => next.content !== current.content,
});
```

`beforeUpdate` is read from the incoming props, which for `setState` are the current props merged with the change, so a hook set at creation keeps applying.

**Details**

- `mounted` and `unmounted` follow the custom element lifecycle: moving a component in the DOM (removing and appending it again) disconnects and connects it. Do setup in `mounted` and release it in the returned cleanup.
- A component that is created but never attached to a document never calls `mounted`.
- `updated` also runs when `tag` changes; the argument is then the new inner element.
- Hooks are read from the current props at the moment they fire, so `setState({ unmounted })` replaces the hook.
- Calling `setState` from `mounted` renders once more and triggers `updated`; `beforeUpdate` runs for it as well.
- Hooks are not rendered as attributes.

Use `ref` for code that must run once when the inner element is created, regardless of whether the component is in the document.

## Shadow DOM and light DOM

By default a component renders into an open Shadow DOM, which isolates its styles from the page. Pass `shadow: false` to render the inner element directly into the `<em-*>` host instead:

```ts
const form = em.Form({
  tag: 'form',
  shadow: false,
  children: [em.Email({ tag: 'input', type: 'email', name: 'email', shadow: false })],
});
```

```
<em-form>
  <form>                   rendered into the host, no shadow root
    <em-email>
      <input type="email" name="email">
    </em-email>
  </form>
</em-form>
```

With `shadow: false`:

- Global stylesheets and selectors such as `em-form > form` apply to the content.
- Controls take part in the surrounding `<form>`: submission, validation and `label`/`for` references work, as long as the whole chain is in the light DOM (a control inside a shadow root of an ancestor component is still isolated).
- `element.shadowRoot` is `null`; the inner element is `element.firstElementChild`.
- The host's own children are fully managed by the component and replaced on every render. Do not put your own children into an `<em-*>` host.
- Styles from the `style` prop are still applied inline on the inner element.

`shadow` is read once, on the first render. Changing it later through `setState` has no effect, because an element cannot switch between shadow and light DOM after it has been rendered. Decide at creation time.

## State and updates

Each component exposes its props and an update method.

| Member                        | Description                                             |
| ----------------------------- | ------------------------------------------------------- |
| `component.props`             | Getter: the current props object.                       |
| `component.props = p`         | Setter: replaces all props and re-renders.              |
| `component.setState(partial)` | Merges `partial` into the current props and re-renders. |
| `component.element`           | The inner element, or `null` before the first render.   |

```ts
const counter = em.Counter({ content: '0' });

counter.setState({ content: '1' });
counter.setState({ style: { color: 'red' } });
```

`setState` shallow-merges: nested objects such as `style` are replaced, not merged. To change one style property, pass the whole style object.

Updates are in place:

- The inner element is reused while `tag` stays the same. Focus, selection, scroll position and the live value of form controls are preserved.
- Attributes, styles and listeners are diffed against the previous render, and stale ones are removed.
- If `tag` changes, a new inner element is created (and `ref` is called again).
- The text content and the `children` are reconciled: text nodes are reused, keyed components are kept, the rest is replaced (see [Lists and keys](#lists-and-keys)).

Components do not track state for you. `setState` is a rendering call, not a store: keep your application state wherever you like and call `setState` when it changes.

An `<em-*>` element created outside the library (for example `document.createElement('em-card')`) renders an empty `div` when it is connected.

## Styled components

`styled` turns CSS written in a tagged template into a component, in the style of styled-components. It is built into ECMact and works with its signals and Shadow DOM; the React library of the same name does not run on custom elements and is not involved.

```ts
import { css, signal, styled } from 'ecmact';

const Button = styled.button<{ $primary?: boolean }>`
  padding: 0.5rem 1rem;
  border: 0;
  border-radius: 8px;
  color: white;
  background: ${(props) => (props.$primary ? '#1665e0' : '#6b7a90')};

  &:hover {
    filter: brightness(1.1);
  }
`;

mount('#app', Button({ content: 'Save', $primary: true }), Button({ content: 'Cancel' }));
```

`styled.<tag>` (any HTML tag) or `styled('tag')` returns a template function; the template returns a function that creates the component. The result is an ordinary ECMact component: it takes the props of its tag (`content`, `onclick`, `ref`, hooks, signals) and can be mounted, nested and updated with `setState`.

- **The template can contain** plain values, signals, functions of the props, and fragments made with `css`. `false`, `null` and `undefined` leave nothing behind, so `${(props) => props.$wide && 'width: 100%;'}` works. Functions may return any of these again.
- **Props in the template.** Functions receive the resolved props: signals in them are already unwrapped. Signals used in the template, or in the props a function reads, update the styles by themselves.
- **Transient props start with `$`.** They reach the functions in the template but are never set on the element, so `$primary` does not end up as an attribute. Type them with the generic: `styled.button<{ $primary?: boolean }>`. Props without `$` go to the element as usual, and are available to the functions too.
- **The styles live in the component's shadow root.** They cannot leak out and the page's CSS cannot reach in. Declarations apply to the inner element; nested rules and `&` use native CSS nesting (Chrome 120, Safari 17.2, Firefox 117 and newer).
- **Styled components always get a shadow root**, even when the app is configured with `configure({ shadow: false })`, because their styles need one. Pass `shadow: false` to one of them and it renders unstyled, with a warning: `css` is ignored without a shadow root.
- **`css` prop of your own** is appended after the styles of the template.
- **Sharing.** `css` writes a fragment that several components can include:

```ts
const focusRing = css<{ $accent: string }>`
  &:focus-visible {
    outline: 2px solid ${(props) => props.$accent};
    outline-offset: 2px;
  }
`;

const Link = styled.a<{ $accent: string }>`
  color: inherit;
  ${focusRing}
`;
```

- **One element per tag.** All components made with `styled.button` share one custom element, `em-styled-button`, and differ only in their styles.

### Attributes, extending and `as`

```ts
const Field = styled.input.attrs({ type: 'text', placeholder: 'Name' })`
  padding: 0.5rem;
`;

const DangerButton = styled(Button)`
  background: crimson;
`;

Button({ as: 'a', href: '/docs', content: 'Docs' });
```

- **`.attrs`** sets default props. Props passed to the component win over them, which differs from styled-components, where `attrs` win. A function receives the props the component was given and is called once, when the component is created: `styled.input.attrs<{ $size?: string }>((props) => ({ type: 'text', $size: props.$size ?? '1em' }))`. Chained `.attrs` merge, the later one winning. Type the transient props that `attrs` adds with the generic, as above.
- **`styled(Component)`** extends a component made by `styled`: it keeps the tag, the templates and the `attrs`, and its own template comes after, so its declarations win. The transient props of both are available. Anything else throws a `TypeError`.
- **`as`** renders another tag with the same styles. It is consumed by the component and never reaches the element.
- A template may end without a final semicolon: the semicolon is added before the next template of an extended component.

### Animations

`keyframes` writes the frames of an animation. The `@keyframes` rule is placed next to the styles of every component that uses it, because an animation defined outside a shadow root does not exist inside it:

```ts
import { keyframes, styled } from 'ecmact';

const spin = keyframes`
  from { rotate: 0deg; }
  to { rotate: 360deg; }
`;

const Spinner = styled.div`
  animation: ${spin} 1s linear infinite;
`;
```

The animation name is derived from the frames, so equal frames share a name and a rule is added once per component. The values in a `keyframes` template are static strings or numbers.

### Themes

`ThemeProvider` offers a theme to every styled component below it, and the template reads it as `props.theme`:

```ts
import { signal, styled, ThemeProvider } from 'ecmact';

const Button = styled.button`
  background: ${(props) => props.theme.accent};
  color: ${(props) => props.theme.onAccent};
`;

const theme = signal({ accent: '#1665e0', onAccent: 'white' });

mount('#app', ThemeProvider({ theme, children: [Button({ content: 'Save' })] }));

theme.value = { accent: '#d6336c', onAccent: 'white' };
```

- The theme is a plain object, or a signal of one. Changing the signal restyles every component below the provider.
- A provider inside another replaces the theme for its own subtree. The provider is a `div` with `display: contents`, so it does not change the layout.
- The `theme` prop of one component overrides the theme from the provider, and is not put on the element. Without a provider and without the prop, `props.theme` is an empty object.
- `props.theme` is typed as `Record<string, unknown>`, so wrap what you read in `String(...)` or `Number(...)` where the template needs text, or read the value into a typed constant yourself.
- `useTheme(element)` reads the theme signal that applies to an element in the document (or `undefined`), for code that is not a styled component. `themeContext` is the context it uses.
- `attrs` functions see the `theme` prop but not the theme from the context, which is only known once the component is in the document.
- For a theme that is only colors and sizes, CSS custom properties are simpler: they cross the shadow boundary, so `color: var(--accent, #1665e0)` works with nothing but a style on an ancestor.

### What is different from styled-components

- No selectors of other components (`${Link}:hover &`): every component has its own shadow root, and a selector cannot cross it. Style the state in the component itself, or pass a prop.
- No `createGlobalStyle`: global styles are the opposite of isolation. Use [shared stylesheets](#shared-stylesheets) for what every component needs.
- No `withConfig` and `shouldForwardProp`: `$`-prefixed props are not forwarded, which covers the same need.
- Props passed to `attrs` components win over the defaults, and `attrs` functions run once.
- Works with signals: a signal in a template or in a prop restyles the component with no re-render of anything else.

## Global configuration

`configure(options)` sets application-wide defaults. Call it once, before creating components. Options are merged between calls.

```ts
import { configure } from 'ecmact';

configure({
  shadow: false,
  styles: [tailwind],
});
```

| Option     | Type                          | Default | Description                                                           |
| ---------- | ----------------------------- | ------- | --------------------------------------------------------------------- |
| `shadow`   | `boolean`                     | `true`  | Default for the `shadow` prop. A component's own `shadow` still wins. |
| `styles`   | `(string \| CSSStyleSheet)[]` | `[]`    | Shared stylesheets adopted by every shadow component.                 |
| `onError`  | `(error, info) => void`       | -       | Default error handler, see [Error handling](#error-handling).         |
| `warnings` | `boolean`                     | `true`  | Development warnings in the console, see [Warnings](#warnings).       |

Configuration is read when a component renders. Components that were already rendered keep what they had, so configure before the first component is created. There is no configuration file: ECMact has no build step of its own, so a file would have nothing to read it.

## Warnings

ECMact logs a `console.warn` for usage that is silently ignored, so mistakes do not go unnoticed. Each distinct message is logged once.

| Message                                                  | Cause                                                                |
| -------------------------------------------------------- | -------------------------------------------------------------------- |
| `attribute "x" was ignored, object values cannot be set` | An attribute prop is an object, function or other unsupported value. |
| `style "x" was ignored, object values cannot be set`     | A style value is not a string or a number.                           |
| `handler "onclick" is not a function and was ignored`    | An `on*` prop is not a function.                                     |
| `content is ignored when html is set`                    | Both `content` and `html` were passed.                               |
| `css is ignored when shadow is false`                    | `css` was passed to a light DOM component.                           |
| `shadow cannot change after the first render`            | `shadow` (or the configured default) changed after the first render. |

`undefined`, `null` and `false` never warn: they are the normal way to switch a prop off (`disabled: isBusy && true`, `onclick: enabled ? handler : undefined`).

Turn the warnings off with `configure({ warnings: false })`, for example in production builds.

## Signals

`setState` is enough for small components. When state is shared between components, derived from other state, or changes outside of any component (a locale, a theme, a store), bind props to signals instead. A signal is a value that notifies its readers when it changes.

```ts
import { computed, effect, signal, tags, mount } from 'ecmact';

const count = signal(0);
const label = computed(() => `Clicked ${count.value} times`);

const button = tags.button({
  content: label,
  onclick: () => count.value++,
});

mount('#app', button);
```

No `setState` call and no reference to `button` is needed: the content follows `count`.

### API

| Function                     | Description                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| `signal(value)`              | A writable signal. Read and write `.value`; `.peek()` reads without subscribing.                     |
| `computed(fn)`               | A read-only signal derived from other signals. Lazy, memoized, recomputed when a dependency changes. |
| `effect(fn)`                 | Runs `fn` now and again whenever a signal it read changes. Returns a function that stops it.         |
| `batch(fn)`                  | Groups writes: effects run once, after `fn` returns. Returns the result of `fn`.                     |
| `untracked(fn)`              | Runs `fn` without subscribing to the signals it reads. Returns the result of `fn`.                   |
| `isSignal(value)`            | Type guard for signals and computed signals.                                                         |
| `signal.subscribe(listener)` | Calls `listener(value)` now and on every change. Returns an unsubscribe function.                    |

```ts
const first = signal('Ada');
const last = signal('Lovelace');
const full = computed(() => `${first.value} ${last.value}`);

const stop = effect(() => {
  document.title = full.value;
  return () => (document.title = '');
});

batch(() => {
  first.value = 'Grace';
  last.value = 'Hopper';
});

stop();
```

- Dependencies are discovered by reading `.value` while an effect or a computed value runs, and re-discovered on every run, so conditional reads are handled.
- Writing the value a signal already holds (`Object.is`) does nothing.
- Effects run synchronously when a signal is written, or after the outermost `batch`. A computed value read by several effects is recomputed once.
- The function passed to `effect` may return a cleanup, which runs before the next run and when the effect is stopped.
- If effects throw, the others still run, and the first error is rethrown from the write. An effect that keeps triggering itself is stopped with an error instead of looping forever.
- Signals hold values, not deep reactivity: replace objects and arrays instead of mutating them (`items.value = [...items.value, item]`).

### Reactive props

These props accept a signal (or a computed signal) instead of a plain value:

- `content`, `html`, `css`
- `style`, either as a signal of a whole style object, or an object whose values are signals
- every attribute (`class`, `title`, `disabled`, `type`, `data-*`, `aria-*`, ...), typed with the same value type as the plain attribute

Not reactive: `tag`, the `children` list itself (text items in it can be signals), `key`, event handlers, `ref`, `shadow` and the lifecycle hooks. Use `setState` for those.

```ts
const theme = signal<'light' | 'dark'>('light');

tags.div({
  class: computed(() => `card card-${theme.value}`),
  style: { color: computed(() => (theme.value === 'dark' ? '#eee' : '#111')) },
  content: 'Hello',
});
```

### How components follow signals

- A component reads its signal props when it renders, and subscribes to them **only while it is connected to a document**. When it is disconnected it unsubscribes, so removed components do not leak and stop doing work.
- When it is connected again, it catches up with any changes made in the meantime. If nothing changed, it does not render and `updated` does not run.
- Signal updates reuse the DOM node like `setState` does, and go through the same hooks: `beforeUpdate` runs with the resolved values and can cancel the update (the next change is evaluated again), `updated` runs afterwards.
- Hooks, `props` getters and `setState` see two views of the props: `component.props` holds what you passed (signals included), while `beforeUpdate` and `updated` receive resolved plain values.
- `setState` and assigning `props` work as before. Replacing a signal with a plain value stops following it, and the other way round.
- Signals read inside hooks or event handlers are not subscribed by the component.

### Signals and lifecycle

`effect` returns a function that stops it, which is exactly the shape of a cleanup. Returning it from `mounted` ties the effect to the component's time in the document:

```ts
const clock = tags.time({
  mounted: (_, component) => {
    const now = signal(new Date());
    const timer = setInterval(() => (now.value = new Date()), 1000);
    const stop = effect(() => component.setState({ content: now.value.toLocaleTimeString() }));
    return () => {
      clearInterval(timer);
      stop();
    };
  },
});
```

For children that depend on a list, rebuild them in an effect and give the items a `key`, so existing items are kept (see [Lists and keys](#lists-and-keys)):

```ts
const items = signal(['one', 'two']);

const list = tags.ul({
  mounted: (_, component) =>
    effect(() =>
      component.setState({
        children: items.value.map((label) => tags.li({ key: label, content: label })),
      }),
    ),
});
```

## Recipes

Everything below is built from the pieces above. None of it needs extra API.

### Internationalization

ECMact has no built-in message catalog. A locale signal and a function that reads it are enough, and they work with any library that can be wrapped in one (`Intl`, i18next, FormatJS): the translated text is just a computed value.

```ts
import { computed, signal, tags } from 'ecmact';

const dictionary = {
  en: { greeting: 'Hello, {name}!', save: 'Save' },
  cs: { greeting: 'Ahoj, {name}!', save: 'Uložit' },
};

type Key = keyof (typeof dictionary)['en'];

const locale = signal<'en' | 'cs'>('en');

const t = (key: Key, params: Record<string, string | number> = {}) =>
  dictionary[locale.value][key].replace(/\{(\w+)\}/g, (_, name) => String(params[name]));

const tr = (key: Key, params?: Record<string, string | number>) => computed(() => t(key, params));

const title = tags.h1({ lang: locale, content: tr('greeting', { name: 'Sasha' }) });
const save = tags.button({ content: tr('save') });

locale.value = 'cs';
```

Because `t` reads `locale.value`, every `computed` that calls it is re-evaluated on a locale change, and the mounted components update in place. Dates, numbers and plurals follow the same way: `computed(() => new Intl.DateTimeFormat(locale.value).format(date))`.

### Theming

Keep the theme in a signal and derive styles from it:

```ts
const theme = signal<'light' | 'dark'>('light');

const palette = computed(() =>
  theme.value === 'dark' ? { bg: '#111', fg: '#eee' } : { bg: '#fff', fg: '#111' },
);

const panel = tags.section({
  content: 'Settings',
  style: computed(() => ({ background: palette.value.bg, color: palette.value.fg })),
});

theme.value = 'dark';
```

For a theme shared through CSS, set custom properties on `:root` from an effect; they inherit into shadow roots, so components can use `var(--bg)` in their `css`:

```ts
effect(() => {
  document.documentElement.style.setProperty('--bg', palette.value.bg);
});
```

### Shared state

A store is a plain module that exports signals and the functions that change them:

```ts
// cart.ts
import { computed, signal } from 'ecmact';

const items = signal<{ id: string; price: number }[]>([]);

export const total = computed(() => items.value.reduce((sum, item) => sum + item.price, 0));
export const count = computed(() => items.value.length);
export const add = (item: { id: string; price: number }) => (items.value = [...items.value, item]);
```

```ts
import { count, total } from './cart';

tags.span({ content: computed(() => `${count.value} items, ${total.value} total`) });
```

Any component in any file that reads `count` or `total` stays up to date, with no provider and no prop drilling.

## State management

`createStore` makes a store: a state, the functions that change it, and ways to follow it. It is modeled on zustand and works with ECMact's signals, so components follow a store without any glue. The store is plain JavaScript and works anywhere; only `select` and `state` use signals.

```ts
import { createStore, mount, tags } from 'ecmact';

interface CounterState {
  count: number;
  inc: () => void;
}

const counter = createStore<CounterState>((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}));

mount(
  '#app',
  tags.button({
    content: counter.select((state) => `count is ${state.count}`),
    onclick: () => counter.getState().inc(),
  }),
);
```

`createStore(creator)` calls `creator(set, get, api)` once and uses what it returns as the state. The state is usually an object holding the values and the actions that change them, but it can be anything, a number included.

| Member                             | Description                                                                                                                |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `getState()`                       | The current state. Do not mutate it: pass a new object to `setState`.                                                      |
| `getInitialState()`                | The state the store was created with.                                                                                      |
| `setState(partial, replace?)`      | Shallow-merges an object (or the object that a function of the state returns) into the state. `replace: true` replaces it. |
| `subscribe(listener)`              | Calls `listener(state, previous)` after every change. Returns a function that stops it.                                    |
| `watch(selector, listener, opts?)` | Like `subscribe`, but only when the selected value changes. Options: `equalityFn`, `fireImmediately`.                      |
| `select(selector, equalityFn?)`    | A signal of a part of the state, for props and effects. It changes only when the selected value does.                      |
| `state`                            | The whole state as a signal.                                                                                               |
| `onReady(callback)`                | For middleware: runs once the state exists.                                                                                |

- **`setState` merges** objects shallowly, replaces a state that is not an object, and does nothing, and notifies nobody, when the new state is the same value (`Object.is`) as the old one. A third argument names the change for `devtools`.
- **`set` and `get` in the creator** must not be called while the creator is still running, only afterwards, for example in an action.
- **Selecting.** `store.select((state) => state.count)` returns a signal. Bind it to a prop and the component updates when the count changes, and not when something else in the store does. A selector that builds a new object or array each time would change on every update; pass `shallow` as the second argument so that only a change of content counts:

```ts
import { shallow } from 'ecmact';

const position = store.select((state) => ({ x: state.x, y: state.y }), shallow);
```

- **Following without components.** `watch` and `subscribe` are for code that is not a component, such as saving to a server. `store.watch((state) => state.token, (token) => api.setToken(token), { fireImmediately: true })`.
- **Selectors are long-lived.** A signal made by `select` follows the store until the store is gone. Create it once, next to the component that needs it, rather than on every render.

`shallow(a, b)` compares one level deep: objects and arrays by their own keys and values, maps and sets by their entries, everything else with `Object.is`.

### Middleware

A middleware wraps the creator. Apply it around the creator, in the order that makes sense: the outermost one sees the others' changes.

```ts
import { combine, createStore, devtools, persist } from 'ecmact';

const cart = createStore(
  devtools(
    persist(
      combine({ items: [] as string[] }, (set) => ({
        add: (item: string) =>
          set((state) => ({ items: [...state.items, item] }), false, 'cart/add'),
      })),
      { name: 'cart', partialize: (state) => ({ items: state.items }) },
    ),
    { name: 'cart' },
  ),
);
```

**`combine(initial, creator)`** takes the initial values separately, so their types are inferred and only the actions are written out. The creator's `set` and `get` know the initial values.

**`persist(creator, options)`** keeps the state in a storage and reads it back when the store is created. The initial state is not written until the first change.

| Option               | Description                                                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `name`               | The key in the storage. Required, and unique to the store.                                                                    |
| `storage`            | `createJSONStorage(() => sessionStorage)`, or any `{ getItem, setItem, removeItem }`. Defaults to `localStorage` as JSON.     |
| `partialize`         | Picks what to persist. Actions are functions and are dropped by JSON anyway; use `partialize` to leave out values too.        |
| `version`, `migrate` | A stored state with another version is ignored, unless `migrate(persisted, version)` converts it. The result is written back. |
| `merge`              | Combines the stored state with the current one. Defaults to a shallow merge.                                                  |
| `skipHydration`      | Does not read the storage on creation. Call `store.persist.rehydrate()` yourself, for example after the page has loaded.      |
| `onRehydrateStorage` | `(state) => (state, error) => void`: called before the storage is read, and returns what to call after.                       |

`store.persist` has `getOptions()`, `setOptions(partial)`, `clearStorage()`, `rehydrate()`, `hasHydrated()`, `onHydrate(listener)` and `onFinishHydration(listener)`. Storages may be asynchronous: hydration then ends in a later microtask, and `hasHydrated()` tells when. A storage that cannot be reached (private mode, an unavailable `localStorage`) makes `createJSONStorage` return `undefined`, and the store works without persistence.

**`devtools(creator, options?)`** connects the store to the Redux DevTools browser extension: every change is sent as an action named by the third argument of `setState` (or `anonymousActionType`, default `anonymous`), and jumping in time in the extension sets the state. Options: `name`, `enabled`, `anonymousActionType`. Without the extension it does nothing.

Differences from zustand: there is no React hook, `select` returns a signal instead; `subscribeWithSelector` is built in as `watch`; there is no `immer` middleware, because ECMact has no dependencies, but any function that returns the next state works with `setState((state) => produce(state, ...))`.

Writing a middleware is writing a function from a creator to a creator. Replace `api.setState` to intercept changes, and use `api.onReady` for what needs the state to exist:

```ts
const logger =
  <T>(creator: StateCreator<T>): StateCreator<T> =>
  (set, get, api) =>
    creator(
      ((partial, replace, action) => {
        set(partial as never, replace as never, action);
        console.log(action ?? 'change', get());
      }) as typeof set,
      get,
      api,
    );
```

## HTTP client

`createHttp` makes a client that is used like axios: the same method shortcuts, config, interceptors and errors, on top of `fetch`. It has no dependencies and runs wherever `fetch` does (browsers, Node 18 and newer, workers).

```ts
import { createHttp } from 'ecmact';

const api = createHttp({ baseURL: 'https://api.example.com', timeout: 5000 });

const { data } = await api.get<User[]>('/users', { params: { page: 1 } });
await api.post('/users', { name: 'Ada' });
```

`http` is a ready-made client with the library defaults. Use `createHttp` in an application, so that `baseURL` and the headers belong to your API.

| Call                               | Description                                                                        |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `api(config)`, `api(url, config?)` | Send a request.                                                                    |
| `api.request(config)`              | Same as `api(config)`.                                                             |
| `get`, `delete`, `head`, `options` | `(url, config?)`.                                                                  |
| `post`, `put`, `patch`             | `(url, data?, config?)`.                                                           |
| `postForm`, `putForm`, `patchForm` | Like `post`, `put` and `patch`, but an object is sent as `multipart/form-data`.    |
| `api.getUri(config?)`              | The URL a config would request, with the base and the query string. Sends nothing. |
| `api.defaults`, `api.interceptors` | Defaults to change in place, and the interceptors.                                 |

The type parameters are `get<T, D>`: `T` is the type of `response.data` and `D` the type of the request data.

### Response

A request resolves with:

| Field        | Description                                               |
| ------------ | --------------------------------------------------------- |
| `data`       | The body, after `transformResponse`.                      |
| `status`     | The HTTP status.                                          |
| `statusText` | The status text.                                          |
| `headers`    | The response headers, as an object with lower-case names. |
| `config`     | The config of the request.                                |
| `duration`   | How long the request took, in milliseconds.               |

### Config

Every option can be given per request, or as a default of the instance, except `url`, `method` and `data`, which belong to one request.

| Option                                              | Description                                                                                                                                                        |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `url`, `method`                                     | The URL, and the method (`get` by default, lower or upper case).                                                                                                   |
| `baseURL`                                           | Prepended to a relative `url`. `allowAbsoluteUrls: false` prefixes absolute URLs too.                                                                              |
| `headers`                                           | Header names are case-insensitive; `null`, `undefined` and `false` remove a header. In defaults, `common`, `get`, `post`, ... hold headers for all methods or one. |
| `params`                                            | An object or `URLSearchParams`. Arrays are `a[]=1&a[]=2`, nested objects `a[b]=1`, dates ISO text, `null` and `undefined` are skipped.                             |
| `paramsSerializer`                                  | A function `(params) => string`, or `{ serialize, encode, indexes }` (`indexes: true` gives `a[0]=1`, `null` gives `a=1&a=2`).                                     |
| `data`                                              | An object (sent as JSON), string, `FormData`, `URLSearchParams`, `Blob`, buffer or stream.                                                                         |
| `transformRequest`                                  | A function `(data, headers) => body`, or a list. The default turns objects into JSON and sets `Content-Type`.                                                      |
| `transformResponse`                                 | A function `(data, headers, status, config) => data`, or a list. The default parses JSON; text that is not JSON stays text.                                        |
| `timeout`                                           | Milliseconds before the request is aborted. `0`, the default, means none. `timeoutErrorMessage` sets the message.                                                  |
| `clarifyTimeoutError`                               | Reports a timeout as `ETIMEDOUT` instead of `ECONNABORTED`.                                                                                                        |
| `signal`                                            | An `AbortSignal` that cancels the request.                                                                                                                         |
| `responseType`                                      | `json` (default), `text`, `blob`, `arraybuffer`, `formdata` or `stream`.                                                                                           |
| `validateStatus`                                    | `(status) => boolean`. Defaults to 200 to 299. `null` accepts every status.                                                                                        |
| `auth`                                              | `{ username, password }`: a Basic `Authorization` header.                                                                                                          |
| `withCredentials`                                   | Sends cookies and credentials to other origins. Default `false`.                                                                                                   |
| `maxRedirects`                                      | `0` does not follow redirects; any other value follows them.                                                                                                       |
| `onDownloadProgress`                                | `({ loaded, total, progress }) => void`, while the body arrives. `total` and `progress` are `undefined` when the size is unknown.                                  |
| `xsrfCookieName`, `xsrfHeaderName`, `withXSRFToken` | Copies the XSRF cookie into a header for same-origin requests (or others, when `withXSRFToken` allows).                                                            |
| `retry`                                             | A number of retries, or `{ retries, delay, retryOn }`. See below.                                                                                                  |
| `redact`                                            | Names of config keys and headers to mask in `error.toJSON()`.                                                                                                      |
| `fetch`                                             | The `fetch` to use. Defaults to the global one. Handy for tests and for polyfills.                                                                                 |

**Precedence.** The library defaults come first, then `createHttp(config)` and `api.defaults`, then the config of the request; the last one wins. Headers are merged bucket by bucket, so a request can add one header without losing the defaults. Setting `api.defaults.headers.common.Authorization` sends the token to every host the instance talks to: give such an instance one `baseURL`, or set the header per request.

### Errors

A request rejects with an `HttpError` when the status fails `validateStatus`, when nothing answered, on a timeout, when it was cancelled, and for an invalid URL.

| Field / method | Description                                                                             |
| -------------- | --------------------------------------------------------------------------------------- |
| `message`      | What happened.                                                                          |
| `code`         | See the table below.                                                                    |
| `status`       | The HTTP status, when the server answered.                                              |
| `response`     | The response (with `data`, `status`, `headers`), when the server answered.              |
| `config`       | The config of the request.                                                              |
| `cause`        | The error that was wrapped, such as the `TypeError` of `fetch`.                         |
| `toJSON()`     | The message, code, status and config as plain data. Keys listed in `redact` are masked. |

| Code               | Meaning                                                        |
| ------------------ | -------------------------------------------------------------- |
| `ERR_BAD_REQUEST`  | A 4xx status.                                                  |
| `ERR_BAD_RESPONSE` | A 5xx status, or any status that `validateStatus` rejected.    |
| `ERR_NETWORK`      | No answer: the network is down, the host is unreachable, CORS. |
| `ECONNABORTED`     | The timeout ran out (`ETIMEDOUT` with `clarifyTimeoutError`).  |
| `ERR_CANCELED`     | The `signal` aborted. The error is a `CanceledError`.          |
| `ERR_INVALID_URL`  | No URL, or a malformed `http:`/`https:` URL.                   |

```ts
import { isCancel, isHttpError } from 'ecmact';

try {
  await api.get('/users/1');
} catch (error) {
  if (isCancel(error)) return;
  if (isHttpError(error)) {
    if (error.response) console.log(error.status, error.response.data);
    else console.log(error.code);
  }
}
```

### Interceptors

Request interceptors receive the config before the request is sent and run in reverse order of adding, the last added first. Response interceptors receive the response and run in the order of adding. Both take a second argument that handles errors, and an interceptor can recover by returning a value or rethrow.

```ts
api.interceptors.request.use((config) => ({
  ...config,
  headers: { ...config.headers, Authorization: `Bearer ${session.token}` },
}));

const id = api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (isHttpError(error) && error.status === 401) await session.refresh();
    throw error;
  },
);

api.interceptors.response.eject(id);
api.interceptors.request.clear();
```

- `use(fulfilled?, rejected?, { runWhen })` returns an id. `runWhen(config)` returning `false` skips a request interceptor for that request.
- `eject(id)` removes one interceptor (an unknown id does nothing) and `clear()` removes all.
- Interceptors may be asynchronous. A thrown error skips the later fulfilled handlers and goes to the next rejected one.
- A request interceptor that returns a different config replaces it entirely.

### Cancelling, timeouts and retries

```ts
const controller = new AbortController();
const pending = api.get('/slow', { signal: controller.signal });
controller.abort();

await api.get('/slow', { timeout: 3000 });
```

Cancelling uses `AbortSignal` only; there is no `CancelToken`. A request cancelled before it is sent never reaches the network. A timeout also aborts the request.

`retry` repeats a failed request. The default policy retries network failures, timeouts and 5xx statuses of idempotent methods (`get`, `head`, `options`, `put`, `delete`), never a cancellation, and waits `300 * 2 ** attempt` milliseconds. Axios has nothing like this built in.

```ts
await api.get('/flaky', { retry: 3 });
await api.post('/orders', order, {
  retry: { retries: 2, delay: 500, retryOn: (error) => error.status === 503 },
});
```

A request body that is a stream can be read once, so retrying such a request is up to you.

### With components

An async result is a signal source: `resource` is the tool that turns a request into signals, and `api` supplies the request.

```ts
import { createHttp, effect, resource, tags } from 'ecmact';

const api = createHttp({ baseURL: '/api' });

const users = resource(({ signal }) =>
  api.get<User[]>('/users', { signal }).then((response) => response.data),
);

const list = tags.ul();

effect(() => {
  list.setState({
    children: (users.data.value ?? []).map((user) => tags.li({ content: user.name })),
  });
});
```

`children` is not a reactive prop (only text items in it can be signals), so a list of components is rebuilt by an effect that calls `setState`. `resource` passes an `AbortSignal` and aborts a request that a newer one replaces, so a slow answer cannot overwrite a fresh one.

### Differences from axios

- It is built on `fetch`: there is no Node `http` adapter, `proxy`, `httpAgent`, `maxContentLength` or `maxBodyLength`, and no upload progress, because `fetch` cannot report it. Download progress is reported while the body is read.
- `CancelToken`, `axios.all` and `axios.spread` are not provided; use `AbortController` and `Promise.all`.
- `transitional` flags are not provided: JSON that cannot be parsed stays text, and a status passed to `validateStatus: undefined` uses the default.
- Added: `retry`, `clarifyTimeoutError` as an option, and `duration` on every response.

## Context

Context passes a value to every component below another one, without handing it down through props. It is built on a DOM event that bubbles through ancestors and shadow roots, so it follows the element tree, not the document.

```ts
import { computed, consume, createContext, em, provide, signal, tags } from 'ecmact';
import type { Signal } from 'ecmact';

const Theme = createContext<Signal<'light' | 'dark'>>('theme');

const theme = signal<'light' | 'dark'>('light');

const badge = tags.span({
  content: 'status',
  mounted: (_, component) => {
    const current = consume(Theme, component);
    if (current) {
      component.setState({ class: computed(() => `badge badge-${current.value}`) });
    }
  },
});

const app = em.App({
  provide: [provide(Theme, theme)],
  children: [badge],
});
```

| Function                    | Description                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------ |
| `createContext<T>(name)`    | Creates a context key. The name is for debugging; two contexts with the same name are still different. |
| `provide(context, value)`   | Pairs a context with a value. Pass a list of them in the `provide` prop.                               |
| `consume(context, element)` | Returns the value from the nearest provider above `element`, or `undefined` if there is none.          |

- `consume` is synchronous. Call it from `mounted` (or any later time), when the component is already inside the tree it belongs to.
- The nearest provider of a given context wins. A provider does not answer its own `consume` call, so a component can read an outer value and offer a new one for the same context.
- Providers only answer the contexts they were given; other requests continue to outer providers.
- A provider answers for elements inside it whether or not it is connected to a document, and always uses its current `provide` prop.
- Context carries values, not reactivity. To make consumers update, provide a signal and read it inside `computed` or an effect, as above.
- `consume` works on any element, not only components, so it can be used from plain DOM code inside a provider.

## Error handling

An error thrown in one of your callbacks would otherwise break the render that called it. Pass an error handler to keep a component working and to find out what happened.

```ts
import { configure, em } from 'ecmact';

configure({
  onError: (error, { component, phase, event }) =>
    report(error, { tag: component.localName, phase, event }),
});

const widget = em.Widget({
  onclick: () => {
    throw new Error('click failed');
  },
  error: (error, info) => console.error(info.phase, error),
});
```

The handler receives the error and an `info` object:

| Field       | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| `component` | The component the error came from.                           |
| `phase`     | Where it happened, see below.                                |
| `event`     | For the `event` phase, the lowercase event name (`'click'`). |

| Phase          | Source                                                                       |
| -------------- | ---------------------------------------------------------------------------- |
| `render`       | Rendering the component, including a throwing `ref`.                         |
| `event`        | A listener passed as an `on<event>` prop.                                    |
| `mounted`      | The `mounted` hook.                                                          |
| `cleanup`      | The cleanup function returned by `mounted`.                                  |
| `unmounted`    | The `unmounted` hook.                                                        |
| `beforeUpdate` | The `beforeUpdate` hook. A failed `beforeUpdate` does not cancel the update. |
| `updated`      | The `updated` hook.                                                          |

- The `error` prop of a component wins over `configure({ onError })`.
- With no handler at all, errors are rethrown, exactly as if there were no error handling. Nothing is swallowed silently.
- If the handler throws, that error propagates.
- A handled error does not stop later steps: for example `unmounted` still runs after a failing cleanup.
- Only synchronous errors are caught. A rejected promise from an `async` handler is not seen, handle it inside the handler.
- Errors in effects you create yourself are not component errors: they surface from the signal write that triggered them, as described in [Signals](#signals).

## Routing

`createRouter` maps URLs to views using the History API. The current location is a signal, so everything built on signals (components, effects, `computed`) can follow it. The router is part of the main package and tree-shakeable: it is not included in your bundle unless you import it.

```ts
import { createRouter, mount, tags } from 'ecmact';

const router = createRouter({
  routes: [
    { path: '/', view: () => tags.h1({ content: 'Home' }) },
    { path: '/users/:id', view: ({ params }) => tags.h1({ content: `User ${params.id}` }) },
    { path: '/files/*', view: ({ params }) => tags.p({ content: `File ${params['*']}` }) },
  ],
  notFound: () => tags.h1({ content: 'Not found' }),
});

mount(
  '#app',
  tags.nav({
    children: [
      router.link({ to: '/', content: 'Home' }),
      router.link({ to: '/users/1', content: 'User 1' }),
    ],
  }),
  router.outlet(),
);
```

### Routes

Each route has a `path` and a `view`. The first route that matches the current path wins, so put specific routes before general ones.

| Pattern      | Matches                                         | `params`             |
| ------------ | ----------------------------------------------- | -------------------- |
| `/`          | The root                                        | `{}`                 |
| `/about`     | `/about` and `/about/`                          | `{}`                 |
| `/users/:id` | `/users/42`, one segment per parameter, decoded | `{ id: '42' }`       |
| `/files/*`   | `/files` and everything below it                | `{ '*': 'a/b.txt' }` |
| `*`          | Any path, useful as a catch-all                 | `{ '*': 'a/b' }`     |

A `view` receives a context and returns a node (any DOM node, usually a component) or a promise of one:

| Field    | Description                                    |
| -------- | ---------------------------------------------- |
| `path`   | The current path, without the base.            |
| `params` | The parameters of the matched pattern.         |
| `query`  | A `URLSearchParams` for the query string.      |
| `hash`   | The hash, including `#`, or an empty string.   |
| `router` | The router, for navigating from inside a view. |

A view that returns a promise is rendered when it resolves, which is how code splitting works:

```ts
{ path: '/settings', view: async () => (await import('./settings')).settingsView() }
```

If the route changes before the promise resolves, the late result is dropped. The outlet stays empty while a view is pending.

### Nested routes

A route with `children` is a layout. Its `path` is a prefix, the paths of the children are relative to it, and the layout never matches alone: use a child with an empty path as the index. The layout's `view` places the child with `router.outlet()`:

```ts
const router = createRouter({
  routes: [
    {
      path: '/users',
      view: () => tags.section({ children: [tags.h1({ content: 'Users' }), router.outlet()] }),
      children: [
        { path: '', view: () => tags.p({ content: 'Pick a user' }) },
        { path: ':id', view: ({ params }) => tags.p({ content: `User ${params.id}` }) },
      ],
    },
  ],
});
```

- An outlet renders the route at its own depth: the outermost one the layout, the one inside the layout its child. Depth comes from the component tree, through [context](#context), so layouts can nest as deep as needed.
- A layout is kept while only its child changes. It is rebuilt when the route outside it changes, or when a parameter in its own part of the path does (`/teams/:team` for a layout at `/teams/:team`).
- `router.match.value` has `route` (the innermost route), `routes` (the whole chain, outermost first) and the `params` of the whole path.
- `notFound` is shown by the outermost outlet when nothing matches.

### Guards

A guard runs before a navigation commits. It receives where the navigation goes (`path`, `query`, `hash`, `params`, `router`) and where it comes from, and returns:

| Result                 | Effect                                               |
| ---------------------- | ---------------------------------------------------- |
| `true` or nothing      | Carry on.                                            |
| `false`                | Cancel. The location does not change.                |
| a path or URL string   | Redirect there instead, replacing the history entry. |
| a promise of the above | The navigation waits for it.                         |

```ts
const router = createRouter({
  beforeEach: (to) => (to.path.startsWith('/admin') && !session.value ? '/login' : true),
  routes: [
    { path: '/admin', view: adminView, beforeEnter: async () => (await can('admin')) || '/' },
    { path: '/login', view: loginView },
  ],
});

if (await router.navigate('/admin')) console.log('navigated');
```

- `beforeEach` runs first, then the `beforeEnter` of every route in the matched chain, outermost first. The first guard that cancels or redirects ends the chain.
- Without async guards the location is already updated when `navigate` returns. With one, it changes when the promise settles; a newer navigation drops an older one that is still waiting.
- Guards also run for the first location of the page. A redirect from there is followed; a cancel is ignored, because there is nowhere to go back to. An async guard on the first location lets the first view render before it settles.
- On back and forward the browser has already changed the URL. A guard that cancels puts the previous URL back with `replaceState`; one that redirects replaces the entry.
- More than ten redirects in a row throw an error.
- Guards are a user-interface convenience, not security: the client can always bypass them. Check permissions on the server.

### Outlet

`router.outlet()` returns a component that renders the view of the current route and swaps it on navigation. You can pass component props such as `class` or `style` (not `children` or `mounted`). Several outlets can exist at once; each follows the router while it is in the document and stops when it is removed.

- The view is rebuilt when the path or the query string changes. A change of the hash alone (`#section`) does not re-render it.
- A new instance of the view is created on every navigation. Keep state that must survive navigation in signals outside the view.
- Without a matching route and without `notFound`, the outlet is empty.
- Reading signals inside a view does not make the outlet re-render; use them in props like anywhere else.

### Links

`router.link(props)` returns an `<a>` component. It takes the usual anchor props plus `to` (and `replace`):

```ts
router.link({ to: '/users/1?tab=posts', content: 'Profile', class: 'nav-link' });
```

- `href` is set, so middle click, copy link and open-in-new-tab work.
- A plain left click navigates without a page load. Clicks with Ctrl, Cmd or Shift, middle or right buttons, links with a `target` other than `_self`, `download` links and links to other origins are left to the browser.
- A custom `onclick` runs first; if it calls `preventDefault`, the router does not navigate.
- The link gets `aria-current="page"` while its path is the current path, and loses it when you navigate away.

### Navigating and reading the location

```ts
router.navigate('/users/2');
router.navigate('/login', { replace: true });
router.navigate('/next', { scroll: false });
router.back();
router.forward();

effect(() => console.log(router.location.value.path));
router.match.value?.params;
```

| Member                   | Description                                                                                                                                                                                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `navigate(to, options?)` | Runs the guards, then pushes a history entry. Returns a promise of whether the navigation happened. `replace` replaces the entry (the same url always replaces). `scroll: false` skips scrolling to the top. A url on another origin is handed to the browser. |
| `back()` / `forward()`   | History navigation.                                                                                                                                                                                                                                            |
| `location`               | Signal with `{ path, query, hash }`. Updates on `navigate` and on back/forward.                                                                                                                                                                                |
| `match`                  | Signal with the matched `{ route, params }`, or `undefined`.                                                                                                                                                                                                   |
| `link(props)`            | Creates a link component.                                                                                                                                                                                                                                      |
| `outlet(props?)`         | Creates an outlet component.                                                                                                                                                                                                                                   |
| `dispose()`              | Removes the `popstate` listener.                                                                                                                                                                                                                               |

### Base path

If the app is served from a sub-path, pass `base`. Paths in routes, links and `navigate` stay relative to it, and the base is added to the real URLs:

```ts
const router = createRouter({ base: '/app', routes: [{ path: '/', view: home }] });
router.navigate('/users/1');
```

The URL becomes `/app/users/1` and `location.value.path` is `/users/1`.

### Notes

- Only history mode is supported. The server must answer unknown paths with `index.html`, which is the default of Vite's dev server and of most static hosts that offer an SPA fallback.
- There are no transitions and no scroll restoration.
- Create one router per application; the router listens to the window's `popstate` until `dispose()`.

## Data fetching

`resource` runs an async function and exposes the result as signals. It is built for `fetch` but works with anything that returns a promise, including an HTTP client of your choice. ECMact does not bundle one: it would add a dependency to a library that has none, and `fetch` with `AbortController` covers what most apps need.

```ts
import { computed, resource, signal, tags } from 'ecmact';

const id = signal(1);

const user = resource(({ signal: abort }) =>
  fetch(`/api/users/${id.value}`, { signal: abort }).then(
    (response) => response.json() as Promise<{ name: string }>,
  ),
);

const card = tags.div({
  content: computed(() => {
    if (user.loading.value) return 'Loading...';
    if (user.error.value) return 'Failed to load';
    return user.data.value?.name ?? '';
  }),
});

id.value = 2;
```

The fetcher runs immediately and receives `{ signal }`, an `AbortSignal` for that request.

| Member          | Description                                                                            |
| --------------- | -------------------------------------------------------------------------------------- |
| `data`          | Signal with the latest result, or `undefined` (or `options.initial`) before the first. |
| `error`         | Signal with the reason of the latest failure, `undefined` otherwise.                   |
| `loading`       | Signal that is `true` while a request is in flight.                                    |
| `refetch()`     | Runs the fetcher again.                                                                |
| `mutate(value)` | Sets `data` by hand (for example after an optimistic update) and clears `error`.       |
| `dispose()`     | Stops reacting, aborts the request in flight and ignores late results.                 |

How it behaves:

- **It tracks the signals the fetcher reads** before its first `await`, like an effect. When `id.value` changes, the previous request is aborted and a new one starts.
- **Only the latest request counts.** A slow response to an older request is ignored, whether it resolves or fails, so results cannot arrive out of order.
- **Data survives reloading.** While a new request is loading, `data` keeps the previous result and `error` is cleared, which avoids flashing empty states.
- **Errors are values.** A rejection (or a synchronous throw) lands in `error` and does not throw.
- **Read dependencies before awaiting.** Signals read after an `await` are not tracked. Read them first: `const value = id.value; await ...`.
- `refetch()` does not subscribe the code that calls it to anything.

Tie a resource to a component with `mounted`, so it stops when the component leaves the document:

```ts
const profile = tags.section({
  mounted: (_, component) => {
    const user = resource(() =>
      fetch('/api/me').then((response) => response.json() as Promise<{ name: string }>),
    );
    const stop = effect(() =>
      component.setState({ content: user.data.value?.name ?? 'Loading...' }),
    );
    return () => {
      stop();
      user.dispose();
    };
  },
});
```

## Mounting

```ts
mount(target, ...nodes);
```

| Argument | Type                | Description                             |
| -------- | ------------------- | --------------------------------------- |
| `target` | `string \| Element` | CSS selector or element to append into. |
| `nodes`  | `Node[]`            | Components or any other DOM nodes.      |

Returns the container. Throws `Error: ecmact: mount target "<selector>" not found` if the selector matches nothing, so a typo in a selector fails loudly instead of rendering nothing.

```ts
mount('#app', header, content, footer);
mount(document.body, toast);
```

`mount` is a thin wrapper over `Element.append`; you can always use the DOM directly.

## Embedding as a widget

Live: the [widget demo](https://eternalvision.github.io/ecmact/widget/) and a [page that is not ours](https://eternalvision.github.io/ecmact/widget/embed.html), which loads the built script with one script tag and keeps its own fonts and colors.

`defineWidget` registers a custom element that renders an ECMact component tree. The page that embeds it needs no framework and no build step: a script tag and the element are enough.

```ts
import { computed, defineWidget, signal, tags } from 'ecmact';

defineWidget(
  'price-widget',
  ({ props, emit }) => {
    const quantity = signal(1);
    const total = computed(() => Number(props.price.value ?? 0) * quantity.value);
    return tags.button({
      content: computed(() => `Add ${quantity.value} for ${total.value}`),
      onclick: () => emit('add', { quantity: quantity.value, total: total.value }),
    });
  },
  { attributes: ['price'] },
);
```

```html
<script src="https://example.com/price-widget.js"></script>
<price-widget price="49"></price-widget>

<script>
  document.addEventListener('add', (event) => console.log(event.detail));
</script>
```

`defineWidget(name, render, options?)` takes the tag name (it must contain a hyphen), a `render` function and the options. `render` runs once, when the element is first connected, and returns the node to show.

| `render` argument     | Description                                                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `host`                | The custom element itself.                                                                                                       |
| `props`               | The observed attributes as signals: the attribute value, or `null` while it is absent.                                           |
| `emit(type, detail?)` | Dispatches a `CustomEvent` on the host that bubbles and crosses the shadow boundary. Returns `false` if a listener cancelled it. |

| Option       | Description                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| `attributes` | The attributes to follow. `setAttribute` and `removeAttribute` on the page update the matching signal. |
| `shadow`     | Render into a Shadow DOM. Defaults to `true`.                                                          |

- **Settings go in as attributes**, and attributes are strings. Convert them in a `computed` (`Number(props.price.value)`) and keep the defaults for the missing ones there.
- **Results come out as events.** A listener on the host, on `document` or anywhere in between hears them, because they are composed.
- **The look is set from outside with CSS custom properties.** Custom properties inherit into a Shadow DOM, so a widget that reads `var(--widget-accent, #1665e0)` can be themed by the page with `price-widget { --widget-accent: red }`, while the rest of the page's CSS stays out.
- **Styles are isolated both ways.** For one stylesheet covering the whole widget, return a fragment with a `<style>` element and render the inner components with `shadow: false`, so they sit in the widget's shadow root and the stylesheet reaches them.
- **One definition per name.** Defining a name twice throws. Define the widget once, in the script that the pages load.
- **Widgets can be nested in any page and used any number of times.** Each instance has its own signals.

### Building the script

The script that pages load is an IIFE bundle of your widget with ECMact inside. With Vite it is a library build:

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/widget.ts',
      formats: ['iife'],
      name: 'PriceWidget',
      fileName: () => 'price-widget.js',
    },
  },
});
```

`npm create ecmact@latest my-widget -- --template widget` sets all of this up: a working widget, a demo page, tests, the IIFE build and the same Prettier and ESLint configuration as the app template.

## Composition

Components are values. Compose them with ordinary functions:

```ts
import { em, mount } from 'ecmact';

const Item = (label: string, onRemove: () => void) =>
  em.Item({
    tag: 'li',
    style: { display: 'flex', gap: '8px' },
    children: [
      em.Label({ tag: 'span', content: label }),
      em.Remove({ tag: 'button', content: 'x', onclick: onRemove }),
    ],
  });

const List = (items: string[]) => {
  const list = em.List({ tag: 'ul' });
  const render = () =>
    list.setState({
      children: items.map((label, index) =>
        Item(label, () => {
          items.splice(index, 1);
          render();
        }),
      ),
    });
  render();
  return list;
};

mount('#app', List(['one', 'two', 'three']));
```

Children are reconciled on every update. Create child components inside the render step (as above) when they depend on state and give them a `key` to keep their state across updates (see [Lists and keys](#lists-and-keys)), or keep references and update them with `setState` individually.

## TypeScript

The package ships its own declarations. Props are typed by the inner tag, which is inferred from the `tag` prop (and defaults to `'div'`).

```ts
const link = em.Link({ tag: 'a', href: '/docs', target: '_blank' });

em.Link({ tag: 'a', src: 'x.png' });
em.Field({ tag: 'input', type: 'bogus' });
em.Card({ onclik: () => {} });
```

The last three calls are compile errors: `src` is not an attribute of `a`, `'bogus'` is not an input type, and `onclik` is not an event.

What is typed:

- **Return type.** `em.X({ tag: 'a' })` is `Component<'a'>`; `setState` accepts `Partial<ComponentProps<'a'>>`.
- **Attributes by tag.** Global attributes (`id`, `class`, `title`, `lang`, `dir`, `hidden`, `inert`, `tabindex`, `role`, `slot`, `part`, `exportparts`, `accesskey`, `translate`, `spellcheck`, `draggable`, `contenteditable`, `inputmode`, `enterkeyhint`, `autocapitalize`, `autofocus`, `nonce`, `popover`, `is`, and the microdata attributes `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`) plus `data-*` and `aria-*` apply to every tag. Tag-specific attributes are defined for: `a`, `area`, `map`, `base`, `embed`, `object`, `style`, `template`, `img`, `input`, `button`, `form`, `label`, `select`, `option`, `optgroup`, `textarea`, `fieldset`, `output`, `progress`, `meter`, `link`, `script`, `iframe`, `video`, `audio`, `source`, `track`, `canvas`, `td`, `th`, `col`, `colgroup`, `ol`, `li`, `details`, `dialog`, `blockquote`, `q`, `time`, `slot`, `data`, `del`, `ins`. Other standard tags accept the global attributes only. If a valid attribute is missing from a tag, add it to `AttributeMap` in `src/types/attributes.ts`.
- **Custom tags.** A tag that is not a standard HTML tag (for example `'x-widget'`, or a plain `string`) accepts any attribute.
- **Events.** `on<event>` props are typed from `HTMLElementEventMap`; the handler receives the right event type. Unknown `on*` names are errors on standard tags and allowed on custom tags.
- **Styles.** `style` accepts the string-valued properties of `CSSStyleDeclaration`, with `string | number` values.
- **`ref` and lifecycle hooks.** The element type follows the tag: `HTMLInputElement` for `'input'`, `HTMLElement` for custom tags. `shadow` is a `boolean`.

Attribute value types follow HTML semantics: booleans for boolean attributes, numbers for numeric ones, string unions for enumerated ones.

When the tag is not known at compile time, widen it to `string`; props then become permissive and `setState({ tag })` accepts any tag:

```ts
const dynamic = em.Dynamic({ tag: tagName as string, content: 'x' });
dynamic.setState({ tag: 'section' });
```

`em` is a Proxy with arbitrary names, so its properties are typed through an index signature. If your project enables `noUncheckedIndexedAccess`, TypeScript types `em.Card` as possibly `undefined`. `tags` does not have this problem (its properties are known), so prefer it there, or assert the factory: `em.Card!({ ... })`.

Exported types:

```ts
import type {
  Component,
  ComponentProps,
  ResolvedProps,
  Child,
  AttributeMap,
  GlobalAttributes,
  TagName,
} from 'ecmact';
```

## Security model

- `content` is inserted as a text node; markup in it is inert.
- Attribute values and style values are set through `setAttribute` and the CSSOM, never concatenated into HTML, so they cannot inject markup or break out of an attribute or a `<style>` block.
- `on*` props only accept functions; strings are ignored, so attribute-style handlers such as `onclick="..."` are never created.
- `html` is the one raw-HTML entry point. It uses `innerHTML` and does not sanitize. Pass only markup you control, or sanitize it first (for example with DOMPurify).
- `tag` is passed to `document.createElement`; it cannot inject markup. It should still not come from untrusted input, since it decides which element is created (for example `script` or `iframe`).
- Attributes that carry URLs (`href`, `src`, `action`) are set as given. `javascript:` URLs are not filtered; validate user-supplied URLs.

## Server-side rendering

Importing `ecmact` is safe without a DOM (Node, SSR bundlers, tooling): no browser globals are touched at import time. Creating components requires `document` and `customElements`, so call `em.*` and `mount` only in the browser, or in a DOM environment such as happy-dom or jsdom. There is no server-side serialization of components.

## Browser support

Any evergreen browser with Custom Elements v1 and Shadow DOM. The published code is not transpiled below Vite's default build target (Baseline widely available, fixed to 2026-01-01 for Vite 8), so it uses modern syntax such as class fields and private `#fields`. Constructable stylesheets are used for `css` and shared styles when the browser has them, with a `<style>` element fallback. No polyfills are included.

## Limitations

- **Attributes, with four exceptions.** Props map to attributes, except `value`, `checked`, `selected` and `indeterminate`, which are also written as DOM properties (see [Form controls](#form-controls)). A property is written when its prop changes, not on every update.
- **Shadow DOM by default.** Global CSS does not apply inside components, and form controls inside a Shadow DOM do not take part in an outer `<form>`'s submission or validation unless the component sets `field: true` (see [Fields inside a form](#fields-inside-a-form)). Label/`for` and `id` references do not cross the shadow boundary. Use `shadow: false` where that matters. The choice is made on the first render and cannot be changed afterwards.
- **One inner element.** A component renders a single element. Compose several components for more complex structures.
- **Children are not a reactive prop.** The list is rebuilt in an effect (see [Signals and lifecycle](#signals-and-lifecycle)); text items in it can be signals. Keyed reconciliation matches components by `key` and name, it does not diff plain elements and it is not tuned for lists of thousands of items (see [Performance of large lists](#performance-of-large-lists)).
- **Minimal lifecycle.** There are `mounted`, `unmounted`, `beforeUpdate` and `updated` hooks. State is whatever signals or objects you keep; there is no built-in store or message catalog (see [Recipes](#recipes)). Routing and data fetching are small and optional (see [Routing](#routing) and [Data fetching](#data-fetching)).
- **Listener options are `capture` and `passive`.** There is no `once`, because listeners are re-attached on every update. Other options require a `ref`.
- **Configuration is read at render time.** `configure` does not update components that are already rendered.

## Migrating from 1.x

2.0.0 fixes the package entry points (1.x published `exports` that pointed to missing files) and closes several injection paths. Breaking changes:

| 1.x                                                              | 2.x                                                        |
| ---------------------------------------------------------------- | ---------------------------------------------------------- |
| `content` was inserted as HTML                                   | `content` is text; use `html` for trusted markup           |
| Attribute and style values were concatenated into an HTML string | Set through DOM APIs                                       |
| `mount` silently did nothing for a missing selector              | `mount` throws                                             |
| `mount` accepted a selector only                                 | accepts a selector or an `Element`, returns the container  |
| `slots` and `customEvents` props (not implemented)               | removed                                                    |
| `ref` was declared but never called                              | `ref` is called when the inner element is created          |
| `em.then` / symbols registered elements or threw                 | return `undefined`; invalid names throw `TypeError`        |
| Every `setState` rebuilt the whole shadow tree                   | in-place update, element reused while `tag` is unchanged   |
| Children were rendered through a `<slot>`                        | children are appended to the inner element                 |
| Props were loosely typed                                         | attributes, events, styles and `ref` typed by tag          |
| `dist/es/index.js`, `dist/cjs/index.js`                          | `dist/index.js`, `dist/index.cjs`, declarations in `dist/` |

## Development

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Contributing needs Node 22.22.2 or newer (the JSDoc lint plugin, Vite 8 and Vitest 5). The published package itself has no Node requirement.

### Repository layout

The repository is an npm workspace. The library is the root package; tools live under `packages/`:

| Path                      | Package         | What it is                                                                                                      |
| ------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------- |
| `.` (`src/`, `tests/`)    | `ecmact`        | The library                                                                                                     |
| `packages/create-ecmact/` | `create-ecmact` | The `npm create ecmact` scaffolder and its template                                                             |
| `packages/site/`          | `ecmact-site`   | The public website: documentation and live demos, written with ECMact itself. Private, deployed to GitHub Pages |

Every package follows the same rules: aliases, tests that mirror `src/`, 100% coverage.

### Imports

Inside `src/` and `tests/` (of every package), import through aliases instead of relative paths:

| Alias            | Resolves to                         | Example                                                                       |
| ---------------- | ----------------------------------- | ----------------------------------------------------------------------------- |
| `@em`            | `src/index.ts`                      | `import { em } from '@em';`                                                   |
| `@em/<path>`     | `src/<path>`                        | `import { render } from '@em/render/render';`                                 |
| `@tests/<path>`  | `tests/<path>`                      | `import { inner } from '@tests/helpers';`                                     |
| `@create/<path>` | `packages/create-ecmact/src/<path>` | `import { run } from '@create/index';` (only inside `packages/create-ecmact`) |

- The aliases are defined once per package, in `compilerOptions.paths` of its `tsconfig.json`. Vite and Vitest read them from there (`resolve.tsconfigPaths`), so there is nothing to keep in sync.
- ESLint (`no-restricted-imports`) rejects `./` and `../` imports in `src/` and `tests/`, so new files follow the rule automatically.
- The build does not leak aliases: the JavaScript is bundled, and the declaration plugin rewrites `@em/...` to relative paths in the published `.d.ts` files.

| Script                   | Description                                                                      |
| ------------------------ | -------------------------------------------------------------------------------- |
| `npm run build`          | Vite library build: ES, CJS and `.d.ts` into `dist/`                             |
| `npm run build:all`      | The library and every package in `packages/`                                     |
| `npm test`               | Structure check, then Vitest with V8 coverage, for the library and every package |
| `npm run test:structure` | Checks that `tests/` mirrors `src/`                                              |
| `npm run test:template`  | Generates both variants of the starter and checks them                           |
| `npm run typecheck`      | `tsc --noEmit` for the library and every package                                 |
| `npm run lint`           | ESLint (flat config, typescript-eslint, prettier)                                |
| `npm run lint:fix`       | ESLint with autofix                                                              |
| `npm run format`         | Prettier write                                                                   |
| `npm run format:check`   | Prettier check                                                                   |

### Documentation comments

Every function, interface, type alias and interface member in `src/` of every package has a JSDoc comment. For functions it is: a description, then `@param` and `@returns` where they apply (and `@template`, `@throws` and `@example` where useful). That covers declarations, arrow functions assigned to constants, class methods, getters and setters, and functions that are properties of an object. Inline callbacks (the function in `.map(...)`) are not documented. Interfaces and type aliases get a description, and so do their members (`Config.shadow`, `Router.navigate`, `ResourceOptions.initial`). Inside `AttributeMap` the tag entries and the global attributes are documented; the HTML attributes nested inside a tag entry are not, because their names are the standard HTML ones. Apart from JSDoc, the code has no comments.

```ts
/**
 * Merges two JSON objects deeply. Values of the overlay win; arrays and primitives are replaced.
 *
 * @param base - The object to start from.
 * @param overlay - The object whose values win.
 * @returns A new merged object.
 */
export const mergeJson = (base: Json, overlay: Json): Json => {
```

- It is enforced: `eslint-plugin-jsdoc` (`jsdoc/require-jsdoc`, `require-param`, `require-returns` and the rest of its recommended TypeScript rules) fails `npm run lint` for a function, interface, type alias or interface member without a proper comment. Types are never repeated in the comment, TypeScript has them.
- The comments end up in the published `.d.ts` files, so editors show them when you hover over `signal`, `createRouter` and the rest of the API. They are stripped from the JavaScript bundles (annotations such as `/* @__PURE__ */` stay), so they do not add to the code size.
- Tests and the generated template are not linted for this, but the template's `createCounter` has one as an example.

### Test rules

- **`tests/` mirrors `src/`, one test file per source file.** `src/render/render.ts` is tested by `tests/render/render.test.ts`, `src/signals/signals.ts` by `tests/signals/signals.test.ts`, and so on, including `index.ts` files and files that contain only types (their tests are type-level, checked by `npm run typecheck`).
- **100% coverage** of statements, branches, functions and lines. The run fails if coverage drops.
- Both are enforced: `npm test` first runs `npm run test:structure`, which fails on a source file without a test and on a test without a source file. Adding a file to `src/` means adding its test in the same change.
- Shared test helpers live in `tests/helpers.ts`; it is not a test file and is not mirrored.

Source layout of the library:

```
src/
  index.ts                public exports
  core/
    em.ts                 Proxy factory and custom element registration
    tags.ts               tag factories
    component.ts          custom element class: props, signals, hooks, context, errors
    config.ts             configure() and its defaults
    context.ts            createContext, provide, consume
  signals/signals.ts      signal, computed, effect, batch, untracked
  render/                 filling the inner element
    render.ts             creates or reuses the inner element and fills it
    reconcileChildren.ts  text, keyed components and minimal moves
    syncAttributes.ts     attribute diffing
    syncProperties.ts     value, checked, selected and indeterminate as properties
    applyStyle.ts         style diffing through the CSSOM
    applyStyleSheets.ts   css prop and shared stylesheets
    setEventListeners.ts  listener diffing, error reporting
  props/
    resolveProps.ts       unwraps signals in props
    propsEqual.ts         compares resolved props
  forms/formControl.ts    value, validity and reset of a control, for form fields
  router/
    match.ts              path patterns
    flatten.ts            nested routes turned into a flat list
    guards.ts             runs beforeEach and beforeEnter guards
    router.ts             createRouter: location, outlet, link, navigate
  data/resource.ts        async data as signals
  store/
    store.ts              createStore
    shallow.ts            shallow comparison
    combine.ts            initial values plus actions
    persist.ts            persist, createJSONStorage
    devtools.ts           Redux DevTools connection
  http/
    http.ts               createHttp: shortcuts, defaults, interceptors
    dispatch.ts           the request itself, on fetch
    config.ts             library defaults and merging
    headers.ts            headers: merging, case-insensitive building
    url.ts                base URL and query string
    body.ts               request and response bodies, form data, progress
    interceptors.ts       the list of interceptors
    retry.ts              retrying failed requests
    error.ts              HttpError, CanceledError
    types.ts              config and response types
  styled/
    styled.ts             styled: components from tagged templates
    template.ts           css and keyframes, joining templates
    theme.ts              ThemeProvider, useTheme
  widget/widget.ts        defineWidget: custom elements for embedding
  types/                  ComponentProps, attribute tables, render state
  utils/
    mount.ts              mount helper
    registry.ts           which nodes are components
    warn.ts               development warnings
tests/                    mirrors src/, plus helpers.ts
scripts/check-tests.mjs   checks that tests mirror src in every package
scripts/benchmark.mjs     list benchmark in Chromium (npm run bench, needs playwright)
packages/create-ecmact/
  src/
    index.ts              run: the questions and the flow
    cli/                  args, prompts
    project/              scaffold, files, json, name
    system/               package manager detection
  template/base/          the generated project
  template/tailwind/      files and dependencies added by --tailwind
  template/widget/        the widget template: files added to the base, and the ones it removes (_remove)
  tests/                  mirrors src/
```

## Release

Releases are published from CI with npm trusted publishing and provenance. Each package has its own tag and its own workflow, and each workflow first checks that the tag matches the version in `package.json`.

| Package         | Tag pattern            | Workflow             |
| --------------- | ---------------------- | -------------------- |
| `ecmact`        | `v2.6.1`               | `release.yml`        |
| `create-ecmact` | `create-ecmact-v0.3.0` | `release-create.yml` |

```bash
npm version <patch|minor|major> --no-git-tag-version
git commit -am "bump version to <version>"
git push
git tag v<version>
git push origin v<version>
```

For `create-ecmact`, bump `packages/create-ecmact/package.json` and push the tag `create-ecmact-v<version>`. The scaffolder pins the `ecmact` dependency of generated projects to the version of the root package at the time it is built, so release `ecmact` first.

Each package needs a trusted publisher on npmjs.com (repository `eternalvision/ecmact`, and the workflow name from the table) before its first release. The CI workflow runs the full check (format, lint, typecheck, tests with coverage, build, production audit) on every push to `main` and on pull requests.

## License

MIT
