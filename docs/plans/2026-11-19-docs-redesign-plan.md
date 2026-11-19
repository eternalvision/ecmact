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
