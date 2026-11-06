import * as library from 'ecmact';
import { describe, expect, it } from 'vitest';
import { api, apiNames } from '@site/content/api';
import { findDoc } from '@site/content/docs/index';

describe('api', () => {
  it('documents every runtime export of the package, and nothing else', () => {
    expect([...apiNames()].sort()).toEqual(Object.keys(library).sort());
  });

  it('lists each export once', () => {
    expect(new Set(apiNames()).size).toBe(apiNames().length);
  });

  it('points every entry at a page that exists and describes it', () => {
    Object.values(api)
      .flat()
      .forEach((entry) => {
        expect(findDoc(entry.page), entry.name).toBeDefined();
        expect(entry.summary.endsWith('.'), entry.name).toBe(true);
      });
  });
});
