import { afterEach, describe, expect, it } from 'vitest';
import { announce } from '@site/lib/announce';

afterEach(() => {
  document.body.replaceChildren();
});

describe('announce', () => {
  it('adds one polite status region and writes the message into it', () => {
    announce('Copied');
    announce('Failed');
    const regions = document.querySelectorAll('.sr-status');
    expect(regions).toHaveLength(1);
    expect(regions[0]!.getAttribute('role')).toBe('status');
    expect(regions[0]!.getAttribute('aria-live')).toBe('polite');
    expect(regions[0]!.classList.contains('sr-only')).toBe(true);
    expect(regions[0]!.textContent).toBe('Failed');
  });

  it('clears the message with an empty text', () => {
    announce('Copied');
    announce('');
    expect(document.querySelector('.sr-status')?.textContent).toBe('');
  });
});
