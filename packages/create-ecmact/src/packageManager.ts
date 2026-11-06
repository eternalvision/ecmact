export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

const known: PackageManager[] = ['pnpm', 'yarn', 'bun', 'npm'];

export const detectPackageManager = (userAgent: string | undefined): PackageManager => {
  const name = userAgent?.split(' ')[0]?.split('/')[0];
  return known.find((candidate) => candidate === name) ?? 'npm';
};

export const installCommand = (manager: PackageManager) => `${manager} install`;

export const runCommand = (manager: PackageManager, script: string) =>
  manager === 'npm' || manager === 'bun' ? `${manager} run ${script}` : `${manager} ${script}`;
