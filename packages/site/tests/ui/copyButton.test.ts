import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyButton } from '@site/ui/copyButton';
import { resetLocale, useLocale } from '@tests/helpers';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

describe('copyButton', () => {
  it('copies the text and says so for a moment', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn(async () => {});
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const inner = copyButton('npm i', 'code-copy');
    document.body.append(inner);
    expect(inner.localName).toBe('button');
    expect(inner.getAttribute('aria-label')).toBe('Copy to the clipboard');
    expect(inner.textContent).toBe('Copy');
    expect(inner.className).toBe('code-copy');
    inner.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(writeText).toHaveBeenCalledWith('npm i');
    expect(inner.textContent).toBe('Copied');
    await vi.advanceTimersByTimeAsync(1500);
    expect(inner.textContent).toBe('Copy');
  });

  it('says so when copying fails', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('navigator', {});
    document.execCommand = vi.fn(() => false);
    const inner = copyButton('x', 'c');
    document.body.append(inner);
    inner.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(inner.textContent).toBe('Failed');
  });
});

describe('copyButton in Russian', () => {
  it('says so in Russian', async () => {
    await useLocale('ru');
    expect(copyButton('x', 'c').textContent).toBe('Копировать');
    await resetLocale();
  });
});
