# Handoff: browser tests, P1-P5 done (2026-11-18)

State: F4/F5 done for every story; waiting for the owner to merge. Merged into `main`: #19-#25 (US1.1-US2.5). Open, stacked, none merged, every check green: #29 US3.1 (`feature/12-form-fields`, base `main`), #32 US3.2, #33 US3.3, #35 US4.1, #37 US4.2, #38 US5.1, #39 US5.2 (`feature/18-browser-support`). AC verification and review results are comments on each PR. Plan: `docs/plans/2026-11-13-browser-tests-plan.md`.

## Done

- F0-F3: spec v1.1, plan v1.0 approved; issues #5-#18, milestone "Browser tests".
- P1-P3: engine projects, scripts, structure check, shared tests and the six files of `tests/browser/` green in Chromium, Firefox and WebKit (743 of 743), Chromium coverage 100%.
- P4: `npm test` runs the engines; CI runs `test:ci` plus reusable `browsers.yml`; `release.yml` publishes only after the engines, write permissions only on the publish job; `release-create.yml` without engines (D33). R8 closed: engine jobs 30-64 s, CI about 2-2.5 min.
- P5: contributor docs in `AGENTS.md`, `CONTRIBUTING.md`, README Development; tested engines in README Browser support and the site (EN/RU), versions referred to the pinned Playwright, no hardcoded number.
- F5 review (Opus) of every PR; accepted findings fixed, the fixes not reviewed again.

## Next step

Owner: merge the stack in order #29 → #32 → #33 → #35 → #37 → #38 → #39. #35 only together with #37, no tag between them. Then: delete merged branches, close issues #5-#18 and #27 if the owner says so, attach the first push-to-`main` run of `ci.yml`.

## Open questions

- Required status checks on `main` are not set (only the ruleset "Protect main history"): owner action.
- US4.1 AC-05 (cache key follows a Playwright bump) verified by construction only; attach the run of the first Dependabot `playwright` bump.
- macOS arm64 runners are sometimes not acquired ("capacity constraints"); a cancelled WebKit job is re-run, not a failure of the code.
- Library defects, issues open, no code changed (3.x behaviour, owner's call): #30, #31, #34.
- Not verified: the `<style>` fallback of `src/styled/inject.ts`; Node 26; `release.yml` never parsed by GitHub (no tag); `actionlint`; Linux system libraries and Windows for contributors (docs say POSIX shell, `install-deps`).
- Spec line 40 still says "WebKit is the engine of Safari"; the user docs are more precise. Left as is.
- No F5 review of the spec and US1.1-US2.4.

## Decisions (do not reopen)

- D1-D21 spec, D22-D26 plan section 1, D27-D33 and the owner's answers: `docs/decisions.md`.
