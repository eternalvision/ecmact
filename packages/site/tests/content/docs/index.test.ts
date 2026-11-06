import { describe, expect, it } from 'vitest';
import { docs, findDoc, groups, neighbours } from '@site/content/docs/index';

describe('docs', () => {
  it('has unique slugs', () => {
    const slugs = docs.map((page) => page.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('puts every page in a group, and every group has pages', () => {
    docs.forEach((page) => expect(groups).toContain(page.group));
    groups.forEach((group) => expect(docs.some((page) => page.group === group)).toBe(true));
  });

  it('keeps the pages of a group together, in the order of the groups', () => {
    const order = docs.map((page) => groups.indexOf(page.group));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('starts with getting started', () => {
    expect(docs[0]?.slug).toBe('getting-started');
  });
});

describe('findDoc', () => {
  it('finds a page by slug', () => {
    expect(findDoc('routing')?.title).toBe('Routing');
    expect(findDoc('nope')).toBeUndefined();
  });
});

describe('neighbours', () => {
  it('gives the page before and after', () => {
    expect(neighbours('components')).toEqual({ previous: docs[0], next: docs[2] });
  });

  it('has nothing before the first page and nothing after the last', () => {
    expect(neighbours(docs[0]!.slug).previous).toBeUndefined();
    expect(neighbours(docs.at(-1)!.slug).next).toBeUndefined();
  });
});
