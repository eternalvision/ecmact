# Handoff: browser tests, F3 done (2026-11-13)

State: F3 done on 2026-11-13, next is F4, starting with US1.1 (#5). Roadmap item 1, "tests in Chromium, Firefox and WebKit in CI". Branch `main`, nothing committed yet.

## What the project is

ECMact is a small TypeScript library for embeddable widgets, no dependencies. The repository holds the library (`src`), the site (`packages/site`) and the scaffolder (`packages/create-ecmact`). `ecmact@3.0.0` and `create-ecmact@0.4.0` are on npm.

## Done

- F0 overview (`AGENTS.md`, this file).
- F1: `docs/plans/2026-11-13-browser-tests-spec.md`, version 1.1, approved.
- F2: `docs/plans/2026-11-13-browser-tests-plan.md`, version 1.0, approved.
- F3: milestone "Browser tests" (#1), labels `browser-tests` and `P1`-`P5`, issues #5-#18 (US1.1-US5.2), "Depends on" in each body and "blocked by" links in GitHub. Issue numbers are written into the plan.

## Next step

F4 in a new session: US1.1 (#5) on branch `feature/5-browser-runner` from `main`. After it, US1.2 (#6); US2.1-US2.4 (#7-#10) need only #5.

## Open questions

- The review of the specification by another model was not done.
- Not verified (plan section 2): how `knownFailure` learns the engine; `vi.resetModules` in browser mode; Chromium coverage at 100%; Node 26.
- The links to the spec and plan in the issues point to `main` and work only after `docs/` is committed.

## Risks

- R1: the number of failing tests is known only after the first run (US2.5 is L).
- D23 changes the bundle size by a few bytes, a deviation from spec section 7.
- WebKit from Playwright is not Safari; macOS runner cost not verified.

## Decisions (do not reopen)

- D1-D5: 3.0 API, widget direction, no breaking changes in 3.x, own version line of `create-ecmact`, spec driven development.
- D6-D21: see the specification.
- D22-D26 2026-11-13 (plan section 1): engine by `--project` with scripts `test:dom`, `test:chromium`, `test:firefox`, `test:webkit`, `test:browsers`, `browsers:install`; internal `src/utils/env.ts` for `document`, `location`, `HTMLElement`; browser-only tests in `tests/browser/` with a closed list; new scripts and `check-tests` in TypeScript, other `.mjs` later; known failures in `tests/knownFailures.ts` with `knownFailure(issue)`.

## Prompt for the new session

We continue ECMact. Read `docs/handoff.md`, `AGENTS.md`, the rule `~/.claude/rules/spec-driven-development.md` and the plan `docs/plans/2026-11-13-browser-tests-plan.md`. This session is F4 for US1.1, issue #5, on branch `feature/5-browser-runner` from `main`: implement it by the plan, run the gate and `npm run test:browsers`, show how each AC is verified. Commit, push and PR only when the owner asks.
