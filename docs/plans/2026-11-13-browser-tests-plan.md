# Plan: tests in Chromium, Firefox and WebKit

- Version: 1.0
- State: approved by the owner on 2026-11-13
- Specification: `docs/plans/2026-11-13-browser-tests-spec.md`, version 1.1, approved by the owner on 2026-11-13
- Tracker: GitHub Issues of `eternalvision/ecmact`, milestone [Browser tests](https://github.com/eternalvision/ecmact/milestone/1), issues #5-#18 created in F3 on 2026-11-13
- Materials: none

The specification says why, this plan says how, in which order and how each step is verified. No code is written in this phase.

## 1. Decisions of this plan

D22-D26 were decided by the owner on 2026-11-13 while this plan was written (questions asked one at a time). Numbering continues the specification.

| Id  | Decision                                                                                                                                                                                                                                                                                                                                                                | Alternatives considered                                                                                              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| D22 | An engine is selected with the `--project` option of Vitest. Scripts: `test:dom`, `test:chromium`, `test:firefox`, `test:webkit`, `test:browsers`, `browsers:install`.                                                                                                                                                                                                  | An environment variable read by the config that builds the list of engines.                                          |
| D23 | The three code paths that a real browser cannot reach by replacing a global (`typeof document` and `typeof location` in `src/http/dispatch.ts`, `typeof HTMLElement` in `src/core/component.ts`) read a new internal module `src/utils/env.ts`, which is not exported from the package. Tests replace it with `vi.mock`, the same way in happy-dom and in every engine. | `/* v8 ignore */` on the three branches and removal of their tests; decide in F4 after a trial run.                  |
| D24 | Browser-only tests live in `tests/browser/`, one file per area. `test:structure` keeps the closed list of their names and fails on any other file there (B07).                                                                                                                                                                                                          | A suffix `x.browser.test.ts` next to the shared test; a tag `browser-only` filtered with `--tags-filter`.            |
| D25 | Scripts added by this feature, and `scripts/check-tests.mjs` that this feature changes, are written in TypeScript and run by Node directly. The other `scripts/*.mjs` and `packages/create-ecmact/bin/create-ecmact.mjs` stay as they are; converting them is a separate issue.                                                                                         | Convert every `scripts/*.mjs` in this feature; also convert the published `bin` of `create-ecmact`.                  |
| D26 | Known failures are listed in one registry, `tests/knownFailures.ts`, with a helper `knownFailure(issue)` that returns the test options `{ fails: true }` in the named engine and `{}` elsewhere. The registry is the one place of K03.                                                                                                                                  | Engine tags with per-project `fails` options; a mark inside each test plus a list kept by hand in `CONTRIBUTING.md`. |

D23 deviates from section 7 of the specification ("no change to the published package or to its size"): the public API does not change, but the bundle grows by the size of `env.ts` (a few dozen bytes, measured by `npm run size` in US2.1). This is recorded in the handoff.

## 2. Facts this plan relies on

Verified on 2026-11-13 in the documentation of Vitest 5.0.3 (Context7) and in the installed sources of `vitest@5.1.0`:

- Browser mode is configured with `test.browser = { enabled, provider: playwright(), headless, instances: [{ browser: 'chromium' }, ...] }`; the provider comes from `@vitest/browser-playwright`. `npm view` gives `@vitest/browser-playwright@5.1.0` with the peers `vitest: 5.1.0` (exact) and `playwright: *`, and `playwright@1.65.0`.
- Each instance becomes a project. Its name is the browser name, or `"<parent> (<browser>)"` inside a named parent project, unless the instance sets `name`. `vitest run --project <name>` runs only that project (`--project` can be repeated and accepts wildcards and `!`).
- `@vitest/coverage-v8` throws "does not work with" when coverage is enabled and any non-Chromium instance is left after the `--project` filter (`vitest/dist/chunks/index.Di8au7q4.js`, around line 7449). Browser coverage is therefore always a run of the Chromium project alone. V8 coverage in Chromium is collected through the DevTools protocol.
- Test options include `fails` ("the test passes if it fails and fails if it passes"), which gives K02 without extra code, and `tags` with `--tags-filter`.
- The audit of `tests/**` (48 files) found 3 files that fail for certain in a browser (`http/dispatch.test.ts`, `router/router.test.ts`, and `index.test.ts` through coverage), 10 more at risk, and about 35 that look neutral. Details are in US2.1-US2.4.

Not verified (each is checked by the user story named):

- `server.browser` from `vitest/browser` and `provide`/`inject` per browser instance, as a way for `knownFailure` to know the engine, and whether importing `vitest/browser` works in the happy-dom run (US1.2).
- Whether `vi.resetModules()` followed by a dynamic import evaluates a module again in browser mode (US2.1).
- Whether V8 coverage of the Chromium run reaches the same 100% as the happy-dom run (US1.1, US2.5).
- The browser run on local Node 26; focus in headless engines; the limit of `history.length`; the cost of macOS runners (risks R5, R7, R8 of the specification).

## 3. Overview and order of delivery

| Phase | User stories                                     | Result                                                                                                     |
| ----- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| P1    | US1.1 runner and scripts, US1.2 structure checks | The engines run locally on demand. `npm test` and CI do not change yet.                                    |
| P2    | US2.1-US2.4 rewrites, US2.5 triage               | Every shared test passes in happy-dom and in the three engines or is a known failure; Chromium is at 100%. |
| P3    | US3.1-US3.3 browser-only tests                   | B01-B06 are covered in every engine.                                                                       |
| P4    | US4.1 gate and CI, US4.2 release                 | `npm test` runs everything; the engines are required on a PR, on `main` and before a publish.              |
| P5    | US5.1 contributor docs, US5.2 user docs          | `AGENTS.md`, `CONTRIBUTING.md`, the README and the site describe the result.                               |

Order: US1.1, then US1.2. US2.1-US2.4 depend on US1.1 only and can go in any order or in parallel. US2.5 comes after US2.1-US2.4. US3.1-US3.3 depend on US1.2 and US2.5. US4.1 depends on US2.5 and US3.1-US3.3, US4.2 on US4.1. US5.1 and US5.2 come last, because they describe the final scripts.

`npm test` keeps today's meaning until US4.1, so `main` stays green while the rewrites land.

## 4. Common rules

- One user story is one issue, one branch `feature/<issue number>-<slug>` from `main` and one PR with a title only. Commit, push and PR only when the owner asks.
- The gate before a commit, as in `AGENTS.md`: `npm run lint && npm run format:check && npm run typecheck && npm test`. From US1.1 on, a story that touches tests also runs `npm run test:browsers` and says which engines passed.
- Tests first where possible. Every `src/**/x.ts` has `tests/**/x.test.ts`; 100% coverage in the happy-dom run (S05) and, from US2.5 on, in the Chromium run (V01).
- Rewriting a test keeps its assertion (S04). A weaker assertion is a deviation: recorded in `docs/handoff.md` and reported to the owner.
- A defect of the library found in Firefox or WebKit is not fixed in this feature (D11): the owner is told, an issue is opened only after the owner says so, and the test gets `knownFailure`. A defect found in Chromium that breaks V01 is fixed here (D16).
- A decision that this plan does not cover (a new dependency beyond section 5, a new browser-only area, skipping a test) stops the work and goes to the owner.
- Imports through the aliases, JSDoc on everything in `src`, named arrow exports, no default exports (`AGENTS.md`).
- Local runs use Node 22, as CI does.

## 5. Mechanisms

Dependencies (dev only; the library keeps zero runtime dependencies): `@vitest/browser-playwright` at the exact version of `vitest` (5.1.0 today), `playwright` at an exact version (1.65.0 today; D19 needs a pinned version), and `@types/node` at the root for the TypeScript scripts (D25; today it is present only through `packages/create-ecmact`). Dependabot keeps updating them in the existing `dev-dependencies` group; `vitest`, `@vitest/coverage-v8` and `@vitest/browser-playwright` must move together because of the exact peer.

Config (`vite.config.ts`), `test.projects`:

- `dom`: today's settings (happy-dom, `tests/**/*.test.ts`), excluding `tests/browser/**`.
- `browser`: `tests/**/*.test.ts` including `tests/browser/**`, `browser.enabled`, `provider: playwright()`, `headless: true` (L04), `instances` with explicit names `chromium`, `firefox`, `webkit`.
- Coverage settings stay as today (include, exclude, 100% thresholds). The Chromium run writes its report to `coverage/chromium` so that it does not overwrite the happy-dom report.

Scripts (D22):

| Script              | Runs                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `test:dom`          | `vitest run --project dom --coverage`                                                    |
| `test:chromium`     | `vitest run --project chromium --coverage --coverage.reportsDirectory=coverage/chromium` |
| `test:firefox`      | `vitest run --project firefox`                                                           |
| `test:webkit`       | `vitest run --project webkit`                                                            |
| `test:browsers`     | the three above, one after another                                                       |
| `browsers:install`  | `playwright install chromium firefox webkit`                                             |
| `test` (from US4.1) | `test:structure`, `test:dom`, `test:browsers`, then the workspaces as today              |

A missing engine (L02): a TypeScript script `scripts/check-browsers.ts`, run before each engine script, asks Playwright for the executable path of the engine and, if the file does not exist, exits with a message that names `npm run browsers:install`.

Missing APIs in a real browser (S03), one rule for all tests:

- A global that the browser lets replace (`CSSStyleSheet`, `FormData`, `Blob`, `ReadableStream`, `fetch`) is replaced with `vi.stubGlobal` inside the test that needs it and restored with `vi.unstubAllGlobals`, never in a `beforeEach` of the whole file.
- A missing method of an element (`attachInternals`) is hidden for one test with `vi.spyOn(..., 'attachInternals', 'get')` or by shadowing it on the test's own subclass, and restored; the real method is never deleted.
- `document`, `location` and `HTMLElement` are read through `src/utils/env.ts` and replaced with `vi.mock('@em/utils/env', ...)` (D23).

Known failures (D26): `tests/knownFailures.ts` holds the list `{ issue, engine, file, test }` and exports `knownFailure(issue)`. A test is written `it('name', knownFailure(12), () => ...)`. `test:structure` fails when an entry of the registry is not used by exactly one test, or a test uses an issue that is not in the registry. How the helper learns the engine is chosen in US1.2 among the documented ways listed in section 2.

## 6. Phases and user stories

### P1 Runner

#### US1.1 (#5) Run the suite in the three engines on demand

As a maintainer I want to run the library tests in Chromium, Firefox and WebKit with one command each, so that differences between engines are visible before they reach CI.

- Affected: `package.json` (dev dependencies, scripts of section 5 except `test`), `vite.config.ts`, `scripts/check-browsers.ts`, `tsconfig.json` and `eslint.config.ts` (include `scripts/**/*.ts`), `.gitignore` if needed.
- Acceptance criteria:
  - AC-01 `npm run browsers:install` installs the three engines; `npm run test:chromium`, `test:firefox` and `test:webkit` each start that engine headless and run every file of `tests/**` (failures in tests are expected at this point and listed in the PR).
  - AC-02 `npm run test:dom` gives the same result and the same 100% coverage as today's `vitest run --coverage`.
  - AC-03 `npm test` is unchanged and passes.
  - AC-04 (error) With an engine removed from the Playwright cache, its script exits with a non-zero code and a message that names `npm run browsers:install`.
  - AC-05 (edge) `test:chromium` writes coverage to `coverage/chromium` and does not touch `coverage/`; the coverage numbers of the first Chromium run are recorded in the PR (R3).
  - AC-06 A failing test in an engine run prints the project name (engine), the file, the test and the assertion (C04).
- Tests: by hand (the commands above); the run of `scripts/check-browsers.ts` with an engine missing.
- Estimate: M. Depends on: -.
- Requirements: S01, S05, L02, L03, L04, C04, V01, V02.

#### US1.2 (#6) Structure checks: browser-only folder and known failures

As a maintainer I want the structure check to guard the browser-only folder and the known-failure registry, so that the closed list (B07) and the single list of failures (K03) cannot drift.

- Affected: `scripts/check-tests.mjs` rewritten as `scripts/check-tests.ts` (D25), `package.json` (`test:structure`), `tests/knownFailures.ts`, `tests/browser/` (empty, with the closed list of six names in the check).
- Acceptance criteria:
  - AC-01 `test:structure` passes on the current tree and prints the same summary as today plus the number of browser-only files and known failures.
  - AC-02 (error) A file in `tests/browser/` that is not on the closed list fails `test:structure` with its path (B07).
  - AC-03 (error) A registry entry not used by any test, or a `knownFailure(n)` with no entry, fails `test:structure`.
  - AC-04 A test marked `knownFailure(n)` for engine X passes in X while it fails, fails in X once it passes (K02), and runs as a normal test in happy-dom and the other engines; shown by a temporary sample test in the PR, removed before merge.
  - AC-05 (edge) The helper works in the happy-dom run, where there is no engine.
- Tests: the check against temporary trees in the PR; the sample test of AC-04.
- Estimate: M. Depends on: US1.1.
- Requirements: B07, K01, K02, K03.

### P2 Shared tests pass in every engine

#### US2.1 (#7) Internal environment module and the three unreachable branches

As a maintainer I want the paths for a missing `document`, `location` and `HTMLElement` to be reachable in a browser, so that Chromium coverage can be 100% without weakening tests.

- Affected: `src/utils/env.ts` (new, JSDoc, not exported from `src/index.ts`), `src/http/dispatch.ts`, `src/core/component.ts`, `tests/utils/env.test.ts` (new), `tests/http/dispatch.test.ts`, `tests/index.test.ts`.
- Acceptance criteria:
  - AC-01 `tests/http/dispatch.test.ts` and `tests/index.test.ts` pass in happy-dom and in the three engines with the same assertions as before.
  - AC-02 The branches at today's `dispatch.ts:23`, `dispatch.ts:38` and `component.ts:14` are covered in the happy-dom run and in the Chromium run.
  - AC-03 (error) No test assigns or stubs `document`, `location` or `HTMLElement`; a search in `tests/` finds none.
  - AC-04 (edge) The public exports of `ecmact` do not change (the export list test in `tests/index.test.ts` passes unchanged); the size difference from `npm run size` is written in the PR and in the handoff (D23).
  - AC-05 If `vi.resetModules()` plus a dynamic import does not evaluate `component.ts` again in browser mode, the work stops and the owner is asked how to test the no-`HTMLElement` case.
- Tests: `tests/utils/env.test.ts`; the rewritten tests.
- Estimate: M. Depends on: US1.1.
- Requirements: S02, S03, S04, S05, V01.

#### US2.2 (#8) Components and form fields with the real element internals

As a maintainer I want the component tests to use the real `attachInternals` in browsers, so that the form API is tested as users get it.

- Affected: `tests/core/component.test.ts` (fake `attachInternals` on `HTMLElement.prototype` and its `delete`), `tests/forms/*.test.ts` if they rely on the fake.
- Acceptance criteria:
  - AC-01 The tests pass in happy-dom and in the three engines with the same assertions.
  - AC-02 (error) No test deletes or overwrites a built-in method of a prototype for longer than one test; the missing-method path is reached as in section 5.
  - AC-03 (edge) In engines the assertions on value and validity run against the real `ElementInternals`; in happy-dom the existing fake stays, limited to the happy-dom run.
- Tests: the rewritten file.
- Estimate: M. Depends on: US1.1.
- Requirements: S02, S03, S04.

#### US2.3 (#9) Styles and stylesheets

As a maintainer I want the style tests to exercise the real stylesheet path in browsers, so that `CSSStyleSheet` and `adoptedStyleSheets` are tested for real.

- Affected: `tests/styled/styled.test.ts`, `tests/styled/template.test.ts`, `tests/styled/inject.test.ts`, `tests/render/applyStyleSheets.test.ts`, `tests/widget/widget.test.ts`, `tests/core/component.test.ts` (the `CSSStyleSheet` stubs), `tests/helpers.ts`.
- Acceptance criteria:
  - AC-01 The tests pass in happy-dom and in the three engines with the same assertions.
  - AC-02 (error) `CSSStyleSheet` is stubbed only inside tests of the fallback path, never in a `beforeEach` of a whole file.
  - AC-03 (edge) Assertions on CSS text compare the meaning, not the serialization of one engine (for example a computed style or a normalised rule), and this is not weaker than before; any weaker assertion is a deviation (S04).
  - AC-04 Clean-up between tests removes only the nodes the library added (`style[data-ecmact]`), not everything in `document.head`.
- Tests: the rewritten files.
- Estimate: M. Depends on: US1.1.
- Requirements: S02, S03, S04.

#### US2.4 (#10) Router, HTTP, storage and focus isolation

As a maintainer I want tests that touch page-wide state to clean up after themselves, so that they pass in a real page that keeps cookies, storage and history.

- Affected: `tests/router/router.test.ts` (`vi.spyOn(window, 'location', 'get')`, `history.pushState`), `tests/http/dispatch.test.ts` (cookies), `tests/store/persist.test.ts` (`localStorage`), `tests/core/each.test.ts` (focus), `tests/http/body.test.ts`.
- Acceptance criteria:
  - AC-01 The tests pass in happy-dom and in the three engines with the same assertions.
  - AC-02 (error) No test navigates the test frame away: the external-link path of the router is reached without a real `location.assign` to another origin.
  - AC-03 (edge) Every cookie and storage key that a test sets is removed after it, and no test calls `localStorage.clear()` on shared keys; the history-length check does not depend on the number of earlier entries.
  - AC-04 Focus assertions mount the element in the document and pass headless in the three engines.
- Tests: the rewritten files.
- Estimate: M. Depends on: US1.1.
- Requirements: S02, S03, S04.

#### US2.5 (#11) Triage of the remaining failures and Chromium coverage

As a maintainer I want every remaining engine failure explained, so that the suite is green in every engine with known failures named.

- Affected: any test still failing after US2.1-US2.4; `tests/knownFailures.ts`; `src` only for a Chromium defect that breaks V01 (D16).
- Acceptance criteria:
  - AC-01 `npm run test:dom` and `npm run test:browsers` pass on Node 22.
  - AC-02 `test:chromium` enforces 100% statements, branches, functions and lines for `src/**/*.ts`.
  - AC-03 (error) Each remaining failure in Firefox or WebKit is either a mistake of a test, fixed here, or a library defect: reported to the owner, an issue opened after the owner's yes with engine, test and observed behaviour, and the test marked `knownFailure(issue)` for that engine only.
  - AC-04 (edge) No test is skipped by environment; a search for `skipIf`, `runIf` and `skip` added by this feature finds none.
- Tests: the full run in all environments.
- Estimate: L (the number of failures is not known, risk R1). Depends on: US2.1-US2.4, US1.2.
- Requirements: S01, S02, K01, V01, V03.

### P3 Browser-only tests

#### US3.1 (#12) Form-associated fields in a real form (B01)

As a widget author I want a `field: true` component to behave as a native form control, so that forms built with ECMact work in every engine.

- Affected: `tests/browser/forms.test.ts`.
- Acceptance criteria:
  - AC-01 The value of the component is in `new FormData(form)`; `form.reset()` resets it.
  - AC-02 `<fieldset disabled>` disables the component; a click on its `<label>` reaches the control.
  - AC-03 (error) Invalid state set through `setValidity` makes `form.checkValidity()` return `false` and fire `invalid`.
  - AC-04 The file runs in the three engines and not in happy-dom; its lines count toward Chromium coverage only (V02).
- Tests: the file itself.
- Estimate: M. Depends on: US1.2, US2.5.
- Requirements: B01, V02.

#### US3.2 (#13) Styles in a real engine (B02-B04)

As a widget author I want the styles produced by `styled` and `css` to apply in every engine, so that isolated styles are not only correct as text.

- Affected: `tests/browser/nesting.test.ts`, `tests/browser/parse-warning.test.ts`, `tests/browser/adopted-sheets.test.ts`.
- Acceptance criteria:
  - AC-01 A nested selector produced by `styled` gives the declared computed style (B02).
  - AC-02 (error) A rule that the engine cannot parse takes the warning path of `src/styled/inject.ts` without a mocked `insertRule`, and the other rules still apply (B03).
  - AC-03 Styles adopted on a shadow root apply (computed style), and `@property` rules are copied to the document and take effect (B04).
- Tests: the files themselves.
- Estimate: M. Depends on: US1.2, US2.5.
- Requirements: B02, B03, B04, V02.

#### US3.3 (#14) Focus, moving and events across the shadow boundary (B05, B06)

As a widget author I want lists, moves and events to behave the same in every engine, so that widgets keep focus and state.

- Affected: `tests/browser/focus.test.ts`, `tests/browser/lifecycle.test.ts`.
- Acceptance criteria:
  - AC-01 `each` restores focus to an element inside a shadow root after a reorder (B05).
  - AC-02 Moving a widget in the DOM does not run its cleanup; removing it does. A moved component runs the cleanup, `unmounted` and `mounted` and keeps following signals in between, as the README documents; removing it stops it (B06, D32).
  - AC-03 (edge) An event emitted by a widget is received by a listener outside its shadow root (`composed`).
- Tests: the files themselves.
- Estimate: S. Depends on: US1.2, US2.5.
- Requirements: B05, B06, V02.

### P4 Gate and CI

#### US4.1 (#15) `npm test` and `ci.yml`

As a maintainer I want the engines in the local gate and as required checks, so that no change lands untested in an engine.

- Affected: `package.json` (`test`, and a script for the happy-dom part used by CI), `.github/workflows/ci.yml`, a reusable workflow `.github/workflows/browsers.yml` shared with US4.2.
- Acceptance criteria:
  - AC-01 `npm test` runs `test:structure`, `test:dom`, `test:browsers` and the workspaces, and fails if any part fails (L01).
  - AC-02 `ci.yml` keeps the Node 22 and 24 jobs, which now run the happy-dom part only (C05), and calls `browsers.yml`, which runs Chromium and Firefox on `ubuntu-latest` and WebKit on `macos-latest`, all on Node 22, on a PR and on a push to `main` (C01).
  - AC-03 The Playwright engines are cached by system and Playwright version; a second run of the same commit reports a cache hit (C03).
  - AC-04 (error) A deliberately failing test on a throwaway branch fails the workflow and the log names the engine, the test and the assertion (C04); the branch is deleted afterwards.
  - AC-05 (edge) After a Dependabot update of `playwright` the cache key changes and the new engines are downloaded.
- Tests: CI runs on the PR; AC-04 on a throwaway branch.
- Estimate: M. Depends on: US2.5, US3.1-US3.3.
- Requirements: L01, C01, C03, C04, C05.

#### US4.2 (#16) Engines before a publish

As a maintainer I want a release to publish only after the three engines pass, so that an engine defect cannot reach npm.

- Affected: `.github/workflows/release.yml`.
- Acceptance criteria:
  - AC-01 The release workflow calls `browsers.yml`; the publish job `needs` it and runs the happy-dom part itself.
  - AC-02 (error) A failure in any engine prevents the publish steps; checked by reading the job graph, without pushing a tag (no tag without the owner's request).
- Tests: `actionlint` or a review of the workflow graph; no real release.
- Estimate: S. Depends on: US4.1.
- Requirements: C02.

### P5 Documentation

#### US5.1 (#17) Contributor documentation

As a contributor I want to know how to install the engines and what to do with an engine failure, so that I can pass the gate.

- Affected: `AGENTS.md`, `CONTRIBUTING.md`.
- Acceptance criteria:
  - AC-01 Both describe the gate with the engines, `npm run browsers:install`, the single-engine scripts and the rule of section 5 for missing APIs.
  - AC-02 (edge) Both describe the known-failure rule: issue first, `knownFailure(issue)` in the registry, the mark is removed when the test passes.
- Tests: `npm run format:check`; reading.
- Estimate: S. Depends on: US4.1.
- Requirements: O01.

#### US5.2 (#18) Browser support in the README and on the site

As a user I want to see which engines are tested, so that I can judge support for my audience.

- Affected: `README.md` ("Browser support"), `packages/site/src/content/docs/tooling.ts` and `ru/tooling.ts`, and `limitations.ts`, `getting-started.ts` with their `ru/` pairs where they repeat the support statement.
- Acceptance criteria:
  - AC-01 The text keeps "any evergreen browser" and names Chromium, Firefox and WebKit as tested in CI with the Playwright version as the source of the engine versions (D20).
  - AC-02 (edge) The English and Russian pages change string for string; the site tests pass.
- Tests: `npm test` (site tests stay on happy-dom, D21).
- Estimate: S. Depends on: US4.1.
- Requirements: O02.

## 7. Coverage of the requirements

| Requirement | User stories               |
| ----------- | -------------------------- |
| S01         | US1.1, US2.5               |
| S02         | US2.1-US2.5                |
| S03         | US2.1, US2.2, US2.3, US2.4 |
| S04         | US2.1, US2.2, US2.3, US2.4 |
| S05         | US1.1, US2.1               |
| B01         | US3.1                      |
| B02         | US3.2                      |
| B03         | US3.2                      |
| B04         | US3.2                      |
| B05         | US3.3                      |
| B06         | US3.3                      |
| B07         | US1.2                      |
| K01         | US1.2, US2.5               |
| K02         | US1.2                      |
| K03         | US1.2                      |
| L01         | US4.1                      |
| L02         | US1.1                      |
| L03         | US1.1                      |
| L04         | US1.1                      |
| C01         | US4.1                      |
| C02         | US4.2                      |
| C03         | US4.1                      |
| C04         | US1.1, US4.1               |
| C05         | US4.1                      |
| V01         | US1.1, US2.1, US2.5        |
| V02         | US1.1, US3.1-US3.3         |
| V03         | US2.5                      |
| O01         | US5.1                      |
| O02         | US5.2                      |

Every user story has at least one acceptance criterion for an error or an edge case.
