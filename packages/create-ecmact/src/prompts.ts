import { createInterface } from 'node:readline';
import type { Readable, Writable } from 'node:stream';

/** Asks questions on a stream. */
export interface Prompter {
  /**
   * Asks a question and waits for one line.
   *
   * @param question - The question.
   * @param fallback - The answer for an empty line or the end of the input.
   * @returns The trimmed answer, or the fallback.
   */
  ask(question: string, fallback: string): Promise<string>;
  /**
   * Asks a yes or no question.
   *
   * @param question - The question.
   * @param fallback - The answer for an empty line.
   * @returns `true` for `y` or `yes`, in any case.
   */
  confirm(question: string, fallback: boolean): Promise<boolean>;
  /** Stops reading the input. */
  close(): void;
}

/**
 * Creates a prompter that reads answers line by line from a stream. It works with a terminal and with piped input,
 * and answers with the default once the input has ended.
 *
 * @param input - Where the answers come from.
 * @param output - Where the questions are written.
 * @returns The prompter.
 */
export const createPrompter = (input: Readable, output: Writable): Prompter => {
  const lines = createInterface({ input, terminal: false });
  const iterator = lines[Symbol.asyncIterator]();

  /**
   * Asks a question and waits for one line.
   *
   * @param question - The question.
   * @param fallback - The answer for an empty line or the end of the input.
   * @returns The trimmed answer, or the fallback.
   */
  const ask = async (question: string, fallback: string) => {
    output.write(`${question} (${fallback}) `);
    const { value, done } = await iterator.next();
    const answer = done ? '' : String(value).trim();
    return answer === '' ? fallback : answer;
  };

  return {
    ask,
    /**
     * Asks a yes or no question.
     *
     * @param question - The question.
     * @param fallback - The answer for an empty line.
     * @returns `true` for `y` or `yes`, in any case.
     */
    confirm: async (question, fallback) => {
      const answer = await ask(`${question} [${fallback ? 'Y/n' : 'y/N'}]`, fallback ? 'y' : 'n');
      return ['y', 'yes'].includes(answer.toLowerCase());
    },
    /**
     * Stops reading the input.
     */
    close: () => {
      lines.close();
    },
  };
};
