import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { isEmptyDirectory } from '@create/project/files';

let directory: string;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'create-ecmact-'));
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

describe('isEmptyDirectory', () => {
  it('is true for a directory that does not exist', async () => {
    expect(await isEmptyDirectory(join(directory, 'missing'))).toBe(true);
  });

  it('is true for an empty directory', async () => {
    expect(await isEmptyDirectory(directory)).toBe(true);
  });

  it('is false when there are files', async () => {
    await writeFile(join(directory, 'file.txt'), '');
    expect(await isEmptyDirectory(directory)).toBe(false);
  });
});
