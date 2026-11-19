# ECMact documentation and identity

Version 1.3 · F1 · 1.2 accepted with the delivery plan, addendum 1.3 approved by the owner on 19 November 2026 · 19 November 2026

Assignment from the owner on 19 November 2026. Modernize the README and the documentation site, redesign the logo in black and white, and make examples and source code central to the experience. The next product initiative is a collection of ready-made components built on ECMact. Tracker issues follow an approved plan. [Design proposal](../sessions/19112026-DocsRedesign/index.html)

## 1. Purpose

A developer deciding whether to embed ECMact should be able to try an interaction, inspect the code behind it, start a project and find the relevant API. Someone already using ECMact should still be able to follow an existing link directly to a specific behavior.

## 2. Evidence and decisions

At the source baseline `8900e86`, the 1,984-line README begins its quick start at line 129, after use cases, comparisons and stability guidance. The homepage puts its install command near the top, followed by facts and feature cards before its first live examples. Its source and preview appear on separate tabs. The site already has 19 bilingual documentation pages, a registry of 12 running demos with source imported from their TypeScript files, and a gallery of widgets embedded in different host pages. [README](../../README.md) · [Homepage](../../packages/site/src/pages/home.ts) · [Documentation](../../packages/site/src/content/docs/index.ts) · [Demos](../../packages/site/src/demos/index.ts) · [Widgets](../../packages/site/src/pages/widgets.ts)

The owner chose a full redesign and a monochrome logo. Recoloring the current stylesheet alone would leave the reading order and examples untouched. The release of the 3.x patch follows the documentation work. The owner placed the reusable component library in a subsequent stage. Its distribution model, API, accessibility primitives and component list belong in its own specification.

## 3. Terms

A **runnable example** has an entry point, imports and any required markup or files. A reader can run it in the named environment. An **excerpt** illustrates a particular operation and links to a complete example. A **host** is the page into which a widget is embedded. Its own typography and colors can demonstrate how a widget behaves in another design.

## 4. Scope

The deliverables are a new root README, English and Russian site content, the homepage, article navigation, examples, widget gallery, missing-page view, code presentation, light and dark themes, and a monochrome symbol and wordmark. Brand applications include GitHub/npm, the site header and favicon. The existing site uses ECMact, Vite, typed content blocks and the project's translation structure. Its architecture supports the proposed work. The application template ships separate logo and favicon assets. Refreshing those assets is deferred to the CLI release decision. [Site styles](../../packages/site/src/styles/site.css) · [Starter](../../packages/create-ecmact/template/base/)

Publishing packages, implementing the component collection and extending the 3.x runtime are separate decisions. Published npm README and starter asset updates become visible through their respective releases.

## 5. Requirements and acceptance criteria

| Requirement                                            | Acceptance                                                                                                                                                                                                                                                                                            | How to verify                                                                                                                                                                                                                              |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R01. Make the README a working starting point.         | AC-01. The first installation command and a complete interactive example precede comparisons, benchmarks and API lists. The README identifies the entry file, expected result and where to continue for widgets or apps.                                                                              | Follow the instructions in a fresh starter. A reader viewing the rendered Markdown with images disabled can still install and reach the guide.                                                                                             |
| R02. Keep reference material discoverable.             | AC-02. Map each former README topic to its retained section or its site destination. Preserve existing GitHub fragment targets when moving material. Each of the 19 site topics has an EN and RU route with relevant links, headings and examples.                                                    | Compare against a baseline inventory of README and site anchors in both locales. Open old links directly under the deployed base path, reload, use browser Back and visit an unknown docs slug.                                            |
| R03. Establish a recognizable monochrome brand.        | AC-03. The logo has a one-color mark and readable wordmark. The mark is distinguishable at 16 px. The full lockup works on white, black and GitHub/npm README backgrounds. The header and favicon use the same geometry.                                                                              | Inspect both themes, favicon-size renderings, and the rendered README without a background. Verify legacy public asset URLs continue serving a readable image.                                                                             |
| R04. Lead with a real interaction.                     | AC-04. The homepage pairs a working ECMact interaction with its source and an installation path. A visitor can perform a meaningful action without a remote service, observe the result, and reach the complete implementation.                                                                       | Exercise the primary interaction with a keyboard and repeat with external API requests blocked. Compare the result with the public API used in the snippet.                                                                                |
| R05. Rewrite the documentation around developer tasks. | AC-05. Review every documentation page for its reader goal, examples and next step. Getting started leads from a generated project to a visible change. Guides explain an input, user action and observable result. Reference pages retain signatures, defaults, limitations and security boundaries. | Type-check the runnable examples against the relevant distributed package or starter. Compare EN/RU content, examples, captions and controls. A claim that depends on an unreleased patch identifies its version.                          |
| R06. Make code usable.                                 | AC-06. Each featured example distinguishes complete files from excerpts and identifies where to put them. The displayed full source comes from the example that runs or has an equivalence check. Copy returns usable text without line labels or shell prompts.                                      | Paste the featured examples into fresh projects. Test copy success and failure, long TypeScript lines and HTML with angle brackets. Visit existing demo IDs and run the widgets in their independent hosts.                                |
| R07. Support browser, keyboard and mobile reading.     | AC-07. At 360 px and 1280 px, in both languages and themes, a reader can find a topic, navigate article sections, inspect code and operate the example. Text and controls have visible contrast and keyboard focus. Long code scrolls within its panel.                                               | Inspect actual browser renderings, verify focus order and visible focus, text contrast of at least 4.5:1 for ordinary text, and a usable reading order at 200% zoom. Check reduced-motion and unavailable-network states where applicable. |
| R08. Preserve project contracts.                       | AC-08. Public 3.x behavior, workspace build, deployment base path and localized content checks remain compatible. Size or benchmark claims retain measurement context.                                                                                                                                | Run the repository gate on Node 22 and build all workspaces. Run the existing template smoke checks to verify the installation path. Check deployed-style deep links and the production build in a browser.                                |

