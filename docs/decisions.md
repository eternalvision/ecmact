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
