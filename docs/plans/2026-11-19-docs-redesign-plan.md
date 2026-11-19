# ECMact documentation and identity delivery plan

Version 1.2 · F2 approved by the owner · F3 issues created, update 1.2 approved and issues #53–#58 created on 19 November 2026 · 19 November 2026

[Specification and requirements R01–R08](2026-11-19-docs-redesign-spec.md) · [Interactive proposal](../sessions/19112026-DocsRedesign/index.html) · [Decision D35](../decisions.md)

## Delivery order

Build the monochrome identity and shared site shell first. Deliver the homepage and the shared example presentation next. Prepare the article navigation before editing the bilingual guides. Finish with the root README once its destinations and runnable examples exist. Each PR leaves a usable site. The first composition uses a light canvas in the design study. A fresh visit follows the system theme. Code uses grayscale with weight and spacing to distinguish syntax. Host pages can use color when it demonstrates style isolation.

## Implementation and verification

- Use Node 22 and the [project rules](../../AGENTS.md). Each story gets one GitHub issue, a branch named `feature/<issue number>-<slug>` from the current main after its dependencies merge, and one PR. The implementation and independent review use separate sessions.
- Capture compatibility evidence from baseline `8900e86` before changing each surface. For site pages, record route, locale, emitted section IDs (including duplicate suffixes), example IDs and the corresponding headings. For the README, collect the rendered GitHub heading targets and public asset paths. Reuse this inventory in the acceptance checks. Keep permanent regression fixtures only for contracts the existing tests miss.
- Use the existing ECMact views, content registry, EN/RU localization, raw-source demo imports, styles and tests. Site filenames below are relative to `packages/site/src/` unless noted. Use the existing source mirroring under `packages/site/tests/`. Run the repository gate before committing with `npm run lint && npm run format:check && npm run typecheck && npm test`. Preserve the repository's coverage thresholds.
- Capture the changed UI in a real browser at 360 px and 1280 px, in English and Russian, in light and dark modes. Exercise keyboard activation and visible focus, ordinary text contrast of at least 4.5:1, 200% zoom, reduced motion where applicable and horizontal scrolling inside long code blocks. Record evidence by story and criterion in its PR or handoff.
- Verify the integrated site with `npm run build:all` and `npm run test:template`. Use the Pages base path `/ecmact/` and its existing 404 fallback when checking direct links and reloads. The existing Pages workflow builds the starter and widget previews separately. [Pages workflow](../../.github/workflows/pages.yml)

## Stories

### US1. Recognize ECMact across themes

A reader sees the same recognizable mark on GitHub, npm and the documentation site. Replace the visual system for the header, footer and shared surfaces, and give the existing language and theme controls clear labels and keyboard focus. Estimate M. Requirements R03, R07, R08. [Prototype header](../sessions/19112026-DocsRedesign/index.html)

Files include root `public/`, `packages/site/public/`, `packages/site/index.html`, `ui/logo.ts`, `ui/header.ts`, `ui/footer.ts`, `ui/themeToggle.ts` and `styles/site.css`. Retain the public image URLs consumers already use.

- AC-01. The one-color mark and wordmark share geometry across the header, README image and favicon. Inspect black and white backgrounds, the transparent image and the 16 px favicon at actual size. Request each existing public brand asset URL in the built site or its original repository location.
- AC-02. On a fresh visit the chrome follows system light and dark preferences. The manual theme and locale choices still work after reload. Verify both system preferences and stored overrides with the existing theme, logo, header and language-toggle tests and a browser.
- AC-03. Keyboard users can reach and operate the header controls at both widths. Check visible focus, contrast and readable text labels with images disabled. Confirm the footer and missing-page view remain legible in both themes.

### US2. Try a working example from the homepage

