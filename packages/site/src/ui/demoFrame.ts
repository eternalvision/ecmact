import { computed, signal } from 'ecmact';
import { view, tag } from '@site/lib/component';
import { el } from '@site/lib/dom';
import type { Demo } from '@site/demos/index';
import { CodeBlock } from '@site/ui/codeBlock';

/**
 * A live demo with its source. The tabs switch between running it and reading the code that makes it.
 *
 * @param demo - The demo.
 * @returns The component.
 */
export const DemoFrame = (demo: Demo) => {
  const tab = signal<'run' | 'code'>('run');

  /**
   * Makes a tab button that selects its panel.
   *
   * @param name - Which panel it selects.
   * @param label - Its text.
   * @returns The button.
   */
  const tabButton = (name: 'run' | 'code', label: string) =>
    tag('button', {
      type: 'button',
      class: 'tab',
      role: 'tab',
      content: label,
      'aria-selected': computed(() => String(tab.value === name)),
      /**
       * Shows the panel of this tab.
       */
      onclick: () => {
        tab.value = name;
      },
    });

  return view('DemoFrame', {
    tag: 'section',
    class: 'demo',
    'aria-label': demo.title,
    children: [
      el(
        'header',
        { class: 'demo-head' },
        el('h3', {}, demo.title),
        view('Tabs', {
          class: 'tabs',
          role: 'tablist',
          children: [tabButton('run', 'Run'), tabButton('code', 'Code')],
        }),
      ),
      el('p', { class: 'demo-note' }, demo.description),
      view('Run', {
        class: 'demo-run',
        role: 'tabpanel',
        hidden: computed(() => tab.value !== 'run'),
        children: [demo.create()],
      }),
      view('Source', {
        class: 'demo-source',
        role: 'tabpanel',
        hidden: computed(() => tab.value !== 'code'),
        children: [CodeBlock({ code: demo.source, language: 'ts', title: `${demo.id}.ts` })],
      }),
    ],
  });
};
