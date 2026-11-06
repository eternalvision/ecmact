import { basename, resolve } from 'node:path';
import type { Readable, Writable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { helpText, parseArguments } from '@create/args';
import { detectPackageManager, installCommand, runCommand } from '@create/packageManager';
import { createPrompter } from '@create/prompts';
import { isEmptyDirectory, scaffold, toPackageName } from '@create/scaffold';

export interface Io {
  cwd: string;
  env: Record<string, string | undefined>;
  stdin: Readable;
  stdout: Writable;
  stderr: Writable;
}

const templateRoot = fileURLToPath(new URL('../template', import.meta.url));

/**
 * Runs the scaffolder: reads the options, asks what is missing, writes the project and prints the next steps.
 *
 * @param argv - The arguments after the program name.
 * @param io - The working directory, environment and streams, injected so it can be tested.
 * @returns The exit code: `0` on success, `1` if the target directory is not empty.
 */
export const run = async (argv: string[], io: Io): Promise<number> => {
  const options = parseArguments(argv);
  if (options.help) {
    io.stdout.write(helpText);
    return 0;
  }

  const prompter = createPrompter(io.stdin, io.stdout);
  try {
    const directory =
      options.name ??
      (options.yes ? 'my-ecmact-app' : await prompter.ask('Project name', 'my-ecmact-app'));
    const target = resolve(io.cwd, directory);
    const name = toPackageName(basename(target));

    if (!options.force && !(await isEmptyDirectory(target))) {
      io.stderr.write(`Directory "${directory}" is not empty. Use --force to write into it.\n`);
      return 1;
    }

    const tailwind =
      options.tailwind ??
      (options.yes ? false : await prompter.confirm('Add Tailwind CSS?', false));

    await scaffold({ templateRoot, target, name, tailwind, ecmactVersion: __ECMACT_VERSION__ });

    const manager = detectPackageManager(io.env.npm_config_user_agent);
    const steps = [
      ...(directory === '.' ? [] : [`cd ${directory}`]),
      installCommand(manager),
      runCommand(manager, 'dev'),
    ];
    io.stdout.write(`\nCreated ${name}${tailwind ? ' with Tailwind CSS' : ''}.\n\nNext steps:\n`);
    io.stdout.write(`${steps.map((step) => `  ${step}`).join('\n')}\n`);
    return 0;
  } finally {
    prompter.close();
  }
};
