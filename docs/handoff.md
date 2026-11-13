# Handoff: browser tests, US1.1 done (2026-11-13)

State: F4, US1.1 (#5) done on branch `feature/5-browser-runner`, PR #19 (not merged). Next is US1.2 (#6). Plan: `docs/plans/2026-11-13-browser-tests-plan.md`.

## Done

- F0-F3 (spec v1.1 and plan v1.0 approved, issues #5-#18 in milestone "Browser tests").
- US1.1: `vite.config.ts` projects `dom`, `chromium`, `firefox`, `webkit`; scripts `test:dom`, `test:chromium`, `test:firefox`, `test:webkit`, `test:browsers`, `browsers:install`; `scripts/check-browsers.ts`. Gate green on Node 22. The first engine run (Chromium and Firefox 7 failures, WebKit 15) and the first Chromium coverage (99.76/99.61/100/99.86) are in a comment on PR #19.

## Next step

US1.2 (#6) on branch `feature/6-structure-checks` from `main` after PR #19 is merged, or from `feature/5-browser-runner` if it is not merged yet. US2.1-US2.4 (#7-#10) need only #5.

## Open questions

- The review of the specification by another model was not done. US1.1 has had no F5 review yet.
- Not verified: how `knownFailure` learns the engine (US1.2); `vi.resetModules` in browser mode (US2.1); Node 26.

## Risks

- R8 confirmed: WebKit allows 100 `history.replaceState` calls in 10 s. 11 router tests fail on it (US2.4).
- D23 changes the bundle size by a few bytes, a deviation from spec section 7.

## Decisions (do not reopen)

- D1-D21: see the specification. D22-D26: plan section 1.
- D27 2026-11-13 (US1.1, deviations from the plan): `check-browsers.ts` launches the engine headless, because `executablePath()` misses the Chromium headless shell. `test:chromium` adds `--coverage.reportOnFailure`. `test:browsers` runs all three engines and fails at the end (POSIX `sh`). `npm test` calls `test:dom` instead of `vitest run --coverage`, with the same meaning. `.vitest/` is ignored.

## Prompt for the new session

We continue ECMact. Read `docs/handoff.md`, `AGENTS.md`, the rule `~/.claude/rules/spec-driven-development.md` and the plan `docs/plans/2026-11-13-browser-tests-plan.md` (sections 4, 5 and US1.2). This session is F4 for US1.2, issue #6: rewrite `scripts/check-tests.mjs` as `scripts/check-tests.ts`, add `tests/knownFailures.ts` with `knownFailure(issue)` and the closed list of `tests/browser/`. Run the gate and `npm run test:browsers` on Node 22, and show how each AC is verified.
