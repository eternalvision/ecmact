import { describe, expect, it } from 'vitest';
import { findDoc } from '@site/content/docs/index';
import { features, useCases } from '@site/content/features';

describe('features', () => {
  it('lead to pages that exist, with an icon and a text', () => {
    features.forEach((feature) => {
      expect(findDoc(feature.page), feature.title).toBeDefined();
      expect(feature.icon.length, feature.title).toBeGreaterThan(0);
      expect(feature.text.length, feature.title).toBeGreaterThan(20);
    });
  });

  it('have unique titles', () => {
    expect(new Set(features.map((feature) => feature.title)).size).toBe(features.length);
  });

  it('come in a number that fills the grid', () => {
    expect(features.length % 4).toBe(0);
  });
});

describe('useCases', () => {
  it('have a title and a text each', () => {
    useCases.forEach((useCase) => {
      expect(useCase.title).not.toBe('');
      expect(useCase.text).not.toBe('');
    });
    expect(useCases).toHaveLength(6);
  });
});
