# Decisions

The dated log of decisions made after the specification and the plan. D1-D21 are in the specification, D22-D26 in section 1 of the plan (`docs/plans/`).

## 2026-11-13

- D27 (US1.1): `check-browsers.ts` launches headless; `test:chromium` adds `--coverage.reportOnFailure`; `test:browsers` runs all three, fails at the end.
- D28 (US1.2): `knownFailure` reads `inject('engine')`; the issue is a number literal; one entry, one test.
- D29 (US2.1): browser mode does not evaluate a module again after `vi.resetModules()`; the no-`HTMLElement` test imports `@em/core/component?without-dom`. `env.ts` has no branches. Size: the whole library 13.4 to 13.5 kB gzip.
- D30 (US2.4): `env.ts` also has `leavePage(href)` (`location.assign`), mocked by the router test of other origins; the frame never leaves. Minified size of the whole library 34.3 to 34.4 kB.
- D31 (US2.4): WebKit throws after 100 `pushState`/`replaceState` calls in 10 s (the router file makes about 110). The router test waits once in WebKit, 10 s after the last call, when 90 are reached; history-length checks became `pushState`/`replaceState` spies.

## 2026-11-14

- D32 (US3.3): B06 and AC-02 were wrong for components. The README (Lifecycle) documents that a moved component runs the cleanup, `unmounted` and `mounted` and keeps following signals in between; 3.x does not change, so the tests prove that, and the literal "no cleanup on a move" only for widgets. Spec and plan reworded.
- Owner, 2026-11-14: issues for #30, #31, #34 yes; the weak click test of `component.test.ts` fixed in US3.3.

## 2026-11-18

- D33 (US4.2): `release-create.yml` runs `npm run test:ci` and does not require the engines. The template pulls `ecmact` from npm, and the library is checked in the engines in its own release (`release.yml`). After US4.1 plain `npm test` needs installed engines, so the old call would break the create-ecmact release.

## 2026-11-19

- D34. The owner approved native disabled-control behavior in a 3.x patch for #30 and #31. Enabling a fieldset must preserve a control's own disabled state. Disabled inner controls must be omitted from FormData.

- D35. Following the owner’s “продолжай”, F2 uses the recommended monochrome identity, interface and code, the light-first composition in the prototype, and system theme support. The documentation refresh comes before the package release and the component collection.

- D36. The owner approved the documentation redesign plan and authorized issue creation. Issues #44–#48 are in the Documentation redesign milestone.

- D37 (US1). The transparent README and site lockup is drawn in one gray, #767676: a single-color transparent PNG cannot be black and white at once, and this gray keeps 4.5:1 on white and on black. The header uses the text color through an inline SVG, the mark and the favicon are ink on paper, and `npm run brand:images` renders all the images from `packages/site/src/lib/brand.ts`.

- D38. Browser support for 3.x (owner, after the JS/TS platform survey in `docs/sessions/19112026-JsTsFeatures/`): unguarded calls use only Baseline widely available features; newer platform features are used behind feature detection with a fallback and ship in a minor (3.1), so the minimum browser does not rise within 3.x.
- D39. Two ECMact copies defining the same component name crash the second copy: #50, a spike in the three engines, then a scoped custom element registry where available with a clear error as fallback.
- D40. Native-only platform paths (scoped registries, `moveBefore`, `TrustedHTML`) are tested in one new file added to the closed `tests/browser/` list (owner approved extending the list).

- D41 (US2). The homepage follows the design study, including its copy (owner decision 2026-11-19): headline, lead, actions, install command, the panel with the entry file, the result strip and the three-step flow. The example lives in `demos/estimate.ts` outside the 12-demo registry, so the gallery and its IDs do not change. The displayed entry file mounts into `#app` as a starter does, and a test runs that text against the example that runs on the page; the whole rendered DOM is compared. The source keeps narrow wrapping as in the study, which intentionally differs from the starter's Prettier width. The widget guide and the examples are plain links in the flow, the big hero lockup is dropped because the header carries it, and the badges sit below the flow.
