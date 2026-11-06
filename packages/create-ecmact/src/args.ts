import { parseArgs } from 'node:util';

export interface Options {
  name: string | undefined;
  tailwind: boolean | undefined;
  yes: boolean;
  force: boolean;
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
      yes: { type: 'boolean', short: 'y' },
      force: { type: 'boolean', short: 'f' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  return {
    name: positionals[0],
    tailwind: values.tailwind,
    yes: values.yes ?? false,
    force: values.force ?? false,
    help: values.help ?? false,
  };
};

export const helpText = `Usage: create-ecmact [directory] [options]

Options:
  --tailwind       Add Tailwind CSS
  --no-tailwind    Do not add Tailwind CSS
  -y, --yes        Use defaults, do not ask questions
  -f, --force      Write into a directory that is not empty
  -h, --help       Show this help
`;
