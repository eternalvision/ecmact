<p align="center">
  <img src="https://raw.githubusercontent.com/eternalvision/ecmact/main/public/ecmact-logo.png" alt="ECMact" width="320" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/create-ecmact"><img src="https://img.shields.io/npm/v/create-ecmact?logo=npm&color=CB3837&label=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/create-ecmact"><img src="https://img.shields.io/npm/dm/create-ecmact?logo=npm&color=CB3837" alt="npm downloads" /></a>
  <a href="https://www.npmjs.com/package/ecmact"><img src="https://img.shields.io/npm/v/ecmact?logo=npm&color=CB3837&label=ecmact" alt="ecmact version" /></a>
  <a href="https://eternalvision.github.io/ecmact/"><img src="https://img.shields.io/badge/demo-live-1e7bff" alt="live demo" /></a>
</p>

# create-ecmact

Scaffold an [ECMact](https://github.com/eternalvision/ecmact) app with Vite and TypeScript. ECMact builds reactive interfaces on native Web Components, which suits widgets for other sites, small self-contained apps, internal tools and browser extensions.

```bash
npm create ecmact@latest my-app
cd my-app
npm install
npm run dev
```

With pnpm: `pnpm create ecmact my-app`. `yarn create ecmact` and `bun create ecmact` work too. Run it without arguments to be asked for the name, the template and, for an app, for Tailwind CSS.

For an embeddable custom element instead of an app: `npm create ecmact@latest my-widget -- --template widget`.

| Option           | Description                                                   |
| ---------------- | ------------------------------------------------------------- |
| `[directory]`    | Where to create the project. `.` uses the current directory.  |
| `-t, --template` | What to create: `app` (default) or `widget`.                  |
| `--tailwind`     | Add Tailwind CSS, wired in as a shared stylesheet (app only). |
| `--no-tailwind`  | Skip the Tailwind question.                                   |
| `-y, --yes`      | Use the defaults (`my-ecmact-app`, no Tailwind), ask nothing. |
| `-f, --force`    | Write into a directory that is not empty.                     |
| `-h, --help`     | Show the options.                                             |

The generated project is a small welcome page with the ECMact logo and a counter, in the style of the Vite, React and Next.js starters, with a test and with Prettier and ESLint configured in detail (`npm run check` runs everything). Requires Node 20.19 or newer.

Documentation: https://github.com/eternalvision/ecmact#readme
