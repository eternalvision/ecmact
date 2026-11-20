# Handoff (2026-11-20)

State: US8 (#65) is merged (PR #66), `ecmact@3.0.1` is published (tag `v3.0.1`, PR #67). D65.

Next step: outside this repository - migrate `em-spotify-widget` (GitHub `eternalvision/em-spotify-widget`) from ecmact 2.6.1 to 3.0.1 (D65). It needs F0 there first (no AGENTS.md, no docs/handoff.md), then a specification: `defineWidget` props, `createStore`, `mount` and `ThemeProvider` changed in 3.0. The owner has uncommitted work there; migrate on top of it, keep it apart in the report.

Back in this repository after that: #56 (five widgets and four hosts in the v2 looks), #57, #47, #48.

Risks: the release workflow warns that npm tokens bypassing 2FA are being restricted; publishing may need the owner to move to trusted publishing. `backdrop-filter` in `customs` has a solid fallback; a new font or a changed stack needs the 360 px run again.

Decisions (do not reopen): D50, D56-D65 (full text in `docs/decisions.md`).

Materials: [plan](plans/2026-11-19-docs-redesign-plan.md) (update 1.3), [specification](plans/2026-11-19-docs-redesign-spec.md), [v2 mocks](sessions/19112026-DocsRedesign/concepts-v2.html), [style matrix](sessions/19112026-DocsRedesign/style-matrix.md), PR #66, PR #67.

Earlier state (forms, #30, #31, #34, #40) is in the [decision log](decisions.md) and the [browser-test plan](plans/2026-11-13-browser-tests-plan.md).
