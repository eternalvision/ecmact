<p align="center">
  <img src="https://raw.githubusercontent.com/eternalvision/ecmact/main/public/ecmact.png" alt="ECMact" width="300" />
</p>

# ECMact

ECMact is a small component library built on native Web Components. Every component is a custom element, rendered into an open Shadow DOM by default (or into the light DOM with `shadow: false`), created through a single factory, `em`. There is no virtual DOM, no template language and no build-time step: components are plain function calls that return real DOM elements.

- Zero runtime dependencies
- Content, attributes and styles are written through DOM APIs, never through `innerHTML` (unless you ask for it)
- In-place updates: `setState` reuses the DOM node, so focus and input state survive
- Full TypeScript support, with attributes, events, styles, `ref` and lifecycle hooks typed per HTML tag
- Optional light DOM rendering and lifecycle hooks (`mounted` with cleanup, `unmounted`, `beforeUpdate`, `updated`)
- ES and CommonJS builds, bundled type declarations, `sideEffects: false`

## Table of contents

- [Install](#install)
- [Quick start](#quick-start)
- [How it works](#how-it-works)
- [Creating components](#creating-components)
- [Tag factories](#tag-factories)
- [Props reference](#props-reference)
- [Content and children](#content-and-children)
- [Attributes](#attributes)
- [Styles](#styles)
- [Stylesheets and Tailwind CSS](#stylesheets-and-tailwind-css)
- [Global configuration](#global-configuration)
- [Events](#events)
- [Refs](#refs)
- [Lifecycle](#lifecycle)
- [Shadow DOM and light DOM](#shadow-dom-and-light-dom)
- [State and updates](#state-and-updates)
- [Mounting](#mounting)
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

## Install

```bash
npm install ecmact
```

Requires a browser (or DOM implementation) with Custom Elements v1 and Shadow DOM. The package ships ES2022 code.

```ts
import { em, mount } from 'ecmact';
```

CommonJS is supported as well:

```js
const { em, mount } = require('ecmact');
```

## Quick start

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

| Prop           | Type                                            | Default | Description                                                     |
| -------------- | ----------------------------------------------- | ------- | --------------------------------------------------------------- |
| `tag`          | `string`                                        | `'div'` | Tag name of the inner element.                                  |
| `content`      | `string`                                        | `''`    | Text content. Never parsed as HTML.                             |
| `html`         | `string`                                        | -       | Raw HTML for the inner element. Opt-in, trusted input only.     |
| `children`     | `Node[]`                                        | `[]`    | Nodes appended after the content.                               |
| `style`        | object of CSS properties                        | -       | Inline styles, camelCase keys.                                  |
| `css`          | `string`                                        | -       | Stylesheet text scoped to this component's shadow root.         |
| `ref`          | `(element) => void`                             | -       | Called once, when the inner element is created.                 |
| `shadow`       | `boolean`                                       | `true`  | `false` renders into the light DOM. Read on the first render.   |
| `mounted`      | `(element, component) => void \| (() => void)`  | -       | Called when connected to the document; may return a cleanup.    |
| `unmounted`    | `(element, component) => void`                  | -       | Called when the component is disconnected from the document.    |
| `beforeUpdate` | `(next, current, component) => boolean \| void` | -       | Return `false` to cancel an update.                             |
| `updated`      | `(element, component, previous) => void`        | -       | Called after every render except the first.                     |
| `on<event>`    | `(event) => void`                               | -       | Event listener on the inner element, lowercase, e.g. `onclick`. |
| any other      | `string \| number \| boolean`                   | -       | Set as an HTML attribute on the inner element.                  |

All props except `shadow` and the lifecycle hooks apply to the inner element, not to the `<em-*>` host.

## Content and children

`content` is always inserted as a text node, so markup in it is shown literally:

```ts
em.Card({ content: '<b>not bold</b>' });
```

`children` is an array of DOM nodes, appended after the content:

```ts
em.Card({
  content: 'Parent text',
  children: [em.Card({ content: 'Child 1' }), em.Card({ content: 'Child 2' })],
});
```

`html` replaces the inner element's contents with parsed HTML. Children are appended after it. Use it only for trusted markup (see [Security model](#security-model)):

```ts
em.Card({ html: '<strong>trusted</strong> markup', children: [em.Card({ content: 'after' })] });
```

When `html` is set, `content` is ignored.

Children passed to `children` are moved, not cloned: a node can have only one parent. On every update the inner element's children are replaced with the current `content` or `html` and the current `children` array.

## Attributes

Any prop that is not a reserved key (`tag`, `content`, `html`, `style`, `css`, `children`, `ref`, `shadow`, `mounted`, `unmounted`, `beforeUpdate`, `updated`) and does not start with `on` is set on the inner element with `setAttribute`.

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
- Styles apply to the inner element only. There are no selectors, pseudo-classes or media queries. For those, use a stylesheet that targets the host (`em-card`) with CSS custom properties, or a `ref` that adds a `<style>` to `element.getRootNode()`.

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

Props starting with `on` whose value is a function become event listeners on the inner element. The event name is the rest of the key, lowercased.

```ts
em.Field({
  tag: 'input',
  oninput: (event) => console.log((event.target as HTMLInputElement).value),
  onkeydown: (event) => event.key === 'Enter' && submit(),
});
```

- Non-function `on*` values are ignored (an `onclick` string is never evaluated).
- Listeners are replaced on every update: old ones are removed, current ones are added. There are no duplicate handlers, and removing the prop removes the listener.
- Listeners are registered without options. For `once`, `passive` or `capture`, or for custom events, add the listener yourself in a `ref`:

```ts
em.Card({
  ref: (element) => element.addEventListener('wheel', onWheel, { passive: true }),
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
- The text content and the `children` are always rebuilt.

Components do not track state for you. `setState` is a rendering call, not a store: keep your application state wherever you like and call `setState` when it changes.

An `<em-*>` element created outside the library (for example `document.createElement('em-card')`) renders an empty `div` when it is connected.

## Global configuration

`configure(options)` sets application-wide defaults. Call it once, before creating components. Options are merged between calls.

```ts
import { configure } from 'ecmact';

configure({
  shadow: false,
  styles: [tailwind],
});
```

| Option   | Type                          | Default | Description                                                           |
| -------- | ----------------------------- | ------- | --------------------------------------------------------------------- |
| `shadow` | `boolean`                     | `true`  | Default for the `shadow` prop. A component's own `shadow` still wins. |
| `styles` | `(string \| CSSStyleSheet)[]` | `[]`    | Shared stylesheets adopted by every shadow component.                 |

Configuration is read when a component renders. Components that were already rendered keep what they had, so configure before the first component is created. There is no configuration file: ECMact has no build step of its own, so a file would have nothing to read it.

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

Since children are rebuilt on every update, create child components inside the render step (as above) when they depend on state, or keep references and update them with `setState` individually.

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

Exported types:

```ts
import type { Component, ComponentProps, AttributeMap, GlobalAttributes, TagName } from 'ecmact';
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

Any evergreen browser with Custom Elements v1, Shadow DOM and ES2022 class fields (including private `#fields`). No polyfills are included.

## Limitations

- **Attributes, not properties.** Props map to attributes. For form controls, `value` and `checked` set the default value/state; after the user interacts with the control, changing the attribute no longer changes what is displayed. Set live values through a `ref` (`input.value = '...'`).
- **Shadow DOM by default.** Global CSS does not apply inside components, and form controls inside a Shadow DOM do not take part in an outer `<form>`'s submission or validation. Label/`for` and `id` references do not cross the shadow boundary. Use `shadow: false` where that matters. The choice is made on the first render and cannot be changed afterwards.
- **One inner element.** A component renders a single element. Compose several components for more complex structures.
- **Full rebuild of children.** Children and text are rebuilt on every update; there is no keyed child diffing.
- **Minimal lifecycle, no context or store.** There are `mounted`, `unmounted`, `beforeUpdate` and `updated` hooks, but no context or state container. The library is a rendering layer.
- **Handlers without options.** Listener options require a `ref`.
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

| Script                 | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| `npm run build`        | Vite library build: ES, CJS and `.d.ts` into `dist/` |
| `npm test`             | Vitest with happy-dom and V8 coverage                |
| `npm run typecheck`    | `tsc --noEmit` over `src` and `tests`                |
| `npm run lint`         | ESLint (flat config, typescript-eslint, prettier)    |
| `npm run lint:fix`     | ESLint with autofix                                  |
| `npm run format`       | Prettier write                                       |
| `npm run format:check` | Prettier check                                       |

Tests enforce 100% statement, branch, function and line coverage; the run fails if coverage drops. Type-level behavior (attributes, events, styles, `ref` by tag) is covered by `tests/types.test.ts` and checked by `npm run typecheck`.

Source layout:

```
src/
  index.ts           public exports
  em.ts              Proxy factory and custom element registration
  component.ts       custom element class: props, setState, rendering entry
  types/             ComponentProps, attribute tables, render state
  utils/
    render.ts        creates or reuses the inner element and fills it
    syncAttributes.ts  attribute diffing
    applyStyle.ts    style diffing through the CSSOM
    setEventListeners.ts  listener diffing
    mount.ts         mount helper
tests/               Vitest suites (runtime and type-level)
```

## Release

Releases are published from CI. Bump the version, push, and push a matching tag:

```bash
npm version <patch|minor|major>
git push --follow-tags
```

A tag matching `v*` triggers the release workflow, which runs format check, lint, typecheck and tests, then publishes to npm with provenance via trusted publishing. Configure a trusted publisher for `ecmact` on npmjs.com (repository `eternalvision/ecmact`, workflow `release.yml`) before the first release.

The CI workflow runs the full check (format, lint, typecheck, tests with coverage, build, production audit) on every push to `main` and on pull requests.

## License

MIT
