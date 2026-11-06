import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { createPrompter } from '@create/cli/prompts';

const setup = (...lines: string[]) => {
  const input = new PassThrough();
  const output = new PassThrough();
  lines.forEach((line) => input.write(`${line}\n`));
  const prompter = createPrompter(input, output);
  return { input, output, prompter };
};

describe('createPrompter', () => {
  it('returns the answer', async () => {
    const { prompter } = setup('my-app');
    expect(await prompter.ask('Name', 'default')).toBe('my-app');
    prompter.close();
  });

  it('trims the answer', async () => {
    const { prompter } = setup('  spaced  ');
    expect(await prompter.ask('Name', 'default')).toBe('spaced');
    prompter.close();
  });

  it('uses the fallback for an empty answer', async () => {
    const { prompter } = setup('');
    expect(await prompter.ask('Name', 'default')).toBe('default');
    prompter.close();
  });

  it('uses the fallback when the input has ended', async () => {
    const { input, prompter } = setup();
    input.end();
    expect(await prompter.ask('Name', 'default')).toBe('default');
    prompter.close();
  });

  it('prints the question with its default', async () => {
    const { output, prompter } = setup('x');
    await prompter.ask('Name', 'default');
    expect(output.read().toString()).toBe('Name (default) ');
    prompter.close();
  });

  it('asks several questions in a row from piped input', async () => {
    const { prompter } = setup('first', 'second');
    expect(await prompter.ask('A', 'a')).toBe('first');
    expect(await prompter.ask('B', 'b')).toBe('second');
    prompter.close();
  });

  it('confirms with yes and y, in any case', async () => {
    const { prompter } = setup('y', 'YES', 'Yes');
    expect(await prompter.confirm('Ok?', false)).toBe(true);
    expect(await prompter.confirm('Ok?', false)).toBe(true);
    expect(await prompter.confirm('Ok?', false)).toBe(true);
    prompter.close();
  });

  it('declines with anything else', async () => {
    const { prompter } = setup('n', 'no', 'maybe');
    expect(await prompter.confirm('Ok?', true)).toBe(false);
    expect(await prompter.confirm('Ok?', true)).toBe(false);
    expect(await prompter.confirm('Ok?', true)).toBe(false);
    prompter.close();
  });

  it('uses the default for an empty confirmation', async () => {
    const { prompter } = setup('', '');
    expect(await prompter.confirm('Ok?', true)).toBe(true);
    expect(await prompter.confirm('Ok?', false)).toBe(false);
    prompter.close();
  });

  it('shows the default choice in the prompt', async () => {
    const { output, prompter } = setup('', '');
    await prompter.confirm('Ok?', true);
    await prompter.confirm('Ok?', false);
    expect(output.read().toString()).toBe('Ok? [Y/n] (y) Ok? [y/N] (n) ');
    prompter.close();
  });
});
