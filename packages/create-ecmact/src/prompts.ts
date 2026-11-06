import { createInterface } from 'node:readline';
import type { Readable, Writable } from 'node:stream';

export interface Prompter {
  ask(question: string, fallback: string): Promise<string>;
  confirm(question: string, fallback: boolean): Promise<boolean>;
  close(): void;
}

export const createPrompter = (input: Readable, output: Writable): Prompter => {
  const lines = createInterface({ input, terminal: false });
  const iterator = lines[Symbol.asyncIterator]();

  const ask = async (question: string, fallback: string) => {
    output.write(`${question} (${fallback}) `);
    const { value, done } = await iterator.next();
    const answer = done ? '' : String(value).trim();
    return answer === '' ? fallback : answer;
  };

  return {
    ask,
    confirm: async (question, fallback) => {
      const answer = await ask(`${question} [${fallback ? 'Y/n' : 'y/N'}]`, fallback ? 'y' : 'n');
      return ['y', 'yes'].includes(answer.toLowerCase());
    },
    close: () => lines.close(),
  };
};
