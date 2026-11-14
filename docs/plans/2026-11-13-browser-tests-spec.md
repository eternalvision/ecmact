# Specification: tests in Chromium, Firefox and WebKit

- Version: 1.1
- State: approved by the owner on 2026-11-13
- Tracker: GitHub Issues of `eternalvision/ecmact`; no issue or milestone exists yet (created in F3 after "create")
- Assignment: `docs/handoff.md`, roadmap item 1, "Trust"
- Materials: none (no wireframes, the feature has no screen; a diagram would go into `docs/sessions/13112026-Browser-tests/`)

## 1. Purpose

Everything in ECMact 3.0.0 was verified in happy-dom and, by hand, in Chromium. Firefox and Safari are not verified, while the README promises "any evergreen browser". This feature makes the test suite of the library run in three browser engines, locally and in CI, so that a difference between engines fails a build before a release instead of reaching a user.

## 2. Decisions

D6-D13 were decided by the owner on 2026-11-13 while this specification was written. D14-D21 answer the questions Q1-Q8 of version 1.0; they were given by the main session on the owner's delegation on 2026-11-13 and approved by the owner with the specification. Numbering continues `docs/handoff.md`.

| Id  | Decision                                                                                                                                                                                   | Alternatives considered                                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D6  | The whole test suite of the library (`tests/**`, 48 files, about 707 tests) runs in Chromium, Firefox and WebKit, in addition to happy-dom.                                                | A separate small browser suite for the sensitive areas only; end-to-end tests against built artifacts (site demos, the widget bundle, the template); both of those together. |
| D7  | Every existing test passes in both environments. A test that depends on happy-dom is rewritten; none is skipped in browsers.                                                               | Mark such tests "happy-dom only" and skip them in browsers; mark them and add browser-only replacements.                                                                     |
| D8  | New browser-only tests are added for what happy-dom cannot check. They are the one explicit exception to D7, limited to the areas listed in B01-B06.                                       | Leave those areas out of scope as a known risk.                                                                                                                              |
| D9  | The browser run is a required check on a pull request, on a push to `main` and in the release workflow before publishing.                                                                  | Required in `ci.yml` only; a non-blocking run.                                                                                                                               |
| D10 | `npm test` runs happy-dom and the three browsers. The gate before a commit therefore includes the browsers.                                                                                | A separate script outside the gate; a separate script added to the gate.                                                                                                     |
| D11 | A real defect of the library found in Firefox or WebKit becomes a GitHub issue and is fixed separately. Its test is marked as expected to fail in that browser, with the issue referenced. | Fix every defect inside this feature; decide per defect.                                                                                                                     |
| D12 | In CI, Chromium and Firefox run on `ubuntu-latest`, WebKit runs on `macos-latest`.                                                                                                         | All three on ubuntu; an additional run in real Safari through safaridriver.                                                                                                  |
| D13 | The 100% coverage threshold is required from the browser run as well as from the happy-dom run.                                                                                            | Coverage from happy-dom only; postpone.                                                                                                                                      |
| D14 | The runner is the browser mode of Vitest with the Playwright provider (`@vitest/browser-playwright`): the existing tests are Vitest tests and this provider has a WebKit build.            | The WebdriverIO provider, which drives installed browsers and has no WebKit build for Linux.                                                                                 |
| D15 | Browser coverage is measured in Chromium only. Firefox and WebKit only pass or fail. The 100% of D13 is required from the Chromium run and from the happy-dom run.                         | Coverage in every engine; coverage merged over the three engines.                                                                                                            |
| D16 | A known failure in Firefox or WebKit does not touch coverage (D15). A defect found in Chromium that breaks the threshold is fixed inside this feature, as the one exception to D11.        | Lower the threshold of an engine by a recorded exception; measure coverage only in engines without known failures.                                                           |
| D17 | The engines run on Node 22 only.                                                                                                                                                           | Engines on Node 22 and 24.                                                                                                                                                   |
| D18 | The existing CI jobs for Node 22 and 24 run the happy-dom part only; separate jobs run the engines. `npm test` still runs everything (D10), CI calls the parts through separate scripts.   | Every job runs everything its system supports.                                                                                                                               |
| D19 | The engines are the ones that the pinned Playwright version ships, updated by Dependabot.                                                                                                  | Also a fixed oldest version of each engine.                                                                                                                                  |
| D20 | "Browser support" keeps "any evergreen browser" and adds which engines and versions are tested in CI.                                                                                      | Replace the wording with the three tested engines.                                                                                                                           |
| D21 | The tests of the site stay on happy-dom.                                                                                                                                                   | A later feature runs the site tests in the engines.                                                                                                                          |

