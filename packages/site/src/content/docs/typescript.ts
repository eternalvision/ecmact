import { callout, code, p, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** The types: props typed by tag, events, styles, elements. */
export const page: DocPage = {
  slug: 'typescript',
  title: 'TypeScript',
  summary: 'Props, attributes and events typed per tag, so most mistakes are compile errors.',
  group: 'Reference',
  blocks: [
    p(
      'The package ships its own declarations. Props are typed by the inner tag, which is inferred from the `tag` prop and defaults to `div`.',
    ),
    code(
      'ts',
      `
const link = em.Link({ tag: 'a', href: '/docs', target: '_blank' });

em.Link({ tag: 'a', src: 'x.png' });
em.Field({ tag: 'input', type: 'bogus' });
em.Card({ onclik: () => {} });
`,
    ),
    p(
      'The last three calls are compile errors: `src` is not an attribute of `a`, `"bogus"` is not an input type, and `onclik` is not an event.',
    ),
    ul(
      '**Return type.** `em.X({ tag: "a" })` is `Component<"a">`; `setState` accepts `Partial<ComponentProps<"a">>`.',
      '**Attributes by tag.** Global attributes plus `data-*` and `aria-*` apply to every tag. Tag-specific attributes are defined for forms, media, tables, links, dialogs and more. Attribute value types follow HTML: booleans for boolean attributes, numbers for numeric ones, string unions for enumerated ones.',
      '**Custom tags.** A tag that is not a standard HTML tag accepts any attribute.',
      '**Events.** `on<event>` props are typed from `HTMLElementEventMap`; the handler receives the right event.',
      '**Styles.** `style` accepts the string-valued properties of `CSSStyleDeclaration`, with `string | number` values.',
      '**`ref` and hooks.** The element type follows the tag: `HTMLInputElement` for `"input"`.',
      '**Signals everywhere.** Where a prop takes a value it also takes a signal of it.',
    ),
    callout(
      'tip',
      'When the tag is not known at compile time, widen it to `string`: props become permissive and `setState({ tag })` accepts any tag.',
    ),
    code(
      'ts',
      `
const dynamic = em.Dynamic({ tag: tagName as string, content: 'x' });
dynamic.setState({ tag: 'section' });
`,
    ),
  ],
};
