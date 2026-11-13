import { inject, type TestOptions } from 'vitest';

/** An engine of the browser run, by the name of its Vitest project. */
export type Engine = 'chromium' | 'firefox' | 'webkit';

declare module 'vitest' {
  interface ProvidedContext {
    /** The engine of the browser run, set per instance in `vite.config.ts`; absent in the happy-dom run. */
    engine?: Engine;
  }
}

/** A test that fails in one engine because of a defect of the library, recorded as a GitHub issue (K01). */
export interface KnownFailure {
  /** The number of the GitHub issue that describes the defect. */
  issue: number;
  /** The engine in which the test fails. */
  engine: Engine;
  /** The test file, relative to `tests/`. */
  file: string;
  /** The name of the test, as written in `it`. */
  test: string;
}

/**
 * Every known failure of the suite, the one place where they are listed (K03).
 * `npm run test:structure` checks that each entry is used by exactly one test of its file.
 */
export const knownFailures: KnownFailure[] = [];

/**
 * Returns the options of a test that is expected to fail in the engine of its registry entry (K02):
 * `{ fails: true }` in that engine, so the run fails once the test passes, and `{}` elsewhere,
 * including the happy-dom run.
 *
 * @example
 * it('name', knownFailure(12), () => { ... });
 *
 * @param issue - The number of the GitHub issue, as in the registry.
 * @returns The options to pass to `it` or `test`.
 * @throws When the registry has no entry for the issue.
 */
export const knownFailure = (issue: number): TestOptions => {
  const entry = knownFailures.find((item) => item.issue === issue);
  if (entry == null)
    throw new Error(`knownFailure(${issue}) has no entry in tests/knownFailures.ts`);
  return entry.engine === inject('engine') ? { fails: true } : {};
};
