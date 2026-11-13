import { describe, expect, it } from 'vitest';
import { pageDocument, pageHTMLElement, pageLocation } from '@em/utils/env';

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
