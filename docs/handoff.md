# Handoff: browser tests, US1.2 done (2026-11-13)

State: F4, US1.2 (#6) done on branch `feature/6-structure-checks` (stacked on `feature/5-browser-runner`, PR #19 not merged). Next are US2.1-US2.4 (#7-#10). Plan: `docs/plans/2026-11-13-browser-tests-plan.md`.

## Done

- F0-F3 (spec v1.1 and plan v1.0 approved, issues #5-#18 in milestone "Browser tests").
- US1.1 (#5, PR #19): projects `dom`, `chromium`, `firefox`, `webkit`, the `test:*` scripts, `scripts/check-browsers.ts`. Engine failures: Chromium and Firefox 7, WebKit 15; Chromium coverage 99.76/99.61/100/99.86.
- US1.2 (#6): `scripts/check-tests.ts` (mirror check, closed list of six names in `tests/browser/`, registry check), `tests/knownFailures.ts` with `knownFailure(issue)`. AC verification is in a comment on its PR.

## Next step

US2.1-US2.4 (#7-#10), one branch and PR each, from `main` once #19 (and #6) are merged, otherwise stacked on `feature/6-structure-checks`. US2.1 first if they run in one session, because it adds `src/utils/env.ts` (D23).

## Open questions

- The review of the specification by another model was not done. US1.1 and US1.2 have had no F5 review yet.
- Not verified: `vi.resetModules` in browser mode (US2.1); Node 26.

## Risks

- R8 confirmed: WebKit allows 100 `history.replaceState` calls in 10 s. 11 router tests fail on it (US2.4).
- D23 changes the bundle size by a few bytes, a deviation from spec section 7.

## Decisions (do not reopen)

- D1-D21: see the specification. D22-D26: plan section 1.
- D27 2026-11-13 (US1.1, deviations from the plan): `check-browsers.ts` launches the engine headless, because `executablePath()` misses the Chromium headless shell. `test:chromium` adds `--coverage.reportOnFailure`. `test:browsers` runs all three engines and fails at the end (POSIX `sh`). `npm test` calls `test:dom` instead of `vitest run --coverage`, with the same meaning. `.vitest/` is ignored.
- D28 2026-11-13 (US1.2): `knownFailure` learns the engine through `provide: { engine }` on each browser instance and `inject('engine')`; the happy-dom run provides nothing, so the helper returns `{}` there without importing `vitest/browser`. The check imports the registry by its file path (Node type stripping) and finds uses by the text `knownFailure(<number>)`, so the issue must be a number literal. One entry per issue, used by exactly one test of `entry.file` containing `entry.test`.

## Prompt for the new session

We continue ECMact. Read `docs/handoff.md`, `AGENTS.md`, the rule `~/.claude/rules/spec-driven-development.md` and the plan `docs/plans/2026-11-13-browser-tests-plan.md` (sections 4, 5 and US2.1-US2.4). This session is F4 for US2.1-US2.4, issues #7-#10: make the shared tests pass in every engine by the rules of plan section 5, with `knownFailure` for library defects in Firefox or WebKit (tell the owner, no issue without them). Run the gate and `npm run test:browsers` on Node 22, and show how each AC is verified.
