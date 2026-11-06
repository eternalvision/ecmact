# Contributing to ECMact

ECMact focuses on reactive interfaces and embeddable widgets built with native Web Components. Bug reports, documentation improvements and small, focused pull requests are welcome.

## Before you start

- Read the [API documentation and limitations](README.md).
- Search [existing issues](https://github.com/eternalvision/ecmact/issues) before opening a new one.
- For a new API or a breaking change, open a feature request describing the use case and alternatives before implementing it.
- Report potential vulnerabilities privately using the [security policy](SECURITY.md).

## Local development

Use Node.js 22.22.2 or newer; CI checks Node.js 22 and 24. Install from the repository root with `npm ci`. This is an npm workspace: the root package is `ecmact`, and `packages/create-ecmact` contains the scaffolder and templates.

Before submitting a change, run the applicable checks:

- `npm run format:check` for Markdown, configuration and source formatting.
- `npm run lint` and `npm run typecheck` for source changes.
- `npm test` for tests and coverage across the workspace.
- `npm run build:all` for the library and scaffolder builds.
- `npm run test:template` after building when changing the scaffolder or templates.

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