## 6. Visual proposal

Use the [HTML proposal](../sessions/19112026-DocsRedesign/index.html) to evaluate type, the mark and the relation between controls, live result and code. Give the homepage one meaningful interaction that works on its own. A compact install command and a route into the guide sit alongside it. On a wide article page, topic navigation, a readable prose column and local section links support reference work. On narrow screens, the reading column takes precedence and navigation stays accessible.

For the examples gallery, group entries by a developer's task and make the result and corresponding source easy to compare. The widget gallery should retain contrasting host designs so readers can see which styles belong to the host. The monochrome mark can remain recognizable across them. Use grayscale type, surfaces and syntax highlighting. Weight, spacing and a visible focus outline convey structure and interaction. Color belongs to a demonstration when it explains behavior such as a themed host or a color input.

## 7. Content and interfaces

The current `DocPage` and `Block` types encode headings, prose, lists, code, running demos, callouts and tables. Keep content in this existing registry. Keep the EN/RU block order aligned and use stable heading targets through editorial renames. The demo registry already pairs a factory with source loaded using Vite's raw import. Preserve that connection when editing the examples. Extracts used on the homepage need a clear path to a runnable file that uses only public imports. [Types](../../packages/site/src/content/types.ts) · [Demo registry](../../packages/site/src/demos/index.ts) · [Routes](../../packages/site/src/app/router.ts)

## 8. Risks

Moving reference material can silently break inbound GitHub or Pages links. Capture the current anchors before rewriting. Live API demos can fail due to rate limits or network conditions. Use a local example for the first interaction and keep actionable status in network examples. A neutral theme can make code tokens, focus rings or translation controls disappear against one of the backgrounds. Evaluate both themes with realistic TypeScript and Russian text. The rendered visual result and final production asset sizes are not verified at F1.

## 9. Direction for planning

The owner said “продолжай” after the recommendation to use a monochrome identity, interface and code with support for the system theme. F2 uses the light-first composition in the design study and applies the dark palette when the system or the visitor chooses it. The blue and violet code sample remains a design-study alternative. See D35 in the [decision log](../decisions.md).

Component distribution and release tags remain decisions for their later stages.

## ECMact documentation and identity: addendum 1.3

Version 1.3 · F1 addendum · approved by the owner on 19 November 2026 · 19 November 2026

