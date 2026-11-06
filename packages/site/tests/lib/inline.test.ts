import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { el } from '@site/lib/dom';
import { parseInline } from '@site/lib/inline';

beforeEach(() => {
  vi.stubEnv('BASE_URL', '/ecmact/');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const render = (text: string) => el('p', {}, ...parseInline(text));

describe('parseInline', () => {
  it('leaves plain text alone', () => {
    expect(render('just text').innerHTML).toBe('just text');
  });

  it('turns backticks into code and double stars into strong', () => {
    expect(render('use `signal()` and **care**').innerHTML).toBe(
      'use <code>signal()</code> and <strong>care</strong>',
    );
  });

  it('turns an internal link into an anchor with the base and a marker', () => {
    const anchor = render('see [signals](/docs/signals)').querySelector('a')!;
    expect(anchor.getAttribute('href')).toBe('/ecmact/docs/signals');
    expect(anchor.dataset.internal).toBe('/docs/signals');
    expect(anchor.hasAttribute('target')).toBe(false);
    expect(anchor.textContent).toBe('signals');
  });

  it('opens an external link in a new tab', () => {
    const anchor = render('[repo](https://github.com/x)').querySelector('a')!;
    expect(anchor.getAttribute('href')).toBe('https://github.com/x');
    expect(anchor.getAttribute('target')).toBe('_blank');
    expect(anchor.getAttribute('rel')).toBe('noreferrer');
    expect(anchor.hasAttribute('data-internal')).toBe(false);
  });

  it('never parses HTML', () => {
    const paragraph = render('<img src=x onerror=alert(1)> **b**');
    expect(paragraph.querySelector('img')).toBeNull();
    expect(paragraph.textContent).toContain('<img');
  });

  it('keeps text that only looks like a link', () => {
    expect(render('a [b] (c)').textContent).toBe('a [b] (c)');
  });

  it('works for an empty string', () => {
    expect(parseInline('')).toEqual([]);
  });
});
