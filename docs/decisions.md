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

- D41 (US2). The homepage keeps its current headline and lead, so the baseline headings stay: the first screen follows the study's composition (copy on the left, one panel with the entry file, the running result and the markup on the right) but not its draft headline. The example lives in `demos/estimate.ts` outside the 12-demo registry, so the gallery and its IDs do not change. The displayed entry file mounts into `#app` as a starter does, and a test runs that text against the example that runs on the page. The big hero lockup is dropped because the header already carries it, and the hero actions become Get started, Build a widget, See live examples and GitHub.

- D42 (US2). Supersedes D41 (owner, 2026-11-19): the homepage follows the design study including its copy and its code. The panel shows the study's `main.ts` word for word and nothing else: no `type`, no `aria-label` and no `aria-live` on the elements, because `<output>` has the implicit status role. The running example is `demos/estimate.ts`, outside the 12-demo registry; a test runs the displayed text against it and compares the whole rendered DOM. The paste path `src/main.ts` and the starter's `index.html` (checked in a test against the scaffolder template) are named in a short strip below the three-step flow, not in the panel. The widget guide and the examples are plain links in the flow, the big hero lockup is dropped, the badges sit below the strip, and the site header keeps its bottom border while the intro has only its bottom line.

- D43 (US3). Section ids do not change: they stay the slug of the heading text with `-2` suffixes, and a Russian heading keeps the baseline id (`section`, `section-2`, `api`). The ids of every page in both locales are pinned against baseline 8900e86 in `packages/site/tests/pages/docAnchors.ts`. A Russian heading also answers to the English id of the same section, through an empty `span.anchor` that `localize` adds; a heading block can list `aliases` of its own, so the US4 rewrite can rename a section without breaking its old address. English headings answer to the Russian ids the same way (`#section-2` on the English page). An alias never takes an id that another heading on the page owns.

- D44 (US3). The article follows the `#docs` section of the design study: topics 160px, text column with inline borders, sections 128px, the article title (h1) at the study's 31px with -0.04em, sections (h2) at 20px bold and subsections (h3) at 17px, as in the study where the title is the 31px heading and the sections are small, the study's panel style for code, tables, callouts and demos, and the 780px and 520px rules. One step is added at 960px: below it the sections move under the article and the topics stay at 160px, because three columns would leave 350px of text at 781px. Keyboard path: two skip links ("Skip to the article", "Skip to the sections of this page") lead from the sidebar to the title and to "On this page"; after a topic or the previous or next page opens through the router the focus moves to the article title, as the link that had it is gone; a link in the text that names a section moves the focus to that section; a table is a focusable region, named by the heading above it, only while it overflows. On a screen up to 520px the topics fold into a closed `details` named "Topics" with the current page in its summary, so the article starts on the first screen; the DOM order is unchanged. The router's scroll to the top is repeated with `behavior: 'instant'` after the focus, because focusing without scrolling cancels it in WebKit. The sidebar groups are lists under a `strong` title, not `h2`, so the page keeps one heading outline.

- D44a (US3). CSS of D44 that reaches other pages: the `.wrap` gutter of 16px up to 520px, `.page-simple h1` (the not-found title), `.demo-head` wrapping, and the global `table`, `th`, `td`, `.callout`, `.pager` selectors (the guides are the only page that uses them).

- D45 (US3). An internal link with a hash in the article text (`[x](/docs/signals#rules)`) scrolls to its section after the router opens the page; the router itself scrolls to the top. Opening such an address directly, reloading and Back already worked in the browser at baseline and are covered by the router tests and the browser checks in the PR evidence.

- D46–D49. Owner requirements of 2026-11-19, recorded in addendum 1.3 of the specification: every gallery widget is written again, each different in function and look (D46); the examples are written again to be interactive and unusual (D47); the starter is restyled to the site in this redesign (D48); English is the default language of the site (D49).
- D50. The owner approved the concept sheet `docs/sessions/19112026-DocsRedesign/concepts.html` as is (8 widgets, 12 examples), each example with its own visual style inside the monochrome frame, `?lang=` applying only to the tab session, and the recommended answers to the remaining questions Q1–Q10 of the addendum. Issues #53–#58 were created and #47 narrowed to the guides.

- D51 (US7). The language from `?lang=` lasts for the tab session: `localeStore.force` writes it to `sessionStorage` (`ecmact-site-locale-session`) and `start` reads the address first, then that key. While the key is there, no write reaches the kept choice; `cycle` removes the key, so a click on the control stores the language the visitor then sees and the choice is the visitor's again. The kept choice is never touched by the address. The persisted store uses its own storage that swallows errors on read, write and remove, and drops a stored language that is not in `locales` (also a non-string); the same validation applies to the session key. A blocked `localStorage` or `sessionStorage` leaves the site English and the control working for the page load.
- D52 (US7). The `/docs` redirect keeps the query and the hash of the address (`/docs?lang=ru#x` goes to `/docs/<first>?lang=ru#x`), so the language of a link to the documentation root survives the redirect and a reload of the page after it.
