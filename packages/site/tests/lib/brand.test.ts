import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { brand } from '@site/lib/brand';

const read = (path: string) => readFileSync(resolve(import.meta.dirname, path));

/**
 * Reads the size of a PNG file from its header.
 *
 * @param path - The path of the file, relative to this test.
 * @returns The width and the height.
 */
const pngSize = (path: string) => {
  const bytes = read(path);
  expect(bytes.subarray(1, 4).toString()).toBe('PNG');
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
};

describe('brand geometry', () => {
  it('draws the mark on a 64 unit grid and the lockup with the same height', () => {
    expect(brand.block).toBe('M0 0H64V64H0Z');
    expect(brand.height).toBe(64);
    expect(brand.lockupWidth).toBeGreaterThan(brand.wordOffset);
  });

  it('is the geometry of the favicon file', () => {
    const favicon = read('../../public/favicon.svg').toString();
    expect(favicon).toContain(`d="${brand.block}"`);
    expect(favicon).toContain(`d="${brand.glyph}"`);
    expect(favicon).toContain('prefers-color-scheme:dark');
  });
});

describe('public brand images', () => {
  it('keeps every address that README files, npm and the site already use', () => {
    expect(pngSize('../../public/ecmact-logo.png')).toEqual([1068, 256]);
    expect(pngSize('../../../../public/ecmact-logo.png')).toEqual([1068, 256]);
    expect(pngSize('../../../../public/ecmact-mark.png')).toEqual([256, 256]);
    expect(pngSize('../../../../public/ecmact.png')).toEqual([1024, 1024]);
    expect(pngSize('../../public/favicon.png')).toEqual([256, 256]);
  });

  it('shares the lockup between the README image and the site', () => {
    expect(
      read('../../public/ecmact-logo.png').equals(read('../../../../public/ecmact-logo.png')),
    ).toBe(true);
  });

  it('keeps the lockup proportion that the logo component draws', () => {
    const [width, height] = pngSize('../../public/ecmact-logo.png');
    expect(Math.round((256 * brand.lockupWidth) / brand.height)).toBe(width);
    expect(height).toBe(256);
  });
});
