import { callout, code, demo, h2, p, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** Form controls: live values and form-associated fields. */
export const page: DocPage = {
  slug: 'forms',
  title: 'Forms',
  summary:
    'Live form values, and fields that take part in the form around them across the Shadow DOM.',
  group: 'Core',
  blocks: [
    h2('Form controls'),
    p(
      '`value`, `checked`, `selected` and `indeterminate` are written as DOM properties, so they keep working after the user has interacted with the control. An attribute only sets the default. The attribute is still set for `value`, `checked` and `selected`, so selectors such as `[checked]` match.',
    ),
    code(
      'ts',
      `
const name = signal('');

tags.input({
  value: name,
  oninput: (event) => (name.value = (event.target as HTMLInputElement).value),
});
`,
    ),
    ul(
      'A property is written when its prop **changes**, not on every update. An unrelated update does not reset what the user typed.',
      'To clear a field, change the prop. A prop that was never updated is not rewritten: if you do not track the value in a signal, clear it through a `ref`.',
      'Properties are applied after the children, so a `select` can take a `value` that matches one of its options.',
    ),
    h2('Fields inside a form'),
    p(
      'A control inside a Shadow DOM does not take part in the submission or validation of the `<form>` around it. Set `field: true` on a component with an `input`, `select` or `textarea` tag and it becomes a form-associated custom element: the form sees its `name`, its value and its validity.',
    ),
    demo('form'),
    code(
      'ts',
      `
const email = em.Field({ tag: 'input', type: 'email', name: 'email', required: true, field: true });
const agree = em.Field({ tag: 'input', type: 'checkbox', name: 'agree', value: 'yes', field: true });

form.append(email, agree);
form.checkValidity();
new FormData(form);
`,
    ),
    ul(
      '`name` and `disabled` are copied to the host element, where forms look for them. `required`, `pattern`, `minlength` and the other constraints are evaluated on the inner control, and the form reports them as for a native one.',
      'A checkbox or radio contributes its value only while checked; a multiple `select` contributes every selected option.',
      '`form.reset()` puts the inner control back to its default, and a disabled `<fieldset>` disables it.',
    ),
    callout(
      'note',
      '`field` needs `ElementInternals`. For `select`, give the options through `html`, because the options of a native `select` must be real `option` elements. Labels (`<label for>`) still do not cross the shadow boundary: put the control inside the label (a click on the label is forwarded to the control inside the component) or use `aria-label`.',
    ),
  ],
};
