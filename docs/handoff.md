# Handoff: ECMact after 3.0 (2026-11-13)

State: F0 overview is done. No feature is in progress. Next is F1 for the first item of the roadmap.

## What the project is

ECMact is a small library for embeddable widgets and reactive interfaces in plain TypeScript: plain DOM elements from `tags`, components and widgets as custom elements with a Shadow DOM, signals, a store, an HTTP client, a router, no dependencies and no compiler. The repository holds the library (`src`), the website with the documentation in English and Russian (`packages/site`) and the scaffolder (`packages/create-ecmact`).

## Done

- `ecmact@3.0.0` and `create-ecmact@0.4.0` are on npm; the site is deployed from `main`.
- The API was rewritten for 3.0; the README, the site and the templates describe it.
- Positioning: a toolkit for embeddable widgets. The comparison page, `npm run size`, the benchmark and the stability promise are in.

## Roadmap, in this order

1. Trust: tests in Chromium, Firefox and WebKit in CI; a patch release with the rough edges listed below.
2. Widgets (3.1): a minified build for a script tag and a CDN; properties next to attributes; type declarations for hosts (React, Vue, TypeScript); a lazy loader.
3. Reach: a playground on the site; two or three widget templates in `create-ecmact`; an article and a Show HN.

## Open questions

- Rough edges found while documenting 3.0, not decided yet: an `effect` that returns something that is not a function fails on its next run; a store action that reads through `get()` is not followed in a reactive function; a function passed to an attribute by mistake is treated as reactive without a warning; `as` of a styled element needs a cast for the props of the new tag.
- Recipes and Composition were removed from the README during the rewrite; restore them or not.
- The description of the repository on GitHub ("About") still has the old text.

## Risks

- Everything was checked in Chromium and happy-dom only. Firefox and Safari are not verified.
- The website texts and the README were written by agents and checked by tools (types of every sample, anchors, exports), not read by the owner.

## Decisions (do not reopen)

- D1 2026-11-12: 3.0 breaks the API. `tags` returns plain elements, children are positional, a function is reactive, signals keep `.value`.
- D2 2026-11-13: direction is embeddable widgets. No SSR, no larger router, no virtualization.
- D3 2026-11-13: 3.0 is the baseline; 3.x makes no breaking changes; no date is promised for the next major.
- D4 2026-11-13: `create-ecmact` keeps its own version line (0.4.0).
- D5 2026-11-13: work follows the spec driven development rule: phases F0-F6, strict gates, every phase in a new session.

## Prompt for the new session

We continue ECMact. Read `docs/handoff.md` and `AGENTS.md`. Start F1 for roadmap item 1, tests in three browsers in CI: write the specification `docs/plans/YYYY-MM-DD-browser-tests-spec.md`, ask me the questions one at a time, write no code.
