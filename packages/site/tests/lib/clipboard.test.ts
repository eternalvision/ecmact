import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyText } from '@site/lib/clipboard';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('copyText', () => {
  it('uses the async clipboard when there is one', async () => {
    const writeText = vi.fn(async () => {});
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    expect(await copyText('hello')).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('falls back to a text area and removes it again', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: () => Promise.reject(new Error('denied')) },
    });
    document.execCommand = vi.fn(() => true);
    expect(await copyText('hello')).toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith('copy');
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('reports a failure when nothing can copy', async () => {
    vi.stubGlobal('navigator', {});
    document.execCommand = vi.fn(() => false);
    expect(await copyText('x')).toBe(false);
  });

  it('reports a failure where execCommand does not exist', async () => {
    vi.stubGlobal('navigator', {});
    (document as { execCommand?: unknown }).execCommand = undefined;
    expect(await copyText('x')).toBe(false);
  });
});
