import { afterEach, describe, expect, it } from 'vitest';
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
