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
      'ECMact writes content, attributes and styles through DOM APIs, never through string concatenation into HTML. That makes the default path safe from markup injection. The places where it is not are few and explicit.',
    ),
    h2('Safe by default'),
    ul(
      '`content` is inserted as a text node; markup in it is inert.',
      'Attribute and style values are set through `setAttribute` and the CSSOM, so they cannot break out of an attribute or a `<style>` block.',
      '`on*` props accept only functions. A string such as `onclick="..."` is never evaluated.',
    ),
    h2('Yours to handle'),
    ul(
      '`html` is the one raw-HTML entry point. It uses `innerHTML` and does not sanitize. Pass only markup you control, or sanitize it first, for example with DOMPurify.',
      '`tag` decides which element is created. It cannot inject markup but should not come from untrusted input (`script`, `iframe`).',
      'Attributes that carry URLs (`href`, `src`, `action`) are set as given and `javascript:` URLs are not filtered. Validate user-supplied URLs.',
      'Client-side [route guards](/docs/routing) do not enforce authorization. Enforce permissions on the server.',
      "A third-party [widget](/docs/widgets) script runs with the host page's privileges. Shadow DOM isolates markup and styling; it is not a sandbox for untrusted scripts.",
    ),
    callout(
      'tip',
      'Found something that violates these boundaries? Report it privately through the [security policy](https://github.com/eternalvision/ecmact/security/policy).',
    ),
  ],
};
