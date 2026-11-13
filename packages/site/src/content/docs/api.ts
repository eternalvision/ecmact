import { api } from '@site/content/api';
import { h2, p, table } from '@site/content/builders';
import type { Block, DocPage } from '@site/content/types';

/**
 * Builds the blocks of the reference: a heading and a table per area.
 *
 * @returns The blocks.
 */
const blocks = (): Block[] =>
  Object.entries(api).flatMap(([area, entries]) => [
    h2(area),
    table(
      ['Export', 'What it is', 'Read'],
      ...entries.map((entry) => [
        `\`${entry.name}\``,
        entry.summary,
        `[docs](/docs/${entry.page})`,
      ]),
    ),
  ]);

/** The exported types, by area. */
const types: [string, string, string][] = [
  [
    'Elements',
    '`Props`, `Child`, `ClassValue`, `Styles`, `Reactive`, `Getter`, `Factory`, `Tags`, `TagName`, `AttributeMap`, `GlobalAttributes`, `EventHandlerOptions`, `EachOptions`',
    'components',
  ],
  ['Components', '`Component`, `ComponentProps`', 'components'],
  [
    'Configuration and errors',
    '`Config`, `StyleSource`, `ErrorHandler`, `ErrorInfo`, `ErrorPhase`',
    'lifecycle',
  ],
  ['Context', '`Context`, `Provision`', 'context'],
  ['Signals', '`Signal`, `ReadonlySignal`', 'signals'],
  [
    'Styled components',
    '`Styled`, `StyledTag`, `StyledComponent`, `StyledProps`, `StyleProps`, `Attrs`, `CssFragment`, `Keyframes`, `Interpolation`, `Theme`, `ThemeProviderProps`',
    'styled',
  ],
  [
    'Routing',
    '`Router`, `RouterOptions`, `Route`, `RouteContext`, `RouteMatch`, `RouterLocation`, `Guard`, `GuardResult`, `NavigateOptions`, `LinkProps`, `OutletProps`',
    'routing',
  ],
  [
    'State',
    '`Store`, `StoreOptions`, `SetState`, `Listener`, `WatchOptions`, `PersistOptions`, `PersistApi`, `PersistStorage`, `StateStorage`, `StorageValue`, `JsonStorageOptions`, `DevtoolsOptions`',
    'state',
  ],
  ['Data', '`Resource`, `ResourceContext`, `ResourceOptions`', 'data'],
  [
    'HTTP',
    '`HttpInstance`, `HttpPromise`, `HttpResourceConfig`, `HttpRequestConfig`, `HttpResponse`, `HttpMethod`, `HttpHeaders`, `HeaderMap`, `HeaderValue`, `HttpErrorCode`, `HttpErrorLike`, `ResponseType`, `RetryOptions`, `ProgressEvent`, `ParamsSerializerOptions`, `RequestTransform`, `ResponseTransform`',
    'http',
  ],
  ['Widgets', '`WidgetContext`, `WidgetOptions`', 'widgets'],
];

/** The list of everything the package exports. */
export const page: DocPage = {
  slug: 'api',
  title: 'API reference',
  summary: 'Every export of the package in one place, with a link to where it is explained.',
  group: 'Reference',
  blocks: [
    p(
      'Everything is imported from `ecmact`. The package is ES and CommonJS, has no runtime dependencies and is tree-shakeable, so you pay only for what you import.',
    ),
    ...blocks(),
    h2('Exported types'),
    p('Import them with `import type { ... } from "ecmact"`.'),
    table(
      ['Area', 'Types', 'Read'],
      ...types.map(([area, names, slug]) => [area, names, `[docs](/docs/${slug})`]),
    ),
  ],
};
