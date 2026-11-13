import { callout, h2, p, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** What the library does and does not protect you from. */
export const page: DocPage = {
  slug: 'security',
  title: 'Security model',
  summary:
    'What is safe by default, the one raw-HTML entry point, and where validation is your job.',
  group: 'Reference',
  blocks: [
    p(
      'ECMact writes text, attributes and styles through DOM APIs, never through string concatenation into HTML. That makes the default path safe from markup injection. The places where it is not are few and explicit.',
    ),
    h2('Safe by default'),
    ul(
      'Text children are inserted as text nodes; markup in them is inert. That holds for strings, numbers and what reactive children return.',
      'Attribute values are set through `setAttribute` and `style` values through the CSSOM, so they cannot break out of an attribute or a declaration.',
      '`on*` props accept only functions. A string such as `onclick="..."` is never evaluated.',
    ),
    h2('Yours to handle'),
    ul(
      '`html` is the one raw-HTML entry point. It uses `innerHTML` and does not sanitize. Pass only markup you control, or sanitize it first, for example with DOMPurify.',
      'The tag decides which element is created. `tags[name]` and the `as` prop of a styled component cannot inject markup, but the name should not come from untrusted input (`script`, `iframe`).',
      'Attributes that carry URLs (`href`, `src`, `action`) are set as given and `javascript:` URLs are not filtered. Validate user-supplied URLs.',
      'Stylesheet text is used as written: the `css` prop, the `css` option of a widget and the templates of `styled`. Do not build it from untrusted input.',
      'Client-side [route guards](/docs/routing) do not enforce authorization. Enforce permissions on the server.',
      "A third-party [widget](/docs/widgets) script runs with the host page's privileges. Shadow DOM isolates markup and styling; it is not a sandbox for untrusted scripts.",
    ),
    callout(
      'tip',
      'Found something that violates these boundaries? Report it privately through the [security policy](https://github.com/eternalvision/ecmact/security/policy).',
    ),
  ],
};
