import { signal, tags } from 'ecmact';
import { text } from '@site/content/messages';
import type { Demo } from '@site/demos/index';
import { CodeBlock } from '@site/ui/codeBlock';

const { button, div, h3, header, p, section } = tags;

/**
 * A live demo with its source. The tabs switch between running it and reading the code that makes it.
 *
 * @param demo - The demo.
 * @returns The `section` element.
 */
export const DemoFrame = (demo: Demo) => {
  const m = text();
  const copy = m.demos[demo.id] ?? demo;
  const tab = signal<'run' | 'code'>('run');

  /**
   * Makes a tab button that selects its panel.
   *
   * @param name - Which panel it selects.
   * @param label - Its text.
   * @returns The button.
   */
  const tabButton = (name: 'run' | 'code', label: string) =>
    button(
      {
        type: 'button',
        class: 'tab',
        role: 'tab',
        /**
         * Tells whether the panel of this tab is the one shown.
         *
         * @returns `true` or `false`, as text.
         */
        'aria-selected': () => String(tab.value === name),
        /**
         * Shows the panel of this tab.
         */
        onclick: () => {
          tab.value = name;
        },
      },
      label,
    );

  /**
   * Makes a panel that is shown while its tab is selected.
   *
   * @param name - The tab it belongs to.
   * @param className - The class of the panel.
   * @param content - What the panel holds.
   * @returns The panel.
   */
  const panel = (name: 'run' | 'code', className: string, content: Node) =>
    div(
      {
        class: className,
        role: 'tabpanel',
        /**
         * Hides the panel while the other tab is selected.
         *
         * @returns `true` to hide it.
         */
        hidden: () => tab.value !== name,
      },
      content,
    );

  return section(
    { class: 'demo', 'aria-label': copy.title },
    header(
      { class: 'demo-head' },
      h3(copy.title),
      div(
        { class: 'tabs', role: 'tablist' },
        tabButton('run', m.code.run),
        tabButton('code', m.code.source),
      ),
    ),
    p({ class: 'demo-note' }, copy.description),
    panel('run', 'demo-run', demo.create()),
    panel(
      'code',
      'demo-source',
      CodeBlock({ code: demo.source, language: 'ts', title: `${demo.id}.ts` }),
    ),
  );
};