A visitor changes the sample estimate, sees the output immediately and can start an app or follow the widget guide. Use the approved first-screen composition and label sample data. Estimate M. Depends on US1. Requirements R04, R06, R07. [Homepage prototype](../sessions/19112026-DocsRedesign/index.html#title)

Files include `pages/home.ts`, `content/messages.ts`, `demos/`, `ui/demoFrame.ts`, `ui/codeBlock.ts`, `ui/copyButton.ts`, `lib/highlight.ts` and `styles/site.css`.

- AC-01. The first screen contains an install command, a local ECMact interaction and its source. Activate the example by keyboard with external requests blocked and confirm the expected result updates. Follow the app and widget entry points in both languages.
- AC-02. The source and result are visible side by side on desktop and in reading order on mobile. A complete example includes its entry file, public imports, mount target and required markup. Verify the displayed code comes from the running example or compare its behavior in a fresh starter.
- AC-03. Copy the install command and example without prompts or line labels. Deny clipboard access and check existing fallback/error feedback. Check TypeScript and escaped HTML rendering, long lines and focus using the relevant home, demo frame, code block and copy tests.

### US3. Find an article and keep existing bookmarks

A reader can reach a topic, navigate headings and return to the previous page from desktop or mobile. Estimate M. Depends on US1. Requirements R02, R07, R08. [Article prototype](../sessions/19112026-DocsRedesign/index.html#docs)

Files include `pages/docs.ts`, `pages/notFound.ts`, `ui/sidebar.ts`, `ui/toc.ts`, `ui/blocks.ts`, `app/router.ts`, `content/types.ts` if heading aliases are needed, and `styles/site.css`.

- AC-01. The guide index, all 19 topic slugs and links into sections work in both locales. Verify emitted IDs from both locales against the baseline, including duplicate headings. Retain matching headings or render stable aliases for renamed sections. Test sidebar, table of contents and localized headings together.
- AC-02. Under the Pages base path, open an old link with a hash directly, reload, follow another article, then use Back. Test the existing `?lang=ru` entry point, `/docs` redirect and unknown slug with a working route back to documentation.
- AC-03. At the two target widths a keyboard user can choose a topic, move into the article and reach its section navigation with visible focus. Text and code stay readable at 200% zoom. Verify real-browser layout alongside existing docs, router, blocks and not-found tests.

### US4. Learn from the bilingual guides, demos and widget gallery

A developer can complete a task, inspect what produced the result and find the relevant reference. Estimate L. Depends on US2 and US3. Requirements R02, R05, R06, R07, R08.

Files include `content/docs/` and its `ru/` counterpart, `content/messages.ts`, `content/widgets.ts`, `pages/examples.ts`, `pages/widgets.ts`, `demos/`, `widgets/` and `ui/demoFrame.ts`. Reuse the typed docs blocks and current registry. Pair each EN edit with its RU text.

- AC-01. Review all 19 paired topics against a checklist of reader goal, example or reference need and next step. Getting started takes a reader from a fresh scaffold to a visible change. Guides name the input, action and result. Verify signatures, defaults, limitations and security guidance against the public API. Label unreleased behavior with its target version. Run existing content and translation tests in both languages.
- AC-02. Organize the gallery by task and keep each of the 12 registered demo IDs reachable. Featured code identifies the entry file or links an excerpt to a complete example. Paste complete samples into their stated environments and type-check them against the distributed package or locally packed patch as labeled. Compare rendered behavior to the running source.
- AC-03. The widget gallery embeds working widgets in independent hosts. Exercise one meaningful interaction per widget and switch host styles to demonstrate isolation. Test loading and recoverable failure for network demos with deterministic responses. Verify both locales keep captions, accessible controls and source aligned.
- AC-04. Open each retained topic and demo link after the rewrite, including old section IDs in English and Russian. Compare the final pages with the US3 inventory. Recheck the mobile gallery, keyboard controls and long examples in both themes.

### US5. Start from the README and reach the complete reference

A developer arriving at the repository or npm gets the command, entry file, observable result and a clear choice between app and widget guides. Estimate M. Depends on US4. Requirements R01, R02, R03, R05, R06, R08. [README outline](../sessions/19112026-DocsRedesign/index.html#readme)

The principal file is the root `README.md`. Correct any missing site reference destination in its paired EN/RU topic before moving that material.

- AC-01. Product summary, install command and one complete interactive example appear ahead of comparisons, benchmarks and API listings. Follow the README in a new starter, paste the code into the named file and observe the documented result. Check the rendered Markdown with images disabled and in light and dark themes.
- AC-02. Map each old topic to its retained heading or a named destination on the site. A link to an old GitHub fragment lands on that topic or on a compatibility anchor beside its new destination link. Compare the rendered anchors to the baseline and open the app and widget links from the README. Check GitHub and npm-compatible image paths without publishing a package.
- AC-03. Verify retained size and benchmark claims against repository measurement commands and context, or remove the measured claim. Run the integrated verification above. Check the built site, starter and widget preview links, including reloads under the deployment base path. Record final verification and any publication-dependent check in the handoff.

## GitHub issues

Parent milestone [Documentation redesign](https://github.com/eternalvision/ecmact/milestone/2). All issues have the `documentation` label.

| Story                                                          | Proposed title                                                  | Estimate | Depends on |
| -------------------------------------------------------------- | --------------------------------------------------------------- | -------- | ---------- |
| [#44](https://github.com/eternalvision/ecmact/issues/44) · US1 | Introduce the monochrome identity and site shell                | M        | —          |
| [#45](https://github.com/eternalvision/ecmact/issues/45) · US2 | Put a runnable ECMact example on the homepage                   | M        | US1        |
| [#46](https://github.com/eternalvision/ecmact/issues/46) · US3 | Redesign article navigation and preserve documentation links    | M        | US1        |
| [#47](https://github.com/eternalvision/ecmact/issues/47) · US4 | Rewrite the bilingual guides and redesign the example galleries | L        | US2, US3   |
| [#48](https://github.com/eternalvision/ecmact/issues/48) · US5 | Rewrite the README around a working quick start                 | M        | US4        |

## Owner decisions and next stages

Recommended delivery sequence is US1 through US5. The owner approved the plan and authorized issue creation on 19 November 2026. Start F4 with #44. Library and CLI tags have their own release decisions after documentation review. The CLI template's brand assets can be refreshed as part of that decision. The ready-made component collection on ECMact begins with its own specification after this redesign. The live post-release npm README and final production screenshots can be verified once their respective artifacts exist.

## Requirement coverage

| Requirement | Stories       | Evidence                                                               |
| ----------- | ------------- | ---------------------------------------------------------------------- |
| R01         | US5           | Fresh starter and rendered README                                      |
| R02         | US3, US4, US5 | Baseline route and fragment comparison, locale and browser navigation  |
| R03         | US1, US5      | Logo at header, favicon and README sizes in light and dark             |
| R04         | US2           | Local interactive demo with public source and installation             |
| R05         | US4, US5      | Bilingual content review and runnable guides                           |
| R06         | US2, US4, US5 | Source parity, clipboard and paste/run checks                          |
| R07         | US1–US4       | Browser captures, keyboard, contrast, zoom and overflow checks         |
| R08         | US1, US3–US5  | Repository gate, workspace builds, template checks and Pages base path |

## ECMact documentation and identity delivery plan: update 1.2

Version 1.2 · F2 update · approved by the owner on 19 November 2026

Updates the [delivery plan](2026-11-19-docs-redesign-plan.md), version 1.1, for requirements R09 to R12 of the [specification addendum 1.3](2026-11-19-docs-redesign-spec.md). Mocks and the coverage matrix: [concept sheet](../sessions/19112026-DocsRedesign/concepts.html). No code is written before the owner approves the addendum and this update. The story split below follows the recommended answers to questions Q1 to Q10 of the addendum; a different answer changes the story it names.

### What changes

US1 (#44) and US2 (#45) are merged. US3 (#46) is in progress on `feature/46-docs-navigation` and does not change.

US4 (#47) was one story of size L for the guides, the demos and the widget gallery. The new requirements replace all five widgets and all twelve demos, so it is split in five. Two stories are new: the starter and the default language. US5 (#48) stays last and gains one dependency.

| Story                | What it delivers                                                                                | Estimate | Depends on      | Requirements                 |
| -------------------- | ----------------------------------------------------------------------------------------------- | -------- | --------------- | ---------------------------- |
| US3 (#46)            | Article navigation, in progress, unchanged                                                      | M        | US1             | R02, R07, R08                |
| US7 (new)            | English by default, the address parameter kept apart from the stored choice                     | S        | US3             | R12, R08                     |
| US4b (new)           | Examples I: the registry and frame for stages, and six examples of state and interface          | L        | US3             | R10, R02, R06, R07           |
| US4c (new)           | Examples II: six examples of requests, lifecycle, a widget and routes; the last old demos go    | L        | US4b            | R10, R02, R06, R07           |
| US4d (new)           | Widgets I: the five successors, the four hosts written again, the old widgets removed           | L        | US4c            | R09, R02, R06, R07           |
| US4e (new)           | Widgets II: three new widgets, the reference, the measured bundle                               | M        | US4d            | R09, R06, R08                |
| US6 (new)            | The starter in the site's style: app template plain and Tailwind, widget template, brand assets | M        | US1             | R11, R03, R08                |
| US4a (#47, narrowed) | The nineteen bilingual guides rewritten around tasks                                            | M        | US4c, US4e, US6 | R02, R05, R06, R07, R08      |
| US5 (#48)            | The README around a working quick start                                                         | M        | US4a, US6       | R01, R02, R03, R05, R06, R08 |

### Delivery order

1. US3 (#46), in progress.
2. US7. Small, and it edits `tests/app/app.test.ts`, which #46 also edits, so it starts after #46 merges.
3. US4b, then US4c. The examples come before the guides because six guide pages embed examples by id, and their text has to describe what is rendered.
4. US4d, then US4e.
5. US6. It depends only on the identity of US1 and can move to any place after #46 if a gallery story waits for an owner decision. It must merge before US4a, because the getting-started guide walks through a fresh starter.
6. US4a (#47), then US5 (#48).

One checkout and no worktrees: the stories run one at a time, each in a new session, each from the current `main` after its dependencies merged.

### Rules added to "Implementation and verification"

- Record the compatibility inventory before the first gallery story: the twelve demo ids, the five widget tags, the four host addresses, and the addresses `/ecmact/starter/`, `/ecmact/widget/`, `/ecmact/widget/embed.html` and `/ecmact/widget/price-widget.js`. The acceptance checks of US4b to US4e and US6 reuse it.
- Every example and every widget is one source file with one test file of the same name, with 100% coverage, JSDoc on every function in `src`, alias imports and named arrow exports, as the [project rules](../../AGENTS.md) say. The site's tests run in happy-dom. No file is added to `tests/browser/`.
- An example or widget imports only from `ecmact` and from its own folder. It requests no other origin. A server it needs is a function passed as the `fetch` option of `createHttp`, or a fetcher given to `resource`.
- No library change. An idea that needs SVG from `tags`, a hash-mode router or a form-associated widget is redrawn. Drawings use CSS, or a fixed SVG string through the trusted `html` prop.
- An old demo or widget file is removed in the pull request that lands its successor, together with its test and its texts in both languages.
- A text that depends on behaviour that is on `main` and not in 3.0.0 (keyed focus #34, disabled controls #30 and #31) names the version it ships in.
- Taste gate. Before a gallery story merges, its pull request shows a browser capture of every new piece at 360 px and 1280 px beside the matching card of the concept sheet.
- A number for the bundle comes from `npm run size` and says where it was measured. Nothing in this update states a size.
- A change under `packages/create-ecmact/template` also runs `npm run build:all && npm run test:template`.

### Stories

#### US7. Open the site in English

A visitor with no stored choice reads English. A link with `?lang=ru` shows Russian for that tab and does not change what the visitor sees next week. Estimate S. Depends on US3. Requirements R12, R08. Recommended answer to Q7 assumed; with answer b the story adds tests only.

Affected: `lib/i18n.ts`, `app/app.ts`, `ui/languageToggle.ts`, `tests/lib/i18n.test.ts`, `tests/app/app.test.ts`.

- AC-01. With empty storage, no `lang` parameter and a browser language of `ru-RU`, the interface is English and the document has `lang="en"`. Test in `tests/lib/i18n.test.ts`; browser with a fresh profile.
- AC-02. The language control stores the choice and a reload keeps it. `?lang=en` shows English over a stored Russian choice. `?lang=ru#section-2` shows Russian and lands on the section. Tests in `tests/app/app.test.ts`.
- AC-03, error and edge. `?lang=de` and `?lang=` are ignored. After a visit through `?lang=ru`, the stored choice is unchanged, and a click on the control during that visit stores the language the visitor then sees. With a storage that throws on read and on write the site is English and the control works for the visit. Tests with a replaced storage.

#### US4b. Play with the examples of state and interface

A developer opens the gallery, finds examples grouped by task, plays with each and reads the files that produced it. Estimate L. Depends on US3. Requirements R10, R02, R06, R07. Mocks E1 to E4, E6 and E10 of the concept sheet.

Affected: `demos/index.ts` (old ids an entry answers for, task group, named files), `ui/demoFrame.ts` (stage, one tab per file), `pages/examples.ts` (groups), `content/messages.ts` in both languages, `styles/site.css` (frame only), and the new `demos/exposure.ts`, `setlist.ts`, `typecase.ts`, `fieldbook.ts`, `customs.ts`, `gels.ts` with their tests. Removed with their tests: `counter.ts`, `todo.ts`, `styled.ts`, `store.ts`, `form.ts`, `context.ts`. The six demos of US4c stay registered until that story.

- AC-01. The six examples run in their stages, grouped by task. Each has at least two controls that change what is seen. One test per example drives its main interaction: the batch in `exposure` leaves the exposure value unchanged and runs the dependent text once; a moved row of `setlist` is the same node and keeps focus; one theme signal restyles `typecase`; `fieldbook` reads its entries back from storage; `customs` submits the values of its shadow fields in `FormData`; an actor in `gels` takes the colour of the nearest zone that has one.
- AC-02. `findDemo` answers for `counter`, `todo`, `styled`, `store`, `form` and `context` with the successor, so the guide pages `signals`, `components`, `styled`, `state` and `forms` and the homepage still render an example. A sentence in a guide that names the old demo is corrected in English and Russian in this pull request. Registry test over all twelve old ids; open the five guide pages in both languages.
- AC-03. Every file of an example is shown under its name and equals the text that runs; copy returns it without labels. A test lists the API areas of the coverage matrix and fails when an area has no user among the registered sources. A test fails on an absolute address to another origin in an example source.
- AC-04, error and edge. `customs` reports the validity error of a shadow field through the native form, leaves the goods out of `FormData` while "nothing to declare" is ticked, and `form.reset()` restores the defaults. With a storage that throws, `fieldbook` works for the visit and says the page will not be kept; a stored state of an older version goes through `migrate`. An unknown id passed to `findDemo` gives `undefined` and the guide renders nothing in its place. `setlist` shows its empty state after the last song is removed.
- AC-05. Titles, descriptions, captions and frame controls exist in both languages (translation tests). At 360 px and 1280 px, in both themes of the frame, each example works by keyboard with visible focus, long source scrolls inside its panel, and reduced motion stops the press animation of `typecase`. Browser captures in the pull request.

#### US4c. Play with the examples of requests, lifecycle and routes

Estimate L. Depends on US4b. Requirements R10, R02, R06, R07. Mocks E5, E7 to E9, E11 and E12.

Affected: new `demos/switchboard.ts`, `catalog.ts`, `departures.ts`, `darkroom.ts`, `seedpacket.ts`, `atlas.ts` with tests; `app/router.ts` and `pages/examples.ts` for the branch `/examples/atlas` (recommended answer to Q3); `content/messages.ts`; `lib/title.ts` if the new route needs a title. Removed with their tests: `http.ts`, `github.ts`, `posts.ts`, `weather.ts`, `lifecycle.ts`, `widget.ts`.

- AC-01. The six examples run. Tests: each line of `switchboard` ends as designed (answered, cancelled with `ERR_CANCELED` and no retry, answered on the third attempt, refused with status 503 after the retries); `departures` shows only the harbour asked for last and counts the aborted requests; `seedpacket` follows `setAttribute`, fires `sow`, and reads `false` from `emit` when a listener cancels the event; `darkroom` logs `mounted`, the cleanup and `unmounted` in the documented order, also for a move.
- AC-02. `findDemo` answers for `http`, `github`, `posts`, `weather`, `lifecycle` and `widget`. All twelve old ids resolve, and no old demo source remains. The guide page `http` renders `switchboard`. Registry test; open the page in both languages.
- AC-03. `atlas` opens at `/ecmact/examples/atlas`, a place at `/ecmact/examples/atlas/saltmarsh?layer=tides`, and both survive a reload and browser Back under the Pages base path with its 404 fallback. The lazy place shows its waiting state. The current link has `aria-current="page"`. The gallery card links to it and shows its source.
- AC-04, error and edge. In `catalog` a newer search aborts the older one and a late answer never replaces a newer one; a borrow that the closed desk refuses with 503 is rolled back and says why; the sixth request in a window gets 429 and the wait is shown and ends. The guard of `atlas` sends the closed lighthouse back to the island, and an unknown place shows the example's own not-found view with a way back. A throw inside a hook of `darkroom` reaches the nearest `error` prop with its phase, and the later hooks still run. `departures` shows an error with a working retry.
- AC-05. As AC-05 of US4b for these six. In addition the whole gallery works with requests to other origins blocked (browser check), and the coverage test of US4b passes with all twelve examples and no old demo.

#### US4d. See five different widgets in four different pages

A developer sees widgets that share nothing but the library, each embedded in two pages that are not ours. Estimate L. Depends on US4c. Requirements R09, R02, R06, R07. Mocks W1 to W5.

Affected: new `widgets/printQuote.ts`, `moonDial.ts`, `proofClock.ts`, `rowCounter.ts`, `feedLamp.ts` with tests; `widgets/index.ts`, `widgets/kit.ts`, `widgets/api.ts`; `content/widgets.ts` (kind, style, former tag, properties per widget); `pages/widgets.ts`; `packages/site/public/hosts/cafe.html`, `terminal.html`, `zine.html`, `kids.html` and the feed files beside them; `content/messages.ts`. Removed with their tests: `priceCalculator.ts`, `weatherNow.ts`, `repoCard.ts`, `pollWidget.ts`, `countdownTimer.ts`, `flip.ts`.

- AC-01. The five widgets are registered once each, and no two share a kind or a style (registry test). Tests per widget: attributes and their defaults, the main interaction, the event and its detail. `print-quote` keeps `currency`, `base`, `heading` and the event `quote`; `proof-clock` keeps `to`, `label` and the event `done`.
- AC-02. The four host addresses answer under the base path with new content. Every widget is in at least two hosts with different custom-property values and keeps its layout under each host's stylesheet. Host tests in the existing pattern (complete page, phone viewport, only registered tags, the bundle script); browser captures of the four hosts at both widths.
- AC-03. The reference lists attributes, events and custom properties of each widget in both languages, and an anchor for each former tag lands on its successor (recommended answer to Q2). `widgets#price-calculator` opens on `print-quote`. Translation tests; open the five old anchors.
- AC-04, error and edge. `feed-lamp` shows a distinct state for a slow answer, a 404 and a body that is not JSON, keeps the last good reading, retries as configured, and aborts its request when `src` changes or the element leaves the page. A missing or malformed attribute gives the documented default in every widget (`to` in the past, `repeat="0"`, an unknown currency). A widget taken out and put back starts clean with no timer left. `row-counter` keeps its count per `pattern` across a reload and works for the visit when storage throws. Tests with a replaced `fetch`, fake timers and a replaced storage.
- AC-05. With requests to other origins blocked the gallery works. Each widget's main interaction works by keyboard with visible focus. Reduced motion stops the refresh flash of `moon-dial` and the stage change of `proof-clock`. Browser check.

#### US4e. Three more widgets and the measured bundle

Estimate M. Depends on US4d. Requirements R09, R06, R08. Mocks W6 to W8.

Affected: new `widgets/morseKey.ts`, `fretMap.ts`, `clueBox.ts` with tests; `widgets/index.ts`, `content/widgets.ts`, the four host pages, `content/messages.ts` (the texts that count widgets and hosts), `scripts/size.mjs` (the label of the gallery entry).

- AC-01. The three widgets are registered; the eight share no kind and no style; each of the eight is in exactly the hosts the concept sheet lists. Tests per widget: `morse-key` turns a short and a long press into a dot and a dash and a pause into a letter, by pointer and by Space; `fret-map` marks the notes of the chosen key and scale and a preset changes both in one update; `clue-box` moves between cells with the arrows and Backspace and fires `solved` once.
- AC-02. The reference and the gallery texts name eight widgets in both languages. `npm run size` reports the gallery bundle under a label that matches; a number shown on the site or in the README is the measured one with its context.
- AC-03, error and edge. `morse-key` ignores a key repeat while held, ends a press when the pointer leaves, and shows an unknown pattern as unknown. `fret-map` falls back to the default for an unknown key, scale or tuning. `clue-box` accepts one letter per cell, ignores other characters, and marks a wrong letter without revealing the answer. Removal and return leave no timer. Tests with fake timers.
- AC-04. As AC-05 of US4d for these three, and the coverage test passes with all eight widgets.

#### US6. Start from a starter that looks like the site

A developer runs `npm create ecmact` and the first screen belongs to the same product as the documentation. Estimate M. Depends on US1. Requirements R11, R03, R08. Mock: the starter section of the concept sheet. Recommended answers to Q6 and Q8 assumed: the file list and `<price-widget>` stay, the look changes.

Affected in `packages/create-ecmact/template`: `base/index.html` (theme colours), `base/src/styles.css` (tokens), `base/src/app.ts`, `base/src/components/logo.ts` and `counter.ts`, `base/src/assets/ecmact-logo.png` and `base/public/favicon.png` (brand assets), `base/README.md`; `tailwind/src/components/counter.ts`; `widget/index.html`, `widget/src/widget.ts` (default colours), `widget/README.md`. Outside the template: `scripts/brand-images.mjs` (also renders the template's images), `packages/create-ecmact/tests/project/scaffold.test.ts`, `packages/create-ecmact/README.md`. `.github/pages/embed.html` stays as it is: it plays a page that is not ours.

- AC-01. The first screen of the app template, plain and Tailwind, matches the mock: ink and paper, light and dark by system preference, the mark and wordmark from the brand geometry, the hint about `src/app.ts`, the counter and the links. No request leaves the page for a font or an image. Scaffold both variants, run them, capture at 360 px and 1280 px in both schemes.
- AC-02. The mark of the template cannot drift from the site: a test compares its path data with `packages/site/src/lib/brand.ts`, or `npm run brand:images` writes the template's images and a second run changes no file.
- AC-03. `npm run build:all && npm run test:template` pass: each of the three variants passes its own check and build, and the widget variant writes `dist/widget/price-widget.js`. The scaffolder tests name the generated files. The repository gate passes.
- AC-04, error and edge. `packages/site/tests/demos/estimate.test.ts` still passes, so the homepage shows the starter's real `index.html`. Text keeps 4.5:1 and focus is visible in both schemes. The counter test of the template still passes unchanged. `<price-widget>` keeps its attributes, its event and the two custom properties that `embed.html` sets. After the merge `/ecmact/starter/`, `/ecmact/widget/`, `/ecmact/widget/embed.html` and `/ecmact/widget/price-widget.js` answer; this last check depends on the deployment and is recorded in the handoff.

The restyled template reaches `npm create ecmact` only with a `create-ecmact-v*` tag. The tag is not part of this story.

#### US4a (#47, narrowed). Learn from the bilingual guides

The story keeps AC-01 and AC-04 of the old US4. Its old AC-02 moved to US4b and US4c, its old AC-03 to US4d and US4e. Estimate M. Depends on US4c, US4e and US6. Requirements R02, R05, R06, R07, R08.

Affected: `content/docs/` and `content/docs/ru/`, `content/messages.ts`.

- AC-01. All nineteen paired topics are reviewed against the checklist of reader goal, example or reference and next step. Getting started leads from a fresh restyled starter to a visible change. A guide that embeds an example describes the example that renders. Signatures, defaults, limits and security notes match the public API; unreleased behaviour names its version. Content and translation tests in both languages.
- AC-02. Every retained topic and section id opens in English and Russian after the rewrite and is compared with the inventory of US3. Guide pages refer to examples by their new ids; the old ids keep resolving.
- AC-03, error and edge. An unknown documentation slug still leads to the not-found view with a way back. A guide that links to a widget or an example links to an address that exists (link test over the content). The mobile reading order, keyboard controls and long examples are checked again in both themes.

#### US5 (#48). README

Unchanged, with one more dependency: US6, because "What you get" describes the generated project.

### Where the old ids go

| Old demo id | Successor     | Story | Embedded today in         |
| ----------- | ------------- | ----- | ------------------------- |
| `counter`   | `exposure`    | US4b  | guide `signals`, homepage |
| `todo`      | `setlist`     | US4b  | guide `components`        |
| `styled`    | `typecase`    | US4b  | guide `styled`, homepage  |
| `store`     | `fieldbook`   | US4b  | guide `state`             |
| `form`      | `customs`     | US4b  | guide `forms`             |
| `context`   | `gels`        | US4b  | none                      |
| `http`      | `switchboard` | US4c  | guide `http`              |
| `github`    | `catalog`     | US4c  | none                      |
| `posts`     | `catalog`     | US4c  | none                      |
| `weather`   | `departures`  | US4c  | none                      |
| `lifecycle` | `darkroom`    | US4c  | none                      |
| `widget`    | `seedpacket`  | US4c  | none                      |
| none        | `atlas` (new) | US4c  | none                      |

| Old widget tag     | Successor                                 | Story | Attributes and event kept              |
| ------------------ | ----------------------------------------- | ----- | -------------------------------------- |
| `price-calculator` | `print-quote`                             | US4d  | `currency`, `base`, `heading`, `quote` |
| `countdown-timer`  | `proof-clock`                             | US4d  | `to`, `label`, `done`                  |
| `poll-widget`      | `row-counter`                             | US4d  | none                                   |
| `weather-now`      | `moon-dial`                               | US4d  | none                                   |
| `repo-card`        | `feed-lamp`                               | US4d  | event `loaded`                         |
| none               | `morse-key`, `fret-map`, `clue-box` (new) | US4e  | none                                   |

| Host       | Address, kept                 | Widgets after US4e                                    |
| ---------- | ----------------------------- | ----------------------------------------------------- |
| `cafe`     | `/ecmact/hosts/cafe.html`     | `proof-clock`, `row-counter`, `clue-box`, `moon-dial` |
| `terminal` | `/ecmact/hosts/terminal.html` | `feed-lamp`, `morse-key`, `fret-map`, `moon-dial`     |
| `zine`     | `/ecmact/hosts/zine.html`     | `print-quote`, `proof-clock`, `clue-box`, `morse-key` |
| `kids`     | `/ecmact/hosts/kids.html`     | `row-counter`, `fret-map`, `feed-lamp`, `print-quote` |

### GitHub issues

Milestone [Documentation redesign](https://github.com/eternalvision/ecmact/milestone/2). Created on 2026-11-19 after the owner said "create" (the owner approved the concepts and answers Q1-Q10 with the recommended options).

| Story                                                           | Proposed title                                                                   | Labels                         | Estimate | Depends on      |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------ | -------- | --------------- |
| [#53](https://github.com/eternalvision/ecmact/issues/53) · US7  | Open the site in English and keep the address parameter out of the stored choice | `documentation`                | S        | #46             |
| [#54](https://github.com/eternalvision/ecmact/issues/54) · US4b | Rewrite the examples of state and interface on a new example stage               | `documentation`                | L        | #46             |
| [#55](https://github.com/eternalvision/ecmact/issues/55) · US4c | Rewrite the examples of requests, lifecycle and routes                           | `documentation`                | L        | US4b            |
| [#56](https://github.com/eternalvision/ecmact/issues/56) · US4d | Replace the five gallery widgets and rewrite the four hosts                      | `documentation`                | L        | US4c            |
| [#57](https://github.com/eternalvision/ecmact/issues/57) · US4e | Add three widgets and measure the gallery bundle                                 | `documentation`                | M        | US4d            |
| [#58](https://github.com/eternalvision/ecmact/issues/58) · US6  | Restyle the starter templates to the site                                        | `documentation`, `enhancement` | M        | #44             |
| US4a · [#47](https://github.com/eternalvision/ecmact/issues/47) | Rewrite the bilingual guides around tasks (new title, the galleries move out)    | `documentation`                | M        | US4c, US4e, US6 |
| US5 · [#48](https://github.com/eternalvision/ecmact/issues/48)  | Rewrite the README around a working quick start (unchanged)                      | `documentation`                | M        | #47, US6        |

Changing the title and text of #47 is a change to an existing issue and is done on the owner's word with the creation of the others.

### Manual steps of the owner

1. Read the concept sheet and the addendum; answer Q1 to Q10; write "approved" for the addendum and for this update.
2. Say "create" for the six new issues and the change to #47.
3. Look at the browser captures in each gallery pull request (the taste gate) and at the starter captures in US6.
4. Decide the `create-ecmact` tag after the redesign, with the library patch release.

### Requirement coverage

| Requirement | Stories                                | Evidence                                                                            |
| ----------- | -------------------------------------- | ----------------------------------------------------------------------------------- |
| R01         | US5                                    | Fresh starter and rendered README                                                   |
| R02         | US3, US4a, US4b, US4c, US4d, US5       | Inventory of ids, tags and addresses; old ids resolve; host addresses answer        |
| R03         | US1, US5, US6                          | Mark in the header, favicon, README and starter from one geometry                   |
| R04         | US2                                    | Local interactive example with source and install path                              |
| R05         | US4a, US5                              | Bilingual review, runnable guides, versions named                                   |
| R06         | US2, US4a, US4b, US4c, US4d, US4e, US5 | Source parity per file, copy checks, widgets in hosts                               |
| R07         | US1, US2, US3, US4a to US4e            | Captures at two widths, keyboard, contrast, reduced motion                          |
| R08         | US1, US3, US4a, US4e, US5, US6, US7    | Repository gate, workspace builds, template checks, measured sizes                  |
| R09         | US4d, US4e                             | Registry of kinds and styles, widget and host tests, blocked-network check          |
| R10         | US4b, US4c                             | Coverage test, per-example tests of interaction and failure, old ids                |
| R11         | US6                                    | Scaffolded captures, brand geometry check, template checks, Pages addresses         |
| R12         | US7                                    | Language tests with empty, stored and throwing storage; fresh-profile browser check |

Not verified in this update: every item listed as not verified in section 8 of the addendum; the size estimates, which are judgements and not measurements; whether the homepage section that embeds `counter` and `styled` stays after US3 merges.

## Style v2 for the examples and widgets: plan update 1.3 (approved by the owner on 19 November 2026)

Version 0.1 · F2 update · **draft for comments, not approved** · 19 November 2026

Proposed update of the delivery plan `docs/plans/2026-11-19-docs-redesign-plan.md` (version 1.2) and, in section 2, of the specification addendum 1.3 in `docs/plans/2026-11-19-docs-redesign-spec.md`. Tracker: milestone "Documentation redesign" of `eternalvision/ecmact`, issues #55, #56, #57, #47 and one new issue. Materials in [`docs/sessions/19112026-DocsRedesign/`](../sessions/19112026-DocsRedesign/): [`concepts-v2.html`](../sessions/19112026-DocsRedesign/concepts-v2.html) (the twenty mocks), `concepts-v2-1280.png` and `concepts-v2-390.png` (captures), [`style-matrix.md`](../sessions/19112026-DocsRedesign/style-matrix.md) (the table, the checks, the devices that must not return), and the scripts that produced and checked them (`build/`), which are not in the repository; see D64.

The owner approved the v2 looks as drawn on 19 November 2026 and the recommended answers to Q11-Q20 apply. Issue: #65 (US8); #56 and #57 updated; #47 depends on #65.

### 1. Why, and what was checked

The owner looked at the built examples on 19 November 2026 and wrote: "ты сделал 4 виджета в одинаковом стиле, с одинаковыми цветами, везде острые углы". The approved concept sheet (D50) names a different style on every card, but the cards are built from the same few devices. Counted in the twelve sources `packages/site/src/demos/*.ts` on `feature/55-examples-requests-routes` at 2465f22:

| Device                                                                                                               | Sources that have it, of 12                         |
| -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `padding: 18px`                                                                                                      | 10                                                  |
| a monospace font stack                                                                                               | 9                                                   |
| `text-transform: uppercase`                                                                                          | 8                                                   |
| `1px solid` rules                                                                                                    | 8                                                   |
| `border-radius: 0` (10 times in all)                                                                                 | 6                                                   |
| `letter-spacing`                                                                                                     | 11                                                  |
| a cream or beige background (`#f7eed6`, `#f4ecd6`, `#f1efe6`, `#f6f1e4`, `#f6efdc`, `#f3e7c6`, `#eee3c9`, `#d2b48c`) | not counted per file; the values are in the sources |

Stage schemes today (`packages/site/tests/demos/index.test.ts`, "the stages"): dark for `exposure`, `setlist`, `gels`, `departures`, `darkroom`; light for the other seven.

State of the code: the six examples of US4b are on `main` (#54 merged, 6f3dfa1). The six of US4c are on `feature/55-examples-requests-routes`, in review, not merged. The eight widgets are not written: `packages/site/src/widgets/` still holds the five old ones.

### 2. Specification change this plan needs (addendum 1.4, approved)

Decided by the owner on 19 November 2026 (the feedback above and the assignment for this document), proposed for the decision log as D60 to D62:

| Decision                                                                                                                                                                                                                                                                                           | Alternatives considered                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| D60. The style directions of D50 are replaced. Each example and each widget is different from the others in shape, colour, type, surface and kind of control. The looks are current and playful, not a family of retro panels. The functions, names, interactions and ECMact coverage of D50 stay. | Keep the D50 styles and change colours only. Restyle only the pieces that look most alike. |
| D61. The frame of the site stays monochrome, as the design study decided. Only stages and widgets carry a look of their own.                                                                                                                                                                       | Bring colour into the frame.                                                               |
| D62. The twelve written examples are restyled inside their own files: no library change, no dependency, no font or image from the network. System font stacks, CSS gradients, shapes and shadows; a drawing that needs more is a fixed SVG string through the trusted `html` prop.                 | Rewrite the examples. Load web fonts. Add SVG to `tags`.                                   |

Section 6 of the addendum (visual proposal): `concepts-v2.html` replaces the style part of `concepts.html`. The coverage matrix, the map of old ids and the starter mock of `concepts.html` stay as they are.

New requirement:

| Requirement                              | Acceptance                                                                                                                                                                                                                                                                                                                                                                                                        | How to verify                                                                                                                                                                                                                                                                   |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R13. No two pieces look like one family. | AC-24. Each of the twenty pieces has one value on each of six axes (shape, palette, type, surface, primary control, motion), as `style-matrix.md` lists them. Any two pieces share at most two values.                                                                                                                                                                                                            | A test computes the 190 pairs from the recorded values (question Q17). Today: 140 pairs share nothing, 48 share one value, 2 share two.                                                                                                                                         |
|                                          | AC-25. Sharp corners in at most two pieces, a dark stage in at most five, monospace as the main type in at most two, small uppercase monospace labels in at most two.                                                                                                                                                                                                                                             | The same test. Today: 1, 4, 2 and 0.                                                                                                                                                                                                                                            |
|                                          | AC-26, error and edge. In every piece text keeps 4.5:1 against what is behind it in every state (also error, waiting, disabled-but-readable and every ink and stock pair), each focus stop shows an outline, nothing overflows its stage at 360 px, and with `prefers-reduced-motion: reduce` no animation runs that carries no information. A device with none of the named fonts still gets a layout that fits. | Browser measurement in the pull request (the scripts in `build/` do it for the mocks: lowest ratio 4.69:1 over 286 text boxes at 1280 px and 287 at 390 px, 120 focus stops, no animation under reduced motion). A run with the stack cut down to its generic family at 360 px. |
|                                          | AC-27. None of the devices listed in section 6 of `style-matrix.md` is in an example or widget source outside the piece that is allowed to have it.                                                                                                                                                                                                                                                               | A test scans the sources: `border-radius: 0` only in `typecase`; a monospace stack only in `feed-lamp` and `morse-key`; no `1px solid`; `text-transform: uppercase` only in `typecase`.                                                                                         |

AC-09 of R09 changes in one word: the "style direction" a widget records is its row of the matrix, not the D50 name. AC-13 of R10 ("review against the concept sheet") means `concepts-v2.html` for the look and `concepts.html` for the function.

### 3. Overview and order of delivery

| Story               | What it delivers                                                                             | Estimate | Depends on                                       | Requirements            |
| ------------------- | -------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------ | ----------------------- |
| US4c (#55)          | Unchanged. It merges with the looks it has; the restyle does not reopen its review.          | L        | US4b                                             | R10                     |
| US8 (#65)           | The twelve examples in their v2 looks; the style rule as a test; the v2 materials in `docs/` | L        | US4c merged                                      | R13, R10, R06, R07      |
| US4d (#56, updated) | The five successor widgets and the four hosts, built in the v2 looks from the start          | L        | US4c; after US8 by the recommended answer to Q20 | R09, R13, R02, R06, R07 |
| US4e (#57, updated) | Three more widgets in the v2 looks, the reference, the measured bundle                       | M        | US4d                                             | R09, R13, R06, R08      |
| US4a (#47)          | Unchanged in scope; gains a dependency on US8, because the guides describe what is rendered  | M        | US8, US4e, US6                                   | as before               |

Order: #55, then US8, then #56, #57, then US6, #47, #48 as planned. One checkout, one story at a time, each in a new session from the current `main`.

### 4. Common rules

All rules of plan 1.2 keep applying (gate before a commit, alias imports, named arrow exports, JSDoc in `src`, 100% coverage, tests in happy-dom, no file added to `tests/browser/`, English and Russian string for string, taste gate). Added:

- A look is the row of `style-matrix.md` and the card of `concepts-v2.html`. A piece that needs to leave its row says so in the pull request and the matrix is updated in the same change, with the pairwise check run again.
- The taste gate compares each built piece at 360 px and 1280 px with its v2 card, in both themes of the frame, and shows the twelve (or the widgets of the story) on one sheet, so the owner judges the difference between them and not each piece alone.
- Fonts are the stacks of section 5 of `style-matrix.md`, copied whole. No `@font-face`, no `url(` in any example or widget style. The existing test "name no address on another origin" stays.
- Motion sits behind `@media (prefers-reduced-motion: no-preference)` unless it carries information; a state that motion shows is also shown without it (colour, text, position).
- Focus: every focusable element of a piece has a `:focus-visible` outline of at least 3 px in a colour of the piece that keeps 3:1 against what is around it. A date input also takes it on `:focus-within`.
- Features newer than "Baseline widely available" are used with a fallback that passes AC-26 alone. Known case: `backdrop-filter` in `customs` (question Q18). D38 speaks of the library; this plan applies the same care to example CSS. The Baseline dates of `color-mix()`, CSS masks and `backdrop-filter` were not checked against current documentation for this draft.

### 5. Stories

#### US8 (#65). See twelve examples that share nothing but the library

A developer scrolls the examples and sees twelve different things. Each still works as before and still shows the file that runs. Estimate L. Depends on US4c merged. Requirements R13, R10, R06, R07. Mocks E1 to E12 of `concepts-v2.html`.

The example mocks are drawn on the element structure and class names the sources have today, so each look is a change of the CSS in the example's own file. Where a mock uses a helper that the source does not have, the table names the selector that replaces it.

Affected, per example (`packages/site/src/demos/<name>.ts` and `packages/site/tests/demos/<name>.test.ts`):

| Example       | Scheme now, then | CSS change                                                                                                                                                                                                                                                                                                                                                     | Anything else in the file                                                                                                                                                                                      | Tests touched                                                                                                                              |
| ------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `exposure`    | dark, light      | LCD and plastic keys go. Raised cards for the three readouts, an inset well for the exposure value, each `.pair` a capsule stepper, `.lock` a switch drawn with `::after` and `[aria-pressed]`. Labels lowercased with `::first-letter` raised; the third label keeps its capitals (`.glass > div:nth-child(3) small`).                                        | none                                                                                                                                                                                                           | scheme map                                                                                                                                 |
| `setlist`     | dark, light      | Tape and marker go. Rows are white cards with a 3 px outline and a hard shadow on a pink field, row number from a CSS counter, round buttons, lime minutes and Add, the total in a black capsule. The lift is `li:focus-within` and `li:hover`.                                                                                                                | none                                                                                                                                                                                                           | scheme map; `setlist.test.ts` line 77 (`color-scheme: dark`)                                                                               |
| `typecase`    | light, light     | The double rule and the stretched slab go. `Poster` is a solid ink block with stock-coloured condensed type and an offset tint (`color-mix`), square swatches, the field a tinted block. The `press` keyframes and their `0.5s ease-out` stay.                                                                                                                 | The values of `inks` and `stocks`: Black `#111111`, Red `#C4161C`, Blue `#2B2BFF`; stocks Mint `#C8F7DC`, White `#FFFFFF`, Lemon `#FFF27A`; the start becomes Blue on Mint. Stock names change (question Q15). | `typecase.test.ts` lines 35, 36, 43, 48 to 50: the colophon text, `border: 3px double #1a1a1a`, `#d2b48c`, `color: #b3261e`, "Kraft stock" |
| `fieldbook`   | light, light     | Ruled paper and pencil go. A lemon sticky note with a tape strip and a folded corner (`:host::before`, `:host::after`), blue hand type, wobbly round `+`, a dashed underline field, a filled and a dashed button.                                                                                                                                              | none                                                                                                                                                                                                           | none expected                                                                                                                              |
| `switchboard` | light, light     | The enamel panel goes. Four arch tiles; `.lamp` becomes a ring behind the round `.disc`; the state class of `.line` tints the tile and lights the ring; `.strip` is a speech bubble. The pulse of `.ringing` only without reduced motion.                                                                                                                      | none                                                                                                                                                                                                           | none expected                                                                                                                              |
| `customs`     | light, light     | Carbon paper and typewriter go. A frosted card on a gradient mesh, pill fields, checkboxes drawn as switches with a background thumb (no pseudo-element on `input`), filled Submit, a stamp that lands. `label.sw` of the mock is `fieldset label` and `label.nothing` in the source.                                                                          | The switch rule is needed in `fieldCss` (the goods) and in `css` (the two plain checkboxes): one shared template constant, or the rule twice.                                                                  | none expected                                                                                                                              |
| `catalog`     | light, light     | The drawer and index cards go. `:host` becomes a grid; cards are book shapes with a spine colour by `:nth-of-type`, Optima titles, filled buttons, a rotated "on loan" badge (lowercased by CSS), a large pill search field.                                                                                                                                   | none                                                                                                                                                                                                           | none expected                                                                                                                              |
| `departures`  | dark, light      | Yellow on black goes. An orange field, the harbours in one black capsule, white capsule rows with the time in DIN, the pier in a black circle; the two switches are chips with a dot (`[aria-pressed]::before`), "Ask again" is `.controls button:not([aria-pressed])`. Shimmer on `.rows[aria-busy='true']`.                                                  | none                                                                                                                                                                                                           | scheme map                                                                                                                                 |
| `darkroom`    | dark, dark       | Thin red lines go. Three inset wells with a red rim light, the print a small photo that develops with `--d`, one filled primary pill and two quiet ones (`.acts button:first-child`), the log as dots. Type at weight 300, 15.5 px or more.                                                                                                                    | none                                                                                                                                                                                                           | none expected                                                                                                                              |
| `gels`        | dark, dark       | Outlined boxes go. Each zone is a rounded pool with a neon ring and bloom in `--c`, the gel button a filled chip, the actor a glowing dot and name. The chip of a zone without a gel is `button[aria-label$='no gel']`. Nested radius by `font-size` in `em` on `:host` (40, 30, 23 px); not tried in the component. The gel colours stay, the test pins them. | none                                                                                                                                                                                                           | none expected                                                                                                                              |
| `seedpacket`  | light, light     | Ochre and double border go. A mint field with seed dots, the packet white with a pinked top edge (conic mask) and a drop shadow on the widget host, Clarendon name, filled "Tear open"; the side panel a white card with filled fields.                                                                                                                        | The values of `inks` and the default `--packet-ink`: `#0E7A46`, Rust `#C92A1E`, Indigo `#6D28D9`; names stay.                                                                                                  | `seedpacket.test.ts` line 81 (`#2f5d3a`)                                                                                                   |
| `atlas`       | light, light     | Parchment and sepia go. An address pill, a sea with a green blob island on a sand ring, places as white labels with a coral pin, the current one dark (`[aria-current='page']`), a sheet with a handle, layers as leaf chips, Night as a sun or moon chip. Applies to the plate of the gallery and to the route.                                               | none                                                                                                                                                                                                           | none expected                                                                                                                              |

Also affected: `packages/site/tests/demos/index.test.ts` (the scheme map; the new tests of AC-06 and AC-07), `packages/site/src/demos/index.ts` if question Q17 is answered a (the six values per example), `docs/sessions/19112026-DocsRedesign/` (`concepts-v2.html`, its captures and `style-matrix.md` move in), `docs/decisions.md` (D60 to D62 and what the story decides), `docs/plans/` (addendum 1.4 and this update, with the issue number written back), `docs/handoff.md`. The descriptions of the examples in `packages/site/src/content/messages.ts` are read in both languages for a sentence that names an old look; whether one exists was not checked for this draft.

Not affected: `src/` of the library, `ui/demoFrame.ts`, `styles/site.css`, the routes, the behaviour of any example.

- AC-01. Each of the twelve examples shows its row of the matrix and its v2 card: the pull request has one sheet with the twelve built stages at 1280 px and one at 360 px, and for each example a pair "v2 card, built" in both themes of the frame. Verified by the owner on the captures (taste gate).
- AC-02. Behaviour does not change. Every existing example test passes with its interaction assertions untouched; only the style assertions named in the table change. The source shown is still the source that runs (the raw-import check of the registry). Verified by `npm test` and by `git diff --stat` of the test files.
- AC-03. Each stage declares its scheme: light for `exposure`, `setlist` and `departures` from now on, dark only for `gels` and `darkroom`, light for the other seven. Native controls (date, select, checkbox, number) follow the stage in both themes of the frame. Verified by the registry test "declare a color scheme of their own" with the new map and by captures in the dark frame.
- AC-04. At 360 px no element leaves its stage, long words wrap, every target is at least 24 by 24 px, and `atlas` works at `/examples/atlas` the same way. Verified in the browser with a script that compares every element's box with its stage, as `build/shot.mjs` does for the mocks.
- AC-05. Text keeps 4.5:1 and every focus stop shows its outline, in every state the example has: the invalid field and both stamps of `customs`, the lost and the kept status of `fieldbook`, the wait and the notice of `catalog`, loading and the error with Retry of `departures`, the notice, the waiting sheet and the missing place of `atlas`, the over-curfew and the empty set of `setlist`, all nine ink and stock pairs of `typecase`, all three inks of `seedpacket`, every lamp of `switchboard`, every gel and "no gel" of `gels`. Verified by a browser measurement of text against the pixels behind it, per state, in the pull request.
- AC-06, error and edge. With `prefers-reduced-motion: reduce` no animation runs in any stage (the press of `typecase` keeps its existing test; the pulse, shimmer, thud and ping do not start) and every state is still told apart without motion. With `backdrop-filter` unsupported the card of `customs` is a solid light surface that passes AC-05. With every named font missing (stack cut to the generic family) AC-04 still holds. A control with `aria-disabled='true'` in `darkroom` looks disabled and keeps a visible focus. Verified by a test that reads each source for its reduced-motion block, by an `@supports` rule in `customs`, and by browser runs with reduced motion and with the cut stacks.
- AC-07. The rule is a test: the pairwise check over the twelve examples (and later the eight widgets) and the limits of AC-25 pass, and the source scan of AC-27 passes. Verified by the tests in `tests/demos/index.test.ts`; each fails when a thirteenth "same" look or a forbidden device is added (shown once in the pull request by a deliberate failing change, then removed).
- AC-08. The v2 materials are in `docs/sessions/19112026-DocsRedesign/`, linked from the specification and the plan; D60 to D62 and the answers to Q11 to Q20 are in `docs/decisions.md`. Verified by reading the links.

Tests: the twelve example tests (unchanged interactions), the registry tests (scheme map, pairwise rule, limits, source scan, reduced-motion blocks), and the gate `npm run lint && npm run format:check && npm run typecheck && npm test` on Node 22. Browser evidence in the pull request: captures, overflow, contrast and focus measurements at 360 px and 1280 px, both frame themes, Chromium, Firefox and WebKit.

#### US4d (#56), update. Five widgets built in their v2 looks

Scope, files, attributes, events and hosts stay as plan 1.2 says. Changed: mocks W1 to W5 of `concepts-v2.html` replace W1 to W5 of `concepts.html` for the look.

- AC-01 gains: the `style` a widget records is its row of the matrix; the registry test of unique kinds and styles becomes the pairwise check of AC-24 over the registered widgets and the twelve examples.
- AC-02 gains: the taste gate compares each widget with its v2 card and shows the five on one sheet beside the twelve examples.
- New AC-06. `print-quote` offers the price breaks as a radio group of cards (arrow keys move, one is always chosen) and keeps `currency`, `base`, `heading` and the event `quote`. `moon-dial` has a ring with `role="slider"` (arrow keys step a day, Home is today) beside the buttons of D50. `proof-clock` has a native range input for the temperature. `feed-lamp` offers the four sample feeds as tabs and keeps `src` as the attribute that decides. `row-counter` is one round button. Verified by widget tests for keyboard and pointer. (Question Q16: these controls differ from the D50 cards.)
- New AC-07, error and edge. Under each host's stylesheet and with each host's custom-property values the widget keeps AC-26: 4.5:1, visible focus, no overflow at 360 px, no animation under reduced motion. A custom property set to a value that would break contrast is the host's responsibility and is said so in the reference. The masks of `print-quote` and `moon-dial` have a fallback outline (a plain rounded card, a plain ring) where the mask is unsupported. Verified in the browser on the four hosts and by an `@supports` rule.

The look of the four host pages is not part of this sheet (question Q19).

#### US4e (#57), update. Three more widgets in their v2 looks

Scope stays. Mocks W6 to W8 of `concepts-v2.html` replace W6 to W8 of `concepts.html` for the look.

- AC-01 gains: the eight widgets and twelve examples pass the pairwise check and the limits; `feed-lamp` and `morse-key` are the two pieces with a monospace main type, and no third is added.
- AC-03 gains, error and edge: the tape of `morse-key` and the pop of `fret-map` do not animate under reduced motion and the new mark or note is visible at once; a wrong letter of `clue-box` is marked by colour and by a text for assistive technology, not by the shake alone.
- AC-02 keeps: the bundle number comes from `npm run size`. Eight styled widgets weigh more than five plain ones; nothing here states a size.

### 6. Manual steps of the owner

1. Open `concepts-v2.html` (or the two captures) and answer Q11.
2. Answer Q12 to Q20, or accept the recommendations.
3. Write "approved" for the specification change of section 2 and for this plan update.
4. Say "create" for the new issue and the three issue changes of section 8.
5. Look at the built sheet in the pull request of US8 (taste gate) before it merges.

### 7. To decide

Each question is the owner's. The recommended option is first.

**Q11. The twenty looks.**

- a. Take the twenty as drawn. Recommended: the matrix passes its own rule and the built captures are a second chance to object.
- b. Take them with changes to named pieces. The matrix is re-run for each change.
- c. Reject the direction; a new round of mocks.

**Q12. Where the restyle of the examples lands.**

- a. One new issue and one pull request for all twelve, after #55 merges. Recommended: the owner judges the twelve side by side once, the scheme map and the rule tests change once, and the review of #55 is not reopened.
- b. Two pull requests: the six on `main` now, the six of #55 after it merges. Starts sooner, and the side-by-side judgement happens twice on half a set.
- c. Fold the six of US4c into #55 before it merges. Changes a branch that is in review.

**Q13. How far the examples may change.**

- a. CSS in the example's file, plus the colour values and names listed for `typecase` and `seedpacket`. Recommended: the mocks are drawn on today's elements, behaviour tests stay untouched.
- b. Also swap controls for native ones where a look suggests it (a range input in `exposure`, real radio inputs in `departures`). More honest control types, new markup, rewritten tests, new review of behaviour.

**Q14. Three stages turn from dark to light.**

- a. `exposure`, `setlist` and `departures` become light; dark stays for `gels` and `darkroom`. Recommended: the owner named dark panels as part of the sameness, and both remaining ones are dark because light is their subject.
- b. Keep one of the three dark. The limit of five still holds (two examples and two widgets are dark in the matrix).

**Q15. Names and colours in `typecase` and `seedpacket`.**

- a. `typecase`: stocks become Mint, White, Lemon; inks keep the names Black, Red, Blue with new values. `seedpacket`: ink names stay, values change. Recommended: the visible names match what is seen.
- b. Keep "Cream" and "Kraft" as names over the new colours. No test text changes, and the names are wrong.
- c. Keep the old stock colours in `typecase`. The poster stays beige, which the feedback named.

**Q16. Controls of the widgets that differ from the D50 cards.**

- a. Accept them: price-break cards in `print-quote` instead of a stepper, a ring dial in `moon-dial` beside its buttons, tabs for the sample feeds in `feed-lamp`. Recommended: twenty different primary controls is the point of the axis, and attributes and events do not change.
- b. Keep the D50 controls and give them the v2 look. Two widgets then share "stepper" with `exposure`; the pairwise rule still passes.

**Q17. The rule as data and a test.**

- a. Each registry entry (examples and widgets) records its six values, and a test checks the pairs, the limits and the source scan. Recommended: the sameness came back once without anyone deciding it; a failing test is cheaper than another round of captures. It adds a field to both registries.
- b. Only the widget registry records a style, as AC-09 says today; the examples are guarded by the taste gate.
- c. No test. The matrix is a document.

**Q18. Glass in `customs`.**

- a. `backdrop-filter` inside `@supports`, with a solid light card otherwise. Recommended: the look is the only glass among the twenty, and the fallback passes the contrast rule alone.
- b. No blur: a translucent card without it. Works everywhere, reads as flat.
- c. Another surface for `customs`; the matrix is re-run.

**Q19. The four host pages (`cafe`, `terminal`, `zine`, `kids`).**

- a. A small sheet of four host mocks at the start of #56, shown to the owner before the hosts are written. Recommended: two of the names point at the retro looks this update removes, and the hosts frame every widget.
- b. The implementer of #56 decides and the taste gate of #56 judges.
- c. Keep the addresses and make all four plain, differing only in custom-property values.

**Q20. Order of US8 and #56.**

- a. US8 first, then #56. Recommended: the owner sees the direction on real components after one story of CSS, before eight widgets are built on it.
- b. #56 first. The widgets arrive sooner; a rejected direction costs more.

### 8. Proposed issues

To create or change only after the owner says "create". Milestone "Documentation redesign".

| Action | Issue      | Title                                                                         | Labels          | Estimate | Depends on                  | Change                                                                                |
| ------ | ---------- | ----------------------------------------------------------------------------- | --------------- | -------- | --------------------------- | ------------------------------------------------------------------------------------- |
| create | #65 · US8  | Give each of the twelve examples its own look                                 | `documentation` | L        | #55                         | Story text of US8, AC-01 to AC-08, the table of files                                 |
| change | #56 · US4d | Replace the five gallery widgets and rewrite the four hosts (title unchanged) | `documentation` | L        | #55; the new issue if Q20 a | Mocks W1 to W5 of `concepts-v2.html`; AC-01 and AC-02 as amended; new AC-06 and AC-07 |
| change | #57 · US4e | Add three widgets and measure the gallery bundle (title unchanged)            | `documentation` | M        | #56                         | Mocks W6 to W8 of `concepts-v2.html`; AC-01 and AC-03 as amended                      |
| change | #47 · US4a | Rewrite the bilingual guides around tasks (title unchanged)                   | `documentation` | M        | adds the new issue          | One line: depends on the restyle, because the guides describe what is rendered        |

Branch of the new issue: `feature/<issue number>-examples-own-look` from `main`. #55 itself does not change.

### 9. Risks

- Taste, again. A mock can read differently once built, and "different" is the owner's judgement. The sheet of all built pieces side by side is the gate, and the rule is also a test (Q17).
- Fonts. The looks lean on fonts that exist on macOS: Futura, Optima, Didot, DIN Alternate, Superclarendon, Rockwell, Bradley Hand, Iowan Old Style, Arial Rounded. On Windows, Android and Linux the next name of each stack is used, and several pieces fall back to a plain sans or serif. The difference between pieces then rests on shape, colour, surface and control. This was not captured on any other system.
- Engines. The mocks were rendered in Chromium only. Not tried in Firefox and WebKit: `backdrop-filter`, conic and radial masks with `mask-composite`, `color-mix()`, range input pseudo-elements, checkboxes with `appearance: none`, `::first-letter` on a block `small`.
- Source length. The examples show their CSS as part of the source (R06). The mocks have about 1000 declarations for the twelve examples where the sources have about 800, and the mocks do not draw every state. Expect the CSS of an example to grow by a third or more; `atlas` most. The existing answer stands: styles as a second named file where the logic drowns (D53 allows it).
- Selectors that lean on text or order: `button[aria-label$='no gel']` in `gels`, `.glass > div:nth-child(3)` in `exposure`, `.acts button:first-child` in `darkroom`, `:nth-of-type` spines in `catalog`. They break when the markup or a label changes. Each gets a line in the example's test, or a class by Q13 b.
- `gels` nesting by `em` and the shared switch rule of `customs` are ideas, not tried in the components.
- Contrast in states the mocks do not show. AC-05 lists them; some palettes will need a darker variant of an accent for text, as `exposure` already has (`#FF5B14` for the switch, `#B83A00` for text).
- Bundle. Eight widgets with these looks carry more CSS than the D50 sketches. Measure with `npm run size`; no number is stated here.
- #55 is in review while this is planned. If its review changes markup of the six examples, the table of US8 is read again before the story starts.
- Unreleased behaviour labels (D54) and the old-id map are not touched; a restyle that hides the "next 3.0.x patch" note would break AC-17. The note is in the frame, not in the stage.

### 10. Not verified

- Anything in Firefox, WebKit, Windows, Android or Linux.
- The looks in the real components; the mocks are static HTML and CSS written against the element structure read from the sources.
- That no example test other than those named asserts a style value. A search for `toContain`/`toMatch` on rules and sources found `index.test.ts`, `setlist.test.ts` line 77, `typecase.test.ts` and `seedpacket.test.ts` line 81; the test files were not read in full.
- Whether a description in `content/messages.ts` or a guide sentence names an old look.
- The tag names `em.*` creates for nested zones, and whether a style in a parent shadow root may address them (not needed by the plan as written).
- Baseline status and dates of the CSS features named in section 4.
- The owner's constraints D61 and D62 are taken from the assignment for this document, not from a message of the owner read by the author.

### 11. Requirement coverage

| Requirement                                                 | Stories                                                        | Evidence                                                                                |
| ----------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| R13, AC-24 (pairs)                                          | US8, US4d, US4e                                                | The pairwise test over registry values; the matrix in `style-matrix.md`                 |
| R13, AC-25 (limits)                                         | US8, US4d, US4e                                                | The same test; four dark, one sharp, two monospace, no small uppercase monospace labels |
| R13, AC-26 (contrast, focus, 360 px, reduced motion, fonts) | US8 (AC-03 to AC-06), US4d (AC-05, AC-07), US4e (AC-03, AC-04) | Browser measurements and captures in each pull request                                  |
| R13, AC-27 (devices that must not return)                   | US8 (AC-07), US4d, US4e                                        | The source scan                                                                         |
| R09 (own job, own look)                                     | US4d, US4e                                                     | Registry test, host tests, taste gate against W1 to W8 of v2                            |
| R10 (examples worth playing with)                           | US8 (AC-01, AC-02), US4c                                       | Behaviour tests unchanged; taste gate against E1 to E12 of v2                           |
| R06 (source parity)                                         | US8 (AC-02), US4d, US4e                                        | Raw-import check; styles as a second file where needed                                  |
| R07 (keyboard, mobile)                                      | US8 (AC-04, AC-05), US4d, US4e                                 | Browser at 360 px, focus measurement                                                    |
| R02 (old addresses and ids)                                 | unchanged                                                      | The old-id map and host addresses are not touched                                       |
| R08 (repository contracts)                                  | all                                                            | The gate; no library change, no dependency, no network font or image                    |
