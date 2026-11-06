import { getConfig } from '../config';

const seen = new Set<string>();

export const warn = (message: string) => {
  if (!getConfig().warnings || seen.has(message)) return;
  seen.add(message);
  console.warn(`ecmact: ${message}`);
};

export const resetWarnings = () => seen.clear();
