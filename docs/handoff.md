# Handoff: browser tests, P1 and P2 done (2026-11-14)

State: F4. Merged into `main`: #19-#24 (US1.1-US2.4). Open: PR #25 US2.5 (#11, `feature/11-triage`), checks green, AC verification is a comment on the PR. Next: US3.1 (#12). Plan: `docs/plans/2026-11-13-browser-tests-plan.md`.

## Done

- F0-F3: spec v1.1, plan v1.0 approved; issues #5-#18, milestone "Browser tests".
- US1.1, US1.2: the engine projects and scripts; `scripts/check-tests.ts`, `tests/knownFailures.ts`.
- US2.1-US2.4: `src/utils/env.ts`; real `ElementInternals`; `tests/helpers.ts` `watchRules`, `styledRules`, `cleanStyles`; history spies, cookie and storage clean-up.
- US2.5: the 12 engine failures were all mistakes of tests (`applyStyle`, `props`, 3 `resource` tests), fixed; no library defect, `knownFailures.ts` has no entry. Node 22: gate green, `npm run test:browsers` 711 of 711 in Chromium, Firefox and WebKit, Chromium coverage 100%.

## Next step

US3.1 (#12): `tests/browser/forms.test.ts`, branch `feature/12-<slug>` from `main` once #25 is merged, otherwise stacked on `feature/11-triage`. Then US3.2 (#13), US3.3 (#14).

## Open questions

- No F5 review yet of the spec and US1.1-US2.5.
- Issues #5-#10 and #27 are still open although their PRs are merged.
- Not verified: Node 26.

## Decisions (do not reopen)

- D1-D21: the specification. D22-D26: plan section 1.
- D27 (US1.1): `check-browsers.ts` launches headless; `test:chromium` adds `--coverage.reportOnFailure`; `test:browsers` runs all three, fails at the end.
- D28 (US1.2): `knownFailure` reads `inject('engine')`; the issue is a number literal; one entry, one test.
- D29 (US2.1): browser mode does not evaluate a module again after `vi.resetModules()`; the no-`HTMLElement` test imports `@em/core/component?without-dom`. `env.ts` has no branches. Size: the whole library 13.4 to 13.5 kB gzip.
- D30 (US2.4): `env.ts` also has `leavePage(href)` (`location.assign`), mocked by the router test of other origins; the frame never leaves. Minified size of the whole library 34.3 to 34.4 kB.
- D31 (US2.4): WebKit throws after 100 `pushState`/`replaceState` calls in 10 s (the router file makes about 110). The router test waits once in WebKit, 10 s after the last call, when 90 are reached; history-length checks became `pushState`/`replaceState` spies.
- US2.5 needed no new decision.

## Prompt for the new session

We continue ECMact. Read `docs/handoff.md`, `AGENTS.md`, `~/.claude/rules/spec-driven-development.md` and the plan (sections 4, 5, US3.1). F4 for issue #12: `tests/browser/forms.test.ts` covers B01 in the three engines and not in happy-dom. Gate and `npm run test:browsers` on Node 22; AC verification as a comment on the PR.