Appends to the [specification](2026-11-19-docs-redesign-spec.md), version 1.2. Assignment: four new owner requirements of 19 November 2026 (widgets, examples, starter, default language). Tracker: milestone [Documentation redesign](https://github.com/eternalvision/ecmact/milestone/2), issue [#47](https://github.com/eternalvision/ecmact/issues/47) and issues #53–#58. Materials: [concept sheet](../sessions/19112026-DocsRedesign/concepts.html) and the [design study](../sessions/19112026-DocsRedesign/index.html).

This text stays a draft until the owner writes "approved". Sections 1 to 9 below follow the numbering of the specification and say only what changes.

### 1. Purpose

The owner started the redesign because the old site showed no colour, no examples and no code worth looking at. Version 1.2 fixed the reading order and the identity. It kept the five widgets and the twelve demos as they were, and those are the ordinary set every library has: a counter, a to-do list, a weather card. A visitor should instead meet things they have not seen in another library's documentation, and each one should prove a part of the API.

### 2. Evidence and decisions

Checked in the repository at `8455668` plus the working tree of `feature/46-docs-navigation`:

- The gallery has five widgets (`price-calculator`, `weather-now`, `repo-card`, `poll-widget`, `countdown-timer`) in four hosts (`cafe`, `terminal`, `zine`, `kids`). All five take the same set of seven `--w-*` properties. Two of them call public APIs. [Widgets](../../packages/site/src/content/widgets.ts)
- The registry has twelve demos. Three call public APIs (`github`, `weather`, `posts`). Six ids are embedded in guide pages (`counter`, `todo`, `styled`, `store`, `http`, `form`) and two on the homepage (`counter`, `styled`). A demo id is a registry key; the gallery has no address per demo. [Demo registry](../../packages/site/src/demos/index.ts)
- No demo uses the router. The router supports history mode only, and the site's own router owns the history. [README, Routing](../../README.md#routing)
- `tags` creates elements with `document.createElement`, so it makes no SVG elements. [Element](../../src/core/element.ts)
- `createHttp` takes a `fetch` option, which the `http` demo already uses for a server that lives inside the example. [HTTP demo](../../packages/site/src/demos/http.ts)
- `defineWidget` documents `attributes`, `css` and `shadow`. It documents no `field` option, so a widget is not a form field. [README, Embedding as a widget](../../README.md#embedding-as-a-widget)
- The app template still has the blue palette, a glow and the hexagon logo image. `scripts/brand-images.mjs` writes no file of the template. The Pages workflow scaffolds both templates on every push to `main` that touches them and serves them at `/ecmact/starter/` and `/ecmact/widget/`. The script `price-widget.js` is named by the workflow, `scripts/check-template.mjs`, the README, the guide and the homepage. [Template](../../packages/create-ecmact/template/) · [Pages workflow](../../.github/workflows/pages.yml)
- The site is English until the visitor chooses otherwise, whatever the browser language is, and a test says so. The choice is kept in `localStorage` under `ecmact-site-locale`. Opening an address with `?lang=ru` writes the same stored choice, so one visit through such a link makes every later visit Russian. [i18n](../../packages/site/src/lib/i18n.ts) · [App](../../packages/site/src/app/app.ts)
- The fixes for keyed focus (#34) and disabled controls (#30, #31) are on `main`; the published library is 3.0.0. An example that shows them shows unreleased behaviour.

Decided by the owner on 19 November 2026, proposed for the decision log as D46 to D49:

| Decision                                                                                                                                               | Alternatives considered                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| D46. Every widget of the gallery is written again. The widgets differ from each other in what they do and in how they look.                            | Restyle the five current widgets. Add new widgets beside the old ones.      |
| D47. The examples are written again to be interactive and unusual. The counter, to-do and weather set goes.                                            | Keep the twelve and restyle the frame only. Add a few examples beside them. |
| D48. The starter is restyled to the site in this redesign. This replaces the deferral in section 4 of version 1.2 and in the plan's "Owner decisions". | Refresh the starter's brand assets with the CLI release (version 1.2).      |
| D49. English is the default language of the site.                                                                                                      | Follow the browser language. The existing code and test already reject it.  |

### 3. Terms

A **stage** is the area in which an example runs. It has its own palette and type and sits inside the monochrome frame of the site. A **successor** is the new widget or example that answers for an old tag or id. A **feed** is a static JSON file of the site that a widget reads from its own origin.

### 4. Scope

Added: the five widgets and their four hosts are replaced by the approved set; the twelve demos are replaced by the approved set; both variants of the app template and the widget template take the site's look; the language behaviour gets acceptance criteria.

Changed in "out of scope". The sentence "Refreshing those assets is deferred to the CLI release decision" no longer holds: the template changes in this redesign and shows on the Pages previews after a merge to `main`. What stays out:

- Publishing. The restyled template reaches `npm create ecmact` only with a `create-ecmact-v*` tag, which stays the owner's release decision.
- The 3.x runtime. No example may need a library change: no SVG support in `tags`, no hash mode in the router, no `field` option for widgets. An idea that needs one is redrawn or dropped.
- The ready-made component collection. The gallery widgets are demonstrations, not that collection.
- Third-party services. No widget and no example depends on another origin.

### 5. Requirements and acceptance criteria

| Requirement                                          | Acceptance                                                                                                                                                                                                                                                                                                                                                                                                                                                             | How to verify                                                                                                                                                                                            |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R09. Give every widget its own job and its own look. | AC-09. The gallery holds the approved set (question Q1). None of the five current widget sources remains. Each widget records a kind of job and a style direction, and no two widgets share either.                                                                                                                                                                                                                                                                    | A registry test checks the closed list and that kinds and styles are unique. Review compares every widget in a browser with its card in the concept sheet.                                               |
|                                                      | AC-10. Every widget runs in at least two hosts with different custom-property values, keeps its layout under the host's stylesheet, does its main interaction by keyboard and by pointer, and fires its documented event with the documented detail.                                                                                                                                                                                                                   | Widget tests for attributes, defaults and events. Host tests in the pattern of `tests/pages/widgets.test.ts`. Browser at 360 px and 1280 px.                                                             |
|                                                      | AC-11, error and edge. With requests to other origins blocked every widget renders and works. `feed-lamp` has a distinct, recoverable state for a slow answer, a missing file and a body that is not JSON, and keeps the last good reading. A missing or malformed attribute gives the documented default. A widget taken out of the page and put back starts clean and leaves no timer or request behind. Reduced motion stops animation that carries no information. | Tests with a replaced `fetch` and fake timers. Browser with the network blocked and with `prefers-reduced-motion`.                                                                                       |
|                                                      | AC-12. The four host addresses answer under the base path. Each former tag leads to its successor as question Q2 decides. The reference lists attributes, events and custom properties of every widget in English and Russian. The gallery bundle is measured with `npm run size` after the change, and a number that the site or the README shows says where it was measured.                                                                                         | Open the addresses in the built site. Translation tests. Run `npm run size`.                                                                                                                             |
| R10. Make the examples worth playing with.           | AC-13. The gallery holds the approved set (Q1), grouped by developer task. Each example has at least two controls that change what is seen and, where its API can fail, one control that leads to the failure. Each names its guide page.                                                                                                                                                                                                                              | Review against the concept sheet. One test per example drives the main interaction and the failure path.                                                                                                 |
|                                                      | AC-14. Every area of the coverage matrix is used by at least one example or widget.                                                                                                                                                                                                                                                                                                                                                                                    | A test over the imports of the example and widget sources fails when an area loses its last user.                                                                                                        |
|                                                      | AC-15. No example and no widget requests another origin. The first interaction works with the network unplugged.                                                                                                                                                                                                                                                                                                                                                       | A test scans the sources for absolute addresses outside links to documentation. Browser with requests blocked.                                                                                           |
|                                                      | AC-16, error and edge. Each of the twelve old ids still resolves to an example, so the guides and the homepage keep rendering one. An unknown id renders nothing and does not throw. With storage unavailable `fieldbook` works for the visit and says the page will not be kept. A late answer never replaces a newer one.                                                                                                                                            | A registry test over the twelve ids. A test with a storage that throws. A test with answers out of order.                                                                                                |
|                                                      | AC-17. The source shown is the source that runs. Every file of an example is shown under its name and copies without labels. Titles, descriptions, captions and the controls of the frame exist in English and Russian. The example works by keyboard at 360 px in both themes of the frame. Behaviour that depends on an unreleased patch names its version.                                                                                                          | The raw-import check of the registry, translation tests, copy tests, browser.                                                                                                                            |
| R11. Restyle the starter to the site.                | AC-18. The first screen of the app template, plain and Tailwind, uses the ink and paper of the site in light and dark by system preference and the mark from the brand geometry. It requests no font and no image from the network.                                                                                                                                                                                                                                    | Scaffold into a temporary directory and compare with the starter mock at 360 px and 1280 px in both schemes. A test compares the mark's path data in the template with `packages/site/src/lib/brand.ts`. |
|                                                      | AC-19. A generated project of each of the three variants passes its own `npm run check` and `npm run build`. The scaffolder's tests and both template READMEs describe the files that are generated.                                                                                                                                                                                                                                                                   | `npm run build:all && npm run test:template`, the repository gate.                                                                                                                                       |
|                                                      | AC-20, error and edge. The starter's `index.html` still matches what the homepage shows of it. Text keeps 4.5:1 in both schemes and focus is visible. The widget template still writes `dist/widget/price-widget.js` (question Q6), and `/ecmact/starter/`, `/ecmact/widget/`, `/ecmact/widget/embed.html` and `/ecmact/widget/price-widget.js` answer after the Pages build.                                                                                          | `packages/site/tests/demos/estimate.test.ts`. The steps of the Pages workflow run locally, then the deployed addresses after the merge.                                                                  |
| R12. Speak English by default.                       | AC-21. With empty storage and no `lang` parameter the site is English whatever the browser language is, and the document says `lang="en"`.                                                                                                                                                                                                                                                                                                                             | The existing test in `tests/lib/i18n.test.ts`. Browser with a fresh profile and a `ru-RU` locale.                                                                                                        |
|                                                      | AC-22. A choice made with the language control survives a reload. `?lang=en` shows English to a visitor whose stored choice is Russian. `?lang=ru` shows Russian and keeps the hash.                                                                                                                                                                                                                                                                                   | `tests/lib/i18n.test.ts`, `tests/app/app.test.ts`.                                                                                                                                                       |
|                                                      | AC-23, error and edge. An unknown or empty `lang` is ignored. With a storage that throws the site is English and the control still works for the visit. After one visit through `?lang=ru`, a new visit to an address without the parameter is English unless the visitor used the control (this last sentence holds only if question Q7 is decided as recommended).                                                                                                   | New tests beside the two above. Browser: open the link, close the tab, open the plain address.                                                                                                           |

R02, R06, R07 and R08 of version 1.2 keep applying to all of the above: old addresses, source parity, keyboard and mobile reading, and the repository contracts.

### 6. Visual proposal

The [concept sheet](../sessions/19112026-DocsRedesign/concepts.html) shows eight widget concepts, twelve example concepts, the coverage matrix, the map of old ids and a mock of the restyled starter in both themes.

Section 6 of version 1.2 says colour belongs to a demonstration when it explains behaviour. The addendum reads it this way, subject to question Q4: the chrome of the site stays grayscale (header, navigation, frame, tabs, code). A host page and a stage are demonstrations as a whole, so each may carry its own palette and type. The contrast between the quiet frame and the loud content is the point.

Drawings inside widgets and examples are made with CSS, or with a fixed SVG string through the trusted `html` prop.

### 7. Content and interfaces

All changes are inside the site and the template. Nothing in the library's public API changes and no dependency is added.

- The demo registry keeps the pairing of a running factory with its raw source. An entry gains the old ids it answers for, its task group and a list of named files when it has more than one. `findDemo` resolves an old id to its successor.
- The widget registry gains a kind, a style and the former tag of each widget. The set of custom properties is per widget; the reference documents each.
- Feeds for `feed-lamp` are static files under the hosts folder of the site.
- The estimate example of the homepage stays outside the registry, as D42 decided.
- The language is still one store. If Q7 is decided as recommended, the address parameter is held apart from the stored choice.

### 8. Risks

- Size. Eight styled widgets in one bundle weigh more than five plain ones. Measure with `npm run size`; do not state a number before measuring.
- Source length. A richly styled example has long CSS. If the logic drowns in it, the example fails R06. Showing styles as a second named file keeps the logic readable.
- Work. Twenty new pieces with full test coverage in three engines is the largest part of the redesign. The plan splits it.
- Taste. A style sketch can read differently once built. Each gallery story shows the owner a browser capture of every piece before it merges.
- Unreleased behaviour. `setlist` shows the keyed-focus fix and `customs` the disabled-control rule; both are on `main` and not in 3.0.0. They are labelled with the target version.
- Approximations. The moon phase, the bake schedule and the prices are simple models. Each is labelled as approximate or sample inside the widget's documentation.
- The router example cannot run like the others (question Q3).

Not verified at this stage: the rendered result of the real widgets and examples in the three engines; any bundle size; whether the site keeps working when `localStorage` throws on write; the order in which the site's router would match `/examples` and a nested `/examples/atlas`; how `history.pushState` behaves inside an embedded frame under the Pages 404 fallback; whether the owner's impression of a Russian default came from a stored choice in his own browser.

### 9. To decide

Each question is the owner's. The recommendation is first.

**Q1. How many widgets and examples.**

- a. Eight widgets and twelve examples, as in the concept sheet. Recommended: every style direction and every API area gets a place, and each old id has a successor.
- b. Six widgets and ten examples: drop `clue-box` and `fret-map`, merge `gels` into another example. Less work, thinner coverage of lists and context.
- c. Five widgets, one per old tag, and twelve examples. The smallest widget bundle, and the least variety where the owner asked for the most.

**Q2. What happens to the five old widget tags.**

- a. No old tag stays in the bundle. The four host addresses stay, and the reference keeps an anchor for every old tag that lands on its successor. Recommended: nothing published tells anyone to load the gallery bundle (the embed snippet uses `example.com`), and a tag that renders a different widget than its name would mislead.
- b. Keep `price-calculator` and `countdown-timer` as second names of `print-quote` and `proof-clock`, whose attributes and events match. The other three get the anchor only.
- c. Keep all five tags as second names, with defaults where attributes differ. The most compatible and the most code to carry and test.

**Q3. How the router example runs.** History mode is the only mode and the site already owns the history.

- a. `atlas` is a real branch of the site's own routes at `/examples/atlas`, with nested routes, a guard and a lazy view; the gallery card links to it and shows its source. Recommended: it is deep-linkable, reload and Back work through the existing fallback, and it is honest about how the router is used.
- b. `atlas` runs in an embedded page of its own. Isolated from the site, but its history joins the tab's history and a reload inside it is not verified.
- c. No router example. The routing guide keeps its code blocks, and the gallery says that the site itself is the example.

**Q4. How far a stage may leave the monochrome.**

- a. Every example has its own stage look inside a grayscale frame, as in the concept sheet. Recommended: it answers the complaint that started the redesign and keeps the identity in the chrome.
- b. Examples stay grayscale, with colour only where it explains behaviour, as version 1.2 says. Widgets alone get their own looks.
- c. Own looks for the examples shown on the homepage and at the top of each group, grayscale for the rest.

**Q5. Widgets and the network.**

- a. No widget calls another origin. `feed-lamp` reads feeds from the site's own files and shows every failure state. Recommended: it demonstrates the HTTP client without depending on a service that can rate-limit the gallery.
- b. Keep one widget on a public API, with a bundled answer shown when the API fails.
- c. No widget uses the HTTP client; only the examples do.

**Q6. The widget template's `<price-widget>`.**

- a. Keep its name, attributes, event and script name; change only its look to the site's tokens. Recommended: the README, the guide, the homepage, the Pages workflow, `scripts/check-template.mjs` and a public script address all name it.
- b. Replace it with one of the new widgets and keep publishing `price-widget.js` for pages that embed it.
- c. Leave the widget template as it is and restyle only the app template.

**Q7. `?lang=` and the stored choice.**

- a. The address parameter applies to the tab session and never overwrites the stored choice; only the language control stores. Recommended: a link somebody else made should not change a visitor's default, and English stays the default for everyone who did not choose.
- b. Keep today's behaviour: the parameter is stored like a click on the control.
- c. The parameter applies to one page load only. The simplest rule; a reload after navigating falls back to the stored choice.

**Q8. What the starter shows.**

- a. Keep the counter component, its test and the file list; change the look. Recommended: the homepage tells the reader to paste the estimate example into a fresh starter, which only makes sense if the starter does not contain it; the scaffolder tests, the Tailwind variant and two READMEs name these files.
- b. Replace the counter with the homepage estimate, so the README, the homepage and the starter show the same code.
- c. Give the starter a small unusual example of its own.

**Q9. How finely the work is cut.**

- a. Examples in two stories, widgets in two stories, guides in one. Recommended: each pull request can be reviewed in one sitting and leaves a working site.
- b. One story for all examples, one for all widgets, one for the guides. Fewer issues, three very large pull requests.

**Q10. Russian inside a stage.** Today the frame of a demo is translated and the words inside it are English, because the source shown is the source that runs.

- a. Keep that rule for the new examples and widgets: titles, descriptions, captions and frame controls in both languages, the text inside a stage in English. Recommended: translated strings would either leave the shown source or fill it with lookups.
- b. Translate the text inside stages through an argument of each example.
- c. Translate only the widgets, through attributes set by the Russian host text.

Knowingly postponed: the `create-ecmact` tag that publishes the restyled template, and the number shown for the gallery bundle until it is measured.
