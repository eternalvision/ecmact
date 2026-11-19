# Handoff for the 3.x maintenance release (2026-11-19)

## Current work

- The browser-test stack through #39 is on main. Its [CI run](https://github.com/eternalvision/ecmact/actions/runs/44387323923) passed. Historical acceptance criteria and follow-ups are in the [browser-test plan](plans/2026-11-13-browser-tests-plan.md) and [decision log](decisions.md).
- [#40](https://github.com/eternalvision/ecmact/pull/40) updated six development dependencies, including Playwright 1.65.1. All five [PR jobs](https://github.com/eternalvision/ecmact/actions/runs/44387795291) and the [main CI run](https://github.com/eternalvision/ecmact/actions/runs/44517136577) passed.
- CodeQL alerts #7 and #8 were dismissed as false positives. The renderer inserts DOM nodes and writes character data into a Text node. Alert #6 was dismissed as intended behavior under the trusted-markup contract for the html prop. The GitHub alert records contain the individual rationales.
- [#34](https://github.com/eternalvision/ecmact/issues/34) restores focus after reordering retained keyed rows. The regression tests cover node identity, backward selection, document and shadow roots, removal and focus changes during render. Independent review covered the final diff on feature/34-keyed-focus.

## Next decision

[#30](https://github.com/eternalvision/ecmact/issues/30) and [#31](https://github.com/eternalvision/ecmact/issues/31) concern native disabled-control semantics. The proposed patch preserves the inner control's own disabled state when its fieldset is enabled again and omits a disabled inner control from FormData. The latter changes submitted data. The owner reserved this decision when the issues were filed.

The published versions are ecmact 3.0.0 and create-ecmact 0.4.0. The published generator writes ^3.0.0, which includes the proposed library patch. Release tags trigger publication and require the owner's release decision.
