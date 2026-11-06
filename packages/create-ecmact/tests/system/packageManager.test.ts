import { describe, expect, it } from 'vitest';
import { detectPackageManager, installCommand, runCommand } from '@create/system/packageManager';

describe('detectPackageManager', () => {
  it('reads the manager from the user agent', () => {
    expect(detectPackageManager('pnpm/9.1.0 npm/? node/v22.0.0 linux x64')).toBe('pnpm');
    expect(detectPackageManager('yarn/4.0.0 npm/? node/v22.0.0')).toBe('yarn');
    expect(detectPackageManager('bun/1.1.0 npm/? node/v22.0.0')).toBe('bun');
    expect(detectPackageManager('npm/10.9.0 node/v22.0.0')).toBe('npm');
  });

  it('falls back to npm', () => {
    expect(detectPackageManager(undefined)).toBe('npm');
    expect(detectPackageManager('')).toBe('npm');
    expect(detectPackageManager('deno/2.0.0')).toBe('npm');
  });
});

describe('installCommand', () => {
  it('installs with the same manager', () => {
    expect(installCommand('npm')).toBe('npm install');
    expect(installCommand('pnpm')).toBe('pnpm install');
  });
});

describe('runCommand', () => {
  it('uses "run" for npm and bun', () => {
    expect(runCommand('npm', 'dev')).toBe('npm run dev');
    expect(runCommand('bun', 'dev')).toBe('bun run dev');
  });

  it('runs scripts directly for pnpm and yarn', () => {
    expect(runCommand('pnpm', 'dev')).toBe('pnpm dev');
    expect(runCommand('yarn', 'dev')).toBe('yarn dev');
  });
});
