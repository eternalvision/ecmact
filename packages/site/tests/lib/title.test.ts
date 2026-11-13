import { afterEach, describe, expect, it } from 'vitest';
import { applyMeta, metaFor } from '@site/lib/title';

afterEach(() => {
  document.head.querySelector('meta[name="description"]')?.remove();
});

describe('metaFor', () => {
  it('describes the home page', () => {
    expect(metaFor('/').title).toBe('ECMact - Widgets for any website, in plain TypeScript');
    expect(metaFor('').description).toContain('signals');
  });

  it('describes the examples', () => {
    expect(metaFor('/examples').title).toBe('Examples - ECMact');
  });

  it('does not mind a trailing slash on any page', () => {
    expect(metaFor('/widgets/').title).toBe('Widgets - ECMact');
    expect(metaFor('/examples/').title).toBe('Examples - ECMact');
    expect(metaFor('/docs/routing//').title).toBe('Routing - ECMact docs');
    expect(metaFor('//').title).toBe('ECMact - Widgets for any website, in plain TypeScript');
  });

  it('describes the widget gallery', () => {
    expect(metaFor('/widgets').title).toBe('Widgets - ECMact');
    expect(metaFor('/widgets').description).toContain('hostile CSS');
  });

  it('describes a documentation page by its own title and summary', () => {
    const meta = metaFor('/docs/routing');
    expect(meta.title).toBe('Routing - ECMact docs');
    expect(meta.description).toContain('History API');
    expect(metaFor('/docs/routing/').title).toBe('Routing - ECMact docs');
  });

  it('falls back to not found for anything else', () => {
    expect(metaFor('/docs/nope').title).toBe('Not found - ECMact');
    expect(metaFor('/other').title).toBe('Not found - ECMact');
  });
});

describe('applyMeta', () => {
  it('sets the title and creates the description tag', () => {
    applyMeta({ title: 'A', description: 'about a' });
    expect(document.title).toBe('A');
    expect(document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.content).toBe(
      'about a',
    );
  });

  it('reuses the description tag that exists', () => {
    applyMeta({ title: 'A', description: 'one' });
    applyMeta({ title: 'B', description: 'two' });
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.content).toBe(
      'two',
    );
  });
});

describe('metaFor in Russian', () => {
  it('describes the pages in Russian', () => {
    expect(metaFor('/', 'ru').title).toBe('ECMact - Виджеты для любого сайта на чистом TypeScript');
    expect(metaFor('/examples', 'ru').title).toBe('Примеры - ECMact');
    expect(metaFor('/docs/routing', 'ru').title).toBe('Роутинг - ECMact документация');
    expect(metaFor('/docs/routing', 'ru').description).toContain('History API');
    expect(metaFor('/nope', 'ru').title).toBe('Не найдено - ECMact');
  });
});
