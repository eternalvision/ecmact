import { signal, tags } from 'ecmact';
import { text } from '@site/content/messages';
import type { Demo } from '@site/demos/index';
import { CodeBlock } from '@site/ui/codeBlock';

const { button, div, h3, header, p, section, span } = tags;

/**
 * A live demo with its source. The tabs switch between the stage, where the demo runs, and one file at a time of
 * the code that makes it.
 *
 * @param demo - The demo.
 * @returns The `section` element.
 */
export const DemoFrame = (demo: Demo) => {
  const m = text();
  const copy: { title: string; description: string; hint?: string; note?: string } = m.demos[
    demo.id
  ] ?? { title: demo.title, description: demo.description };
  const tab = signal('');

  /**
   * Makes a tab button that selects its panel.
   *
   * @param name - Which panel it selects: the empty text for the stage, or the name of a file.
   * @param label - Its text.
   * @returns The button.
   */
  const tabButton = (name: string, label: string) =>
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
  const panel = (name: string, className: string, ...content: Node[]) =>
    div(
      {
        class: className,
        role: 'tabpanel',
        /**
         * Hides the panel while another tab is selected.
         *
         * @returns `true` to hide it.
         */
        hidden: () => tab.value !== name,
      },
      ...content,
    );

  return section(
    { class: 'demo', 'aria-label': copy.title },
    header(
      { class: 'demo-head' },
      h3(copy.title),
      div(
        { class: 'tabs', role: 'tablist' },
        tabButton('', m.code.run),
        demo.files.map((file) => tabButton(file.name, file.name)),
      ),
    ),
    p({ class: 'demo-note' }, copy.description),
    copy.note && p({ class: 'demo-note demo-since' }, copy.note),
    panel(
      '',
      'demo-run',
      div({ class: 'stage-bar' }, span(m.code.stage), copy.hint && span(copy.hint)),
      div({ class: 'stage' }, demo.create()),
    ),
    demo.files.map((file) =>
      panel(
        file.name,
        'demo-source',
        CodeBlock({ code: file.source, language: 'ts', title: file.name }),
      ),
    ),
  );
};
