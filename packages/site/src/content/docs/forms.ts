import { callout, code, demo, h2, p, table, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** Form controls: two-way binding, live values and form-associated fields. */
export const page: DocPage = {
  slug: 'forms',
  title: 'Forms',
  summary:
    'Two-way binding with bind, live control values, and fields that reach the form across a Shadow DOM.',
  group: 'Core',
  blocks: [
    h2('Two-way binding'),
    p(
      '`bind` ties an `input`, a `select` or a `textarea` to a signal both ways: the control shows the signal, and what the user enters is written to it. No `oninput` handler is needed.',
    ),
    code(
      'ts',
      `
import { mount, signal, tags } from 'ecmact';

const { input, label, option, p, select } = tags;

const name = signal('');
const age = signal(30);
const agree = signal(false);
const plan = signal('free');

mount(
  '#app',
  input({ placeholder: 'Name', bind: name }),
  input({ type: 'number', bind: age }),
  label(input({ type: 'checkbox', bind: agree }), ' I agree'),
  select({ bind: plan }, option({ value: 'free' }, 'Free'), option({ value: 'pro' }, 'Pro')),
  p(() => \`\${name.value}, \${age.value}, \${plan.value}, \${agree.value ? 'agreed' : 'not agreed'}\`),
);
`,
    ),
    table(
      ['Control', 'Signal'],
      ['Text `input`, `textarea`, `select`', '`Signal<string>`'],
      ['`input` of type `checkbox`', '`Signal<boolean>`'],
      [
        '`input` of type `radio`',
        '`Signal<string>`: the button is checked when its `value` equals the signal.',
      ],
      [
        '`input` of type `number` or `range`',
        '`Signal<number>` if the signal holds a number, text otherwise. An empty field gives `NaN`.',
      ],
      ['`select` with `multiple`', '`Signal<string[]>`: the values of the selected options.'],
    ),
    p(
      'Text that the control already shows is not written again, so the cursor stays where the user is typing.',
    ),
    h2('Live values'),
    p(
      'Without `bind`, `value`, `checked`, `selected` and `indeterminate` are written as DOM properties, so they keep working after the user has interacted with the control. An attribute alone only sets the default. The attribute is still set for `value`, `checked` and `selected`, so selectors such as `[checked]` match.',
    ),
    code(
      'ts',
      `
import { mount, signal, tags } from 'ecmact';

const { button, input } = tags;

const query = signal('');

mount(
  '#app',
  input({
    value: query,
    oninput: (event) => (query.value = (event.target as HTMLInputElement).value.toUpperCase()),
  }),
  button({ onclick: () => (query.value = '') }, 'Clear'),
);
`,
    ),
    ul(
      'A plain value is written once, when the element is created. A signal or a function is written again whenever it changes.',
      'Properties are applied after the children, so a `select` can take a `value` that matches one of its options.',
    ),
    h2('Fields inside a component'),
    p(
      'A control inside a Shadow DOM does not take part in the submission or validation of the `<form>` around it. Set `field: true` on the component and it becomes a form-associated custom element: the form sees its `name` and the value and validity of the first `input`, `select` or `textarea` inside it.',
    ),
    demo('form'),
    code(
      'ts',
      `
import { em, mount, tags } from 'ecmact';

const { button, form, input, label } = tags;

const email = em.EmailField(
  { field: true, name: 'email', css: 'input { padding: 8px; }' },
  input({ type: 'email', required: true }),
);

const agree = em.AgreeField({ field: true, name: 'agree' }, input({ type: 'checkbox', value: 'yes' }));

mount(
  '#app',
  form(
    {
      onsubmit: (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget as HTMLFormElement);
        console.log(Object.fromEntries(data));
      },
    },
    email,
    label(agree, ' I agree'),
    button('Sign up'),
  ),
);
`,
    ),
    ul(
      '`name` and `disabled` are props of the component: they are set on the custom element, where forms look for them. `required`, `pattern`, `minlength` and the other constraints are evaluated on the control inside, and the form reports them as for a native one.',
      'A checkbox or a radio contributes its value only while checked. A multiple `select` contributes every selected option.',
      '`form.reset()` puts the control back to its default, and a disabled `<fieldset>` disables it.',
      'A control with `bind` tells the field when the signal changed it, so the form always has the current value.',
    ),
    callout(
      'note',
      '`field` needs `ElementInternals`. Labels with `for` and `id` do not cross the shadow boundary: put the component inside the `<label>`, where a click on the label is forwarded to the control, or use `aria-label`. A component with `shadow: false` and plain elements need none of this: their controls are in the form already.',
    ),
  ],
};
