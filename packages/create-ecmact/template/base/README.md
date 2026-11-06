# {{name}}

An [ECMact](https://github.com/eternalvision/ecmact) app built with Vite and TypeScript.

```bash
npm install
npm run dev
```

Open the address that Vite prints and edit `src/app.ts`. The same commands work with `pnpm`, `yarn` and `bun`.

## Scripts

| Command             | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `npm run dev`       | Start the dev server                                     |
| `npm run build`     | Type check and build to `dist/`                          |
| `npm run preview`   | Preview the production build                             |
| `npm test`          | Run the tests (Vitest, happy-dom)                        |
| `npm run lint`      | Lint with ESLint (`lint:fix` fixes what it can)          |
| `npm run format`    | Format with Prettier (`format:check` only checks)        |
| `npm run typecheck` | Type check without building                              |
| `npm run check`     | Type check, lint, check the formatting and run the tests |

## Project

| Path                 | What it holds                                                                 |
| -------------------- | ----------------------------------------------------------------------------- |
| `src/main.ts`        | The entry: configures ECMact and mounts the app.                              |
| `src/app.ts`         | The welcome page.                                                             |
| `src/components/`    | Components: the logo and the counter.                                         |
| `src/setup.ts`       | `configure()` calls, such as the stylesheets every component shares.          |
| `src/styles.css`     | Global styles and the color variables (dark, and light by system preference). |
| `public/favicon.png` | The favicon.                                                                  |

A component is a function that returns an element, styled by its own `css`. Props accept signals, so `content: computed(() => ...)` updates by itself. See the [documentation](https://github.com/eternalvision/ecmact#readme) for props, signals, routing and data fetching.

## Code quality

- **Prettier** (`.prettierrc`): 100 columns, single quotes, trailing commas, semicolons, LF. `.editorconfig` and `.vscode/settings.json` make editors follow it (format on save, ESLint fixes on save).
- **ESLint** (`eslint.config.ts`): `@eslint/js` plus the strict and stylistic type-checked rule sets of `typescript-eslint`, with extra rules for correctness (`eqeqeq`, `curly`, `no-eval`, `switch-exhaustiveness-check`), safety (`innerHTML` and friends are forbidden) and style (type imports, naming, sorted import members). `eslint-config-prettier` comes last, so the two never disagree.
