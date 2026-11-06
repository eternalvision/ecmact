import { describe, expect, it } from 'vitest';
import { findDoc } from '@site/content/docs/index';
import {
  features,
  featuresFor,
  featuresRu,
  useCases,
  useCasesFor,
  useCasesRu,
} from '@site/content/features';

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

describe('in Russian', () => {
  it('has a title and a text for every card and use case', () => {
    expect(featuresRu).toHaveLength(features.length);
    expect(useCasesRu).toHaveLength(useCases.length);
    [...featuresRu, ...useCasesRu].forEach((item) => {
      expect(item.title).not.toBe('');
      expect(item.text.length).toBeGreaterThan(20);
    });
  });

  it('keeps the icons and the pages when the text is translated', () => {
    const russian = featuresFor('ru');
    expect(russian[0]?.title).toBe('Нативные Web Components');
    russian.forEach((feature, index) => {
      expect(feature.icon).toBe(features[index]!.icon);
      expect(feature.page).toBe(features[index]!.page);
    });
    expect(featuresFor('en')).toBe(features);
  });

  it('picks the use cases of a language', () => {
    expect(useCasesFor('ru')).toBe(useCasesRu);
    expect(useCasesFor('en')).toBe(useCases);
  });
});
