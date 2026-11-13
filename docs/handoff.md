# Handoff: browser tests, US2.1-US2.4 done (2026-11-13)

State: F4. Stacked PRs, none merged: #19 US1.1, #20 US1.2, #21 US2.1, #22 US2.2, #23 US2.3, then US2.4 (#10, `feature/10-page-state`). Next: US2.5 (#11). Plan: `docs/plans/2026-11-13-browser-tests-plan.md`.

## Done

- F0-F3: spec v1.1, plan v1.0 approved; issues #5-#18, milestone "Browser tests".
- US1.1, US1.2: the engine projects and scripts; `scripts/check-tests.ts`, `tests/knownFailures.ts`.
- US2.1-US2.4: `src/utils/env.ts`; real `ElementInternals`; `tests/helpers.ts` `watchRules`, `styledRules`, `cleanStyles`; history spies, cookie and storage clean-up. AC verification is a comment on each PR.
- Failures left: Chromium 5, Firefox 5, WebKit 2: `applyStyle` "does not let a value break out" (the page has Vitest's `<script>`), `props` "rethrows an error of a handler", 3 `resource` tests of `http.test.ts` (Chromium, Firefox). Chromium coverage is 100% apart from them.

## Next step

US2.5 (#11): triage of these failures, Chromium at 100%, branch stacked on `feature/10-page-state` while #19 is open.

## Open questions

- No F5 review yet of the spec and US1.1-US2.4.
- Not verified: Node 26.

## Decisions (do not reopen)

- D1-D21: the specification. D22-D26: plan section 1.
- D27 (US1.1): `check-browsers.ts` launches headless; `test:chromium` adds `--coverage.reportOnFailure`; `test:browsers` runs all three, fails at the end.
- D28 (US1.2): `knownFailure` reads `inject('engine')`; the issue is a number literal; one entry, one test.
- D29 (US2.1): browser mode does not evaluate a module again after `vi.resetModules()`; the no-`HTMLElement` test imports `@em/core/component?without-dom`. `env.ts` has no branches. Size: the whole library 13.4 to 13.5 kB gzip.
- D30 (US2.4): `env.ts` also has `leavePage(href)` (`location.assign`), mocked by the router test of other origins; the frame never leaves. Minified size of the whole library 34.3 to 34.4 kB.
- D31 (US2.4): WebKit throws after 100 `pushState`/`replaceState` calls in 10 s (the router file makes about 110). The router test waits once in WebKit, 10 s after the last call, when 90 are reached; history-length checks became `pushState`/`replaceState` spies.

## Prompt for the new session

We continue ECMact. Read `docs/handoff.md`, `AGENTS.md`, `~/.claude/rules/spec-driven-development.md` and the plan (sections 4, 5, US2.5). F4 for issue #11: explain every remaining engine failure; a test mistake is fixed, a library defect in Firefox or WebKit gets `knownFailure` after the owner's yes on an issue; Chromium coverage 100%. Gate and `npm run test:browsers` on Node 22.
