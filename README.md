<p align="center">
  <img src="https://raw.githubusercontent.com/eternalvision/ecmact/main/public/ecmact.png" alt="ECMact" width="300" />
</p>

# ECMact

Small component library on top of native Web Components. Components are custom elements with a Shadow DOM, created through a single `em` factory.

## Install

```bash
npm install ecmact
```

## Usage

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

## API

### `em.<Name>(props)`

Returns a custom element `em-<name>` (registered on first access). The name must match `/^[A-Za-z][A-Za-z0-9_-]*$/`, otherwise a `TypeError` is thrown.

| Prop        | Type                             | Description                                                               |
| ----------- | -------------------------------- | ------------------------------------------------------------------------- |
| `tag`       | `string`                         | Element rendered inside the shadow root. Default `div`.                   |
| `content`   | `string`                         | Text content. Never parsed as HTML.                                       |
| `html`      | `string`                         | Raw HTML. Opt-in, do not pass untrusted input.                            |
| `children`  | `Node[]`                         | Nodes appended after the content.                                         |
| `style`     | `Partial<CSSStyleDeclaration>`   | Inline styles, applied through the CSSOM.                                 |
| `ref`       | `(element: HTMLElement) => void` | Called once when the inner element is created.                            |
| `on<event>` | `(event: Event) => void`         | Event listener, e.g. `onclick`, `oninput`. Event name is lowercased.      |
| any other   | `string \| number \| boolean`    | Set as an attribute. `true` sets an empty attribute, `false`/`null` skip. |

### `component.setState(partial)`

Merges `partial` into the current props and updates the inner element in place. The element is reused while `tag` stays the same, so focus and input values survive updates. Attributes, styles and listeners that are no longer present are removed.

### `mount(target, ...nodes)`

Appends nodes to `target` (a CSS selector or an `Element`) and returns the container. Throws if the selector matches nothing.

## Notes

- The library can be imported without a DOM (SSR, Node tooling). Components can only be created in a browser-like environment.
- Content lives in a Shadow DOM: global styles do not apply, and form controls inside it do not participate in an outer `<form>`.

## Development

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Tests run on Vitest with happy-dom and enforce 100% coverage.

## Release

Push a tag matching `v*`. The release workflow publishes to npm with provenance via trusted publishing; configure the trusted publisher for `ecmact` on npmjs.com first.

## License

MIT
