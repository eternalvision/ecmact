import type { DemoGroup } from '@site/demos/index';
import { currentLocale, type Locale } from '@site/lib/i18n';

/** Every piece of text of the interface that is not documentation: one set per language. */
export interface Messages {
  /** The links of the header. */
  nav: {
    docs: string;
    examples: string;
    widgets: string;
    starter: string;
    menu: string;
    close: string;
    label: string;
  };
  /** The buttons of the header. */
  chrome: {
    home: string;
    theme: string;
    themeAuto: string;
    themeLight: string;
    themeDark: string;
    language: string;
    languageName: string;
  };
  /** The footer. */
  footer: {
    tagline: string;
    selfMade: string;
    source: string;
    learn: string;
    build: string;
    project: string;
    gettingStarted: string;
    components: string;
    signals: string;
    examples: string;
    routing: string;
    state: string;
    http: string;
    widgets: string;
    issues: string;
    security: string;
  };
  /** The documentation pages. */
  docs: {
    navLabel: string;
    onThisPage: string;
    pagerLabel: string;
    edit: string;
    skipArticle: string;
    skipToc: string;
    table: string;
    topics: string;
    groups: Record<'Start' | 'Core' | 'Application' | 'Delivery' | 'Reference', string>;
    callouts: Record<'note' | 'tip' | 'warning', string>;
  };
  /** The code blocks and the demo frames. */
  code: {
    copy: string;
    copied: string;
    failed: string;
    copyLabel: string;
    run: string;
    stage: string;
    guide: string;
    open: string;
  };
  /** The gallery: its title, its lead and the tasks it is grouped by. */
  examples: {
    title: string;
    lead: string;
    groups: Record<DemoGroup, { title: string; lead: string }>;
  };
  /** The page of the example that runs on its own address, the atlas. */
  atlas: { title: string; lead: string; back: string; source: string };
  /** The page for an unknown address. */
  notFound: { title: string; lead: string; home: string; docs: string };
  /** The widget gallery. */
  widgets: {
    title: string;
    lead: string;
    openFull: string;
    hosts: Record<string, { title: string; text: string }>;
    embedTitle: string;
    embedCaption: string;
    embedLead: string;
    referenceTitle: string;
    referenceLead: string;
    /** The note under the title of a widget that replaced one of the first gallery; `{tag}` is the old tag. */
    former: string;
    columns: {
      kind: string;
      name: string;
      default: string;
      description: string;
    };
    /** The words for the three kinds of row of a reference table. */
    kinds: { attribute: string; event: string; property: string };
    /** What the table shows for an attribute whose default is empty. */
    empty: string;
    /** What each widget is, by tag. */
    descriptions: Record<string, string>;
    /** What each attribute does, by `tag.attribute`. */
    attributes: Record<string, string>;
    /** What each event carries, by `tag.event`. */
    events: Record<string, string>;
    /** What each custom property does in each widget, by `tag.--w-name`. */
    properties: Record<string, string>;
    themeTitle: string;
    themeLead: string;
  };
  /** The titles of the demos, by id. */
  demos: Record<string, { title: string; description: string; hint?: string; note?: string }>;
  /** The home page. */
  home: {
    heroTitle: string;
    lead: string;
    start: string;
    live: string;
    widgetGuide: string;
    exampleLabel: string;
    exampleResult: string;
    exampleSample: string;
    starterTitle: string;
    starterNote: string;
    installName: string;
    flowLabel: string;
    flow: [string, string][];
    badgesLabel: string;
    factsLabel: string;
    facts: [string, string][];
    featuresTitle: string;
    featuresLead: string;
    liveTitle: string;
    liveLead: string;
    embedTitle: string;
    embedText: string;
    embedTicks: string[];
    embedGallery: string;
    embedForeign: string;
    embedGuide: string;
    wholeTitle: string;
    wholeLead: string;
    usesTitle: string;
    closingTitle: string;
    guide: string;
    tryStarter: string;
  };
  /** The title and the description of the pages that are not documentation. */
  meta: {
    tagline: string;
    summary: string;
    examplesTitle: string;
    examplesDescription: string;
    atlasTitle: string;
    atlasDescription: string;
    widgetsTitle: string;
    widgetsDescription: string;
    notFound: string;
    docsSuffix: string;
  };
}

