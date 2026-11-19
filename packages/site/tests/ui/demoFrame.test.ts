import { mount } from 'ecmact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { demos, findDemo, type Demo } from '@site/demos/index';
import { DemoFrame } from '@site/ui/demoFrame';
import { resetLocale, useLocale } from '@tests/helpers';

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

const exposure = findDemo('exposure')!;

describe('DemoFrame', () => {
  it('shows the title, the description, the stage with the running demo and its source', () => {
    const frame = DemoFrame(exposure);
    mount(document.body, frame);
    expect(frame.querySelector('h3')?.textContent).toBe(exposure.title);
    expect(frame.querySelector('.demo-note')?.textContent).toBe(exposure.description);
    expect(frame.localName).toBe('section');
    expect(frame.getAttribute('aria-label')).toBe(exposure.title);
    expect(frame.querySelector('.stage')?.childElementCount).toBe(1);
    expect(frame.querySelector('.stage-bar')?.textContent).toBe('Live exampletry the keys');
    expect(frame.querySelector('.demo-source pre')?.textContent).toContain('signal');
    expect(frame.querySelector('.demo-since')).toBeNull();
  });

  it('names a tab after each file and switches between the stage and a file', () => {
    const frame = DemoFrame(exposure);
    mount(document.body, frame);
    const [run, code] = [...frame.querySelectorAll<HTMLButtonElement>('.tab')];
    const panels = [...frame.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
    expect([...frame.querySelectorAll('.tab')].map((tab) => tab.textContent)).toEqual([
      'Run',
      'exposure.ts',
    ]);
    expect(frame.querySelector('.code-title')?.textContent).toBe('exposure.ts');
    expect(panels.map((panel) => panel.hidden)).toEqual([false, true]);
    expect(run!.getAttribute('aria-selected')).toBe('true');
    code!.click();
    expect(panels.map((panel) => panel.hidden)).toEqual([true, false]);
    expect(code!.getAttribute('aria-selected')).toBe('true');
    expect(run!.getAttribute('aria-selected')).toBe('false');
    run!.click();
    expect(panels.map((panel) => panel.hidden)).toEqual([false, true]);
  });

  it('gives a demo of several files one tab and one panel for each', () => {
    const many: Demo = {
      ...exposure,
      files: [
        { name: 'exposure.ts', source: "import { signal } from 'ecmact';" },
        { name: 'exposure.css', source: 'a { color: red; }' },
      ],
    };
    const frame = DemoFrame(many);
    mount(document.body, frame);
    const tabs = [...frame.querySelectorAll<HTMLButtonElement>('.tab')];
    const panels = [...frame.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
    expect(tabs.map((tab) => tab.textContent)).toEqual(['Run', 'exposure.ts', 'exposure.css']);
    tabs[2]!.click();
    expect(panels.map((panel) => panel.hidden)).toEqual([true, true, false]);
    expect(panels[2]?.querySelector('pre')?.textContent).toBe('a { color: red; }');
  });

  it('copies a file as it is, without the file name or any label', async () => {
    const writeText = vi.fn(async () => {});
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const frame = DemoFrame(exposure);
    mount(document.body, frame);
    frame.querySelector<HTMLButtonElement>('.code-copy')!.click();
    await Promise.resolve();
    expect(writeText).toHaveBeenCalledWith(exposure.files[0]!.source);
    expect(exposure.files[0]!.source.startsWith('import {')).toBe(true);
  });

  it('shows the note of an example that depends on a patch that is not released', () => {
    const frame = DemoFrame(findDemo('setlist')!);
    expect(frame.querySelector('.demo-since')?.textContent).toContain('next 3.0.x patch');
    expect(DemoFrame(findDemo('customs')!).querySelector('.demo-since')?.textContent).toContain(
      'next 3.0.x patch',
    );
  });

  it('runs every demo of the gallery on its stage', () => {
    demos.forEach((demo) => {
      const frame = DemoFrame(demo);
      expect(frame.querySelector('.stage')?.childElementCount, demo.id).toBe(1);
    });
  });
});

describe('DemoFrame texts', () => {
  it('uses the texts of the language in use', async () => {
    await useLocale('ru');
    const frame = DemoFrame(exposure);
    expect(frame.querySelector('h3')?.textContent).toBe('Треугольник экспозиции');
    expect([...frame.querySelectorAll('.tab')].map((tab) => tab.textContent)).toEqual([
      'Запуск',
      'exposure.ts',
    ]);
    expect(frame.querySelector('.stage-bar')?.textContent).toBe('Живой примерпонажимайте клавиши');
    await resetLocale();
  });

  it('falls back to the texts of the demo when the language has none', () => {
    const frame = DemoFrame({
      ...exposure,
      id: 'unknown',
      title: 'Own',
      description: 'Own text.',
    });
    expect(frame.querySelector('h3')?.textContent).toBe('Own');
    expect(frame.querySelector('.demo-note')?.textContent).toBe('Own text.');
    expect(frame.querySelector('.stage-bar')?.textContent).toBe('Live example');
  });
});
