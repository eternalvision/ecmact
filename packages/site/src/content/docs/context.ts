import { code, h2, p, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** Context: values offered to the components below. */
export const page: DocPage = {
  slug: 'context',
  title: 'Context',
  summary: 'Offer a value to everything below a component without passing it through every level.',
  group: 'Core',
  blocks: [
    p(
      'Context hands a value to the components below a provider. It works through a bubbling DOM event, so it needs no registration and crosses the Shadow DOM boundary.',
    ),
    code(
      'ts',
      `
import { consume, createContext, em, provide, signal, tags } from 'ecmact';

const locale = createContext<{ value: string }>('locale');

const app = em.App({
  provide: [provide(locale, { value: 'cs' })],
  children: [
    tags.span({
      mounted: (element) => {
        const found = consume(locale, element);
        element.textContent = found?.value ?? 'en';
      },
    }),
  ],
});
`,
    ),
    h2('How it behaves'),
    ul(
      '`createContext<T>(name)` makes a key. `provide(context, value)` pairs it with a value; pass a list of them in the `provide` prop.',
      '`consume(context, element)` asks the nearest provider above the element and returns its value, or `undefined`.',
      'A provider answers for elements inside it whether or not it is connected, and always uses its current `provide` prop.',
      'The nearest provider wins, so a nested one overrides an outer one for its subtree.',
      'To make a context reactive, provide a **signal**. [Themes](/docs/styled) work that way.',
    ),
  ],
};
