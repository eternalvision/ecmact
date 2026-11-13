/** One export of the package. */
export interface ApiEntry {
  /** The exported name. */
  name: string;
  /** One sentence: what it is for. */
  summary: string;
  /** The documentation page where it is explained. */
  page: string;
}

/** The exports of the package, by area. */
export const api: Record<string, ApiEntry[]> = {
  Components: [
    {
      name: 'em',
      summary:
        'Components: custom elements with a shadow root, a stylesheet and a lifecycle: `em.Name(props, ...children)`.',
      page: 'components',
    },
    {
      name: 'tags',
      summary:
        'Plain DOM elements with reactive props and children: `tags.div(props, ...children)`.',
      page: 'components',
    },
    {
      name: 'each',
      summary:
        'A keyed list that follows an array, a signal or a function: `each(items, render, options)`.',
      page: 'components',
    },
    {
      name: 'mount',
      summary: 'Appends children to a container given as a selector or an element.',
      page: 'components',
    },
    {
      name: 'configure',
      summary:
        'Global defaults: Shadow DOM, the prefix of component names, shared stylesheets, error handler, warnings.',
      page: 'styling',
    },
    {
      name: 'createContext',
      summary:
        'Creates a context: `provide` offers a value to the elements below, `use` reads the nearest one.',
      page: 'context',
    },
  ],
  Signals: [
    { name: 'signal', summary: 'A writable reactive value.', page: 'signals' },
    {
      name: 'computed',
      summary: 'A derived value, lazy and memoized, with an optional equality cutoff.',
      page: 'signals',
    },
    {
      name: 'effect',
      summary: 'Runs now and again when the signals it read change.',
      page: 'signals',
    },
    { name: 'batch', summary: 'Groups writes so that effects run once.', page: 'signals' },
    { name: 'untracked', summary: 'Reads signals without subscribing.', page: 'signals' },
    { name: 'isSignal', summary: 'Type guard for signals and computed values.', page: 'signals' },
  ],
  Styling: [
    { name: 'styled', summary: 'Elements from CSS in tagged templates.', page: 'styled' },
    { name: 'css', summary: 'A shareable piece of CSS for styled elements.', page: 'styled' },
    { name: 'keyframes', summary: 'Frames of an animation for styled elements.', page: 'styled' },
    {
      name: 'ThemeProvider',
      summary: 'Offers a theme to the styled elements below it.',
      page: 'styled',
    },
    { name: 'themeContext', summary: 'The context that carries the theme.', page: 'styled' },
    {
      name: 'useTheme',
      summary: 'Reads the theme signal that applies to an element.',
      page: 'styled',
    },
  ],
  Routing: [
    {
      name: 'createRouter',
      summary: 'A History API router with outlet, links, nested routes and guards.',
      page: 'routing',
    },
  ],
  State: [
    {
      name: 'createStore',
      summary:
        'A store of values and actions, with persistence and Redux DevTools as options: `createStore(initial, actions, options)`.',
      page: 'state',
    },
    {
      name: 'createJSONStorage',
      summary:
        'A JSON storage for the `persist` option, over `localStorage`, `sessionStorage` or any string storage.',
      page: 'state',
    },
    { name: 'shallow', summary: 'One-level comparison for selectors.', page: 'state' },
  ],
  Data: [
    {
      name: 'resource',
      summary:
        'An async function as `data`, `error` and `loading`, which reactive functions follow.',
      page: 'data',
    },
    {
      name: 'createHttp',
      summary: 'An HTTP client on `fetch` with interceptors, retries and resources.',
      page: 'http',
    },
    { name: 'http', summary: 'A ready-made client with the library defaults.', page: 'http' },
    { name: 'HttpError', summary: 'The error of a failed request.', page: 'http' },
    { name: 'CanceledError', summary: 'The error of a cancelled request.', page: 'http' },
    { name: 'isHttpError', summary: 'Type guard for `HttpError`.', page: 'http' },
    { name: 'isCancel', summary: 'Type guard for `CanceledError`.', page: 'http' },
    { name: 'toFormData', summary: 'Turns an object into `FormData`.', page: 'http' },
  ],
  Delivery: [
    {
      name: 'defineWidget',
      summary: 'Registers a custom element for embedding in any page.',
      page: 'widgets',
    },
  ],
};

/**
 * Lists the names of every documented export.
 *
 * @returns The names, in the order of the groups.
 */
export const apiNames = () =>
  Object.values(api)
    .flat()
    .map((entry) => entry.name);

/** The names of the areas, in Russian. */
export const areasRu: Record<string, string> = {
  Components: 'Компоненты',
  Signals: 'Сигналы',
  Styling: 'Стилизация',
  Routing: 'Роутинг',
  State: 'Состояние',
  Data: 'Данные',
  Delivery: 'Поставка',
};

/** What each export is for, in Russian. */
export const apiRu: Record<string, string> = {
  em: 'Компоненты: кастомные элементы с shadow root, таблицей стилей и жизненным циклом: `em.Name(props, ...children)`.',
  tags: 'Обычные DOM-элементы с реактивными пропсами и детьми: `tags.div(props, ...children)`.',
  each: 'Список с ключами, который следует за массивом, сигналом или функцией: `each(items, render, options)`.',
  mount: 'Добавляет детей в контейнер, заданный селектором или элементом.',
  configure:
    'Глобальные значения по умолчанию: Shadow DOM, префикс имён компонентов, общие таблицы стилей, обработчик ошибок, предупреждения.',
  createContext:
    'Создаёт контекст: `provide` предоставляет значение элементам ниже, `use` читает ближайшее.',
  signal: 'Записываемое реактивное значение.',
  computed:
    'Производное значение, ленивое и мемоизированное, с необязательным отсечением по равенству.',
  effect: 'Выполняется сразу и снова при изменении прочитанных сигналов.',
  batch: 'Группирует записи, чтобы эффекты выполнялись один раз.',
  untracked: 'Читает сигналы без подписки.',
  isSignal: 'Проверка типа для сигналов и вычисляемых значений.',
  styled: 'Элементы из CSS в шаблонных литералах.',
  css: 'Переиспользуемый кусок CSS для styled-элементов.',
  keyframes: 'Кадры анимации для styled-элементов.',
  ThemeProvider: 'Предоставляет тему styled-элементам ниже.',
  themeContext: 'Контекст, который несёт тему.',
  useTheme: 'Читает сигнал темы, действующей для элемента.',
  createRouter: 'Роутер на History API с outlet, ссылками, вложенными маршрутами и гардами.',
  createStore:
    'Стор из значений и действий, с сохранением и Redux DevTools в опциях: `createStore(initial, actions, options)`.',
  createJSONStorage:
    'JSON-хранилище для опции `persist` поверх `localStorage`, `sessionStorage` или любого строкового хранилища.',
  shallow: 'Сравнение на один уровень для селекторов.',
  resource:
    'Асинхронная функция как `data`, `error` и `loading`, за которыми следят реактивные функции.',
  createHttp: 'HTTP-клиент на `fetch` с интерцепторами, повторами и ресурсами.',
  http: 'Готовый клиент с настройками библиотеки по умолчанию.',
  HttpError: 'Ошибка неудавшегося запроса.',
  CanceledError: 'Ошибка отменённого запроса.',
  isHttpError: 'Проверка типа для `HttpError`.',
  isCancel: 'Проверка типа для `CanceledError`.',
  toFormData: 'Превращает объект в `FormData`.',
  defineWidget: 'Регистрирует кастомный элемент для встраивания в любую страницу.',
};
