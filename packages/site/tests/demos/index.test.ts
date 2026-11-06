import { describe, expect, it } from 'vitest';
import { findDoc } from '@site/content/docs/index';
import { cleanSource, demos, findDemo } from '@site/demos/index';

describe('cleanSource', () => {
  it('removes documentation comments and trims', () => {
    expect(cleanSource('/**\n * Doc.\n */\nexport const a = 1;\n')).toBe('export const a = 1;');
    expect(cleanSource('a /** x */ b')).toBe('a  b');
  });
});

describe('demos', () => {
  it('have unique ids and point at pages that exist', () => {
    expect(new Set(demos.map((demo) => demo.id)).size).toBe(demos.length);
    demos.forEach((demo) => expect(findDoc(demo.page), demo.id).toBeDefined());
  });

  it('create a node and show source that imports from ecmact without comments', () => {
    demos.forEach((demo) => {
      expect(demo.create(), demo.id).toBeInstanceOf(Node);
      expect(demo.source, demo.id).toContain("from 'ecmact'");
      expect(demo.source, demo.id).not.toContain('/**');
      expect(demo.description.length, demo.id).toBeGreaterThan(20);
    });
  });
});

describe('findDemo', () => {
  it('finds a demo by id', () => {
    expect(findDemo('counter')?.title).toBe('Signals');
    expect(findDemo('nope')).toBeUndefined();
  });
});
