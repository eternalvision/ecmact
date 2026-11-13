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

Build embeddable widgets in plain TypeScript: isolated styles, typed attributes, one script tag. No dependencies, no compiler.

ECMact is a small library for reactive interfaces on the DOM. You build the page from function calls that return real DOM elements, and signals keep those elements up to date. There is no virtual DOM, no template language and no build step that the library depends on. The [website](https://eternalvision.github.io/ecmact/) has the same documentation, in English and Russian, with live examples.

- Zero runtime dependencies
- `tags.button(...)` returns a real `<button>`, with no wrapper around it
- Text, attributes and styles are written through DOM APIs, never through `innerHTML` (unless you ask for it)
- Signals, computed values and effects; a child or a prop that reads a signal updates only that text, attribute or style
- Components (`em`): custom elements with an open Shadow DOM, their own stylesheet and lifecycle hooks
- Keyed lists, two-way binding for form controls, context and error handlers
- Styled components: CSS in tagged templates, with props, signals, themes and animations
- A store with persistence and Redux DevTools, an axios-style HTTP client on `fetch`, async resources and a router, all built in and tree-shakeable
- Full TypeScript support, with attributes, events, styles and `ref` typed per HTML tag
- ES and CommonJS builds, bundled type declarations, `sideEffects: false`

## What it is for

ECMact fits best where an interface has to live inside something else: a page you do not control, an existing application, a browser extension. Elements are real DOM elements, components and widgets are custom elements with an isolated Shadow DOM, there are no runtime dependencies, and nothing needs a framework on the host page.

| Task                            | How ECMact is used                                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| Widgets for other sites         | Price calculators, request forms, service pickers and small configurators dropped into any page.   |
| Interactive blocks in a CMS     | Extra functionality for Webflow, WordPress or any existing site, without a build step on its side. |
| Browser utilities               | File converters, JSON editors, document generators, data viewers.                                  |
| Internal tools                  | Small admin panels, service monitors, API front ends, working dashboards.                          |
| Browser extensions              | Popups, options pages, side panels and interfaces on top of a page.                                |
| Modules of an older application | New screens or components added one at a time, without rewriting the whole project.                |

Widgets come first. Shadow DOM keeps the styles of a widget apart from the styles of the host page, and the router, resources, signals and context cover the logic of a small self-contained app. A widget talks to the page with ordinary DOM events.

### When it is not the right tool

ECMact is young, and a large application would have to build part of the infrastructure itself.

- **No server-side rendering or hydration.** If the server has to deliver ready content for search engines or first paint, use something else (see [Server-side rendering](#server-side-rendering)).
- **A small router.** Nested routes and guards exist, but there is no route-level data loading, transitions or scroll restoration (see [Routing](#routing)).
- **No virtualization.** Every item of a list is a real node. For long lists, paginate or render only the rows in view (see [Large lists](#large-lists)).
- **Shadow DOM needs care with forms.** `field: true` connects a control inside a component to the form around it. Labels with `for` and `id` and the stylesheets of the page still do not cross the boundary. Plain elements and `shadow: false` have no such problem.

See [Limitations](#limitations) for the full list.

## Compared with other libraries

The same widget, a custom element with a Shadow DOM, one style rule and a button that counts its clicks and follows an attribute, was written in four libraries and built with Vite as one minified script with the library inside. All four behave the same in a browser.

| Library                                      | Minified, kB | gzip, kB | brotli, kB |
| -------------------------------------------- | ------------ | -------- | ---------- |
| `vanjs-core` 1.6.2                           | 2.7          | 1.3      | 1.2        |
| `ecmact` 3.0.0                               | 9.8          | 4.2      | 3.7        |
| `solid-js` 1.9.19 with `solid-element` 1.9.2 | 14.2         | 5.3      | 4.8        |
| `lit` 3.3.3                                  | 14.8         | 5.7      | 5.2        |

Measured in November 2026. The numbers are for this small widget, not for the libraries as a whole. `npm run size` measures ECMact again; the four sources are on the [comparison page](https://eternalvision.github.io/ecmact/docs/comparison) of the website.

- **VanJS** is the smallest: pick it when size matters most and the widget is small. It has no layer for custom elements, so the class, the shadow root, the observed attributes and the stylesheet are written by hand.
- **Lit** is the closest in purpose: pick it for a set of components that many teams share. Markup is a template string in a class; ECMact uses function calls with props typed per tag, and has a store, an HTTP client and a router in the same package.
- **Solid** has a compiler for JSX and, with SolidStart, server-side rendering: pick it for an application. ECMact needs no compiler, and a widget with its attributes, styles and events is one call.

## Stability

Version 3.0 is the baseline. Within 3.x nothing that this document describes is removed or changes its behaviour: code written for 3.0 keeps working on every later 3.x release. New features come in minor versions and fixes in patch versions.

## Table of contents

- [What it is for](#what-it-is-for)
- [Compared with other libraries](#compared-with-other-libraries)
- [Stability](#stability)
- [Quick start](#quick-start)
- [Install](#install)
- [First elements](#first-elements)
- [Elements](#elements)
  - [Children](#children)
  - [Props](#props)
  - [Attributes](#attributes)
  - [Reactive props](#reactive-props)
  - [Classes](#classes)
  - [Inline styles](#inline-styles)
  - [Events](#events)
  - [Refs](#refs)
  - [Custom tags](#custom-tags)
- [Form controls](#form-controls)
- [Components](#components)
  - [Names](#names)
  - [The css of a component](#the-css-of-a-component)
  - [Shared stylesheets](#shared-stylesheets)
  - [Tailwind CSS](#tailwind-css)
  - [Light DOM](#light-dom)
  - [Lifecycle](#lifecycle)
  - [Fields inside a form](#fields-inside-a-form)
- [Lists](#lists)
  - [Large lists](#large-lists)
- [Mounting](#mounting)
- [Signals](#signals)
- [Context](#context)
- [Error handling](#error-handling)
- [State management](#state-management)
- [HTTP client](#http-client)
- [Data fetching](#data-fetching)
- [Routing](#routing)
- [Styled components](#styled-components)
- [Embedding as a widget](#embedding-as-a-widget)
- [Global configuration](#global-configuration)
- [Warnings](#warnings)
- [TypeScript](#typescript)
- [Security model](#security-model)
- [Server-side rendering](#server-side-rendering)
- [Browser support](#browser-support)
- [Limitations](#limitations)
- [Migrating from 2.x](#migrating-from-2x)
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

There are two templates: an `app` (the default, [live starter](https://eternalvision.github.io/ecmact/starter/)) and a `widget` ([live demo](https://eternalvision.github.io/ecmact/widget/)), an embeddable custom element, see [Embedding as a widget](#embedding-as-a-widget):

```bash
npm create ecmact@latest my-widget -- --template widget
```

### What you get

A [Vite](https://vite.dev) project in TypeScript with a small welcome page, like the starters of Vite, React and Next.js: the ECMact logo, a hint about where to start, a counter built from a signal and a few links. It follows the colors of the logo, in the dark scheme or the light one, depending on the system.

- **Few files.** `src/app.ts` is the page, `src/components/` holds the logo and the counter (a function that returns a component, with a signal that drives the label of its button), `src/setup.ts` shares a reset stylesheet with every component, `src/main.ts` mounts the app.
- **A test.** The counter has a Vitest test (happy-dom), so `npm test` has something to run.
- **Prettier and ESLint, configured in detail.** Prettier options, `.editorconfig` and VS Code settings; ESLint with the strict, type-aware `typescript-eslint` rule sets plus rules for correctness, safety (no `innerHTML`) and style. `npm run check` runs the type check, lint, format check and tests in one go.

The `ecmact` dependency is set to the version that the scaffolder was released with. The generated `README.md` lists the scripts and explains the lint setup.

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

All variants are checked by CI on every push: the scaffolder generates each of them, installs the dependencies (the library from the current build), and runs `npm run check` and `npm run build` in the result.

The scaffolder asks for nothing beyond the name, the template and Tailwind, installs nothing and does not touch git. Requires Node 20.19 or newer.

## Install

```bash
npm install ecmact
```

Components and widgets need a browser (or DOM implementation) with Custom Elements v1 and Shadow DOM. The package ships modern, unminified ES and CommonJS code that is not transpiled down; see [Browser support](#browser-support).

```ts
import { mount, tags } from 'ecmact';
```

CommonJS is supported as well:

```js
const { mount, tags } = require('ecmact');
```

## First elements

```ts
import { mount, signal, tags } from 'ecmact';

const { button, h1 } = tags;

const count = signal(0);

mount(
  '#app',
  h1('Hello, ECMact'),
  button({ onclick: () => count.value++ }, () => `Clicked ${count.value} times`),
);
```

- `tags.button(...)` returns a real `<button>`. The first argument is the props when it is a plain object. Everything after it is children.
- A child that is a function is rendered again when a signal it reads changes. Here only the text of the button is rewritten on a click.
- `mount` puts the elements into the page, into the element that the selector finds.

Updates are synchronous: the DOM is up to date when the write to a signal returns.

## Elements

There are two factories. `tags` creates plain DOM elements: `tags.button(...)` returns an `HTMLButtonElement`, with no wrapper around it. `em` creates [components](#components): custom elements with a shadow root, their own stylesheet and lifecycle hooks. Use `tags` for everything, and `em` where you need style isolation or hooks.

```ts
import { mount, tags } from 'ecmact';

const { a, article, h2, p } = tags;

const card = article(
  { class: 'card' },
  h2('ECMact'),
  p('Reactive interfaces on the DOM.'),
  a({ href: '/docs/getting-started' }, 'Read the docs'),
);

mount('#app', card);
```

The first argument is the props if it is a plain object. Everything else is children, in order. Both are optional: `p()`, `p('text')` and `p({ class: 'lead' }, 'text')` all work.

### Children

| Child                                | What is rendered                                                          |
| ------------------------------------ | ------------------------------------------------------------------------- |
| A node                               | The node itself: an element, a component, a text node, a fragment.        |
| A string or a number                 | Text. It is never parsed as HTML.                                         |
| An array                             | Its items, in order. Nested arrays are flattened.                         |
| `false`, `true`, `null`, `undefined` | Nothing, so conditions are plain expressions.                             |
| A signal or a function               | A reactive region: it is rendered again when the signals it reads change. |

A reactive child may return text, a node, a list or nothing. That is how conditional rendering works: return the element or `null`.

```ts
import { mount, signal, tags } from 'ecmact';

const { button, p, section } = tags;

const open = signal(false);
const unread = signal(3);
const details = p('Shown only while the panel is open.');

mount(
  '#app',
  section(
    button({ onclick: () => (open.value = !open.value) }, () => (open.value ? 'Hide' : 'Show')),
    () => (open.value ? details : null),
    p('Unread: ', unread),
  ),
);
```

### Props

| Prop          | Meaning                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| `class`       | Class names: text, a list, or an object of switches. See [Classes](#classes).                           |
| `style`       | Inline styles with camelCase keys. A number is a length in pixels. See [Inline styles](#inline-styles). |
| `html`        | Trusted markup for the content of the element.                                                          |
| `ref`         | A function called once with the element, right after it is built.                                       |
| `bind`        | A signal tied to an `input`, `select` or `textarea` both ways. See [Form controls](#form-controls).     |
| `on<event>`   | An event listener: `onclick`, `oninput`, `onkeydown`, and so on.                                        |
| `provide`     | Values offered to the elements below. See [Context](#context).                                          |
| `error`       | A handler for errors of this element and of everything below it. See [Error handling](#error-handling). |
| anything else | An attribute of the element.                                                                            |

An element with `html` ignores its children, with a warning. `html` uses `innerHTML` and does not sanitize, see the [security model](#security-model).

Props are applied once, when the element is created. To change something later, write to a signal that the prop reads, or change the DOM element directly: it is an ordinary element.

### Attributes

Strings and numbers are set as they are and `true` sets an empty attribute. `false`, `null` and `undefined` remove the attribute. Names are the HTML ones: `class`, not `className`. `value`, `checked`, `selected` and `indeterminate` are also written as DOM properties.

```ts
import { tags } from 'ecmact';

const { input } = tags;

const email = input({
  type: 'email',
  placeholder: 'you@example.com',
  required: true,
  'aria-label': 'Email',
  'data-testid': 'email',
});
```

### Reactive props

Any attribute, `html`, `class`, `style` and each value inside `style` take a plain value, a signal, or a function that reads signals. The element follows the signals and updates only that attribute or style. `on<event>` handlers and `ref` are functions too, but they are never treated as reactive.

```ts
import { mount, signal, tags } from 'ecmact';

const { button } = tags;

const count = signal(0);

mount(
  '#app',
  button(
    {
      disabled: () => count.value >= 3,
      title: () => `${3 - count.value} clicks left`,
      style: { opacity: () => (count.value >= 3 ? 0.5 : 1) },
      onclick: () => count.value++,
    },
    'Click me, three times at most',
  ),
);
```

### Classes

`class` takes text, a list, or an object whose keys are class names and whose values switch them on. Empty items of a list are left out. Signals and functions may stand anywhere in it.

```ts
import { mount, signal, tags } from 'ecmact';

const { li, ul } = tags;

const done = signal(false);
const urgent = true;

mount(
  '#app',
  ul(
    li({ class: 'todo' }, 'Plain text'),
    li({ class: ['todo', urgent && 'urgent'] }, 'A list'),
    li(
      { class: ['todo', { done }], onclick: () => (done.value = !done.value) },
      'An object of switches inside a list',
    ),
    li({ class: () => (done.value ? 'todo done' : 'todo') }, 'A function'),
  ),
);
```

### Inline styles

`style` takes an object with camelCase keys. A number is a length in pixels, so `{ width: 240 }` is `240px`. Properties that take plain numbers, such as `opacity`, `zIndex`, `flex`, `flexGrow`, `lineHeight`, `fontWeight`, `order` and `aspectRatio`, keep the number as it is. `false`, `null` and `undefined` remove a property.

```ts
import { mount, signal, tags } from 'ecmact';

const { div, input } = tags;

const size = signal(120);

mount(
  '#app',
  input({ type: 'range', min: 40, max: 240, bind: size }),
  div({
    style: {
      width: size,
      height: () => size.value / 2,
      borderRadius: 12,
      opacity: 0.9,
      background: 'teal',
      '--gap': 4,
    },
  }),
);
```

- Each value may be a signal or a function, and then only that property is rewritten. The whole object may be a signal or a function too.
- A custom property such as `'--gap'` works as a key too, and a number stays a plain number there.
- Values are set through the CSSOM, not by building a `style` string.

An element made with `tags` is an ordinary element of the page, so the CSS of the page styles it as well.

### Events

A prop that starts with `on` is a listener on the element. The handler is typed with the right event. To listen in the capture phase, passively or once, pass an object with a `handler` and the options. A string is never evaluated.

```ts
import { tags } from 'ecmact';

const { div, input } = tags;

const search = input({
  oninput: (event) => console.log((event.target as HTMLInputElement).value),
  onkeydown: (event) => {
    if (event.key === 'Enter') console.log('submit');
  },
});

const area = div({
  onwheel: { handler: (event) => console.log(event.deltaY), passive: true },
  onclick: { handler: () => console.log('first click only'), once: true },
});
```

A listener is attached when the element is created and is never reactive. For anything else, the element is a real one: call `addEventListener` on it.

### Refs

A factory returns the element, so most of the time a variable is enough. `ref` helps when the element is created in the middle of a tree.

```ts
import { mount, tags } from 'ecmact';

const { button, form, input } = tags;

let field!: HTMLInputElement;

mount(
  '#app',
  form(
    input({ ref: (element) => (field = element) }),
    button({ type: 'button', onclick: () => field.focus() }, 'Focus the field'),
  ),
);
```

### Custom tags

A name with a hyphen creates that custom element and accepts any attribute: `tags['x-widget']({ mode: 'compact' })`.

## Form controls

`bind` ties an `input`, a `select` or a `textarea` to a signal both ways: the control shows the signal, and what the user enters is written to it. No `oninput` handler is needed.

```ts
import { mount, signal, tags } from 'ecmact';

const { input, label, option, p, select } = tags;

const name = signal('');
const age = signal(30);
const agree = signal(false);
const plan = signal('free');

mount(
  '#app',
  input({ placeholder: 'Name', bind: name }),
  input({ type: 'number', bind: age }),
  label(input({ type: 'checkbox', bind: agree }), ' I agree'),
  select({ bind: plan }, option({ value: 'free' }, 'Free'), option({ value: 'pro' }, 'Pro')),
  p(() => `${name.value}, ${age.value}, ${plan.value}, ${agree.value ? 'agreed' : 'not agreed'}`),
);
```

| Control                             | Signal                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| Text `input`, `textarea`, `select`  | `Signal<string>`                                                                           |
| `input` of type `checkbox`          | `Signal<boolean>`                                                                          |
| `input` of type `radio`             | `Signal<string>`: the button is checked when its `value` equals the signal.                |
| `input` of type `number` or `range` | `Signal<number>` if the signal holds a number, text otherwise. An empty field gives `NaN`. |
| `select` with `multiple`            | `Signal<string[]>`: the values of the selected options.                                    |

Text that the control already shows is not written again, so the cursor stays where the user is typing.

Without `bind`, `value`, `checked`, `selected` and `indeterminate` are written as DOM properties, so they keep working after the user has interacted with the control. An attribute alone only sets the default. The attribute is still set for `value`, `checked` and `selected`, so selectors such as `[checked]` match.

```ts
import { mount, signal, tags } from 'ecmact';

const { button, input } = tags;

const query = signal('');

mount(
  '#app',
  input({
    value: query,
    oninput: (event) => (query.value = (event.target as HTMLInputElement).value.toUpperCase()),
  }),
  button({ onclick: () => (query.value = '') }, 'Clear'),
);
```

- A plain value is written once, when the element is created. A signal or a function is written again whenever it changes.
- Properties are applied after the children, so a `select` can take a `value` that matches one of its options.

A control inside a component with a Shadow DOM needs one more step to reach the form around it, see [Fields inside a form](#fields-inside-a-form).

## Components

`em.Name(props, ...children)` registers a custom element the first time the name is used and returns an instance. The children go into an open shadow root, and the `css` prop is a stylesheet that applies only to them.

```ts
import { em, mount, tags } from 'ecmact';

const { h2, p } = tags;

const card = em.UserCard(
  {
    css: `
      :host { display: block; padding: 16px; border: 1px solid #d0d7e2; border-radius: 12px; }
      h2 { margin: 0; }
    `,
  },
  h2('Ada Lovelace'),
  p('Engineer'),
);

mount('#app', card);
```

Attributes, `class`, `style`, listeners and `ref` apply to the custom element itself. These props exist only on components:

| Prop                        | Description                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| `css`                       | The stylesheet of the shadow root. See [The css of a component](#the-css-of-a-component).            |
| `shadow`                    | `false` renders the children into the component itself. See [Light DOM](#light-dom).                 |
| `mounted`, `unmounted`      | Hooks. See [Lifecycle](#lifecycle).                                                                  |
| `field`, `name`, `disabled` | Make the component a field of the form around it. See [Fields inside a form](#fields-inside-a-form). |

### Names

- The words of a camelCase name are joined with hyphens: `em.UserCard` is `<user-card>`.
- A name of one word gets a prefix, because a custom element name must contain a hyphen: `em.Card` is `<em-card>`.
- `configure({ prefix: 'my' })` makes `em.Card` a `<my-card>`. With `configure({ prefix: '' })` every name must have two words, and a name of one word throws.
- A name must match `/^[A-Za-z][A-Za-z0-9_-]*$/`, otherwise a `TypeError` is thrown.
- `em.then` and symbol properties return `undefined`, so `await em` and `String(em)` are safe. The same holds for `tags`.

### The css of a component

A component keeps its children in a shadow root. The CSS of the page does not reach inside, and the styles of the component do not leak out. The `css` prop is the stylesheet of that shadow root: its selectors match the children directly, and `:host` is the component itself. It may be a signal or a function.

```ts
import { em, mount, tags } from 'ecmact';

const { button } = tags;

const toolbar = em.Toolbar(
  {
    css: `
      :host { display: flex; gap: 8px; }
      button {
        padding: 8px 16px;
        border-radius: 10px;
        background: var(--accent, #1665e0);
        color: white;
      }
      button:hover { filter: brightness(1.1); }
    `,
  },
  button('Save'),
  button('Cancel'),
);

mount('#app', toolbar);
```

The stylesheet is a constructable stylesheet where the browser has them and a `<style>` element otherwise.

CSS custom properties inherit into a shadow root. That makes them the theming mechanism: a component reads `var(--accent, #1665e0)` and the page sets `--accent` on any ancestor. This is how [widgets](#embedding-as-a-widget) are themed from outside.

### Shared stylesheets

Styles that every component needs, such as a reset, go into `configure({ styles })`. Strings are turned into one sheet that the shadow roots of all components and widgets share. Sheets can also be `CSSStyleSheet` objects. Call `configure` before the first component is created.

```ts
import { configure } from 'ecmact';
import reset from './reset.css?inline';

configure({ styles: [reset] });
```

### Tailwind CSS

Elements made with `tags` in the page take Tailwind utilities as any other markup does. Inside a shadow root the utilities do nothing, because the CSS of the page does not reach there. There are two ways to use them in components:

- **Light DOM.** Create components with `shadow: false`, or call `configure({ shadow: false })`, and load Tailwind in the page as usual.
- **Shared stylesheet.** Build Tailwind to a CSS file and pass it as a shared stylesheet. Utilities, theme values and variants then work inside every shadow root.

```ts
import { configure, em, tags } from 'ecmact';
import tailwind from './tailwind.out.css?inline';

const { button } = tags;

configure({ styles: [tailwind] });

const actions = em.Actions(
  button({ class: 'rounded-lg bg-red-500 px-4 py-2 text-white md:px-8' }, 'Delete'),
);
```

Tailwind 4 registers custom properties with `@property`, which browsers only honor in the document, not in a shadow root. When a shared stylesheet contains `@property` rules, ECMact copies them once into a `<style data-ecmact="properties">` element in `document.head`, so `border`, `shadow-*`, `ring-*` and transforms have what they rely on.

### Light DOM

`shadow: false` renders the children into the component itself. The CSS of the page applies, and labels and ids work across components. The hooks still run. The `css` prop is ignored without a shadow root, with a warning. The choice is made when the component is created and cannot be changed afterwards.

```ts
import { configure, em, tags } from 'ecmact';

const { p } = tags;

configure({ shadow: false });

const plain = em.Notice(p('Styled by the page'));
const isolated = em.Notice({ shadow: true, css: 'p { color: teal; }' }, p('Styled by itself'));
```

### Lifecycle

A component has two hooks. They are props, and each one receives the component itself. Plain elements made with `tags` have no hooks.

| Hook              | When it runs                                                                        |
| ----------------- | ----------------------------------------------------------------------------------- |
| `mounted(host)`   | Every time the component is connected to a document. May return a cleanup function. |
| `unmounted(host)` | Every time it is disconnected, after the cleanup that `mounted` returned.           |

```ts
import { em, mount, signal, tags } from 'ecmact';

const { output } = tags;

const time = signal(new Date().toLocaleTimeString());

const clock = em.Clock(
  {
    mounted: () => {
      const timer = setInterval(() => (time.value = new Date().toLocaleTimeString()), 1000);
      return () => clearInterval(timer);
    },
    unmounted: () => console.log('the clock left the page'),
  },
  output(time),
);

mount('#app', clock);
```

An `effect` or a [resource](#data-fetching) created inside `mounted` is stopped when the component is disconnected. You do not return anything for them. Return a cleanup only for what the library does not know about: timers, observers, listeners on `window`.

```ts
import { effect, em, mount, signal, tags } from 'ecmact';

const { button } = tags;

const unread = signal(0);

const inbox = em.Inbox(
  {
    mounted: () => {
      effect(() => {
        document.title = `${unread.value} unread`;
      });
    },
  },
  button({ onclick: () => unread.value++ }, 'New message'),
);

mount('#app', inbox);
```

- A component that leaves the document stops following signals, together with everything inside it. When it comes back, its reactive children and props run once to catch up, and `mounted` runs again.
- A component that is moved is disconnected and connected at once. The cleanup, `unmounted` and `mounted` run, and it keeps following signals in between.
- The nodes that a reactive child or `each` takes out of the page stop following signals too.
- A component that is created but never put into a document never calls `mounted`.

A plain element that you take out of the document by hand, with `element.remove()` for example, keeps following its signals: it still updates, and the signals keep it in memory. To take a part of the page out, return it from a reactive child, such as `() => (open.value ? panel : null)`, or put it inside a component.

### Fields inside a form

A control inside a Shadow DOM does not take part in the submission or validation of the `<form>` around it. Set `field: true` on the component and it becomes a form-associated custom element: the form sees its `name` and the value and validity of the first `input`, `select` or `textarea` inside it.

```ts
import { em, mount, tags } from 'ecmact';

const { button, form, input, label } = tags;

const email = em.EmailField(
  { field: true, name: 'email', css: 'input { padding: 8px; }' },
  input({ type: 'email', required: true }),
);

const agree = em.AgreeField(
  { field: true, name: 'agree' },
  input({ type: 'checkbox', value: 'yes' }),
);

mount(
  '#app',
  form(
    {
      onsubmit: (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget as HTMLFormElement);
        console.log(Object.fromEntries(data));
      },
    },
    email,
    label(agree, ' I agree'),
    button('Sign up'),
  ),
);
```

- `name` and `disabled` are props of the component: they are set on the custom element, where forms look for them. `required`, `pattern`, `minlength` and the other constraints are evaluated on the control inside, and the form reports them as for a native one.
- A checkbox or a radio contributes its value only while checked. A multiple `select` contributes every selected option.
- `form.reset()` puts the control back to its default, and a disabled `<fieldset>` disables it.
- A control with `bind` tells the field when the signal changed it, so the form always has the current value.
- `field` needs `ElementInternals`. Labels with `for` and `id` do not cross the shadow boundary: put the component inside the `<label>`, where a click on the label is forwarded to the control, or use `aria-label`.
- A component with `shadow: false` and plain elements need none of this: their controls are in the form already.

## Lists

`each(items, render, options)` renders one node per item and keeps the list in step with the data. Put it among the children of any element: the nodes are placed right there, with no wrapper.

```ts
import { each, mount, signal, tags } from 'ecmact';

const { button, li, ul } = tags;

const todos = signal([{ id: 1, title: 'Write docs' }]);

mount(
  '#app',
  ul(
    each(todos, (todo) => li(todo.title), {
      by: (todo) => todo.id,
      empty: li('Nothing to do'),
    }),
  ),
  button(
    {
      onclick: () => {
        todos.value = [...todos.value, { id: todos.value.length + 1, title: 'Ship it' }];
      },
    },
    'Add',
  ),
);
```

- `items` is an array, a signal of an array, or a function that returns one. Put a new array into the signal: an array that is changed in place is not noticed.
- `render` receives the item and its position and returns a node.
- `by` gives an item its key. Without it a string or a number is its own key and anything else is keyed by its position, so give `by` for objects. A duplicate key is reported with a warning.
- `empty` is shown while there are no items.
- When the list changes, an item that is still there keeps its node. Nodes are added, moved and removed with as few DOM operations as possible.

An item that is a new object under the same key gets its row rendered again, in place. Focus inside the row is restored by position, but other state of the old row, such as a scroll position, is lost. To update a row without replacing it, keep the item the same and let the row read signals.

### Large lists

- A keyed list keeps the node of every item that is still there and only moves it, so reordering, removing or appending does not create the other rows again.
- A row that reads signals updates only the text or attribute that changed, without the list being involved.
- The library does not virtualize: every item is a real node. For long lists, paginate or render only the rows in view.

Measured in Chromium 156 on an Apple M5 with `npm run bench`. Every row is a `tr` with two `td`, kept by key with `each`; median of 7 runs, in milliseconds, including the time until the next frame:

| rows  | create | update 1 in 10 | swap two | remove one | append 10% | clear |
| ----- | ------ | -------------- | -------- | ---------- | ---------- | ----- |
| 1000  | 13.8   | 4.7            | 6.5      | 8.6        | 12.2       | 3.3   |
| 10000 | 100.5  | 33.9           | 20.6     | 17.3       | 60.4       | 33.0  |

The numbers come from one machine and will differ on yours: use them to compare options, not as a promise. `BENCH_HTML=bench.html npm run bench` writes a page that runs the same benchmark in any browser, without Playwright.

## Mounting

`mount(target, ...children)` appends children to an element, given as a selector or as the element. It takes anything a child can be and returns the container. A selector that matches nothing throws.

Use `mount` for the top of the tree, not `parent.append(...)`. Two things are resolved when elements enter the document: [context](#context) lookups made in reactive functions, and the styles of [styled components](#styled-components). The library does that when elements arrive through `mount`, an `em` component, `each`, a reactive region or a [widget](#embedding-as-a-widget). A plain `append` does not trigger it.

## Signals

A signal holds a value and tells whoever read it when it changes. Children and props read signals, and the DOM updates on its own: no tree is rendered again, only the text, attribute or style that depends on the value.

| Function                | What it does                                                                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signal(value)`         | A value that can be read and written through `.value`. `.peek()` reads without subscribing. `.subscribe(listener)` calls a listener on every change. |
| `computed(fn, equals?)` | A read-only value derived from other signals. It is lazy and memoized. With `equals`, an equal result keeps the old value and does not notify.       |
| `effect(fn)`            | Runs now and again whenever a signal it read changes. Returns a function that stops it.                                                              |
| `batch(fn)`             | Groups writes: effects run once, after the last one.                                                                                                 |
| `untracked(fn)`         | Reads signals inside `fn` without subscribing.                                                                                                       |
| `isSignal(value)`       | A type guard for signals and computed values.                                                                                                        |

```ts
import { batch, computed, effect, signal } from 'ecmact';

const first = signal('Ada');
const last = signal('Lovelace');
const full = computed(() => `${first.value} ${last.value}`);

const stop = effect(() => {
  console.log(full.value);
});

batch(() => {
  first.value = 'Grace';
  last.value = 'Hopper';
});

stop();
```

A child or a prop can be a function that reads signals. It runs again when one of them changes. You do not need `computed` for that: write the expression where it is used. A signal can also be passed as it is.

- Reading `.value` inside an effect, a computed value or a reactive function subscribes it. Reading inside `untracked`, or through `.peek()`, does not.
- An effect runs once immediately. Dependencies are collected anew on every run, so conditional reads work.
- Writing the same value (by `Object.is`) does nothing and notifies nobody.
- A signal that holds an object changes only when you assign a new object. Replace instead of mutating: `list.value = [...list.value, item]`.
- An effect that throws surfaces the error from the write that triggered it.
- An effect created inside the `mounted` hook of a component, or inside the `render` of a widget, is stopped for you when the element leaves the document.

The function of an effect must return nothing or a cleanup function. The cleanup runs before the next run and when the effect is stopped. An arrow function with an expression body returns the value of the expression: `effect(() => (total.value = price.value * 2))` returns a number. Use a block body: `effect(() => { total.value = price.value * 2; })`.

A `computed` normally notifies its readers whenever a dependency changed. Pass `equals` and a result that is equal to the previous one is dropped, so a selector over a big object does not wake up readers for unrelated changes.

```ts
import { computed, shallow, signal } from 'ecmact';

const pointer = signal({ x: 0, y: 0, pressed: false });

const position = computed(() => ({ x: pointer.value.x, y: pointer.value.y }), shallow);

pointer.value = { ...pointer.value, pressed: true };
```

The last line changes `pointer`, but `position` keeps its value and notifies nobody.

## Context

Context hands a value to the elements below a provider. Any element can provide, through the `provide` prop, and anything below it can read the value with `use`. It works through a bubbling DOM event, so it needs no registration and crosses the Shadow DOM boundary.

```ts
import { createContext, mount, signal, tags, type Signal } from 'ecmact';

const { button, div, p } = tags;

const Accent = createContext<Signal<string>>('accent');

const color = signal('#1665e0');

mount(
  '#app',
  div(
    { provide: Accent.provide(color) },
    p({ style: { color: () => Accent.use()?.value } }, 'I have the accent color'),
    button({ onclick: () => (color.value = '#d6336c') }, 'Change it'),
  ),
);
```

- `createContext<T>(name)` makes a context. The name is for debugging: two contexts with the same name are still different contexts.
- `createContext(name, fallback)` makes one with a fallback value. `use` then never returns `undefined`.
- `Context.provide(value)` pairs the context with a value. Pass the result, or a list of them, to the `provide` prop of any element.
- The nearest provider wins, so a nested one overrides an outer one for its subtree. An element does not receive what it provides itself.

Inside a reactive function, a child or a prop, call `use()` without arguments: the lookup starts from the element that the function belongs to. Anywhere else, pass the node to start from. Without a node and outside a reactive function, `use()` throws.

```ts
import { createContext, em, mount, tags } from 'ecmact';

const { p, section } = tags;

const Locale = createContext('locale', 'en');

const panel = em.Panel(
  { mounted: (host) => console.log('mounted with', Locale.use(host)) },
  p(() => `Locale: ${Locale.use()}`),
);

mount(
  '#app',
  section({ provide: Locale.provide('cs') }, panel),
  p(() => Locale.use()),
);
```

The first paragraph shows `cs`. The last one has no provider above it and shows the fallback, `en`.

A reactive function usually runs for the first time before its element is in the tree, so `use()` finds no provider yet and returns the fallback or `undefined`. The function runs again when the element enters the document. That needs the tree to be put into the page with `mount`, see [Mounting](#mounting).

The provided value itself is fixed. To make a context reactive, provide a signal, as the first example does: readers follow the signal. [Themes](#styled-components) work that way.

## Error handling

An error thrown by an event listener or by a hook goes to the nearest `error` prop: the one on the element itself or on an element above it, across shadow roots. `error` works on any element. If there is none, the error goes to `configure({ onError })`. With no handler at all the error is rethrown, exactly as if there were no error handling.

```ts
import { configure, mount, tags } from 'ecmact';

const { button, section } = tags;

configure({
  onError: (error, info) => console.error(info.phase, info.element.localName, error),
});

mount(
  '#app',
  section(
    { error: (error, { phase, event }) => console.warn(`${phase} ${event ?? ''}`, error) },
    button(
      {
        onclick: () => {
          throw new Error('This goes to the section');
        },
      },
      'Break',
    ),
  ),
);
```

The handler receives the error and `{ element, phase, event }`: the element with the listener or the component with the hook, the phase, and the event name for the `event` phase.

| Phase       | Source                                    |
| ----------- | ----------------------------------------- |
| `event`     | A listener passed as an `on<event>` prop. |
| `mounted`   | The `mounted` hook.                       |
| `cleanup`   | The function that `mounted` returned.     |
| `unmounted` | The `unmounted` hook.                     |

- A handled error does not stop later steps: `unmounted` still runs after a failing cleanup.
- If the handler throws, that error propagates.
- Only these synchronous errors are caught. A rejected promise of an `async` handler is not seen: handle it inside the handler.
- An error in a reactive child or prop, or in `ref`, is not passed to the handler either: it is thrown where the element is created, or from the write to the signal that made the function run again.

## State management

`createStore(initial, actions, options)` makes a store from its initial values and the actions that change them. Both become properties of the store: `counter.count` reads a value and `counter.inc()` calls an action. Types are inferred from the two arguments.

```ts
import { createStore, mount, tags } from 'ecmact';

const { button, p } = tags;

const counter = createStore({ count: 0, step: 1 }, (set, get) => ({
  inc: () => set((state) => ({ count: state.count + state.step })),
  reset: () => set({ count: 0 }),
  double: () => set({ count: get().count * 2 }),
}));

mount(
  '#app',
  button({ onclick: () => counter.inc() }, () => `count is ${counter.count}`),
  button({ onclick: () => counter.reset() }, 'Reset'),
  button({ onclick: () => counter.double() }, 'Double'),
  p(() => (counter.count % 2 === 0 ? 'even' : 'odd')),
);
```

- Reading a field inside a reactive function, an effect or a computed value follows that field only. A change of `step` does not rerun a function that read `count`.
- `set` shallow-merges an object, or what a function of the state returns, into the values. `get` reads the values.
- `set`, `get` and the third argument, the store, are typed with the values only. To call another action from an action, go through the store variable: `counter.reset()`.
- The state must be an object. Declare every field in the initial values: only they become properties of the store.
- A field or an action cannot have a name that the store uses itself, such as `state`, `select` or `subscribe`. `createStore` throws for such a name.

| Member                                | Description                                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| fields and actions                    | Plain properties. Fields are read-only: change them in an action.                                       |
| `getState()`, `getInitialState()`     | The current state with the actions, and the one the store was created with.                             |
| `setState(partial, replace?)`         | Shallow-merges an object (or what a function of the state returns). `replace: true` replaces the state. |
| `subscribe(listener)`                 | Calls `listener(state, previous)` after every change. Returns a function that stops it.                 |
| `watch(selector, listener, options?)` | Like `subscribe`, but only when the selected value changes. Options: `equalityFn`, `fireImmediately`.   |
| `select(selector, equalityFn?)`       | A signal of a derived part of the state, for values that are not one field.                             |
| `state`                               | The whole state as a signal.                                                                            |
| `persist`                             | Present when the store is persisted, see below.                                                         |

```ts
import { createStore, shallow } from 'ecmact';

const cart = createStore(
  { items: [] as { title: string; price: number }[], coupon: '' },
  (set) => ({
    add: (title: string, price: number) =>
      set((state) => ({ items: [...state.items, { title, price }] })),
  }),
);

const total = cart.select((state) => state.items.reduce((sum, item) => sum + item.price, 0));
const titles = cart.select((state) => state.items.map((item) => item.title), shallow);

const stop = cart.watch(
  (state) => state.items.length,
  (length, previous) => console.log(`${previous} -> ${length}`),
);

cart.add('Book', 12);
console.log(total.value, titles.value);
stop();
```

- `setState` does nothing, and notifies nobody, when the new state is the same value as the old one.
- A selector that builds a new object or array each time would change on every update: pass `shallow` as the second argument so that only a change of content counts.
- Call `set` and `get` inside the actions, not while the actions are being built.

The third argument holds the options. `persist` keeps the state in a storage and reads it back when the store is created. `devtools` shows the store in the Redux DevTools browser extension, with every change named after the action that made it.

```ts
import { createJSONStorage, createStore } from 'ecmact';

const cart = createStore(
  { items: [] as string[], open: false },
  (set) => ({
    add: (item: string) => set((state) => ({ items: [...state.items, item] })),
    toggle: () => set((state) => ({ open: !state.open })),
  }),
  {
    persist: {
      name: 'cart',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ items: state.items }),
    },
    devtools: { name: 'cart' },
  },
);

cart.add('book');
```

| `persist` option     | Description                                                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`               | The key in the storage. Required.                                                                                                             |
| `storage`            | `createJSONStorage(() => sessionStorage)`, or any `{ getItem, setItem, removeItem }`, asynchronous ones included. Defaults to `localStorage`. |
| `partialize`         | Picks what to persist. Defaults to the whole state.                                                                                           |
| `version`, `migrate` | A stored state with another version is ignored unless `migrate` converts it.                                                                  |
| `merge`              | Combines the stored state with the current one. Defaults to a shallow merge.                                                                  |
| `skipHydration`      | Do not read the storage on creation; call `store.persist.rehydrate()` yourself.                                                               |
| `onRehydrateStorage` | Called before the storage is read; may return a function to call after.                                                                       |

A persisted store has a `persist` property with `rehydrate()`, `hasHydrated()`, `clearStorage()`, `onHydrate(listener)`, `onFinishHydration(listener)`, `getOptions()` and `setOptions(options)`.

| `devtools` value      | Description                                                                            |
| --------------------- | -------------------------------------------------------------------------------------- |
| `true`                | Connects with the defaults.                                                            |
| `name`                | The name of the connection. Changes are then named `name/action`.                      |
| `enabled`             | `false` turns the connection off, for production builds.                               |
| `anonymousActionType` | The name for changes made outside an action, with `setState`. Defaults to `anonymous`. |

Without the extension in the browser the store works as usual.

Differences from zustand: there is no React hook, fields are properties and `select` returns a signal. Actions are passed apart from the values. `persist` and `devtools` are options, not middleware, and `subscribeWithSelector` is built in as `watch`. There is no `immer`, because ECMact has no dependencies.

## HTTP client

`createHttp` makes a client used like axios: the same method shortcuts, config, interceptors and errors, on top of `fetch`. It has no dependencies and runs wherever `fetch` does: browsers, Node 18 and newer, workers.

```ts
import { createHttp } from 'ecmact';

interface User {
  id: number;
  name: string;
}

const api = createHttp({ baseURL: 'https://api.example.com', timeout: 5000 });

const response = await api.get<User[]>('/users', { params: { page: 1 } });
console.log(response.status, response.data);

const users = await api.get<User[]>('/users').data;
await api.post('/users', { name: 'Ada' });
```

A call returns a promise of the response: `data`, `status`, `statusText`, `headers`, `config` and `duration`. The promise also has a `data` property, a promise of the body alone, so `await api.get(url).data` skips the response object.

| Call                                                      | Description                                                                                  |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `api(config)`, `api(url, config?)`, `api.request(config)` | Send a request.                                                                              |
| `get`, `delete`, `head`, `options`                        | `(url, config?)`.                                                                            |
| `post`, `put`, `patch`                                    | `(url, data?, config?)`. Objects are sent as JSON.                                           |
| `postForm`, `putForm`, `patchForm`                        | An object is sent as `multipart/form-data`.                                                  |
| `getUri(config?)`                                         | The URL a config would request. Sends nothing.                                               |
| `resource(url, config?)`                                  | A GET as a resource with `data`, `error` and `loading`. See [Data fetching](#data-fetching). |
| `defaults`, `interceptors`                                | The defaults of the client, to change in place, and its interceptors.                        |

`http` is a ready-made client with the library defaults, for scripts and tests. Create your own with `createHttp` for an app. `toFormData(object)` turns a plain object into `FormData`, the way `postForm` does: nested objects use `key[name]`, arrays use `key[]`.

| Option                                          | Description                                                                                  |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `baseURL`, `params`, `paramsSerializer`         | URL building. Arrays are `a[]=1&a[]=2`, nested objects `a[b]=1`.                             |
| `headers`                                       | Case-insensitive; `common`, `get`, `post`, ... buckets in defaults; `null` removes a header. |
| `data`, `transformRequest`, `transformResponse` | Bodies. Objects become JSON; JSON responses are parsed.                                      |
| `timeout`, `signal`                             | Abort after a time, or when an `AbortSignal` aborts.                                         |
| `responseType`                                  | `json` (default), `text`, `blob`, `arraybuffer`, `formdata`, `stream`.                       |
| `validateStatus`                                | Which statuses succeed. Default 200 to 299.                                                  |
| `auth`, `withCredentials`, `xsrf*`              | Basic auth, cookies for other origins, XSRF cookie to header.                                |
| `onDownloadProgress`                            | `{ loaded, total, progress }` while the body arrives.                                        |
| `retry`                                         | A number of retries, or `{ retries, delay, retryOn }`.                                       |

Precedence: library defaults, then `createHttp(config)` and `api.defaults`, then the request; the last one wins. Headers merge bucket by bucket.

A request rejects with an `HttpError` when the status fails `validateStatus`, when nothing answered, on a timeout, when it was cancelled and for an invalid URL. It carries `code`, `status`, `response`, `config` and `cause`, and `toJSON()` masks the keys listed in `redact`.

| Code                        | Meaning                                                       |
| --------------------------- | ------------------------------------------------------------- |
| `ERR_BAD_REQUEST`           | A 4xx status.                                                 |
| `ERR_BAD_RESPONSE`          | A 5xx status, or one that `validateStatus` rejected.          |
| `ERR_NETWORK`               | No answer: network down, host unreachable, CORS.              |
| `ECONNABORTED`, `ETIMEDOUT` | The timeout ran out (`ETIMEDOUT` with `clarifyTimeoutError`). |
| `ERR_CANCELED`              | The `signal` aborted. The error is a `CanceledError`.         |

```ts
import { createHttp, isCancel, isHttpError } from 'ecmact';

const api = createHttp({ baseURL: 'https://api.example.com' });

const loadUser = async (id: number) => {
  try {
    return await api.get<{ name: string }>(`/users/${id}`).data;
  } catch (error) {
    if (isCancel(error)) return undefined;
    if (isHttpError(error)) {
      if (error.response) console.log(error.status, error.response.data);
      else console.log(error.code);
    }
    throw error;
  }
};
```

Request interceptors run in reverse order of adding; response interceptors run in the order of adding. Both take a second argument that handles errors, and an interceptor can recover by returning a value or rethrow.

```ts
import { createHttp, isHttpError } from 'ecmact';

const api = createHttp({ baseURL: 'https://api.example.com' });

const session = {
  token: 'secret',
  refresh: async () => {
    session.token = await api.post<string>('/session/refresh').data;
  },
};

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
```

Cancelling, timeouts and retries:

```ts
import { createHttp, isCancel } from 'ecmact';

const api = createHttp({ baseURL: 'https://api.example.com' });

const controller = new AbortController();
const pending = api.get('/slow', { signal: controller.signal });
controller.abort();
await pending.catch((error: unknown) => console.log(isCancel(error)));

await api.get('/flaky', { retry: 3 });
await api.post(
  '/orders',
  { product: 'book' },
  { retry: { retries: 2, delay: 500, retryOn: (error) => error.status === 503 } },
);
```

- Cancelling uses `AbortSignal` only. A request cancelled before it is sent never reaches the network.
- The default retry policy retries network failures, timeouts and 5xx statuses of idempotent methods, never a cancellation, and waits `300 * 2 ** attempt` ms. Axios has nothing like it built in.

Differences from axios: it is built on `fetch`, so there is no Node `http` adapter, proxy or upload progress. `CancelToken`, `axios.all` and `axios.spread` are not provided. JSON that cannot be parsed stays text.

## Data fetching

A resource runs a request and exposes `data`, `error` and `loading` as plain properties. Read them in a reactive function and the markup follows the request. When a signal that the request depends on changes, the request runs again and the one in flight is aborted, so a slow answer can never overwrite a fresh one.

`api.resource(url, config?)` is a resource fed by a GET of the [HTTP client](#http-client). The URL is text, or a function that reads signals.

```ts
import { createHttp, each, mount, signal, tags } from 'ecmact';

interface User {
  id: number;
  name: string;
}

const { button, li, p, ul } = tags;

const api = createHttp({ baseURL: '/api' });
const page = signal(1);

const users = api.resource<User[]>(() => `/users?page=${page.value}`, { initial: [] });

mount(
  '#app',
  p(() => (users.loading ? 'Loading...' : users.error ? 'Could not load' : `Page ${page.value}`)),
  ul(
    each(
      () => users.data ?? [],
      (user) => li(user.name),
      { by: (user) => user.id },
    ),
  ),
  button({ onclick: () => page.value++ }, 'Next page'),
);
```

The second argument is the config of the request, such as `params` and `headers`, plus `initial`. The resource sets `url` and `signal` itself.

`resource(fetcher, options?)` works with any function that returns a value or a promise. The fetcher receives `{ signal }`, an `AbortSignal` for that request.

```ts
import { mount, resource, signal, tags } from 'ecmact';

const { button, div } = tags;

const id = signal(1);

const user = resource<{ name: string }>(({ signal: aborted }) =>
  fetch(`/api/users/${id.value}`, { signal: aborted }).then((response) => response.json()),
);

mount(
  '#app',
  div(() => (user.loading ? 'Loading...' : user.error ? 'Failed' : user.data?.name)),
  button({ onclick: () => id.value++ }, 'Next user'),
  button({ onclick: () => user.refetch() }, 'Reload'),
);
```

| Member          | Description                                                            |
| --------------- | ---------------------------------------------------------------------- |
| `data`          | The latest result, or `initial`, or `undefined` before the first one.  |
| `error`         | The reason of the latest failure, `undefined` otherwise.               |
| `loading`       | `true` while a request is in flight.                                   |
| `refetch()`     | Runs the fetcher again.                                                |
| `mutate(value)` | Sets the data by hand and clears the error, for optimistic updates.    |
| `dispose()`     | Stops reacting, aborts the request in flight and ignores late results. |

- `data`, `error` and `loading` are read without `.value`. Reading one inside a reactive function, an effect or a computed value follows it.
- Signals read **before** the first `await` are dependencies. Read them early, as `id.value` above.
- A new request clears `error` and keeps the old `data` until the answer arrives.
- A resource created inside the `mounted` hook of a component, or inside the `render` of a widget, is disposed when the element leaves the document. Anywhere else it lives until you call `dispose()`.
- Pass the `AbortSignal` on to `fetch`. Without it the old request still runs to the end; its result is ignored either way.

## Routing

`createRouter` maps URLs to views using the History API. The location is a signal, so everything built on signals can follow it. The router is tree-shakeable: it is not in your bundle unless you import it.

```ts
import { createRouter, mount, tags } from 'ecmact';

const { h1, nav, p } = tags;

const router = createRouter({
  routes: [
    { path: '/', view: () => h1('Home') },
    { path: '/users/:id', view: ({ params }) => h1(`User ${params.id}`) },
    { path: '/files/*', view: ({ params }) => p(params['*']) },
  ],
  notFound: () => h1('Not found'),
});

mount(
  '#app',
  nav(router.link({ to: '/' }, 'Home'), ' ', router.link({ to: '/users/1' }, 'User 1')),
  p(() => `You are at ${router.location.value.path}`),
  router.outlet({ class: 'view' }),
);
```

| Pattern      | Matches                                         | `params`             |
| ------------ | ----------------------------------------------- | -------------------- |
| `/`          | The root                                        | `{}`                 |
| `/users/:id` | `/users/42`, one segment per parameter, decoded | `{ id: '42' }`       |
| `/files/*`   | `/files` and everything below it                | `{ '*': 'a/b.txt' }` |
| `*`          | Any path, as a catch-all                        | `{ '*': 'a/b' }`     |

The first matching route wins. A `view` receives `path`, `params`, `query` (a `URLSearchParams`), `hash` and the `router`, and returns a node or a promise of one. A promise is how code splitting works: the outlet stays as it is until the promise resolves, and a late result is dropped if the route changed.

```ts
import { createRouter, tags } from 'ecmact';

const { h1 } = tags;

const router = createRouter({
  routes: [
    { path: '/', view: () => h1('Home') },
    { path: '/settings', view: async () => (await import('./settings')).settingsView() },
  ],
});
```

- `router.outlet(props?)` returns a `<router-outlet>` component that shows the view of the current route. It renders into the light DOM, so the CSS of the page styles the views.
- `router.link({ to, replace?, ...props }, ...children)` returns a real `<a>` with an `href`, so middle click and copy link work. A plain left click navigates without a page load. Modifier keys, other buttons, `target`, `download` and other origins are left to the browser.
- The link gets `aria-current="page"` while its path is the current one.
- `router.navigate(to, { replace, scroll })` returns a promise of whether the navigation happened. Without async guards the location is already updated when it returns. It scrolls to the top unless `scroll` is `false`.
- `router.back()` and `router.forward()` move through the history. `router.dispose()` stops listening to it.
- `router.location` and `router.match` are signals: the current path, query and hash, and the route that matches.
- `base` serves the app from a sub-path: `createRouter({ base: '/app', routes })`.

A route with `children` is a layout. Its path is a prefix, the children's paths are relative, and the layout never matches alone: use a child with an empty path as the index. The layout's view places the child with `router.outlet()`.

```ts
import { createRouter, mount, tags } from 'ecmact';

const { h1, p, section } = tags;

const router = createRouter({
  routes: [
    {
      path: '/users',
      view: () => section(h1('Users'), router.outlet()),
      children: [
        { path: '', view: () => p('Pick a user') },
        { path: ':id', view: ({ params }) => p(`User ${params.id}`) },
      ],
    },
  ],
});

mount('#app', router.outlet());
```

A layout is kept while only its child changes, and rebuilt when the route outside it changes or a parameter in its own part of the path does.

A guard runs before a navigation commits. It receives where the navigation goes and where it comes from, and returns `true` or nothing to proceed, `false` to cancel, or a path to redirect there. It may be asynchronous.

```ts
import { createRouter, signal, tags } from 'ecmact';

const { h1 } = tags;

const session = signal<{ admin: boolean } | null>(null);

const router = createRouter({
  beforeEach: (to) => (to.path.startsWith('/admin') && !session.value ? '/login' : true),
  routes: [
    { path: '/', view: () => h1('Home') },
    { path: '/admin', view: () => h1('Admin'), beforeEnter: () => session.value?.admin || '/' },
    { path: '/login', view: () => h1('Sign in') },
  ],
});

if (await router.navigate('/admin')) console.log('navigated');
```

- `beforeEach` runs first, then the `beforeEnter` of every route in the chain, outermost first.
- Guards also run for the first location and for back and forward. A guard that cancels on back puts the old URL back; one that redirects replaces the entry.
- More than ten redirects in a row throw an error.
- Guards are a user-interface convenience, not security: the client can always bypass them. Check permissions on the server.
- Only history mode is supported, so the server must answer unknown paths with `index.html` (the default of Vite and of most hosts with an SPA fallback). There are no transitions, no scroll restoration and no route-level data loading.

## Styled components

`styled` turns CSS written in a tagged template into a function that creates an element with those styles, in the style of styled-components. The result is the element itself: `Button(...)` below returns a `<button>` with a generated class. The React library of the same name is not involved.

```ts
import { mount, styled } from 'ecmact';

const Button = styled.button<{ $primary?: boolean }>`
  padding: 8px 16px;
  border: 0;
  border-radius: 8px;
  color: white;
  background: ${(props) => (props.$primary ? '#1665e0' : '#6b7a90')};

  &:hover {
    filter: brightness(1.1);
  }
`;

mount(
  '#app',
  Button({ $primary: true, onclick: () => console.log('saved') }, 'Save'),
  Button('Cancel'),
);
```

A styled element takes the same props and children as the element from `tags`. Put the tree into the page with `mount`: the styles are attached when the element enters the document, see [Mounting](#mounting).

A template can contain:

- Plain values, signals and functions of the props. `false`, `null` and `undefined` leave nothing behind, so `${(props) => props.$wide && 'width: 100%;'}` works.
- Fragments made with `css`, to share between components.
- `keyframes` animations.
- Nested rules and `&`, using native CSS nesting (Chrome 120, Safari 17.2, Firefox 117 and newer).

Props starting with `$` are transient: they reach the functions of the template but are never set on the element. Type them with the generic: `styled.button<{ $primary?: boolean }>`. A transient prop may be a signal, and the element restyles when it changes.

The styles are one rule for a generated class, such as `.em-1x2y3z`. The rule is put into the document, or into the shadow root of the `em` component or widget that the element is in. Elements with the same style text share one class and one rule. Your own `class` stays next to the generated one.

- A styled element is isolated from the CSS of the page only inside a component or a widget. In the page itself it is an ordinary element with a class: the selectors of the page can match it, and inherited styles reach it.
- Every distinct style text adds a rule, and a rule is never removed. For a value that changes continuously, such as a position that follows the pointer, use the `style` prop instead of a template function.

```ts
import { mount, styled } from 'ecmact';

const Button = styled.button`
  padding: 8px 16px;
  background: #1665e0;
  color: white;
`;

const Field = styled.input.attrs({ type: 'text', placeholder: 'Name' })`
  padding: 8px;
`;

const DangerButton = styled(Button)`
  background: crimson;
`;

mount(
  '#app',
  Field(),
  DangerButton('Delete'),
  Button({ as: 'span', title: 'Not a button' }, 'A span with the same styles'),
  Button({ css: 'margin-left: 8px; &:focus-visible { outline: 2px solid; }' }, 'More'),
);
```

| Feature               | Behavior                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `.attrs(props or fn)` | Default props. Props passed to the component win. A function is called once, when the element is created.                                   |
| `styled(Component)`   | Keeps the tag, templates and attrs of a styled component. Its own template comes after, so it wins.                                         |
| `as`                  | Renders another tag with the same styles. It is not put on the element. The props and the returned element stay typed for the original tag. |
| `css`                 | More CSS for one element: declarations and nested rules, put after the ones of the template. It may be a signal.                            |

`keyframes` writes the frames of an animation. The `@keyframes` rule is placed next to the styles of every element that uses it, so it also works inside a shadow root.

```ts
import { keyframes, styled } from 'ecmact';

const spin = keyframes`
  from { rotate: 0deg; }
  to { rotate: 360deg; }
`;

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid #1665e0;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;
```

`ThemeProvider` offers a theme to every styled element below it and the template reads it as `props.theme`. The theme is an object, or a signal of one: change the signal and every element below restyles. The provider is a `div` with `display: contents`, so it does not affect the layout.

```ts
import { mount, signal, styled, ThemeProvider } from 'ecmact';

const Button = styled.button`
  background: ${(props) => String(props.theme.accent)};
  color: white;
`;

const theme = signal({ accent: '#1665e0' });

mount(
  '#app',
  ThemeProvider(
    { theme },
    Button({ onclick: () => (theme.value = { accent: '#d6336c' }) }, 'Change the theme'),
  ),
);
```

- A provider inside another replaces the theme for its own subtree.
- The `theme` prop of one element overrides the theme from the provider.
- Without a provider and without the prop, `props.theme` is an empty object.
- `useTheme(element)` reads the theme signal that applies to an element, for code that is not a styled component. It returns `undefined` when there is no provider above. `themeContext` is the [context](#context) that carries it.
- For a theme that is only colors and sizes, CSS custom properties need less code.

Differences from styled-components: no selectors of other components (`${Link}:hover &`), because a class name is generated from the style text and is not known in advance. No `createGlobalStyle`: write global styles in the CSS of the page, or use [shared stylesheets](#shared-stylesheets) for components. No `withConfig` and `shouldForwardProp`: `$`-prefixed props cover the same need. Props win over `.attrs` defaults.

## Embedding as a widget

`defineWidget` registers a custom element that renders ECMact elements. The page that embeds it needs no framework and no build step: a script tag and the element are enough.

Try it: the [widget demo](https://eternalvision.github.io/ecmact/widget/) and a [page that is not ours](https://eternalvision.github.io/ecmact/widget/embed.html), which loads the built script with one tag and keeps its own fonts and colors.

```ts
import { defineWidget, signal, tags } from 'ecmact';

const { button, input } = tags;

defineWidget(
  'price-widget',
  ({ props, emit }) => {
    const quantity = signal(1);
    const total = () => props.price * quantity.value;
    return [
      input({ type: 'number', min: 1, bind: quantity }),
      button(
        { disabled: () => props.soldOut, onclick: () => emit('add', { total: total() }) },
        () => `Add ${props.label} for ${total()}`,
      ),
    ];
  },
  {
    attributes: { price: 0, label: 'Product', soldOut: false },
    css: `
      :host { display: inline-flex; gap: 8px; }
      button { font: inherit; background: var(--widget-accent, #1665e0); color: white; }
    `,
  },
);
```

```html
<script src="https://example.com/price-widget.js"></script>
<price-widget price="49" label="Pro plan"></price-widget>

<script>
  document.addEventListener('add', (event) => console.log(event.detail.total));
</script>
```

| Part                  | Description                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host`                | The custom element itself.                                                                                                                        |
| `props`               | The attributes as plain properties, read without `.value`. Reading one in a reactive function follows the attribute on the page.                  |
| `emit(type, detail?)` | Dispatches a `CustomEvent` that bubbles, crosses the shadow boundary and can be cancelled. Returns `false` if a listener called `preventDefault`. |
| `attributes`          | The attributes to follow, as an object of defaults. The type of a default decides how the attribute is read.                                      |
| `css`                 | The stylesheet of the shadow root of the widget.                                                                                                  |
| `shadow`              | Render into a Shadow DOM. Defaults to `true`. With `false` the widget renders into the light DOM and `css` is ignored, with a warning.            |

| Default   | How the attribute is read                                                   |
| --------- | --------------------------------------------------------------------------- |
| A number  | With `Number`, so `price="49"` is `49`.                                     |
| A boolean | `true` while the attribute is present. The value `"false"` switches it off. |
| A string  | As it is.                                                                   |

- While the attribute is absent, the prop is the default.
- A camelCase key stands for the attribute in kebab-case: `soldOut` is `sold-out`.
- `setAttribute` on the page updates the prop, and the reactive functions that read it run again. Attributes that are not listed are not followed.
- `render` returns anything a child can be: an element, a list, text. The elements inside are plain `tags` elements, styled by the `css` of the widget.
- `render` runs when the element is put into a page. An `effect` or a [resource](#data-fetching) created in it stops when the element is taken out, and `render` runs again, from a clean state, if the element is put back. A widget that is only moved keeps its content.
- Results come out as events. A listener on the host, on `document` or anywhere between hears them.
- The look is set from outside with CSS custom properties, which inherit into a Shadow DOM: `price-widget { --widget-accent: red }`. Other styles of the page do not reach inside, and the styles of the widget do not leak out.
- [Shared stylesheets](#shared-stylesheets) from `configure({ styles })` apply inside a widget too, and [styled components](#styled-components) put their rules into its shadow root.
- Each instance has its own state. Define a name once: defining it twice throws.

To ship the widget as one script, build it as an IIFE:

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

```bash
npm create ecmact@latest my-widget -- --template widget
```

The widget template sets all of this up: a working widget, a demo page, tests, the IIFE build, and the same Prettier and ESLint configuration as the app template.

## Global configuration

`configure(options)` sets application-wide defaults. Options are merged between calls.

```ts
import { configure } from 'ecmact';
import reset from './reset.css?inline';

configure({
  prefix: 'my',
  styles: [reset],
  onError: (error, info) => console.error(info.phase, error),
});
```

| Option     | Type                          | Default | Description                                                                                  |
| ---------- | ----------------------------- | ------- | -------------------------------------------------------------------------------------------- |
| `shadow`   | `boolean`                     | `true`  | Whether components render into a shadow root. The `shadow` prop of a component wins.         |
| `prefix`   | `string`                      | `'em'`  | The prefix of the element of a component whose name is one word, see [Names](#names).        |
| `styles`   | `(string \| CSSStyleSheet)[]` | `[]`    | Shared stylesheets adopted by every shadow root of a component or a widget.                  |
| `warnings` | `boolean`                     | `true`  | Development warnings in the console, see [Warnings](#warnings).                              |
| `onError`  | `(error, info) => void`       | -       | The error handler used where no `error` prop applies, see [Error handling](#error-handling). |

Configuration is read when an element is created. `configure` does not update what already exists, so call it first. There is no configuration file: ECMact has no build step of its own, so a file would have nothing to read it.

## Warnings

ECMact logs a `console.warn` for usage that is almost certainly a mistake. Each distinct message is logged once.

| Message                                                       | Cause                                                                        |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `attribute "x" was ignored, object values cannot be set`      | An attribute is an object or another value that cannot be set.               |
| `style "x" was ignored, object values cannot be set`          | A style value is not a string or a number.                                   |
| `handler "onclick" is not a function and was ignored`         | An `on*` prop is neither a function nor an object with a `handler` function. |
| `children are ignored when html is set`                       | An element got both `html` and children.                                     |
| `css is ignored when shadow is false`                         | `css` was passed to a light DOM component or widget.                         |
| `duplicate key "x" in each`                                   | Two items of a list have the same key. The second one is still rendered.     |
| `a styled rule was ignored, the browser cannot parse it: ...` | The CSS of a styled component is not valid for the browser.                  |

`undefined`, `null` and `false` never warn: they are the normal way to switch a prop off (`disabled: isBusy && true`, `onclick: enabled ? handler : undefined`).

Turn the warnings off with `configure({ warnings: false })`, for example in production builds.

## TypeScript

The package ships its own declarations. Each factory of `tags` returns the element type of its tag and takes the props of that tag, so there is nothing to annotate in everyday code.

```ts
import { tags } from 'ecmact';

const { a, div, input } = tags;

const link = a({ href: '/docs', target: '_blank' }, 'Docs');
const field = input({ type: 'email', oninput: (event) => console.log(event.target) });

console.log(link.href, field.value);

// @ts-expect-error: src is not an attribute of a link
a({ src: 'x.png' });

// @ts-expect-error: "bogus" is not an input type
input({ type: 'bogus' });

// @ts-expect-error: onclik is not an event
div({ onclik: () => {} });
```

`link` is an `HTMLAnchorElement` and `field` an `HTMLInputElement`. The last three calls are compile errors.

- **Attributes by tag.** Global attributes plus `data-*` and `aria-*` apply to every tag. Tag-specific attributes are defined for forms, media, tables, links, dialogs and more. Value types follow HTML: booleans for boolean attributes, numbers for numeric ones, string unions for enumerated ones.
- **Reactive values.** Where a prop takes a value it also takes a signal or a function that returns it. That is `Reactive<T>`.
- **Events.** `on<event>` props are typed from `HTMLElementEventMap`; the handler receives the right event.
- **Styles.** `style` accepts the string-valued properties of `CSSStyleDeclaration` and custom properties, with `string | number` values.
- **`ref`.** It receives the element type of the tag: `HTMLInputElement` for `input`, the component for `em`.
- **`bind`.** Only `input`, `select` and `textarea` take it.
- **Custom tags.** A name with a hyphen, such as `tags['x-widget']`, accepts any attribute and returns an `HTMLElement`.
- **Components.** Every `em.Name` takes `ComponentProps` and returns a `Component`, which is an `HTMLElement`.

A reusable piece of interface is a function that returns an element. Type its arguments with the exported types: `Props<'a'>` for the props of a tag and `Child` for children.

```ts
import { tags, type Child, type Props } from 'ecmact';

const { a } = tags;

export const ExternalLink = (props: Props<'a'>, ...children: Child[]) =>
  a({ target: '_blank', rel: 'noreferrer', ...props }, ...children);

const link = ExternalLink({ href: 'https://example.com' }, 'Example');
```

- **Stores.** `createStore(initial, actions)` infers the fields from the first argument and the actions from the second. When an initial value says too little, annotate it: `{ items: [] as string[] }`. The type of a store is `Store<S, A>`.
- **Widgets.** The props of a widget are typed from the defaults in `attributes`: a number default gives a `number` prop.
- **Context.** `createContext<T>(name)` gives `use()` the type `T | undefined`. With a fallback, `createContext(name, fallback)`, it is `T`.
- **Styled components.** Transient props come from the generic: `styled.button<{ $primary?: boolean }>`.
- **HTTP.** `api.get<User[]>(url)` types the body of the response, and `api.resource<User[]>(url)` types `data`.

Exported types, by area:

| Area                     | Types                                                                                                                                                                                                                                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Elements                 | `Props`, `Child`, `ClassValue`, `Styles`, `Reactive`, `Getter`, `Factory`, `Tags`, `TagName`, `AttributeMap`, `GlobalAttributes`, `EventHandlerOptions`, `EachOptions`                                                                                                                                   |
| Components               | `Component`, `ComponentProps`                                                                                                                                                                                                                                                                            |
| Configuration and errors | `Config`, `StyleSource`, `ErrorHandler`, `ErrorInfo`, `ErrorPhase`                                                                                                                                                                                                                                       |
| Context                  | `Context`, `Provision`                                                                                                                                                                                                                                                                                   |
| Signals                  | `Signal`, `ReadonlySignal`                                                                                                                                                                                                                                                                               |
| Styled components        | `Styled`, `StyledTag`, `StyledComponent`, `StyledProps`, `StyleProps`, `Attrs`, `CssFragment`, `Keyframes`, `Interpolation`, `Theme`, `ThemeProviderProps`                                                                                                                                               |
| Routing                  | `Router`, `RouterOptions`, `Route`, `RouteContext`, `RouteMatch`, `RouterLocation`, `Guard`, `GuardResult`, `NavigateOptions`, `LinkProps`, `OutletProps`                                                                                                                                                |
| State                    | `Store`, `StoreOptions`, `SetState`, `Listener`, `WatchOptions`, `PersistOptions`, `PersistApi`, `PersistStorage`, `StateStorage`, `StorageValue`, `JsonStorageOptions`, `DevtoolsOptions`                                                                                                               |
| Data                     | `Resource`, `ResourceContext`, `ResourceOptions`                                                                                                                                                                                                                                                         |
| HTTP                     | `HttpInstance`, `HttpPromise`, `HttpResourceConfig`, `HttpRequestConfig`, `HttpResponse`, `HttpMethod`, `HttpHeaders`, `HeaderMap`, `HeaderValue`, `HttpErrorCode`, `HttpErrorLike`, `ResponseType`, `RetryOptions`, `ProgressEvent`, `ParamsSerializerOptions`, `RequestTransform`, `ResponseTransform` |
| Widgets                  | `WidgetContext`, `WidgetOptions`                                                                                                                                                                                                                                                                         |

## Security model

ECMact writes text, attributes and styles through DOM APIs, never through string concatenation into HTML. That makes the default path safe from markup injection. The places where it is not are few and explicit.

Safe by default:

- Text children are inserted as text nodes; markup in them is inert. That holds for strings, numbers and what reactive children return.
- Attribute values are set through `setAttribute` and `style` values through the CSSOM, so they cannot break out of an attribute or a declaration.
- `on*` props accept only functions. A string such as `onclick="..."` is never evaluated.

Yours to handle:

- `html` is the one raw-HTML entry point. It uses `innerHTML` and does not sanitize. Pass only markup you control, or sanitize it first, for example with DOMPurify.
- The tag decides which element is created. `tags[name]` and the `as` prop of a styled component cannot inject markup, but the name should not come from untrusted input (`script`, `iframe`).
- Attributes that carry URLs (`href`, `src`, `action`) are set as given and `javascript:` URLs are not filtered. Validate user-supplied URLs.
- Stylesheet text is used as written: the `css` prop, the `css` option of a widget and the templates of `styled`. Do not build it from untrusted input.
- Client-side [route guards](#routing) do not enforce authorization. Enforce permissions on the server.
- A third-party [widget](#embedding-as-a-widget) script runs with the privileges of the host page. Shadow DOM isolates markup and styling; it is not a sandbox for untrusted scripts.

Report a vulnerability privately through the [security policy](https://github.com/eternalvision/ecmact/security/policy).

## Server-side rendering

Importing `ecmact` is safe without a DOM (Node, SSR bundlers, tooling): no browser globals are touched at import time. Creating elements requires `document`, and components and widgets require `customElements`, so call `tags.*`, `em.*` and `mount` only in the browser, or in a DOM environment such as happy-dom or jsdom. There is no server-side serialization and no hydration.

## Browser support

Any evergreen browser. Components and widgets use Custom Elements v1 and Shadow DOM, and styled components use native CSS nesting. The published code is not transpiled below Vite's default build target (Baseline widely available, fixed to 2026-01-01 for Vite 8), so it uses modern syntax such as class fields and private `#fields`. Constructable stylesheets are used for `css`, shared styles and styled components when the browser has them, with a `<style>` element fallback. No polyfills are included.

## Limitations

- **Props are applied once.** There is no re-render and no way to pass new props to an element. What has to change reads a signal, or you change the DOM element yourself.
- **Listeners are fixed.** An `on<event>` prop is attached when the element is created and is never reactive.
- **Configuration is read when an element is created.** `configure` does not update what already exists. Call it first.
- **The Shadow DOM choice is final.** `shadow` is read when a component is created and cannot be changed afterwards.
- **Hooks belong to components.** Plain elements have no `mounted` and `unmounted`.
- **No server-side rendering, a small router, no virtualization.** See [When it is not the right tool](#when-it-is-not-the-right-tool).

Limits described in other sections:

| Limit                                                                      | Where                                         |
| -------------------------------------------------------------------------- | --------------------------------------------- |
| The top of the tree goes through `mount`, not `append`                     | [Mounting](#mounting)                         |
| A row of `each` is rendered again when its item changes under the same key | [Lists](#lists)                               |
| `html` and children do not mix                                             | [Props](#props)                               |
| What an `effect` function may return                                       | [Signals](#signals)                           |
| Plain elements removed by hand keep following signals                      | [Lifecycle](#lifecycle)                       |
| Which errors reach the error handler                                       | [Error handling](#error-handling)             |
| Isolation and growth of styled rules                                       | [Styled components](#styled-components)       |
| Fields of a store are fixed at creation                                    | [State management](#state-management)         |
| Labels and page styles do not cross a shadow boundary                      | [Fields inside a form](#fields-inside-a-form) |

## Migrating from 2.x

3.0 changes how elements are written. In 2.x every tag was a custom element that rendered one inner element from its props, and updates went through `setState`. Now `tags` returns the element itself, children are arguments, and what changes reads a signal.

| 2.x                                                                    | 3.0                                                       |
| ---------------------------------------------------------------------- | --------------------------------------------------------- |
| `tags.p({ content: 'x' })`                                             | `tags.p('x')`                                             |
| `tags.div({ children: [a, b] })`                                       | `tags.div(a, b)`                                          |
| `em.X({ tag: 'ul', shadow: false, children })`                         | `tags.ul(...children)`                                    |
| `content: computed(() => ...)`                                         | a child `() => ...`                                       |
| `component.element`, `shadowRoot.firstElementChild`                    | the element that the factory returned                     |
| `component.setState({ content })`, `component.props`                   | write a signal that the child or the prop reads           |
| `mounted: (el, c) => effect(() => c.setState({ children }))`           | `each(...)` or a function child                           |
| `key` on a component in `children`                                     | `each(items, render, { by })`                             |
| `oninput: (e) => (s.value = e.target.value)`                           | `bind: s`                                                 |
| `beforeUpdate`, `updated`                                              | removed: there are no updates of props                    |
| `mounted: (element, component) => ...`                                 | `mounted: (host) => ...`                                  |
| `provide: [provide(Ctx, v)]`, `consume(Ctx, el)`                       | `provide: Ctx.provide(v)`, `Ctx.use(el)` or `Ctx.use()`   |
| `error: (error, { component })`                                        | `error: (error, { element })`                             |
| `store.getState().inc()`                                               | `store.inc()`                                             |
| `store.select((s) => s.count)` in markup                               | `() => store.count`                                       |
| `createStore(devtools(persist(combine(init, actions), p), d))`         | `createStore(init, actions, { persist: p, devtools: d })` |
| `user.data.value`, `user.loading.value`                                | `user.data`, `user.loading`                               |
| `resource(({ signal }) => api.get(u, { signal }).then((r) => r.data))` | `api.resource(u)`                                         |
| `(await api.get(u)).data`                                              | `await api.get(u).data` (the old form still works)        |
| `defineWidget(n, r, { attributes: ['price'] })`, `props.price.value`   | `{ attributes: { price: 0 } }`, `props.price`             |
| `Button({ content: 'Save' })` (styled)                                 | `Button('Save')`                                          |
| `ThemeProvider({ theme, children: [x] })`                              | `ThemeProvider({ theme }, x)`                             |
| `router.link({ to, content: 'Home' })`                                 | `router.link({ to }, 'Home')`                             |
| `style: { width: '240px' }`                                            | `style: { width: 240 }` (a string still works)            |

Changes of behavior to check after the rewrite:

- **`tags` has no host and no shadow root.** `tags.button(...)` is the `<button>`, not an `<em-button>` around it. Selectors, tests and `ref` code that looked for the host or its `shadowRoot` have to change, and the CSS of the page now styles these elements. Style isolation exists only inside an `em` component or a widget.
- **Element names of components changed.** `em.UserCard` is `<user-card>`, and only a name of one word gets the prefix.
- **The `css` of a component targets its children directly.** There is no inner `div` to select. `:host` is the component.
- **Props are applied once.** An element cannot be given new props. Reactive values are functions or signals.
- **A number in `style` is a length in pixels**, except for unitless properties and custom properties.
- **Effects and resources created in `mounted` stop on disconnect.** Code that kept them alive across a removal has to create them outside the hook.
- **A component outside the document does not follow signals.** It catches up when it comes back. A plain element removed by hand keeps following them.
- **The top of the tree goes through `mount`.** Context lookups in reactive functions and styled components rely on it.
- **Styled components have no shadow root of their own.** Their rule goes into the document or into the shadow root around them, and the page can style them when they are not inside a component.
- **A widget renders again when it is put back into a page**, from a clean state, and its `attributes` are an object of defaults that also decides the type of each prop.
- **In a store, `get()` and the third argument see the values only.** Call another action through the store variable. Names that the store uses itself throw.
- **Errors of rendering are not passed to error handlers.** The phases are `event`, `mounted`, `cleanup` and `unmounted`.

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

| Path                      | Package         | What it is                                                                                                                             |
| ------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `.` (`src/`, `tests/`)    | `ecmact`        | The library                                                                                                                            |
| `packages/create-ecmact/` | `create-ecmact` | The `npm create ecmact` scaffolder and its template                                                                                    |
| `packages/site/`          | `ecmact-site`   | The public website: documentation and live demos in English and Russian, written with ECMact itself. Private, deployed to GitHub Pages |

Every package follows the same rules: aliases, tests that mirror `src/`, 100% coverage.

### Imports

Inside `src/` and `tests/` (of every package), import through aliases instead of relative paths:

| Alias            | Resolves to                         | Example                                                                       |
| ---------------- | ----------------------------------- | ----------------------------------------------------------------------------- |
| `@em`            | `src/index.ts`                      | `import { em } from '@em';`                                                   |
| `@em/<path>`     | `src/<path>`                        | `import { applyStyle } from '@em/render/applyStyle';`                         |
| `@tests/<path>`  | `tests/<path>`                      | `import { tick } from '@tests/helpers';`                                      |
| `@create/<path>` | `packages/create-ecmact/src/<path>` | `import { run } from '@create/index';` (only inside `packages/create-ecmact`) |

- The aliases are defined once per package, in `compilerOptions.paths` of its `tsconfig.json`. Vite and Vitest read them from there (`resolve.tsconfigPaths`), so there is nothing to keep in sync.
- ESLint (`no-restricted-imports`) rejects `./` and `../` imports in `src/` and `tests/`, so new files follow the rule automatically.
- The build does not leak aliases: the JavaScript is bundled, and the declaration plugin rewrites `@em/...` to relative paths in the published `.d.ts` files.

| Script                   | Description                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------- |
| `npm run build`          | Vite library build: ES, CJS and `.d.ts` into `dist/`                                   |
| `npm run build:all`      | The library and every package in `packages/`                                           |
| `npm test`               | Structure check, then Vitest with V8 coverage, for the library and every package       |
| `npm run test:structure` | Checks that `tests/` mirrors `src/`                                                    |
| `npm run test:template`  | Generates every variant of the starter and checks it                                   |
| `npm run size`           | Measures the size of widget scripts with the library inside                            |
| `npm run bench`          | Measures keyed lists in Chromium (needs `playwright`, or `BENCH_HTML` for any browser) |
| `npm run typecheck`      | `tsc --noEmit` for the library and every package                                       |
| `npm run lint`           | ESLint (flat config, typescript-eslint, prettier)                                      |
| `npm run lint:fix`       | ESLint with autofix                                                                    |
| `npm run format`         | Prettier write                                                                         |
| `npm run format:check`   | Prettier check                                                                         |

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
- Tests and the generated template are not linted for this, but the template's `Counter` has one as an example.

### Test rules

- **`tests/` mirrors `src/`, one test file per source file.** `src/render/props.ts` is tested by `tests/render/props.test.ts`, `src/signals/signals.ts` by `tests/signals/signals.test.ts`, and so on, including `index.ts` files and files that contain only types (their tests are type-level, checked by `npm run typecheck`).
- **100% coverage** of statements, branches, functions and lines. The run fails if coverage drops.
- Both are enforced: `npm test` first runs `npm run test:structure`, which fails on a source file without a test and on a test without a source file. Adding a file to `src/` means adding its test in the same change.
- Shared test helpers live in `tests/helpers.ts`; it is not a test file and is not mirrored.

Source layout of the library:

```
src/
  index.ts                public exports
  core/
    tags.ts               factories of plain elements
    em.ts                 factories of components, custom element names and registration
    element.ts            tells props from children and builds an element
    component.ts          custom element class: shadow root, css, hooks, form field
    each.ts               keyed lists
    config.ts             configure() and its defaults
    context.ts            createContext, provide and use
    errors.ts             the error prop and onError
  signals/signals.ts      signal, computed, effect, batch, untracked
  render/
    props.ts              attributes, class, live properties and event listeners
    children.ts           children: text, nodes, lists and reactive regions
    bindings.ts           what a node follows, pausing and resuming
    applyStyle.ts         the style prop, through the CSSOM
    applyStyleSheets.ts   css of a component and shared stylesheets
  forms/
    bindControl.ts        the bind prop
    formControl.ts        value, validity and reset of a control, for form fields
  router/
    index.ts              exports of the router
    match.ts              path patterns
    flatten.ts            nested routes turned into a flat list
    guards.ts             runs beforeEach and beforeEnter guards
    router.ts             createRouter: location, outlet, link, navigate
  data/resource.ts        async data with loading and error states
  store/
    store.ts              createStore
    shallow.ts            shallow comparison
    persist.ts            the persist option, createJSONStorage
    devtools.ts           Redux DevTools connection
  http/
    http.ts               createHttp: shortcuts, defaults, interceptors, resource
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
    styled.ts             styled: elements from tagged templates
    template.ts           css and keyframes, joining templates
    inject.ts             puts the rules into the document or a shadow root
    theme.ts              ThemeProvider, useTheme
  widget/widget.ts        defineWidget: custom elements for embedding
  types/                  props, attribute tables
  utils/
    mount.ts              mount helper
    trimTrailingSlashes.ts  trims the slashes at the end of a URL
    warn.ts               development warnings
tests/                    mirrors src/, plus helpers.ts
scripts/check-tests.ts    checks that tests mirror src, the browser-only list and known failures
scripts/check-template.mjs  generates every variant of the starter and checks it
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
| `ecmact`        | `v3.0.0`               | `release.yml`        |
| `create-ecmact` | `create-ecmact-v0.4.0` | `release-create.yml` |

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
