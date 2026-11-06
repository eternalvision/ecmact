# create-ecmact

Scaffold an [ECMact](https://github.com/eternalvision/ecmact) app with Vite and TypeScript.

```bash
npm create ecmact@latest my-app
cd my-app
npm install
npm run dev
```

Works with `pnpm create ecmact`, `yarn create ecmact` and `bun create ecmact`. Run it without arguments to be asked for the name and for Tailwind CSS.

| Option          | Description                                                   |
| --------------- | ------------------------------------------------------------- |
| `[directory]`   | Where to create the project. `.` uses the current directory.  |
| `--tailwind`    | Add Tailwind CSS, wired in as a shared stylesheet.            |
| `--no-tailwind` | Skip the Tailwind question.                                   |
| `-y, --yes`     | Use the defaults (`my-ecmact-app`, no Tailwind), ask nothing. |
| `-f, --force`   | Write into a directory that is not empty.                     |
| `-h, --help`    | Show the options.                                             |

The generated project has a counter built from a signal, a Vitest test for it, a type-checking build and a `.gitignore`. Requires Node 20.19 or newer.

Documentation: https://github.com/eternalvision/ecmact#readme
