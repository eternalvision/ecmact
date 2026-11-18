# Contributing to ECMact

ECMact focuses on reactive interfaces and embeddable widgets built with native Web Components. Bug reports, documentation improvements and small, focused pull requests are welcome.

## Before you start

- Read the [API documentation and limitations](README.md).
- Search [existing issues](https://github.com/eternalvision/ecmact/issues) before opening a new one.
- For a new API or a breaking change, open a feature request describing the use case and alternatives before implementing it.
- Report potential vulnerabilities privately using the [security policy](SECURITY.md).

## Local development

Use a POSIX shell (macOS, Linux or WSL; the scripts do not run in cmd.exe) and Node.js 22.22.2 or newer; CI checks Node.js 22 and 24. Install from the repository root with `npm ci`, then install the browser engines once with `npm run browsers:install`. On Linux, if an engine cannot start because of missing system libraries, run `npx playwright install-deps`. This is an npm workspace: the root package is `ecmact`, and `packages/create-ecmact` contains the scaffolder and templates.

Before submitting a change, run the applicable checks:

- `npm run format:check` for Markdown, configuration and source formatting.
- `npm run lint` and `npm run typecheck` for source changes.
- `npm test` for tests and coverage across the workspace. It runs the structure check, the happy-dom run, then the library tests in Chromium, Firefox and WebKit, then the other packages. It needs the engines from `npm run browsers:install`.
- `npm run build:all` for the library and scaffolder builds.
- `npm run test:template` after building when changing the scaffolder or templates.

### Browser tests

The library tests run in four places: happy-dom (`npm run test:dom`) and the real engines Chromium, Firefox and WebKit through Playwright, headless. Run one of them alone while you work:

- `npm run test:dom`, `npm run test:chromium`, `npm run test:firefox`, `npm run test:webkit`; `npm run test:browsers` runs the three engines one after another and fails if any of them fails.
- `npm run test:ci` is `npm test` without the engines (structure check, happy-dom, the other packages). CI uses it in the `check` job, and the engines run in the separate `browsers` workflow, one job per engine.
- A missing engine stops its script with a message that names `npm run browsers:install`. Run that command again after a Playwright update, because the engines follow the Playwright version.
- The Chromium run writes coverage to `coverage/chromium` and the happy-dom run to `coverage/`. Both keep the 100% thresholds.

Tests must pass in every engine. A test must not depend on an API that only happy-dom has, or on replacing a browser API that a real browser does not let you replace:

- Replace a global that the browser allows to replace (`CSSStyleSheet`, `FormData`, `Blob`, `ReadableStream`, `fetch`) with `vi.stubGlobal` inside the test that needs it, and restore it with `vi.unstubAllGlobals`. Do not do it in a `beforeEach` of the whole file.
- Hide a missing method of an element (`attachInternals`) for one test with `vi.spyOn(..., 'attachInternals', 'get')`, or shadow it on the test's own subclass, and restore it. Never delete the real method.
- `document`, `location` and `HTMLElement` are read through `src/utils/env.ts`; replace them with `vi.mock('@em/utils/env', ...)`.
- Tests that need a real browser live in `tests/browser/`. The list of its files is closed and checked by `npm run test:structure`; a new browser-only area needs the maintainer's decision.

### A test that fails in one engine

When a test fails in one engine because of a defect of the library, do not fix the library in the same change and do not skip the test:

1. Open a GitHub issue with the engine, the test and the observed behaviour.
2. Add an entry `{ issue, engine, file, test }` to `knownFailures` in `tests/knownFailures.ts`, the only list of known failures.
3. Write the test as `it('name', knownFailure(12), () => ...)`, where `12` is the number of the issue. It is expected to fail in that engine only; in happy-dom and the other engines it runs as a normal test.
4. When the defect is fixed and the test passes in that engine, the run fails on purpose. Remove `knownFailure(...)` from the test and its entry from the registry, in the same change.

`npm run test:structure` fails when an entry is used by no test or by more than one, or when a test uses an issue that has no entry.

For documentation-only changes, check formatting, links and the accuracy of the text. Explain any checks you could not run in the pull request.

## Project conventions

- Keep the library free of runtime dependencies; discuss additions first.
- Use the existing import aliases inside source and tests.
- Follow the existing TypeScript and JSDoc conventions described in [Development](README.md#development).
- Tests mirror source files. The existing test suite enforces 100% statement, branch, function and line coverage.
- Document public API changes and explain any compatibility implications.
- Include browser reproduction steps for DOM, focus, form and Shadow DOM issues; DOM emulators do not cover every browser behavior.
- Do not include generated build output, credentials or unrelated formatting changes.

## Pull requests

Target `main`. Describe the problem, the resulting behavior and the checks performed. Include screenshots for visible changes and link related issues. Keep each pull request focused on one change.

Package versions and release tags are handled separately from routine contributions. The two packages have independent versions and release workflows; see [Release](README.md#release).

## Working together

Keep feedback respectful and focused on the work. Give enough context for someone else to reproduce a problem without access to your private project. Remove tokens, personal data and proprietary code from public reports.
