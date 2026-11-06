# {{name}}

An [ECMact](https://github.com/eternalvision/ecmact) widget: a custom element you can drop into any page, built with Vite and TypeScript.

```bash
npm install
npm run dev
```

The dev page shows `<price-widget>` twice. `npm run build` also writes the embeddable script to `dist/widget/price-widget.js`.

## Embedding

Upload `dist/widget/price-widget.js` anywhere and add two lines to the page that should show the widget:

```html
<script src="https://example.com/price-widget.js"></script>
<price-widget price="49" currency="EUR" label="Pro plan"></price-widget>
```

- **Settings** are attributes (`price`, `currency`, `label`). Changing one with `setAttribute` updates the widget.
- **Look** is set from outside with CSS custom properties: `--widget-accent`, `--widget-bg`, `--widget-text`, `--widget-border`, `--widget-radius` and `--widget-font`. The widget's own styles live in a Shadow DOM, so the page's CSS cannot break it and it cannot leak into the page.
- **Results** come out as DOM events. The widget fires `add` with `{ quantity, total }`; listen to it on the page:

```js
document.addEventListener('add', (event) => console.log(event.detail));
```

## Scripts

| Command                | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `npm run dev`          | Start the dev server with the demo page                  |
| `npm run build`        | Type check, build the demo page and the widget script    |
| `npm run build:widget` | Build only `dist/widget/price-widget.js`                 |
| `npm test`             | Run the tests (Vitest, happy-dom)                        |
| `npm run check`        | Type check, lint, check the formatting and run the tests |

## Project

| Path                    | What it holds                                                   |
| ----------------------- | --------------------------------------------------------------- |
| `src/widget.ts`         | The widget: `defineWidget('price-widget', ...)`.                |
| `src/main.ts`           | The demo page entry.                                            |
| `index.html`            | The demo page.                                                  |
| `vite.widget.config.ts` | Builds `src/widget.ts` as a single script (IIFE) for embedding. |

Rename the widget by changing the tag name in `src/widget.ts`, `index.html` and the tests, and the file name in `vite.widget.config.ts`. A custom element name must contain a hyphen. See the [documentation](https://github.com/eternalvision/ecmact#embedding-as-a-widget) for `defineWidget`.