/** The English texts. */
const en: Messages = {
  nav: {
    docs: 'Docs',
    examples: 'Examples',
    widgets: 'Widgets',
    starter: 'Starter',
    menu: 'Menu',
    close: 'Close',
    label: 'Main',
  },
  chrome: {
    home: 'ECMact, home',
    theme: 'Change the color theme',
    themeAuto: 'Auto',
    themeLight: 'Light',
    themeDark: 'Dark',
    language: 'Switch the language',
    languageName: 'RU',
  },
  footer: {
    tagline: 'Widgets for any website, in plain TypeScript. MIT licensed.',
    selfMade: 'This site is written with ECMact itself. ',
    source: 'Read its source.',
    learn: 'Learn',
    build: 'Build',
    project: 'Project',
    gettingStarted: 'Getting started',
    components: 'Components',
    signals: 'Signals',
    examples: 'Examples',
    routing: 'Routing',
    state: 'State management',
    http: 'HTTP client',
    widgets: 'Widgets',
    issues: 'Issues',
    security: 'Security',
  },
  docs: {
    navLabel: 'Documentation',
    onThisPage: 'On this page',
    pagerLabel: 'Previous and next page',
    edit: 'Edit this page on GitHub',
    skipArticle: 'Skip to the article',
    skipToc: 'Skip to the sections of this page',
    table: 'Table',
    topics: 'Topics',
    groups: {
      Start: 'Start',
      Core: 'Core',
      Application: 'Application',
      Delivery: 'Delivery',
      Reference: 'Reference',
    },
    callouts: { note: 'Note', tip: 'Tip', warning: 'Warning' },
  },
  code: {
    copy: 'Copy',
    copied: 'Copied',
    failed: 'Failed',
    copyLabel: 'Copy to the clipboard',
    run: 'Run',
    stage: 'Live example',
    guide: 'Guide',
    open: 'Runs on its own page',
  },
  examples: {
    title: 'Examples',
    lead: 'Every example runs on its own stage, and none of them needs a network. Open the tab of a file beside Run to read the exact source that runs, and copy it.',
    groups: {
      state: {
        title: 'State and signals',
        lead: 'Values that change, and the texts and rows that follow them.',
      },
      interface: {
        title: 'Interface',
        lead: 'Styling, forms and context: what a visitor sees and touches.',
      },
      requests: {
        title: 'Requests and data',
        lead: 'Calls to a server that can be slow, wrong or gone. Every server here is a function inside the example.',
      },
      lifecycle: {
        title: 'Lifecycle, widgets and routes',
        lead: 'What happens when a part appears, changes and leaves, and how a page finds its way.',
      },
    },
  },
  atlas: {
    title: 'Pocket atlas',
    lead: 'This example is a branch of the routes of this site, so it has an address of its own. Walk the island, reload the page and use Back.',
    back: 'Back to the examples',
    source: 'The source of this example',
  },
  notFound: {
    title: 'Page not found',
    lead: 'There is nothing at this address.',
    home: 'Back to the home page',
    docs: 'Read the docs',
  },
  widgets: {
    title: 'Widgets',
    lead: 'Five widgets, each with its own job and its own look, embedded into four unrelated sites. Every page below is a separate document with its own stylesheet, and every stylesheet is hostile: it restyles buttons, inputs and text globally. The widgets keep their own markup and take only what the page hands them as CSS custom properties.',
    openFull: 'Open the page on its own',
    hosts: {
      cafe: {
        title: 'A bakery: sage green and white',
        text: 'The sourdough schedule, a row counter for the knitting circle and a moon dial for the baking calendar, recoloured to sage and terracotta. The page restyles every button and input.',
      },
      terminal: {
        title: 'An ops dashboard: dark slate and indigo',
        text: 'A status lamp that reads the kiln feed, and a moon dial, on a dashboard that sets its own button, input and span styles.',
      },
      zine: {
        title: 'A magazine: black type and one red',
        text: 'A print quote and the bread schedule in a magazine that forces its own type on every paragraph and span with !important.',
      },
      kids: {
        title: "A children's museum: sky blue and sunshine",
        text: 'A row counter, a status lamp and a print quote on a page of big rounded shapes that paints every span and div with !important.',
      },
    },
    embedTitle: 'What every host page does',
    embedCaption: 'any page',
    embedLead: 'The same two lines, whatever the page looks like:',
    referenceTitle: 'The five widgets',
    referenceLead:
      'Attributes configure a widget, events carry results out, custom properties dress it. Each widget lists its own; a widget that replaced one of the first gallery keeps the anchor of the old tag.',
    former: 'Replaces <{tag}>, a widget of the first gallery.',
    columns: {
      kind: 'Kind',
      name: 'Name',
      default: 'Default',
      description: 'What it does',
    },
    kinds: { attribute: 'attribute', event: 'event', property: 'custom property' },
    empty: 'empty',
    descriptions: {
      'print-quote':
        'A print-run quote: price breaks as radio cards, inks, paper and a quote button.',
      'moon-dial':
        'The phase of the moon on a day, with a ring of the 29 days of the month and buttons to move.',
      'proof-clock':
        'The schedule of a sourdough loaf, worked back from the moment it comes out, with a slider for the kitchen.',
      'row-counter':
        'One big round button that counts the rows of a knitting pattern and remembers them.',
      'feed-lamp':
        'A lamp that shows the state of a JSON feed, with every failure in its own words.',
    },
    attributes: {
      'print-quote.currency':
        'The ISO 4217 code of the money. An empty value counts as the default; a code the browser does not know is shown as typed.',
      'print-quote.base':
        'The price of a copy at the break of 100, not a price per seat per month as in `price-calculator`, which this widget replaced. An empty or malformed value counts as the default.',
      'print-quote.heading':
        'The title of the ticket. It is not `title`, which would show a tooltip over the whole widget.',
      'moon-dial.date': 'The day to start from, as `2026-11-20`. Today when missing or malformed.',
      'moon-dial.hemisphere':
        '`north`, or `south` to mirror the moon. Anything else counts as `north`.',
      'proof-clock.to':
        'When the loaf comes out: `2027-01-01`, `2027-01-01T18:00:00` or a moment with an offset. Ten hours from now when missing or malformed; a moment in the past shows the loaf as out.',
      'proof-clock.label': 'The title above the clock.',
      'row-counter.pattern':
        'The name of the pattern. The count is kept in the browser under it, so a reload goes on from it.',
      'row-counter.repeat':
        'How many rows make a repeat, up to 24. `0`, a negative or a malformed value shows no repeat.',
      'feed-lamp.src':
        'The address of the feed, which decides what is shown. `#lag=1500` at the end waits that many milliseconds before asking, to show a slow answer on a static file.',
      'feed-lamp.feeds':
        'Sample feeds as tabs, `ok=a.json, missing=b.json`. The first is shown when `src` is empty; a change of `src` takes the tab off.',
      'feed-lamp.retries':
        'How many more attempts a network failure, a timeout or a 5xx status gets, at most 5. A malformed value counts as the default.',
      'feed-lamp.slow':
        'Milliseconds until the lamp says the answer is slow. A malformed value counts as the default.',
      'feed-lamp.timeout':
        'Milliseconds until an attempt is given up. A malformed value counts as the default.',
    },
    events: {
      'print-quote.quote':
        '`{ copies, inks, stock, perCopy, total, currency }`, when the visitor asks for the quote; it replaces the detail `{ seats, yearly, total, currency }` of `price-calculator`.',
      'moon-dial.change': '`{ date, day, phase }`, when the visitor moves to another day.',
      'proof-clock.done':
        'When the loaf is out. Again if `to` moves to a later moment and that passes too.',
      'row-counter.row': '`{ pattern, count }`, when the count changes.',
      'feed-lamp.loaded': '`{ src, title }`, when a feed has been read.',
    },
    properties: {
      'print-quote.--w-bg': 'The colour of the ticket.',
      'print-quote.--w-fg': 'The text colour, and the colour of the price-break cards.',
      'print-quote.--w-accent': 'The chosen price break and the button.',
      'print-quote.--w-on-accent': 'The text on the chosen card and on the button.',
      'print-quote.--w-font': 'The font family of the text.',
      'print-quote.--w-display': 'The font family of the price and the numbers on the cards.',
      'print-quote.--w-radius': 'The roundness of the ticket.',
      'moon-dial.--w-bg': 'The base colour of the night sky.',
      'moon-dial.--w-fg': 'The text colour, the ticks and the ring.',
      'moon-dial.--w-accent': 'The handle, the elapsed part of the ring and the Today button.',
      'moon-dial.--w-on-accent': 'The text of the Today button.',
      'moon-dial.--w-font': 'The font family.',
      'proof-clock.--w-bg': 'The colour of the card.',
      'proof-clock.--w-fg': 'The text colour, the finished stages and the slider handle.',
      'proof-clock.--w-accent': 'The big shape, the stage that is running and the slider fill.',
      'proof-clock.--w-on-accent': 'The text on the big shape and on the stages.',
      'proof-clock.--w-accent-text':
        'The temperature, which sits on the card: a darker form of the accent.',
      'proof-clock.--w-font': 'The font family.',
      'row-counter.--w-bg': 'The colour of the field under the knit pattern.',
      'row-counter.--w-fg': 'The text colour and the lip of the buttons.',
      'row-counter.--w-accent': 'The dashed ring and the dots of the repeat.',
      'row-counter.--w-font': 'The font family.',
      'feed-lamp.--w-bg': 'The colour of the plate.',
      'feed-lamp.--w-fg':
        'The text colour. The lamp keeps its own colours: green, amber, red and magenta.',
      'feed-lamp.--w-font': 'The font family.',
      'feed-lamp.--w-radius': 'The roundness of the plate.',
    },
    themeTitle: 'Custom properties',
    themeLead:
      "Set them on the widget element or on any ancestor. A widget reads them with its own defaults, so setting none gives its original look. A colour that makes text hard to read is the page's choice: the widget keeps 4.5:1 only with its own colours or with values that do.",
  },
  demos: {
    exposure: {
      title: 'Exposure triangle',
      description:
        'Aperture, shutter and ISO are three signals; the exposure value is computed from them.',
      hint: 'try the keys',
    },
    setlist: {
      title: 'Setlist for tonight',
      description: "A band's running order: reorder the songs and keep an eye on the curfew.",
      hint: 'move a song',
      note: 'A moved row keeps its focus from 3.0.1 (#34). In 3.0.0 the focus is lost.',
    },
    fieldbook: {
      title: 'Field notebook',
      description: "A bird-watcher's tally that is still there after a reload.",
      hint: 'add a sighting, then reload',
    },
    typecase: {
      title: 'Wood-type poster',
      description: 'Set a headline, choose the ink and the stock, pull a proof.',
      hint: 'try the inks',
    },
    customs: {
      title: 'Customs declaration',
      description: 'Shadow DOM fields that a native form validates, submits and resets.',
      hint: 'leave a field wrong',
      note: 'A field whose own input is disabled, like the arrival date while in transit, is left out of FormData from 3.0.1 (#31). In 3.0.0 it is still sent.',
    },
    gels: {
      title: 'Lighting plot',
      description: 'Nested zones of a stage, each able to put a gel in front of its lamps.',
      hint: 'cycle the gels',
    },
    switchboard: {
      title: 'Telephone exchange',
      description: 'Four lines, four fates of a request: answered, cancelled, retried, refused.',
      hint: 'plug into a line',
    },
    catalog: {
      title: 'Library card catalogue',
      description:
        'Search the drawer, borrow a book, and meet a desk that closes and a rate limit.',
      hint: 'type, borrow, close the desk',
    },
    departures: {
      title: 'Ferry departures',
      description:
        'A board that follows the chosen harbour and drops the answer it no longer needs.',
      hint: 'switch harbours quickly',
    },
    darkroom: {
      title: 'Darkroom trays',
      description:
        'A print goes through developer, stop bath and fixer; every hook leaves a line in the log.',
      hint: 'move the print',
    },
    seedpacket: {
      title: 'Seed packet',
      description:
        'A custom element that a page configures with attributes and hears through an event.',
      hint: 'edit the attributes',
    },
    atlas: {
      title: 'Pocket atlas',
      description: 'An island with a page per place: nested routes, a guard and a lazy view.',
      hint: 'a preview',
    },
  },
  home: {
    heroTitle: 'Reactive UI on the DOM.',
    lead: 'Build a page or embed a widget with typed elements, signals and Web Components.',
    start: 'Get started',
    live: 'See live examples',
    widgetGuide: 'Build a widget',
    exampleLabel: 'A runnable ECMact example',
    exampleResult: 'Result',
    exampleSample: 'Sample data: an illustrative $49 per hour.',
    starterTitle: 'Run it in a starter',
    starterNote:
      "Paste the code into src/main.ts. The starter's index.html already has the mount target and loads that file:",
    installName: 'install command',
    flowLabel: 'How ECMact fits together',
    flow: [
      ['Build an element', '`tags` creates a real DOM node.'],
      ['Give it state', 'A signal updates readers when its value changes.'],
      ['Embed the result', 'Package a widget as a custom element for another page.'],
    ],
    badgesLabel: 'Project status',
    factsLabel: 'Facts',
    facts: [
      ['0', 'runtime dependencies'],
      ['100%', 'test coverage, every line'],
      ['Shadow DOM', 'isolation for components and widgets'],
      ['Typed', 'props, events and attributes per tag'],
    ],
    featuresTitle: 'Everything an interface needs, nothing it does not',
    featuresLead:
      'One package covers the pieces that usually come from five. Each one is small, typed and tested.',
    liveTitle: 'See it run',
    liveLead: 'These are real components, not screenshots. Press the buttons, then read the code.',
    embedTitle: 'Built to be embedded',
    embedText:
      'Most interfaces live in a page you control. ECMact is made for the ones that do not: a calculator on a partner site, a form in a CMS, a panel in a browser extension.',
    embedTicks: [
      'One IIFE script, no framework needed on the host page',
      'Shadow DOM keeps your styles and the page apart',
      'Settings come in as attributes, results leave as DOM events',
      'Themed from outside with CSS custom properties',
    ],
    embedGallery: 'Open the widget gallery',
    embedForeign: 'See it on a foreign page',
    embedGuide: 'Read the guide',
    wholeTitle: 'A whole app, one import',
    wholeLead:
      'A router, a store and an HTTP client, all from ecmact, all working with the same signals.',
    usesTitle: 'What people build with it',
    closingTitle: 'Start in a minute',
    guide: 'Read the guide',
    tryStarter: 'Try the starter',
  },
  meta: {
    tagline: 'Widgets for any website, in plain TypeScript',
    summary:
      'ECMact builds embeddable widgets and reactive interfaces in plain TypeScript: isolated styles, typed attributes and one script tag, with signals, a store, an HTTP client and a router built in. No dependencies, no compiler.',
    examplesTitle: 'Examples',
    examplesDescription:
      'Live ECMact demos with their source: signals, stores, styled components, an HTTP client and forms.',
    atlasTitle: 'Pocket atlas',
    atlasDescription:
      'An ECMact example that is a branch of the routes of this site: nested routes, a guard, a lazy view and a query.',
    widgetsTitle: 'Widgets',
    widgetsDescription:
      'The same ECMact widgets embedded into four unrelated sites, each with its own hostile CSS.',
    notFound: 'Not found',
    docsSuffix: 'docs',
  },
};

