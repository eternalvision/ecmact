/// <reference types="node" />
import { chromium, firefox, webkit, type BrowserType } from 'playwright';

/** The engines the browser tests run in, by the name of their Vitest project. */
const engines: Record<string, BrowserType> = { chromium, firefox, webkit };

/**
 * Checks that the Playwright build of an engine can start headless, the way the browser tests start it.
 * A missing engine ends the process with a non-zero code and names the command that installs it.
 *
 * @param name - The engine: `chromium`, `firefox` or `webkit`.
 * @returns A promise that settles once the engine has started and closed.
 */
const checkBrowser = async (name: string): Promise<void> => {
  const engine = engines[name];
  if (engine == null) {
    console.error(`unknown engine "${name}", expected one of: ${Object.keys(engines).join(', ')}`);
    process.exit(1);
  }
  try {
    const browser = await engine.launch({ headless: true });
    await browser.close();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Executable doesn't exist")) {
      console.error(`${name} is not installed for playwright. Run: npm run browsers:install`);
    } else {
      console.error(`${name} could not start: ${message}`);
    }
    process.exit(1);
  }
};

await checkBrowser(process.argv[2] ?? '');
