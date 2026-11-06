import { basename, resolve } from 'node:path';
import type { Readable, Writable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { helpText, parseArguments } from '@create/args';
import { detectPackageManager, installCommand, runCommand } from '@create/packageManager';
import { createPrompter } from '@create/prompts';
import { isEmptyDirectory, scaffold, toPackageName, type Template } from '@create/scaffold';

/** Everything the scaffolder reads from and writes to, injected so it can be tested. */
export interface Io {
  /** The directory relative paths are resolved against. */
  cwd: string;
  /** The environment variables. */
  env: Record<string, string | undefined>;
  /** Where the answers come from. */
  stdin: Readable;
  /** Where output and questions are written. */
  stdout: Writable;
  /** Where errors are written. */
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

    const answer =
      options.template ??
      (options.yes ? 'app' : await prompter.ask('Template: app or widget', 'app'));
    if (answer !== 'app' && answer !== 'widget') {
      io.stderr.write(`Unknown template "${answer}". Use app or widget.\n`);
      return 1;
    }
    const template: Template = answer;

    if (template === 'widget' && options.tailwind === true) {
      io.stderr.write('The widget template does not support Tailwind CSS.\n');
      return 1;
    }

    const tailwind =
      template === 'app' &&
      (options.tailwind ??
        (options.yes ? false : await prompter.confirm('Add Tailwind CSS?', false)));

    await scaffold({
      templateRoot,
      target,
      name,
      tailwind,
      template,
      ecmactVersion: __ECMACT_VERSION__,
    });

    const manager = detectPackageManager(io.env.npm_config_user_agent);
    const steps = [
      ...(directory === '.' ? [] : [`cd ${directory}`]),
      installCommand(manager),
      runCommand(manager, 'dev'),
    ];
    const kind = template === 'widget' ? ' widget' : '';
    io.stdout.write(
      `\nCreated${kind} ${name}${tailwind ? ' with Tailwind CSS' : ''}.\n\nNext steps:\n`,
    );
    io.stdout.write(`${steps.map((step) => `  ${step}`).join('\n')}\n`);
    return 0;
  } finally {
    prompter.close();
  }
};
