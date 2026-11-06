import { getConfig } from '@em/config';

const seen = new Set<string>();

/**
 * Logs a development warning once per distinct message, unless warnings are turned off.
 *
 * @param message - The message, without a prefix.
 */
export const warn = (message: string) => {
  if (!getConfig().warnings || seen.has(message)) return;
  seen.add(message);
  console.warn(`ecmact: ${message}`);
};

/**
 * Forgets the messages that were logged. Meant for tests.
 */
export const resetWarnings = () => {
  seen.clear();
};
