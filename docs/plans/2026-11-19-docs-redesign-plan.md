# ECMact documentation and identity delivery plan

Version 1.1 · F2 approved by the owner · F3 issues created · 19 November 2026

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
