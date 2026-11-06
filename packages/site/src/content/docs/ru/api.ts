import { api, apiRu, areasRu } from '@site/content/api';

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
];
