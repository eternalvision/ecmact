import { describe, expect, it } from 'vitest';
import { helpText, parseArguments } from '@create/args';

describe('parseArguments', () => {
  it('has no name and no choices by default', () => {
    expect(parseArguments([])).toEqual({
      name: undefined,
      tailwind: undefined,
      yes: false,
      force: false,
      help: false,
    });
  });

  it('takes the first positional argument as the name', () => {
    expect(parseArguments(['my-app', 'ignored']).name).toBe('my-app');
  });

  it('reads the tailwind flag and its negation', () => {
    expect(parseArguments(['--tailwind']).tailwind).toBe(true);
    expect(parseArguments(['--no-tailwind']).tailwind).toBe(false);
  });

  it('reads the long and short flags', () => {
    expect(parseArguments(['--yes', '--force', '--help'])).toMatchObject({
      yes: true,
      force: true,
      help: true,
    });
    expect(parseArguments(['-y', '-f', '-h'])).toMatchObject({
      yes: true,
      force: true,
      help: true,
    });
  });
});

describe('helpText', () => {
  it('documents every option', () => {
    for (const flag of ['--tailwind', '--no-tailwind', '--yes', '--force', '--help']) {
      expect(helpText).toContain(flag);
    }
  });
});
