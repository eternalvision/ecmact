export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

const known: PackageManager[] = ['pnpm', 'yarn', 'bun', 'npm'];

/**
 * Detects the package manager that started the scaffolder from the `npm_config_user_agent` variable.
 *
 * @param userAgent - The value of `npm_config_user_agent`.
 * @returns The package manager, `npm` if it cannot be told.
 */
export const detectPackageManager = (userAgent: string | undefined): PackageManager => {
  const name = userAgent?.split(' ')[0]?.split('/')[0];
  return known.find((candidate) => candidate === name) ?? 'npm';
};

/**
 * Builds the command that installs dependencies.
 *
 * @param manager - The package manager.
 * @returns The command, for example `pnpm install`.
 */
export const installCommand = (manager: PackageManager) => `${manager} install`;

/**
 * Builds the command that runs a package script. npm and bun need `run`, the others do not.
 *
 * @param manager - The package manager.
 * @param script - The script name.
 * @returns The command, for example `npm run dev`.
 */
export const runCommand = (manager: PackageManager, script: string) =>
  manager === 'npm' || manager === 'bun' ? `${manager} run ${script}` : `${manager} ${script}`;
