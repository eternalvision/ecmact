import { mount } from 'ecmact';
import { afterEach, describe, expect, it } from 'vitest';
import { demos } from '@site/demos/index';
import { DemoFrame } from '@site/ui/demoFrame';
import { resetLocale, useLocale } from '@tests/helpers';

afterEach(() => {
  document.body.replaceChildren();
});

describe('DemoFrame', () => {
  it('shows the title, the description, the running demo and its source', () => {
    const frame = DemoFrame(demos[0]!);
    mount(document.body, frame);
    expect(frame.querySelector('h3')?.textContent).toBe(demos[0]!.title);
    expect(frame.querySelector('.demo-note')?.textContent).toBe(demos[0]!.description);
    expect(frame.localName).toBe('section');
    expect(frame.getAttribute('aria-label')).toBe(demos[0]!.title);
    expect(frame.querySelector('.demo-run')?.childElementCount).toBe(1);
    expect(frame.querySelector('.demo-source pre')?.textContent).toContain('signal');
  });

  it('switches between running and reading', () => {
    const frame = DemoFrame(demos[0]!);
    mount(document.body, frame);
    const [run, code] = [...frame.querySelectorAll<HTMLButtonElement>('.tab')];
    const panels = [...frame.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
    expect(panels.map((panel) => panel.hidden)).toEqual([false, true]);
    expect(run!.getAttribute('aria-selected')).toBe('true');
    code!.click();
    expect(panels.map((panel) => panel.hidden)).toEqual([true, false]);
    expect(code!.getAttribute('aria-selected')).toBe('true');
    expect(run!.getAttribute('aria-selected')).toBe('false');
    run!.click();
    expect(panels.map((panel) => panel.hidden)).toEqual([false, true]);
  });
});

describe('DemoFrame texts', () => {
  it('uses the title and the description of the language in use', async () => {
    await useLocale('ru');
    const frame = DemoFrame(demos[0]!);
    expect(frame.querySelector('h3')?.textContent).toBe('Сигналы');
    expect([...frame.querySelectorAll('.tab')].map((tab) => tab.textContent)).toEqual([
      'Запуск',
      'Код',
    ]);
    await resetLocale();
  });

  it('falls back to the texts of the demo when the language has none', () => {
    const frame = DemoFrame({
      ...demos[0]!,
      id: 'unknown',
      title: 'Own',
      description: 'Own text.',
    });
    expect(frame.querySelector('h3')?.textContent).toBe('Own');
    expect(frame.querySelector('.demo-note')?.textContent).toBe('Own text.');
  });
});
