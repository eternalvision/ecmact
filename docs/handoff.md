# Handoff: browser tests, P1-P4 done (2026-11-18)

State: F4. Merged into `main`: #19-#25 (US1.1-US2.5). Open, stacked, none merged: #29 US3.1 (`feature/12-form-fields`), #32 US3.2, #33 US3.3, #35 US4.1 (`feature/15-ci-engines`), #37 US4.2 (`feature/16-release-engines`). AC verification and review results are comments on each PR. Next: US5.1 (#17). Plan: `docs/plans/2026-11-13-browser-tests-plan.md`.

## Done

- F0-F3: spec v1.1, plan v1.0 approved; issues #5-#18, milestone "Browser tests".
- P1-P3 (US1.1-US3.3): engine projects, scripts, structure check, shared tests and the six files of `tests/browser/` green in Chromium, Firefox and WebKit (743 of 743), Chromium coverage 100%.
- P4: US4.1 `npm test` runs the engines, CI runs `test:ci` plus reusable `browsers.yml` (three engines, cache per OS, engine and Playwright version). US4.2 `release.yml` publishes only after `browsers.yml`; `release-create.yml` runs `test:ci` without engines (D33); write permissions only on the publish job.
- F5 review (Opus) of every PR; accepted findings fixed, the fixes not reviewed again.
- R8 closed with data: public repository, engine jobs 30-64 s, whole CI about 2-2.5 min, bounded by `check (24)`.

## Next step

US5.1 (#17) contributor docs; its scope also covers the README Development section (`npm test` now needs engines, `npm run browsers:install`). Then US5.2 (#18), site in English and Russian.

## Open questions

- Merge the stack in order; #35 only together with #37, no tag between them (otherwise a release fails on missing engines).
- PR #37: the WebKit job was not run twice, GitHub had no macOS arm64 runner ("not acquired"); re-run before merging.
- Required status checks on `main` are not set (only the ruleset "Protect main history"): owner action.
- US4.1 AC-05 (cache key follows a Playwright bump) verified by construction only; attach the run of the first Dependabot `playwright` bump. Push-to-`main` run of `ci.yml` not seen yet.
- Library defects, issues open, no code changed (3.x behaviour, owner's call): #30, #31, #34.
- Not verified: the `<style>` fallback of `src/styled/inject.ts`; Node 26; `release.yml` never parsed by GitHub (no tag); `actionlint` not run.
- No F5 review of the spec and US1.1-US2.4. Issues #5-#11, #27 open although merged.

## Decisions (do not reopen)

- D1-D21 spec, D22-D26 plan section 1, D27-D33 and the owner's answers: `docs/decisions.md`.

## Prompt for the new session

We continue ECMact. Read `docs/handoff.md`, `AGENTS.md`, `~/.claude/rules/spec-driven-development.md` and the plan (section 5, US5.1). F4 for issue #17 on a branch stacked on `feature/16-release-engines`.
