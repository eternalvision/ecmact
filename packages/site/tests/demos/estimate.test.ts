import * as ecmact from 'ecmact';
import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { create, entryName, entryPath, markup, markupName, source } from '@site/demos/estimate';

afterEach(() => {
  document.body.replaceChildren();
});

/**
 * Runs the displayed entry file as a visitor's starter would: with its import resolved to the library and its mount
 * target `#app` in the page.
 *
 * @returns The `#app` element the file mounted into.
 */
const runSource = () => {
  document.body.innerHTML = markup.split('\n')[0]!;
  const body = source.replace(/^import \{([^}]*)\} from 'ecmact';/, 'const {$1} = ecmact;');
  new Function('ecmact', body)(ecmact);
  return document.querySelector('#app')!;
};

describe('estimate example', () => {
  it('names the files that the page shows', () => {
    expect(entryName).toBe('main.ts');
    expect(entryPath).toBe('src/main.ts');
    expect(markupName).toBe('index.html');
    expect(markup).toContain('<div id="app"></div>');
    expect(markup).toContain(`src="/${entryPath}"`);
  });

  it("promises only what the starter's index.html has: the mount target and the entry file", () => {
    const starter = readFileSync(
      resolve(import.meta.dirname, '../../../create-ecmact/template/base/index.html'),
      'utf8',
    );
    expect(starter).toContain('<div id="app"></div>');
    expect(starter).toContain(`<script type="module" src="/${entryPath}"></script>`);
    markup.split('\n').forEach((line) => expect(starter).toContain(line));
  });

  it('starts at the sample estimate and adds an hour for each press', () => {
    const demo = create();
    document.body.append(demo);
    const output = demo.querySelector('output')!;
    expect(output.textContent).toBe('$49');
    demo.querySelector('button')!.click();
    demo.querySelector('button')!.click();
    expect(output.textContent).toBe('$147');
  });

  it('behaves like the entry file it displays', () => {
    const shown = runSource();
    const running = create();
    document.body.append(running);
    const read = (root: Element) => ({
      output: root.querySelector('output')!.textContent,
      button: root.querySelector('button')!.textContent,
    });
    expect(read(shown)).toEqual(read(running));
    expect(shown.innerHTML).toBe(running.innerHTML);
    [shown, running].forEach((root) => {
      root.querySelector('button')!.click();
      root.querySelector('button')!.click();
    });
    expect(read(shown)).toEqual(read(running));
    expect(shown.innerHTML).toBe(running.innerHTML);
    expect(read(shown).output).toBe('$147');
  });

  it('shows source that has the public import, the mount target and no prompts or line labels', () => {
    expect(source).toContain("from 'ecmact'");
    expect(source).toContain("mount('#app',\n  tags.button(");
    expect(source).not.toMatch(/^\s*(\$|\d+[.:|])\s/m);
  });
});
