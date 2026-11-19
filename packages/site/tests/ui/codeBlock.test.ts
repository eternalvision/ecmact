import { afterEach, describe, expect, it, vi } from 'vitest';
import { CodeBlock, highlighted } from '@site/ui/codeBlock';

afterEach(() => {
  document.body.replaceChildren();
});

describe('highlighted', () => {
  it('wraps tokens in spans by kind and keeps plain text bare', () => {
    const pre = highlighted("const a = 'x';", 'ts');
    expect(pre.localName).toBe('pre');
    expect(pre.getAttribute('tabindex')).toBe('0');
    expect(pre.querySelector('code')?.className).toBe('language-ts');
    expect(pre.querySelector('.tok-keyword')?.textContent).toBe('const');
    expect(pre.querySelector('.tok-string')?.textContent).toBe("'x'");
    expect(pre.textContent).toBe("const a = 'x';");
  });
});

describe('CodeBlock', () => {
  it('shows the title and the code with a copy button', () => {
    const block = CodeBlock({ code: 'npm i ecmact', language: 'bash', title: 'install' });
    document.body.append(block);
    expect(block.localName).toBe('figure');
    expect(block.className).toBe('code');
    expect(block.querySelector('figcaption .code-title')?.textContent).toBe('install');
    expect(block.querySelector('pre')?.textContent).toBe('npm i ecmact');
    expect(block.querySelector('.code-copy')).not.toBeNull();
  });

  it('uses the language as the title when there is none', () => {
    const block = CodeBlock({ code: 'a', language: 'ts' });
    expect(block.querySelector('.code-title')?.textContent).toBe('ts');
  });
});

describe('CodeBlock content', () => {
  it('shows markup as text, not as elements', () => {
    const html = '<div id="app"></div>\n<script type="module" src="/src/main.ts"></script>';
    const block = CodeBlock({ code: html, language: 'html', title: 'index.html' });
    document.body.append(block);
    expect(block.querySelector('pre')?.textContent).toBe(html);
    expect(block.querySelector('pre #app')).toBeNull();
    expect(block.querySelector('pre script')).toBeNull();
    expect(block.querySelector('.tok-tag')?.textContent).toBe('<div');
  });

  it('keeps a long TypeScript line whole, in a panel that can be focused and scrolled', () => {
    const line = `const label = \`${'word '.repeat(60)}$\${count}\`;`;
    const block = CodeBlock({ code: line, language: 'ts', title: 'long.ts' });
    document.body.append(block);
    const pre = block.querySelector('pre')!;
    expect(pre.textContent).toBe(line);
    expect(pre.textContent).not.toContain('\n');
    pre.focus();
    expect(document.activeElement).toBe(pre);
  });

  it('copies the code exactly, with no line labels or prompt', async () => {
    const writeText = vi.fn(async () => {});
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const code = "const a = 1;\nconst b = '<b>';";
    const block = CodeBlock({ code, language: 'ts' });
    document.body.append(block);
    block.querySelector<HTMLButtonElement>('.code-copy')!.click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith(code));
    vi.unstubAllGlobals();
  });
});