/** The Russian texts. */
const ru: Messages = {
  nav: {
    docs: 'Документация',
    examples: 'Примеры',
    widgets: 'Виджеты',
    starter: 'Стартер',
    menu: 'Меню',
    close: 'Закрыть',
    label: 'Основная',
  },
  chrome: {
    home: 'ECMact, главная',
    theme: 'Сменить цветовую тему',
    themeAuto: 'Авто',
    themeLight: 'Светлая',
    themeDark: 'Тёмная',
    language: 'Сменить язык',
    languageName: 'EN',
  },
  footer: {
    tagline: 'Виджеты для любого сайта на чистом TypeScript. Лицензия MIT.',
    selfMade: 'Этот сайт написан на самом ECMact. ',
    source: 'Читать его исходники.',
    learn: 'Изучать',
    build: 'Строить',
    project: 'Проект',
    gettingStarted: 'Быстрый старт',
    components: 'Компоненты',
    signals: 'Сигналы',
    examples: 'Примеры',
    routing: 'Роутинг',
    state: 'Управление состоянием',
    http: 'HTTP-клиент',
    widgets: 'Виджеты',
    issues: 'Issues',
    security: 'Безопасность',
  },
  docs: {
    navLabel: 'Документация',
    onThisPage: 'На этой странице',
    pagerLabel: 'Предыдущая и следующая страница',
    edit: 'Править эту страницу на GitHub',
    skipArticle: 'Перейти к статье',
    skipToc: 'Перейти к разделам страницы',
    table: 'Таблица',
    topics: 'Темы',
    groups: {
      Start: 'Начало',
      Core: 'Основы',
      Application: 'Приложение',
      Delivery: 'Поставка',
      Reference: 'Справочник',
    },
    callouts: { note: 'Заметка', tip: 'Совет', warning: 'Внимание' },
  },
  code: {
    copy: 'Копировать',
    copied: 'Скопировано',
    failed: 'Не вышло',
    copyLabel: 'Копировать в буфер обмена',
    run: 'Запуск',
    stage: 'Живой пример',
    guide: 'Руководство',
    open: 'Работает на своей странице',
  },
  examples: {
    title: 'Примеры',
    lead: 'Каждый пример работает на своей сцене, и ни одному не нужна сеть. Откройте вкладку файла рядом с «Запуском», чтобы прочитать исходник, который выполняется, и скопировать его.',
    groups: {
      state: {
        title: 'Состояние и сигналы',
        lead: 'Значения, которые меняются, и тексты и строки, которые за ними следят.',
      },
      interface: {
        title: 'Интерфейс',
        lead: 'Стили, формы и контекст: то, что посетитель видит и трогает.',
      },
      requests: {
        title: 'Запросы и данные',
        lead: 'Обращения к серверу, который может быть медленным, неправым или недоступным. Каждый сервер здесь - функция внутри примера.',
      },
      lifecycle: {
        title: 'Жизненный цикл, виджеты и маршруты',
        lead: 'Что происходит, когда часть появляется, меняется и уходит, и как страница находит свой путь.',
      },
    },
  },
  atlas: {
    title: 'Карманный атлас',
    lead: 'Этот пример - ветка маршрутов этого сайта, поэтому у него есть собственный адрес. Пройдитесь по острову, перезагрузите страницу и нажмите «Назад».',
    back: 'Назад к примерам',
    source: 'Исходник этого примера',
  },
  notFound: {
    title: 'Страница не найдена',
    lead: 'По этому адресу ничего нет.',
    home: 'На главную',
    docs: 'Читать документацию',
  },
  widgets: {
    title: 'Виджеты',
    lead: 'Пять виджетов, у каждого своя задача и свой облик, встроенных в четыре никак не связанных сайта. Каждая страница ниже - отдельный документ со своей таблицей стилей, и каждая таблица враждебна: она глобально перекрашивает кнопки, поля ввода и текст. Виджеты сохраняют свою разметку и берут только то, что страница отдаёт им через CSS custom properties.',
    openFull: 'Открыть страницу отдельно',
    hosts: {
      cafe: {
        title: 'Пекарня: шалфейно-зелёный и белый',
        text: 'Расписание закваски, счётчик рядов для вязального кружка и лунный круг для календаря выпечки, перекрашенные в шалфей и терракоту. Страница перекрашивает все кнопки и поля.',
      },
      terminal: {
        title: 'Операционная панель: тёмный сланец и индиго',
        text: 'Индикатор состояния, читающий ленту печи, и лунный круг на панели, которая задаёт свои стили для кнопок, полей и span.',
      },
      zine: {
        title: 'Журнал: чёрный шрифт и один красный',
        text: 'Расчёт тиража и расписание хлеба в журнале, который принудительно ставит свой шрифт на каждый абзац и span через !important.',
      },
      kids: {
        title: 'Детский музей: небесно-голубой и солнечный',
        text: 'Счётчик рядов, индикатор состояния и расчёт тиража на странице из больших округлых форм, которая красит каждый span и div через !important.',
      },
    },
    embedTitle: 'Что делает каждая хост-страница',
    embedCaption: 'любая страница',
    embedLead: 'Те же две строки, как бы страница ни выглядела:',
    referenceTitle: 'Пять виджетов',
    referenceLead:
      'Атрибуты настраивают виджет, события выносят результаты наружу, custom properties его одевают. У каждого виджета свои; виджет, заменивший виджет первой галереи, хранит якорь старого тега.',
    former: 'Заменяет <{tag}>, виджет первой галереи.',
    columns: {
      kind: 'Вид',
      name: 'Имя',
      default: 'По умолчанию',
      description: 'Что делает',
    },
    kinds: { attribute: 'атрибут', event: 'событие', property: 'custom property' },
    empty: 'пусто',
    descriptions: {
      'print-quote':
        'Расчёт тиража: ступени цены карточками-радио, краски, бумага и кнопка расчёта.',
      'moon-dial': 'Фаза луны на выбранный день, кольцо из 29 дней месяца и кнопки для перехода.',
      'proof-clock':
        'Расписание хлеба на закваске, рассчитанное назад от момента, когда он выйдет из печи, с ползунком для кухни.',
      'row-counter': 'Одна большая круглая кнопка считает ряды вязального узора и помнит их.',
      'feed-lamp': 'Лампа показывает состояние JSON-ленты, каждый сбой - своими словами.',
    },
    attributes: {
      'print-quote.currency':
        'Код денег по ISO 4217. Пустое значение считается значением по умолчанию; код, которого браузер не знает, показывается как написан.',
      'print-quote.base':
        'Цена экземпляра на ступени 100, а не цена места в месяц, как в `price-calculator`, который этот виджет заменил. Пустое или неверное значение считается значением по умолчанию.',
      'print-quote.heading':
        'Заголовок билета. Это не `title`, который показал бы подсказку над всем виджетом.',
      'moon-dial.date':
        'День, с которого начать, например `2026-11-20`. Сегодня, если не задан или неверен.',
      'moon-dial.hemisphere':
        '`north` или `south`, чтобы отразить луну. Любое другое значение считается `north`.',
      'proof-clock.to':
        'Когда хлеб выйдет из печи: `2027-01-01`, `2027-01-01T18:00:00` или момент со смещением. Через десять часов от сейчас, если не задан или неверен; момент в прошлом показывает хлеб готовым.',
      'proof-clock.label': 'Заголовок над часами.',
      'row-counter.pattern':
        'Название узора. Под ним счёт хранится в браузере, поэтому после перезагрузки он продолжается.',
      'row-counter.repeat':
        'Сколько рядов в повторе, до 24. `0`, отрицательное или неверное значение не показывает повтор.',
      'feed-lamp.src':
        'Адрес ленты, он решает, что показано. `#lag=1500` в конце ждёт столько миллисекунд перед запросом, чтобы показать медленный ответ на статичном файле.',
      'feed-lamp.feeds':
        'Примеры лент во вкладках, `ok=a.json, missing=b.json`. Первая показывается, когда `src` пуст; смена `src` снимает вкладку.',
      'feed-lamp.retries':
        'Сколько ещё попыток получают сбой сети, тайм-аут или статус 5xx, не больше 5. Неверное значение считается значением по умолчанию.',
      'feed-lamp.slow':
        'Через сколько миллисекунд лампа скажет, что ответ медленный. Неверное значение считается значением по умолчанию.',
      'feed-lamp.timeout':
        'Через сколько миллисекунд попытка считается неудачной. Неверное значение считается значением по умолчанию.',
    },
    events: {
      'print-quote.quote':
        '`{ copies, inks, stock, perCopy, total, currency }`, когда посетитель просит расчёт; оно заменяет детали `{ seats, yearly, total, currency }` виджета `price-calculator`.',
      'moon-dial.change': '`{ date, day, phase }`, когда посетитель переходит на другой день.',
      'proof-clock.done':
        'Когда хлеб готов. Снова, если `to` сдвинули на более поздний момент и он тоже прошёл.',
      'row-counter.row': '`{ pattern, count }`, когда счёт меняется.',
      'feed-lamp.loaded': '`{ src, title }`, когда лента прочитана.',
    },
    properties: {
      'print-quote.--w-bg': 'Цвет билета.',
      'print-quote.--w-fg': 'Цвет текста и карточек ступеней цены.',
      'print-quote.--w-accent': 'Выбранная ступень цены и кнопка.',
      'print-quote.--w-on-accent': 'Текст на выбранной карточке и на кнопке.',
      'print-quote.--w-font': 'Семейство шрифтов текста.',
      'print-quote.--w-display': 'Семейство шрифтов цены и чисел на карточках.',
      'print-quote.--w-radius': 'Скругление билета.',
      'moon-dial.--w-bg': 'Основной цвет ночного неба.',
      'moon-dial.--w-fg': 'Цвет текста, делений и кольца.',
      'moon-dial.--w-accent': 'Ручка, пройденная часть кольца и кнопка «Today».',
      'moon-dial.--w-on-accent': 'Текст кнопки «Today».',
      'moon-dial.--w-font': 'Семейство шрифтов.',
      'proof-clock.--w-bg': 'Цвет карточки.',
      'proof-clock.--w-fg': 'Цвет текста, пройденные этапы и ручка ползунка.',
      'proof-clock.--w-accent': 'Большая форма, идущий этап и заливка ползунка.',
      'proof-clock.--w-on-accent': 'Текст на большой форме и на этапах.',
      'proof-clock.--w-accent-text':
        'Температура, которая стоит прямо на карточке: более тёмная форма акцента.',
      'proof-clock.--w-font': 'Семейство шрифтов.',
      'row-counter.--w-bg': 'Цвет поля под вязаным узором.',
      'row-counter.--w-fg': 'Цвет текста и нижний край кнопок.',
      'row-counter.--w-accent': 'Пунктирное кольцо и точки повтора.',
      'row-counter.--w-font': 'Семейство шрифтов.',
      'feed-lamp.--w-bg': 'Цвет панели.',
      'feed-lamp.--w-fg':
        'Цвет текста. Лампа сохраняет свои цвета: зелёный, янтарный, красный и пурпурный.',
      'feed-lamp.--w-font': 'Семейство шрифтов.',
      'feed-lamp.--w-radius': 'Скругление панели.',
    },
    themeTitle: 'Custom properties',
    themeLead:
      'Задавайте их на элементе виджета или на любом предке. Виджет читает их со своими значениями по умолчанию, поэтому без них он выглядит исходно. Цвет, из-за которого текст трудно читать, - выбор страницы: виджет держит 4.5:1 только со своими цветами или со значениями, которые это дают.',
  },
  demos: {
    exposure: {
      title: 'Треугольник экспозиции',
      description:
        'Диафрагма, выдержка и ISO - три сигнала; значение экспозиции вычисляется из них.',
      hint: 'понажимайте клавиши',
    },
    setlist: {
      title: 'Сет-лист на вечер',
      description:
        'Порядок выступления группы: переставляйте песни и следите за комендантским часом.',
      hint: 'переставьте песню',
      note: 'Переставленная строка сохраняет фокус с версии 3.0.1 (#34). В 3.0.0 фокус теряется.',
    },
    fieldbook: {
      title: 'Полевой блокнот',
      description: 'Счёт наблюдений орнитолога, который остаётся и после перезагрузки.',
      hint: 'добавьте наблюдение и перезагрузите страницу',
    },
    typecase: {
      title: 'Афиша деревянным шрифтом',
      description: 'Задайте заголовок, выберите краску и бумагу, сделайте оттиск.',
      hint: 'попробуйте краски',
    },
    customs: {
      title: 'Таможенная декларация',
      description: 'Поля в Shadow DOM, которые нативная форма проверяет, отправляет и сбрасывает.',
      hint: 'оставьте поле неверным',
      note: 'Поле, чей собственный input отключён, как дата прибытия при пересадке, исключается из FormData с версии 3.0.1 (#31). В 3.0.0 оно всё ещё отправляется.',
    },
    gels: {
      title: 'Световая схема',
      description:
        'Вложенные зоны сцены, и каждая может поставить светофильтр перед своими приборами.',
      hint: 'листайте светофильтры',
    },
    switchboard: {
      title: 'Телефонная станция',
      description: 'Четыре линии, четыре судьбы запроса: ответ, отмена, повтор, отказ.',
      hint: 'подключитесь к линии',
    },
    catalog: {
      title: 'Библиотечный каталог',
      description:
        'Поищите в ящике, возьмите книгу и встретьте стойку, которая закрывается, и лимит запросов.',
      hint: 'введите запрос, возьмите книгу, закройте стойку',
    },
    departures: {
      title: 'Отправления паромов',
      description: 'Табло следует за выбранной гаванью и отбрасывает ответ, который уже не нужен.',
      hint: 'быстро переключайте гавани',
    },
    darkroom: {
      title: 'Кюветы фотолаборатории',
      description:
        'Отпечаток проходит проявитель, стоп-ванну и фиксаж; каждый хук оставляет строку в журнале.',
      hint: 'переместите отпечаток',
    },
    seedpacket: {
      title: 'Пакетик семян',
      description:
        'Кастомный элемент: страница настраивает его атрибутами и слышит его по событию.',
      hint: 'измените атрибуты',
    },
    atlas: {
      title: 'Карманный атлас',
      description:
        'Остров со страницей на каждое место: вложенные маршруты, охранник и ленивый вид.',
      hint: 'предпросмотр',
    },
  },
  home: {
    heroTitle: 'Реактивный UI на DOM.',
    lead: 'Соберите страницу или встройте виджет с помощью типизированных элементов, сигналов и Web Components.',
    start: 'Начать',
    live: 'Живые примеры',
    widgetGuide: 'Собрать виджет',
    exampleLabel: 'Работающий пример ECMact',
    exampleResult: 'Результат',
    exampleSample: 'Пример данных: условные $49 в час.',
    starterTitle: 'Запустите в стартере',
    starterNote:
      'Вставьте код в src/main.ts. В index.html стартера уже есть точка монтирования, и он загружает этот файл:',
    installName: 'команда установки',
    flowLabel: 'Как устроен ECMact',
    flow: [
      ['Соберите элемент', '`tags` создаёт настоящий DOM-узел.'],
      ['Дайте ему состояние', 'Сигнал обновляет читателей, когда меняется его значение.'],
      ['Встройте результат', 'Упакуйте виджет как пользовательский элемент для другой страницы.'],
    ],
    badgesLabel: 'Состояние проекта',
    factsLabel: 'Факты',
    facts: [
      ['0', 'runtime-зависимостей'],
      ['100%', 'покрытие тестами, каждая строка'],
      ['Shadow DOM', 'изоляция компонентов и виджетов'],
      ['Типы', 'пропсы, события и атрибуты по тегу'],
    ],
    featuresTitle: 'Всё, что нужно интерфейсу, и ничего лишнего',
    featuresLead:
      'Один пакет закрывает то, что обычно приходит из пяти. Каждая часть небольшая, типизированная и протестированная.',
    liveTitle: 'Смотрите в работе',
    liveLead: 'Это настоящие компоненты, а не скриншоты. Понажимайте кнопки, затем прочитайте код.',
    embedTitle: 'Создан для встраивания',
    embedText:
      'Большинство интерфейсов живёт на странице, которую вы контролируете. ECMact сделан для тех, что нет: калькулятор на сайте партнёра, форма в CMS, панель в расширении браузера.',
    embedTicks: [
      'Один IIFE-скрипт, фреймворк на странице-хосте не нужен',
      'Shadow DOM разделяет ваши стили и страницу',
      'Настройки приходят атрибутами, результаты уходят DOM-событиями',
      'Оформление снаружи через CSS custom properties',
    ],
    embedGallery: 'Открыть галерею виджетов',
    embedForeign: 'Посмотреть на чужой странице',
    embedGuide: 'Читать руководство',
    wholeTitle: 'Целое приложение, один импорт',
    wholeLead: 'Роутер, стор и HTTP-клиент - всё из ecmact, всё на одних и тех же сигналах.',
    usesTitle: 'Что на нём строят',
    closingTitle: 'Начните за минуту',
    guide: 'Читать руководство',
    tryStarter: 'Попробовать стартер',
  },
  meta: {
    tagline: 'Виджеты для любого сайта на чистом TypeScript',
    summary:
      'ECMact собирает встраиваемые виджеты и реактивные интерфейсы на чистом TypeScript: изолированные стили, типизированные атрибуты и один тег script, а сигналы, стор, HTTP-клиент и роутер встроены. Без зависимостей и без компилятора.',
    examplesTitle: 'Примеры',
    examplesDescription:
      'Живые демо ECMact с исходниками: сигналы, сторы, styled-компоненты, HTTP-клиент и формы.',
    atlasTitle: 'Карманный атлас',
    atlasDescription:
      'Пример ECMact, который сам является веткой маршрутов этого сайта: вложенные маршруты, охранник, ленивый вид и query.',
    widgetsTitle: 'Виджеты',
    widgetsDescription:
      'Одни и те же виджеты ECMact, встроенные в четыре несвязанных сайта, у каждого своя враждебная таблица стилей.',
    notFound: 'Не найдено',
    docsSuffix: 'документация',
  },
};

/** The texts of every language. */
export const messages: Record<Locale, Messages> = { en, ru };

/**
 * Reads the texts of the language that is in use now. The interface is rebuilt when the language changes, so
 * code that builds elements reads them when it builds.
 *
 * @returns The messages.
 */
export const text = () => messages[currentLocale()];