## 3. Terms

- **happy-dom run**: today's run of `tests/**/*.test.ts` in Node with the happy-dom environment.
- **browser run**: the same test files executed inside a real browser engine.
- **engine**: Chromium, Firefox or WebKit as shipped by Playwright. WebKit is the engine of Safari, not Safari itself.
- **shared test**: a test that runs in the happy-dom run and in every engine (D7).
- **browser-only test**: a test that runs in the engines and not in happy-dom (D8).
- **known failure**: a test marked as expected to fail in a named engine because of a defect recorded in an issue (D11).

## 4. Scope

In scope:

- Running the suite of the library in three engines, locally and in CI.
- Rewriting the existing tests of the library that cannot pass in a real browser.
- Browser-only tests for the areas B01-B06.
- Changes to `ci.yml` and `release.yml`, to the scripts in `package.json`, to `AGENTS.md`, `CONTRIBUTING.md` and the documentation that describes testing and browser support.
- Issues for defects found (D11).

Out of scope:

- Fixing defects of the library found by the run (separate issues, D11), unless a defect is a mistake of a test.
- The tests of the site (`packages/site`, 99 files) and of `create-ecmact`; they stay on happy-dom (D21), and so do the scaffolded templates.
- End-to-end tests of built artifacts (site demos, `dist/embed/ecmact-widgets.js`, host pages). A later, separate feature may check the built widget bundle end to end, which is what risk R9 is about.
- Real Safari on macOS or iOS, mobile browsers, old browser versions, visual regression tests.
- `npm run bench` and `npm run size`.
- The four rough edges of 3.0 listed in `docs/handoff.md` and the patch release itself (the rest of roadmap item 1).
- Any change of documented behaviour of 3.x.

## 5. Requirements

Suite (S):

- **S01** Every test file under `tests/**` runs in Chromium, Firefox and WebKit.
- **S02** Every existing test passes in the happy-dom run and in each engine, or is a known failure under K01. No existing test is skipped by environment.
- **S03** A test may not rely on an API that only happy-dom provides, or on replacing a browser API that a real browser does not allow to replace. Where a code path exists only for an environment without an API (no `CSSStyleSheet`, no `attachInternals`, no `HTMLElement`), the way to reach it in a browser is defined in the plan and is the same in all tests.
- **S04** A rewritten test keeps what it asserted before. A weaker assertion is recorded as a deviation in the handoff.
- **S05** The happy-dom run stays and keeps its 100% thresholds.

Browser-only tests (B), each in every engine:

- **B01** A `field: true` component inside a real `<form>`: its value is in `FormData` of the form, `form.reset()` resets it, `<fieldset disabled>` disables it, validity set through `setValidity` is reported by `checkValidity()` of the form, a click on an associated `<label>` reaches the control.
- **B02** Native CSS nesting produced by `styled` is parsed: the computed style of a nested selector matches the declared value.
- **B03** A rule that the engine cannot parse takes the warning path of `src/styled/inject.ts` without a mocked `insertRule`.
- **B04** `adoptedStyleSheets` on a shadow root applies styles (computed style), including `@property` rules copied to the document.
- **B05** `each` restores focus when the focused element is inside a shadow root.
- **B06** Moving a widget in the DOM does not run its cleanup; removing it does. A moved component behaves as the README documents (Lifecycle): the cleanup, `unmounted` and `mounted` run and it keeps following signals in between; removing it stops it (D32). Events emitted by a widget cross the shadow boundary (`composed`).
- **B07** The set of browser-only tests is closed: a new browser-only area needs a decision of the owner.

Known failures (K):

