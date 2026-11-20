import { describe, expect, it } from 'vitest';
import { messages, text } from '@site/content/messages';
import { demos, groups } from '@site/demos/index';
import { resetLocale, useLocale } from '@tests/helpers';

const shape = (value: unknown): unknown =>
  Array.isArray(value)
    ? value.map(shape)
    : typeof value === 'object' && value !== null
      ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shape(item)]))
      : typeof value;

const strings = (value: unknown): string[] =>
  typeof value === 'string'
    ? [value]
    : typeof value === 'object' && value !== null
      ? Object.values(value).flatMap(strings)
      : [];

describe('messages', () => {
  it('have the same structure in every language', () => {
    expect(shape(messages.ru)).toEqual(shape(messages.en));
  });

  it('have no empty text', () => {
    ['en', 'ru'].forEach((locale) =>
      strings(messages[locale as 'en' | 'ru']).forEach((value) =>
        expect(value.trim()).not.toBe(''),
      ),
    );
  });

  it('describe every demo in both languages', () => {
    demos.forEach((demo) => {
      expect(messages.en.demos[demo.id]?.title, demo.id).toBe(demo.title);
      expect(messages.en.demos[demo.id]?.description, demo.id).toBe(demo.description);
      expect(messages.ru.demos[demo.id]?.title, demo.id).toBeTruthy();
    });
    expect(Object.keys(messages.ru.demos).sort()).toEqual(demos.map((demo) => demo.id).sort());
    demos.forEach((demo) => {
      expect(messages.en.demos[demo.id]?.hint, demo.id).toBe(messages.en.demos[demo.id]?.hint);
      expect(typeof messages.ru.demos[demo.id]?.hint, demo.id).toBe(
        typeof messages.en.demos[demo.id]?.hint,
      );
      expect(typeof messages.ru.demos[demo.id]?.note, demo.id).toBe(
        typeof messages.en.demos[demo.id]?.note,
      );
    });
  });

  it('name the version that brought the behavior an example shows', () => {
    ['en', 'ru'].forEach((locale) => {
      const { setlist, customs } = messages[locale as 'en' | 'ru'].demos;
      expect(setlist?.note, locale).toContain('3.0.1');
      expect(customs?.note, locale).toContain('3.0.1');
    });
  });

  it('give every task of the gallery a title and a lead in both languages', () => {
    ['en', 'ru'].forEach((locale) =>
      groups.forEach((group) => {
        const copy = messages[locale as 'en' | 'ru'].examples.groups[group];
        expect(copy.title, `${locale} ${group}`).toBeTruthy();
        expect(copy.lead, `${locale} ${group}`).toBeTruthy();
      }),
    );
    expect(Object.keys(messages.en.examples.groups).sort()).toEqual([...groups].sort());
  });

  it('are Russian where the text is Russian', () => {
    expect(messages.ru.nav.docs).toBe('Документация');
    expect(messages.ru.home.facts).toHaveLength(messages.en.home.facts.length);
    expect(messages.ru.home.embedTicks).toHaveLength(messages.en.home.embedTicks.length);
  });
});

describe('text', () => {
  it('reads the messages of the language in use', async () => {
    expect(text().nav.docs).toBe('Docs');
    await useLocale('ru');
    expect(text().nav.docs).toBe('Документация');
    await resetLocale();
  });
});
