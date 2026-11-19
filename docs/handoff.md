# Handoff for the 3.x maintenance release (2026-11-19)

## Current work

- The browser-test stack through #39 is on main. Its [CI run](https://github.com/eternalvision/ecmact/actions/runs/44387323923) passed. Historical acceptance criteria and follow-ups are in the [browser-test plan](plans/2026-11-13-browser-tests-plan.md) and [decision log](decisions.md).
- [#40](https://github.com/eternalvision/ecmact/pull/40) updated six development dependencies, including Playwright 1.65.1. All five [PR jobs](https://github.com/eternalvision/ecmact/actions/runs/44387795291) and the [main CI run](https://github.com/eternalvision/ecmact/actions/runs/44517136577) passed.
- CodeQL alerts #7 and #8 were dismissed as false positives. The renderer inserts DOM nodes and writes character data into a Text node. Alert #6 was dismissed as intended behavior under the trusted-markup contract for the html prop. The GitHub alert records contain the individual rationales.
- [#34](https://github.com/eternalvision/ecmact/issues/34) restores focus after reordering retained keyed rows. The regression tests cover node identity, backward selection, document and shadow roots, removal and focus changes during render. Independent review covered the final diff on feature/34-keyed-focus.

## Forms and release

- D34 records the owner's approval for both native disabled-control fixes in a 3.x patch.
- [#30](https://github.com/eternalvision/ecmact/issues/30) preserves the control's own disabled state across host and fieldset toggles, including overlapping overrides of a control shared by nested fields. [PR #42](https://github.com/eternalvision/ecmact/pull/42).
- [#31](https://github.com/eternalvision/ecmact/issues/31) omits disabled controls from FormData and validation. Reactive disabled props and fieldset changes sync immediately. After direct DOM changes, dispatch a bubbling change event to sync the field.

The published versions are ecmact 3.0.0 and create-ecmact 0.4.0. The published generator writes ^3.0.0, which includes the proposed library patch. Release tags trigger publication and require the owner's release decision.

## Documentation redesign

F2 approved and F3 complete. The five issues are #44–#48 in the Documentation redesign milestone. Begin F4 with #44, the monochrome identity and shared site shell. See the [specification](plans/2026-11-19-docs-redesign-spec.md), [plan](plans/2026-11-19-docs-redesign-plan.md) and [design study](sessions/19112026-DocsRedesign/index.html). US7 (default English) is merged. US4b (#54) is merged. US4c (#55, the six examples of requests, lifecycle, a widget and routes, `atlas` at `/examples/atlas`) is in review on `feature/55-examples-requests-routes`; D56-D59. US4d is next. The patch release follows the redesign. The component collection follows as a separate specification.
