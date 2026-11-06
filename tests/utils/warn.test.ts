import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { configure, resetConfig } from '@em/config';
import { resetWarnings, warn } from '@em/utils/warn';

let spy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  spy.mockRestore();
  resetConfig();
  resetWarnings();
});

describe('warn', () => {
  it('logs the message with a prefix', () => {
    warn('something is off');
    expect(spy).toHaveBeenCalledWith('ecmact: something is off');
  });

  it('logs each distinct message once', () => {
    warn('a');
    warn('a');
    warn('b');
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('is silent when warnings are disabled', () => {
    configure({ warnings: false });
    warn('a');
    expect(spy).not.toHaveBeenCalled();
  });

  it('can warn about a message again after resetWarnings', () => {
    warn('a');
    resetWarnings();
    warn('a');
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('does not remember messages that were suppressed', () => {
    configure({ warnings: false });
    warn('a');
    configure({ warnings: true });
    warn('a');
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
