import { api, apiRu, areasRu } from '@site/content/api';

/** Области экспортируемых типов и страница, где они описаны, в порядке английской таблицы. */
const types: [string, string][] = [
  ['Элементы', 'components'],
  ['Компоненты', 'components'],
  ['Конфигурация и ошибки', 'lifecycle'],
  ['Контекст', 'context'],
  ['Сигналы', 'signals'],
  ['Styled-компоненты', 'styled'],
  ['Роутинг', 'routing'],
  ['Состояние', 'state'],
  ['Данные', 'data'],
  ['HTTP-клиент', 'http'],
  ['Виджеты', 'widgets'],
];

/** Русский перевод страницы "API reference", в порядке `texts`: собирается из таблицы `api`. */
export const translation: string[] = [
  'Справочник API',
  'Все экспорты пакета в одном месте со ссылкой на то, где они объясняются.',
  'Всё импортируется из `ecmact`. Пакет в ES и CommonJS, не имеет runtime-зависимостей и поддерживает tree-shaking, поэтому вы платите только за то, что импортируете.',
  ...Object.entries(api).flatMap(([area, entries]) => [
    areasRu[area] as string,
    'Экспорт',
    'Что это',
    'Читать',
    ...entries.flatMap((entry) => [
      '',
      apiRu[entry.name] as string,
      `[документация](/docs/${entry.page})`,
    ]),
  ]),
  'Экспортируемые типы',
  'Импортируйте их через `import type { ... } from "ecmact"`.',
  'Область',
  'Типы',
  'Читать',
  ...types.flatMap(([area, slug]) => [area, '', `[документация](/docs/${slug})`]),
];
