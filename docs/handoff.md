# Handoff (2026-11-20)

State: #56 (US4d) is built on `feature/56-widgets-hosts`, PR #72, reviewed (F5, ten findings fixed, D72), waiting for the owner's merge. D69-D72. The host mocks were approved by the owner as drawn (D70).

Done in #56: `print-quote`, `moon-dial`, `proof-clock`, `row-counter`, `feed-lamp` in their v2 looks (the five old widgets and `flip` removed, the old tags kept as anchors of the reference, Q2 a); the four hosts `cafe`, `terminal`, `zine`, `kids` by the approved mocks; the reference per widget in both languages; the pairwise style check over the twelve examples and the five widgets; sample feeds in `public/hosts/data/`. Measured in three engines at 1280 and 360 px (`build/widgets.mjs`, `build/hosts.mjs`, `build/gallery.mjs`).

Next: review of #72, merge on the owner's word, then #57 (three more widgets, the measured bundle: `morse-key`, `fret-map`, `clue-box`; the hosts then take their full widget rows), #58, #47, #48 (D66, D67). Start #57 in a new session from `main`, branch `feature/57-<slug>`.

After the redesign (D67): the patch 3.0.2 with the bugs #50, #61, #63, #64; then ecmact-ui (`ecmact/ui`) from F1 with its own specification; then the `em-spotify-widget` migration (D65).

Risks: the dials of the widgets use system font stacks, so the look shifts per system and was captured on macOS only; the moon is the mean month, right to about a day; `color-mix()` and CSS masks have fallbacks only for masks. A new font or stack needs the 360 px run again (`build/hosts.mjs`).

Decisions (do not reopen): D50, D56-D72 (full text in `docs/decisions.md`).

Materials: [plan](plans/2026-11-19-docs-redesign-plan.md) (update 1.3), [specification](plans/2026-11-19-docs-redesign-spec.md), [v2 mocks](sessions/19112026-DocsRedesign/concepts-v2.html), [host mocks](sessions/19112026-DocsRedesign/hosts-mock.html), [style matrix](sessions/19112026-DocsRedesign/style-matrix.md), PR #72, the scripts in `sessions/19112026-DocsRedesign/build/`.
