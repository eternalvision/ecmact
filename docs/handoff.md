# Handoff for the documentation redesign (2026-11-19)

State: F4, US8 (#65), branch `feature/65-example-restyle`, PR #66 against `main`. Phase F5 (review by `sdd-reviewer`) is next; the taste gate (AC-01) is the owner's, on the capture sheets in the PR comment.

Done: the twelve examples are restyled in their own files (rows of the table of #65), the scheme map, the six axis values per example, the pairwise rule, the limits of AC-25, the source scan of AC-27 and the reduced-motion scan are tests in `packages/site/tests/demos/index.test.ts`. Browser evidence (contrast, focus, overflow, 24 px targets, reduced motion, cut font stacks, Chromium, Firefox, WebKit) is in the PR comment. D60-D64.

Next step: review, then the owner's taste gate and merge. After the merge: #56 (five widgets and four hosts in the v2 looks), #57, #47, #48.

Open: the mock tooling named by `style-matrix.md` (`build/*`, `restyle-plan.md`) was never committed; D64 says what replaced it.

Risks: `backdrop-filter` in `customs` has a solid fallback (checked by removing the `@supports` block); a new font or a changed stack needs the 360 px run again.

Decisions (do not reopen): D50, D56-D64 (full text in `docs/decisions.md`).

Materials: [plan](plans/2026-11-19-docs-redesign-plan.md) (update 1.3), [specification](plans/2026-11-19-docs-redesign-spec.md), [v2 mocks](sessions/19112026-DocsRedesign/concepts-v2.html), [style matrix](sessions/19112026-DocsRedesign/style-matrix.md), PR #66.

Earlier state (the 3.x patch release, forms, #30, #31, #34, #40) is in the [decision log](decisions.md) and the [browser-test plan](plans/2026-11-13-browser-tests-plan.md); the patch release follows the redesign and needs the owner's release decision.