- **K01** A defect of the library found in an engine is recorded as a GitHub issue with the engine, the test and the observed behaviour. The test is marked as expected to fail in that engine only and names the issue.
- **K02** A known failure that starts to pass fails the run, so that the mark is removed.
- **K03** The list of known failures is visible in one place (how: plan).

Local run (L):

- **L01** `npm test` runs the happy-dom run and the three engines and fails if any of them fails.
- **L02** One command installs the engines; a missing engine produces a message that names that command.
- **L03** A single engine and the happy-dom run can each be run alone.
- **L04** The run is headless by default.

CI (C):

- **C01** `ci.yml`: Chromium and Firefox on `ubuntu-latest`, WebKit on `macos-latest`, all on Node 22 (D17), in jobs of their own (D18), on a pull request and on a push to `main`. A failure in any engine fails the workflow.
- **C05** The existing jobs for Node 22 and 24 run the happy-dom part only (D18).
- **C02** `release.yml`: the same three engines pass before the publish step. A failure prevents publishing.
- **C03** The downloaded engines are cached between runs.
- **C04** On a failure the log names the engine, the test and the assertion.

Coverage (V):

- **V01** The Chromium run enforces 100% statements, branches, functions and lines for `src/**/*.ts` (same include and exclude as today). Firefox and WebKit measure no coverage: they pass or fail (D15).
- **V02** Browser-only tests count toward the Chromium coverage and not toward the happy-dom coverage.
- **V03** A defect found in Chromium that breaks V01 is fixed inside this feature (D16).

Documentation (O):

- **O01** `AGENTS.md` and `CONTRIBUTING.md` describe the new gate, the install command and the rule for known failures.
- **O02** The site page on tooling and the "Browser support" section of the README keep "any evergreen browser" and say which engines and versions are tested in CI (D20), in English and Russian.

## 6. Wireframes

None. The feature has no screen.

## 7. Data and interfaces

- npm scripts: `npm test` changes its meaning (L01). New scripts for the engines, a single engine and the install of the engines; names are set in the plan.
- New dev dependencies (the library keeps zero runtime dependencies): the Vitest browser package, its Playwright provider and Playwright. Exact packages and versions: plan. Vitest today is 5.1.0.
- A selection of engines from the environment or the command line is needed, because CI runs different engines on different systems (C01) while `npm test` runs all three locally.
- `ci.yml` and `release.yml` get jobs for the engines. `pages.yml` and `release-create.yml` do not change.
- Marking of browser-only tests and of known failures: the mechanism (file name, tag, helper) is set in the plan.
- No change to `src` public API, to the published package or to its size.

## 8. Risks

- R1 The number of tests that need rewriting is not verified. It is known only after the first browser run; D7 allows no skipping, so the estimate of the feature is open.
- R2 Browser mode serves native ES modules: `vi.spyOn` on a module export does not work there, `vi.mock(path, { spy: true })` is the documented replacement. Whether the tests use such spies is not verified.
- R3 V01 may not be reachable as written. Coverage is needed in Chromium only (D15), which removes the question of a coverage provider for Firefox and WebKit, but branches for an environment without a DOM or without `CSSStyleSheet` still need a replaced global inside a real browser, and whether the coverage provider of Vitest 5 gives the same numbers in browser mode is not verified.
- R4 Resolved by D15 and D16: a known failure in Firefox or WebKit does not affect coverage, and a defect in Chromium is fixed inside the feature.
- R5 `npm test` now needs downloaded engines (several hundred MB) on every machine, including a contributor's. The local Node is 26, CI uses 22; the browser run on Node 26 is not verified.
- R6 WebKit from Playwright on macOS is not Safari. Safari on macOS and iOS stays unverified.
- R7 Real browsers add time and flakiness (focus, timing of microtasks and frames) to a gate that blocks a release (D9). A flaky engine can block a publish.
- R8 macOS runners are slower than ubuntu; the cost for a public repository is not verified.
- R9 The run tests the source through Vite, not the published build. A defect of the built files is not caught.

## 9. To decide

Nothing is open. The questions Q1-Q8 of version 1.0 were answered on 2026-11-13 and are recorded as D14-D21 in section 2.
