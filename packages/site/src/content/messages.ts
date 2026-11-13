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
    source: string;
  };
  /** The gallery. */
  examples: { title: string; lead: string };
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
    columns: {
      widget: string;
      property: string;
      attributes: string;
      events: string;
      description: string;
    };
    properties: Record<string, string>;
    descriptions: Record<string, string>;
    themeTitle: string;
    themeLead: string;
  };
  /** The titles of the demos, by id. */
  demos: Record<string, { title: string; description: string }>;
  /** The home page. */
  home: {
    heroTitle: string;
    heroAccent: string;
    lead: string;
    start: string;
    live: string;
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
  },
  chrome: {
    home: 'ECMact, home',
    theme: 'Change the color theme',
    themeAuto: '◐ Auto',
    themeLight: '☀ Light',
    themeDark: '☾ Dark',
    language: 'Switch the language',
    languageName: 'RU',
  },
  footer: {
    tagline: 'Reactive interfaces on native Web Components. MIT licensed.',
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
    source: 'Code',
  },
  examples: {
    title: 'Examples',
    lead: 'Every example below is a live ECMact component. Switch to the Code tab to read the exact source that runs.',
  },
  notFound: {
    title: 'Page not found',
    lead: 'There is nothing at this address.',
    home: 'Back to the home page',
    docs: 'Read the docs',
  },
  widgets: {
    title: 'Widgets',
    lead: 'Five widgets, built once, embedded into four unrelated sites. Every page below is a separate document with its own stylesheet, and every stylesheet is hostile: it restyles buttons, inputs and text globally. The widgets keep their own markup and take only what the page hands them as CSS custom properties.',
    openFull: 'Open the page on its own',
    hosts: {
      cafe: {
        title: 'A bistro: serif, cream and gold',
        text: 'Countdown, catering calculator and a dessert poll, recolored to gold with square corners. The page styles every button and input in serif.',
      },
      terminal: {
        title: 'A dev dashboard: phosphor green',
        text: 'Two GitHub repository cards, a weather card and a poll, in monochrome green with a scanline over everything. The cards are fed by public APIs.',
      },
      zine: {
        title: 'A zine: brutalist yellow and black',
        text: 'Price calculator, countdown and poll with thick borders and no radius, on a page that forces Courier with !important.',
      },
      kids: {
        title: 'A kids club: pastel and playful',
        text: 'Weather, countdown and poll with 36px corners and a pink accent, on a page that paints every span and div purple with !important.',
      },
    },
    embedTitle: 'What every host page does',
    embedCaption: 'any page',
    embedLead: 'The same two lines, whatever the page looks like:',
    referenceTitle: 'The five widgets',
    referenceLead:
      'Attributes configure a widget, events carry results out, custom properties dress it. Every widget understands the same custom properties.',
    columns: {
      widget: 'Widget',
      property: 'Property',
      attributes: 'Attributes',
      events: 'Events',
      description: 'What it does',
    },
    descriptions: {
      'price-calculator': 'A seat slider with a monthly and a yearly price and a quote button.',
      'weather-now': 'The current weather of a city, from the open-meteo.com API.',
      'repo-card': 'The numbers of a public GitHub repository, from the GitHub API.',
      'poll-widget': 'A one-question poll whose votes stay in the browser.',
      'countdown-timer': 'A flip-clock countdown to a moment.',
    },
    properties: {
      '--w-accent': 'The color of buttons, bars and highlights.',
      '--w-bg': 'The background of the card: a color or any CSS background.',
      '--w-fg': 'The text color.',
      '--w-muted': 'The color of secondary text.',
      '--w-border': 'The color of borders and dividers.',
      '--w-radius': 'The roundness of the corners.',
      '--w-font': 'The font family.',
    },
    themeTitle: 'Custom properties',
    themeLead:
      'Set them on the widget element or on any ancestor. A widget reads them with its own defaults, so setting none gives its original look. The flip cards of countdown-timer are painted from --w-bg too, so if --w-bg is a gradient, also set --w-tile to a plain color for them.',
  },
  demos: {
    counter: {
      title: 'Signals',
      description:
        'A signal, a value computed from it and two texts that follow them: nothing else updates.',
    },
    todo: {
      title: 'Keyed list and store',
      description:
        'A store holds the to-dos, a keyed list shows them, a function child counts them.',
    },
    styled: {
      title: 'Styled components and themes',
      description:
        'Props, keyframes and a theme from a signal: pick a swatch to restyle everything.',
    },
    store: {
      title: 'Persistent store',
      description:
        'The persist option keeps the notes in localStorage: add one and reload the page.',
    },
    http: {
      title: 'HTTP client and resource',
      description: 'Retries, aborted requests and loading state against a fake server.',
    },
    form: {
      title: 'Form fields in a Shadow DOM',
      description: 'Components that take part in native form validation and FormData.',
    },
    github: {
      title: 'GitHub API',
      description:
        'A repository card from the GitHub API, with a debounced input and a rate-limit interceptor.',
    },
    weather: {
      title: 'Weather API',
      description:
        'The open-meteo.com API through resource(): a signal picks the city, the old request is aborted.',
    },
    posts: {
      title: 'Create, read, delete',
      description:
        'Optimistic updates against jsonplaceholder, with interceptors that count and time the requests.',
    },
    lifecycle: {
      title: 'Lifecycle hooks',
      description:
        'mounted with a cleanup, an effect that stops by itself and unmounted, on a clock you can remove.',
    },
    context: {
      title: 'Context',
      description: 'Nested providers: each label asks the nearest one above it for its color.',
    },
    widget: {
      title: 'defineWidget',
      description:
        'A custom element configured by attributes, themed by a custom property, speaking through events.',
    },
  },
  home: {
    heroTitle: 'Reactive interfaces on ',
    heroAccent: 'native Web Components',
    lead: 'ECMact is a small library with signals, a router, a store, an HTTP client, styled components and embeddable widgets. No virtual DOM, no dependencies, and nothing that has to be compiled.',
    start: 'Get started',
    live: 'See live examples',
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
    tagline: 'Reactive interfaces on native Web Components',
    summary:
      'ECMact is a small library for reactive interfaces on native Web Components: signals, a router, a store, an HTTP client, styled components and embeddable widgets, with no dependencies.',
    examplesTitle: 'Examples',
    examplesDescription:
      'Live ECMact demos with their source: signals, stores, styled components, an HTTP client and forms.',
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
  },
  chrome: {
    home: 'ECMact, главная',
    theme: 'Сменить цветовую тему',
    themeAuto: '◐ Авто',
    themeLight: '☀ Светлая',
    themeDark: '☾ Тёмная',
    language: 'Сменить язык',
    languageName: 'EN',
  },
  footer: {
    tagline: 'Реактивные интерфейсы на нативных Web Components. Лицензия MIT.',
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
    source: 'Код',
  },
  examples: {
    title: 'Примеры',
    lead: 'Каждый пример ниже - живой компонент ECMact. Откройте вкладку «Код», чтобы прочитать исходник, который выполняется.',
  },
  notFound: {
    title: 'Страница не найдена',
    lead: 'По этому адресу ничего нет.',
    home: 'На главную',
    docs: 'Читать документацию',
  },
  widgets: {
    title: 'Виджеты',
    lead: 'Пять виджетов, написанных один раз и встроенных в четыре никак не связанных сайта. Каждая страница ниже - отдельный документ со своей таблицей стилей, и каждая таблица враждебна: она глобально перекрашивает кнопки, поля ввода и текст. Виджеты сохраняют свою разметку и берут только то, что страница отдаёт им через CSS custom properties.',
    openFull: 'Открыть страницу отдельно',
    hosts: {
      cafe: {
        title: 'Бистро: засечки, крем и золото',
        text: 'Обратный отсчёт, калькулятор кейтеринга и опрос о десертах, перекрашенные в золото с квадратными углами. Страница стилизует все кнопки и поля шрифтом с засечками.',
      },
      terminal: {
        title: 'Дашборд разработчика: зелёный люминофор',
        text: 'Две карточки репозиториев GitHub, карточка погоды и опрос в монохромном зелёном со строчной сеткой поверх всего. Карточки питаются от публичных API.',
      },
      zine: {
        title: 'Зин: брутализм, жёлтое и чёрное',
        text: 'Калькулятор цены, отсчёт и опрос с толстыми рамками и без скруглений на странице, которая принудительно ставит Courier через !important.',
      },
      kids: {
        title: 'Детский клуб: пастель и игра',
        text: 'Погода, отсчёт и опрос со скруглением 36px и розовым акцентом на странице, которая красит каждый span и div в фиолетовый через !important.',
      },
    },
    embedTitle: 'Что делает каждая хост-страница',
    embedCaption: 'любая страница',
    embedLead: 'Те же две строки, как бы страница ни выглядела:',
    referenceTitle: 'Пять виджетов',
    referenceLead:
      'Атрибуты настраивают виджет, события выносят результаты наружу, custom properties его одевают. Все виджеты понимают одни и те же custom properties.',
    columns: {
      widget: 'Виджет',
      property: 'Свойство',
      attributes: 'Атрибуты',
      events: 'События',
      description: 'Что делает',
    },
    descriptions: {
      'price-calculator':
        'Ползунок количества мест с ценой за месяц и за год и кнопкой запроса расчёта.',
      'weather-now': 'Текущая погода в городе, из API open-meteo.com.',
      'repo-card': 'Показатели публичного репозитория GitHub, из GitHub API.',
      'poll-widget': 'Опрос с одним вопросом, голоса остаются в браузере.',
      'countdown-timer': 'Обратный отсчёт до момента в стиле перекидных часов.',
    },
    properties: {
      '--w-accent': 'Цвет кнопок, полос и акцентов.',
      '--w-bg': 'Фон карточки: цвет или любой CSS-фон.',
      '--w-fg': 'Цвет текста.',
      '--w-muted': 'Цвет второстепенного текста.',
      '--w-border': 'Цвет рамок и разделителей.',
      '--w-radius': 'Скругление углов.',
      '--w-font': 'Семейство шрифтов.',
    },
    themeTitle: 'Custom properties',
    themeLead:
      'Задавайте их на элементе виджета или на любом предке. Виджет читает их со своими значениями по умолчанию, поэтому без них он выглядит исходно. Карточки счётчика countdown-timer тоже закрашиваются из --w-bg, поэтому если --w-bg - градиент, задайте для них ещё и --w-tile простым цветом.',
  },
  demos: {
    counter: {
      title: 'Сигналы',
      description:
        'Сигнал, вычисленное из него значение и два текста, которые за ними следят: больше ничего не обновляется.',
    },
    todo: {
      title: 'Список с ключами и стор',
      description:
        'Стор хранит дела, список с ключами их показывает, реактивная функция их считает.',
    },
    styled: {
      title: 'Styled-компоненты и темы',
      description: 'Пропсы, keyframes и тема из сигнала: выберите цвет, и всё перестилизуется.',
    },
    store: {
      title: 'Стор с сохранением',
      description:
        'Опция persist хранит заметки в localStorage: добавьте одну и перезагрузите страницу.',
    },
    http: {
      title: 'HTTP-клиент и resource',
      description: 'Повторы, прерванные запросы и состояние загрузки на фейковом сервере.',
    },
    form: {
      title: 'Поля формы в Shadow DOM',
      description: 'Компоненты, которые участвуют в нативной валидации формы и в FormData.',
    },
    github: {
      title: 'GitHub API',
      description:
        'Карточка репозитория из GitHub API: ввод с задержкой и интерцептор лимита запросов.',
    },
    weather: {
      title: 'API погоды',
      description:
        'API open-meteo.com через resource(): сигнал выбирает город, старый запрос прерывается.',
    },
    posts: {
      title: 'Создать, прочитать, удалить',
      description:
        'Оптимистичные обновления на jsonplaceholder, интерцепторы считают запросы и замеряют время.',
    },
    lifecycle: {
      title: 'Хуки жизненного цикла',
      description:
        'mounted с очисткой, эффект, который останавливается сам, и unmounted на часах, которые можно убрать.',
    },
    context: {
      title: 'Контекст',
      description:
        'Вложенные провайдеры: каждая подпись спрашивает у ближайшего над ней свой цвет.',
    },
    widget: {
      title: 'defineWidget',
      description:
        'Кастомный элемент: настраивается атрибутами, красится CSS-свойством, отвечает событиями.',
    },
  },
  home: {
    heroTitle: 'Реактивные интерфейсы на ',
    heroAccent: 'нативных Web Components',
    lead: 'ECMact - небольшая библиотека: сигналы, роутер, стор, HTTP-клиент, styled-компоненты и встраиваемые виджеты. Без виртуального DOM, без зависимостей и без того, что нужно компилировать.',
    start: 'Начать',
    live: 'Живые примеры',
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
    tagline: 'Реактивные интерфейсы на нативных Web Components',
    summary:
      'ECMact - небольшая библиотека для реактивных интерфейсов на нативных Web Components: сигналы, роутер, стор, HTTP-клиент, styled-компоненты и встраиваемые виджеты, без зависимостей.',
    examplesTitle: 'Примеры',
    examplesDescription:
      'Живые демо ECMact с исходниками: сигналы, сторы, styled-компоненты, HTTP-клиент и формы.',
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
