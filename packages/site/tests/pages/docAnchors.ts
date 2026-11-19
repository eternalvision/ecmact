/**
 * The emitted heading ids and demo ids of every documentation page, read from the site at baseline 8900e86, before
 * the redesign. Readers have bookmarked these addresses. Per locale and slug; headings in page order.
 */
export const baseline: Record<'en' | 'ru', Record<string, { ids: string[]; demos: string[] }>> = {
  en: {
    'getting-started': {
      ids: [
        'create-a-project',
        'add-it-to-an-existing-project',
        'your-first-elements',
        'what-you-get',
        'requirements',
        'stability',
      ],
      demos: [],
    },
    comparison: {
      ids: [
        'the-same-widget-in-four-libraries',
        'compared-with-vanjs',
        'compared-with-lit',
        'compared-with-solid',
        'when-to-pick-ecmact',
      ],
      demos: [],
    },
    components: {
      ids: [
        'children',
        'props',
        'attributes',
        'reactive-props',
        'events',
        'refs',
        'custom-tags',
        'components',
        'lists',
        'mounting',
      ],
      demos: ['todo'],
    },
    signals: {
      ids: ['the-api', 'signals-in-markup', 'rules', 'equality-for-derived-values'],
      demos: ['counter'],
    },
    styling: {
      ids: [
        'the-style-prop',
        'the-class-prop',
        'the-css-of-a-component',
        'shared-stylesheets',
        'custom-properties-cross-the-boundary',
        'tailwind-css',
        'light-dom',
      ],
      demos: [],
    },
    styled: {
      ids: [
        'what-a-template-can-contain',
        'where-the-styles-go',
        'attributes-extending-and-as',
        'animations',
        'themes',
        'what-is-different-from-styled-components',
      ],
      demos: ['styled'],
    },
    lifecycle: {
      ids: [
        'effects-and-resources-clean-up-themselves',
        'leaving-and-coming-back',
        'handling-errors',
        'warnings',
      ],
      demos: [],
    },
    context: {
      ids: ['creating-and-providing', 'reading', 'reactive-values'],
      demos: [],
    },
    forms: {
      ids: ['two-way-binding', 'live-values', 'fields-inside-a-component'],
      demos: ['form'],
    },
    routing: {
      ids: ['routes', 'the-outlet-links-and-navigation', 'nested-routes', 'guards'],
      demos: [],
    },
    state: {
      ids: ['the-store', 'persistence-and-devtools'],
      demos: ['store'],
    },
    http: {
      ids: ['calls', 'config', 'errors', 'interceptors', 'cancelling-timeouts-and-retries'],
      demos: ['http'],
    },
    data: {
      ids: ['from-the-http-client', 'from-any-async-function', 'the-resource'],
      demos: [],
    },
    widgets: {
      ids: ['the-contract', 'attributes', 'how-a-widget-behaves', 'building-the-script'],
      demos: [],
    },
    tooling: {
      ids: ['create-ecmact', 'what-the-generated-project-has', 'testing', 'build'],
      demos: [],
    },
    typescript: {
      ids: ['what-is-typed', 'your-own-functions', 'inferred-types'],
      demos: [],
    },
    security: {
      ids: ['safe-by-default', 'yours-to-handle'],
      demos: [],
    },
    limitations: {
      ids: [
        'where-it-fits',
        'when-it-is-not-the-right-tool',
        'design-limits',
        'limits-described-on-other-pages',
      ],
      demos: [],
    },
    api: {
      ids: [
        'components',
        'signals',
        'styling',
        'routing',
        'state',
        'data',
        'delivery',
        'exported-types',
      ],
      demos: [],
    },
  },
  ru: {
    'getting-started': {
      ids: ['section', 'section-2', 'section-3', 'section-4', 'section-5', 'section-6'],
      demos: [],
    },
    comparison: {
      ids: ['section', 'vanjs', 'lit', 'solid', 'ecmact'],
      demos: [],
    },
    components: {
      ids: [
        'section',
        'section-2',
        'section-3',
        'section-4',
        'section-5',
        'refs',
        'section-6',
        'section-7',
        'section-8',
        'section-9',
      ],
      demos: ['todo'],
    },
    signals: {
      ids: ['api', 'section', 'section-2', 'section-3'],
      demos: ['counter'],
    },
    styling: {
      ids: ['style', 'class', 'css', 'section', 'section-2', 'tailwind-css', 'light-dom'],
      demos: [],
    },
    styled: {
      ids: ['section', 'section-2', 'as', 'section-3', 'section-4', 'styled-components'],
      demos: ['styled'],
    },
    lifecycle: {
      ids: ['section', 'section-2', 'section-3', 'section-4'],
      demos: [],
    },
    context: {
      ids: ['section', 'section-2', 'section-3'],
      demos: [],
    },
    forms: {
      ids: ['section', 'section-2', 'section-3'],
      demos: ['form'],
    },
    routing: {
      ids: ['section', 'outlet', 'section-2', 'section-3'],
      demos: [],
    },
    state: {
      ids: ['section', 'devtools'],
      demos: ['store'],
    },
    http: {
      ids: ['section', 'section-2', 'section-3', 'section-4', 'section-5'],
      demos: ['http'],
    },
    data: {
      ids: ['http', 'section', 'section-2'],
      demos: [],
    },
    widgets: {
      ids: ['section', 'section-2', 'section-3', 'section-4'],
      demos: [],
    },
    tooling: {
      ids: ['create-ecmact', 'section', 'section-2', 'section-3'],
      demos: [],
    },
    typescript: {
      ids: ['section', 'section-2', 'section-3'],
      demos: [],
    },
    security: {
      ids: ['section', 'section-2'],
      demos: [],
    },
    limitations: {
      ids: ['section', 'section-2', 'section-3', 'section-4'],
      demos: [],
    },
    api: {
      ids: [
        'section',
        'section-2',
        'section-3',
        'section-4',
        'section-5',
        'section-6',
        'section-7',
        'section-8',
      ],
      demos: [],
    },
  },
};
