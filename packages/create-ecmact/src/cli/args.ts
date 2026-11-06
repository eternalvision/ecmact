import { parseArgs } from 'node:util';

/** The options read from the command line. */
export interface Options {
  /** The directory to create, if given. */
  name: string | undefined;
  /** Whether to add Tailwind CSS; `undefined` when neither `--tailwind` nor `--no-tailwind` was passed. */
  tailwind: boolean | undefined;
  /** The `--template` value as typed, or `undefined` when it was not passed. */
  template: string | undefined;
  /** Use the defaults and ask nothing. */
  yes: boolean;
  /** Write into a directory that is not empty. */
  force: boolean;
  /** Show the help text. */
  help: boolean;
}

/**
 * Parses the command line of the scaffolder.
 *
 * @param argv - The arguments after the program name.
 * @returns The directory name, if given, and the flags. `tailwind` is `undefined` when neither flag was passed.
 */
export const parseArguments = (argv: string[]): Options => {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    allowNegative: true,
    options: {
      tailwind: { type: 'boolean' },
      template: { type: 'string', short: 't' },
      yes: { type: 'boolean', short: 'y' },
      force: { type: 'boolean', short: 'f' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  return {
    name: positionals[0],
    tailwind: values.tailwind,
    template: values.template,
    yes: values.yes ?? false,
    force: values.force ?? false,
    help: values.help ?? false,
  };
};

/** The text printed by `--help`. */
export const helpText = `Usage: create-ecmact [directory] [options]

Options:
  -t, --template   What to create: app (default) or widget
  --tailwind       Add Tailwind CSS (app only)
  --no-tailwind    Do not add Tailwind CSS
  -y, --yes        Use defaults, do not ask questions
  -f, --force      Write into a directory that is not empty
  -h, --help       Show this help
`;
