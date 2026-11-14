# Handoff: browser tests, P1-P3 done (2026-11-14)

State: F4. Merged into `main`: #19-#24 (US1.1-US2.4). Open, stacked, none merged: PR #25 US2.5 (`feature/11-triage`), #29 US3.1 (`feature/12-form-fields`), #32 US3.2 (`feature/13-browser-styles`), #33 US3.3 (`feature/14-focus-lifecycle`). AC verification and review results are comments on each PR. Next: US4.1 (#15). Plan: `docs/plans/2026-11-13-browser-tests-plan.md`.

## Done

- F0-F3: spec v1.1, plan v1.0 approved; issues #5-#18, milestone "Browser tests".
- P1, P2 (US1.1-US2.5): engine projects and scripts, structure check, `src/utils/env.ts`, shared tests green in every engine; `tests/knownFailures.ts` has no entry.
- P3 (US3.1-US3.3): the six files of `tests/browser/` (forms, nesting, parse-warning, adopted-sheets, focus, lifecycle), each proven by mutations of `src` in the three engines.
- Node 22 on `cafd09b`: gate green, `npm run test:browsers` 742 of 742 in Chromium, Firefox and WebKit, Chromium coverage 100%.
- F5 review (Opus) of #25, #29, #32, #33; accepted findings fixed except the three below.

## Next step

1. Three minor review findings of #32, on `feature/13-browser-styles`: `@property` hoisted from a `CSSStyleSheet` source has no test; "warns once" needs `resetWarnings()` between two mounts; the nested rule count uses `>=` instead of exact 1 and 3.
2. US4.1 (#15): `npm test` and `ci.yml`, branch stacked on `feature/14-focus-lifecycle` while the stack is open.

## Open questions

- Library defects found by the review, issues opened, no code changed, the fix is the owner's decision (behaviour of 3.x): #30 a field loses the control's own `disabled`; #31 a disabled control is still submitted; #34 a keyed row of `each` loses focus when the reorder moves its node.
- Not reported as an issue, not verified: the `<style>` fallback of `src/styled/inject.ts` appends rule text as it is, so text that `insertRule` refuses would apply there.
- No F5 review of the spec and of US1.1-US2.4. Issues #5-#10, #27 are open although their PRs are merged.
- Not verified: Node 26.

## Decisions (do not reopen)

- D1-D21: the specification. D22-D26: plan section 1. D27-D32 and the owner's answers of 2026-11-14: `docs/decisions.md`.
- D32 in short: a moved component runs the cleanup, `unmounted` and `mounted`, as the README documents; B06 and AC-02 reworded.

## Prompt for the new session

We continue ECMact. Read `docs/handoff.md`, `AGENTS.md` on `main`, `~/.claude/rules/spec-driven-development.md` and the plan (sections 4, 5, US4.1). First the three findings of #32, then F4 for issue #15. Gate and `npm run test:browsers` on Node 22; AC verification with a mutation table as a comment on the PR.
