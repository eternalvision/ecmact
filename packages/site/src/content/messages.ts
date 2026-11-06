import { currentLocale, type Locale } from '@site/lib/i18n';

/** Every piece of text of the interface that is not documentation: one set per language. */
export interface Messages {
  /** The links of the header. */
  nav: {
    docs: string;
    examples: string;
    widget: string;
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
  /** The titles of the demos, by id. */
  demos: Record<string, { title: string; description: string }>;
  /** The home page. */
  home: {
    heroTitle: string;
    heroAccent: string;
    lead: string;
    start: string;
    live: string;
    facts: [string, string][];
    featuresTitle: string;
    featuresLead: string;
    liveTitle: string;
    liveLead: string;
    embedTitle: string;
    embedText: string;
    embedTicks: string[];
    embedDemo: string;
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
    notFound: string;
    docsSuffix: string;
  };
}

/** The English texts. */
const en: Messages = {
  nav: {
    docs: 'Docs',
    examples: 'Examples',
    widget: 'Widget demo',
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
  demos: {
    counter: {
      title: 'Signals',
      description: 'A signal, a computed value and props bound to them: only two texts update.',
    },
    todo: {
      title: 'Keyed list and store',
      description:
        'A store holds the to-dos, a keyed list shows them, a selected signal counts them.',
    },
    styled: {
      title: 'Styled components and themes',
      description:
        'Props, keyframes and a theme from a signal: pick a swatch to restyle everything.',
    },
    store: {
      title: 'Persistent store',
      description: 'persist() keeps the notes in localStorage: add one and reload the page.',
    },
    http: {
      title: 'HTTP client and resource',
      description: 'Retries, aborted requests and loading state against a fake server.',
    },
    form: {
      title: 'Form fields in a Shadow DOM',
      description: 'Components that take part in native form validation and FormData.',
    },
  },
  home: {
    heroTitle: 'Reactive interfaces on ',
    heroAccent: 'native Web Components',
    lead: 'ECMact is a small library with signals, a router, a store, an HTTP client, styled components and embeddable widgets. No virtual DOM, no dependencies, and nothing that has to be compiled.',
    start: 'Get started',
    live: 'See live examples',
    facts: [
      ['0', 'runtime dependencies'],
      ['100%', 'test coverage, every line'],
      ['Shadow DOM', 'isolation by default'],
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
    embedDemo: 'Open the widget demo',
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
    notFound: 'Not found',
    docsSuffix: 'docs',
  },
};

/** The Russian texts. */
const ru: Messages = {
  nav: {
    docs: 'Документация',
    examples: 'Примеры',
    widget: 'Демо виджета',
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
  demos: {
    counter: {
      title: 'Сигналы',
      description:
        'Сигнал, вычисляемое значение и пропсы, привязанные к ним: обновляются только два текста.',
    },
    todo: {
      title: 'Список с ключами и стор',
      description: 'Стор хранит дела, список с ключами их показывает, выбранный сигнал их считает.',
    },
    styled: {
      title: 'Styled-компоненты и темы',
      description: 'Пропсы, keyframes и тема из сигнала: выберите цвет, и всё перестилизуется.',
    },
    store: {
      title: 'Стор с сохранением',
      description:
        'persist() хранит заметки в localStorage: добавьте одну и перезагрузите страницу.',
    },
    http: {
      title: 'HTTP-клиент и resource',
      description: 'Повторы, прерванные запросы и состояние загрузки на фейковом сервере.',
    },
    form: {
      title: 'Поля формы в Shadow DOM',
      description: 'Компоненты, которые участвуют в нативной валидации формы и в FormData.',
    },
  },
  home: {
    heroTitle: 'Реактивные интерфейсы на ',
    heroAccent: 'нативных Web Components',
    lead: 'ECMact - небольшая библиотека: сигналы, роутер, стор, HTTP-клиент, styled-компоненты и встраиваемые виджеты. Без виртуального DOM, без зависимостей и без того, что нужно компилировать.',
    start: 'Начать',
    live: 'Живые примеры',
    facts: [
      ['0', 'runtime-зависимостей'],
      ['100%', 'покрытие тестами, каждая строка'],
      ['Shadow DOM', 'изоляция по умолчанию'],
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
    embedDemo: 'Открыть демо виджета',
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
