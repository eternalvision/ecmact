# Handoff: browser tests, US2.3 done (2026-11-13)

State: F4. Stacked PRs, none merged: #19 US1.1, #20 US1.2, US2.1 (#7) #21, US2.2 (#8) #22, then US2.3 (#9, `feature/9-styles`). Next: US2.4 (#10). Plan: `docs/plans/2026-11-13-browser-tests-plan.md`.

## Done

- F0-F3: spec v1.1, plan v1.0 approved; issues #5-#18, milestone "Browser tests".
- US1.1 (#5): projects `dom`, `chromium`, `firefox`, `webkit`, the `test:*` scripts, `scripts/check-browsers.ts`.
- US1.2 (#6): `scripts/check-tests.ts`, `tests/knownFailures.ts` with `knownFailure(issue)`.
- US2.1 (#7): `src/utils/env.ts`; `dispatch.ts` and `component.ts` read it. Engine failures now: Chromium 6, Firefox 6, WebKit 14.
- US2.2 (#8): the form field tests spy on the real `ElementInternals` in engines and on a fake in happy-dom; `attachInternals` is hidden with a getter spy, never deleted.
- US2.3 (#9): `tests/helpers.ts` `watchRules`, `styledRules`, `cleanStyles`; the styled tests use real constructable stylesheets and read the rule text the library inserted, not an engine's serialisation. AC verification is a comment on each PR.

## Next step

US2.4, one branch and PR, stacked on the previous story while #19 is open.

## Open questions

- No F5 review yet of the spec, US1.1, US1.2, US2.1-US2.3.
- Not verified: Node 26.

## Risks

- R8 confirmed: WebKit allows 100 `history.replaceState` calls in 10 s; 11 router tests fail on it (US2.4).

## Decisions (do not reopen)

- D1-D21: the specification. D22-D26: plan section 1.
- D27 (US1.1): `check-browsers.ts` launches the engine headless; `test:chromium` adds `--coverage.reportOnFailure`; `test:browsers` runs all three and fails at the end; `npm test` calls `test:dom`; `.vitest/` is ignored.
- D28 (US1.2): `knownFailure` learns the engine through `provide: { engine }` and `inject('engine')`; the issue must be a number literal; one entry per issue, used by one test.
- D29 (US2.1): AC-05 hit: in browser mode `vi.resetModules()` plus `import()` does not evaluate a module again. Decided without the owner (standing rule): the no-`HTMLElement` test also imports `@em/core/component?without-dom`, a fresh instance in every environment. `env.ts` has no branches (`globalThis.document` and so on). Size (D23): the whole library gzip 13.4 to 13.5 kB, the rest unchanged.

## Prompt for the new session

We continue ECMact. Read `docs/handoff.md`, `AGENTS.md`, `~/.claude/rules/spec-driven-development.md` and the plan (sections 4, 5, US2.4). F4 for issue #10, by plan section 5; `knownFailure` for library defects in Firefox or WebKit, the owner is told, no issue without their yes. Gate and `npm run test:browsers` on Node 22.
