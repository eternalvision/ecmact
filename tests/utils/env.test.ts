import { describe, expect, it } from 'vitest';
import { leavePage, pageDocument, pageHTMLElement, pageLocation } from '@em/utils/env';

describe('env', () => {
  it('returns the document of the page', () => {
    expect(pageDocument()).toBe(document);
  });

  it('returns the location of the page', () => {
    expect(pageLocation()).toBe(location);
  });

  it('returns the HTMLElement class of the page', () => {
    expect(pageHTMLElement()).toBe(HTMLElement);
  });
});

describe('leavePage', () => {
  it('hands the URL to the location of the page', () => {
    const before = location.href;
    try {
      leavePage('#env-test');
      expect(location.hash).toBe('#env-test');
    } finally {
      history.replaceState(null, '', before);
    }
  });
});
