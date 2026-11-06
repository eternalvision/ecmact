import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyButton } from '@site/ui/copyButton';

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
    const button = copyButton('npm i', 'code-copy');
    document.body.append(button);
    const inner = button.querySelector('button')!;
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
    const button = copyButton('x', 'c');
    document.body.append(button);
    const inner = button.querySelector('button')!;
    inner.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(inner.textContent).toBe('Failed');
  });
});
