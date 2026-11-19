import { em, signal, tags } from 'ecmact';

const { button, div, fieldset, form, h4, input, label, legend, p, pre, span } = tags;

const css = `
  :host {
    display: block;
    position: relative;
    container-type: inline-size;
    color-scheme: light;
    padding: 18px;
    background: #eaf1e6;
    color: #17361f;
    font: 12px/1.4 'Courier New', Courier, monospace;
  }
  h4 {
    margin: 0 0 2px;
    font: 700 13px/1.3 'Times New Roman', Times, serif;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  .no {
    margin: 0 0 10px;
    font-size: 11px;
  }
  label {
    display: block;
    margin-top: 8px;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  fieldset {
    margin: 10px 0 0;
    padding: 6px 10px 8px;
    border: 1px solid #17361f;
  }
  legend {
    padding: 0 4px;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  fieldset:disabled {
    opacity: 0.55;
  }
  fieldset label {
    display: inline-block;
    margin-right: 12px;
  }
  .nothing {
    margin-top: 10px;
  }
  .acts {
    flex-wrap: wrap;
    align-items: center;
  }
  .acts {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }
  button {
    padding: 6px 14px;
    border: 1px solid #17361f;
    border-radius: 0;
    background: #17361f;
    color: #eaf1e6;
    font: inherit;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
  }
  button[type='reset'] {
    background: none;
    color: #17361f;
  }
  button:focus-visible,
  input:focus-visible {
    outline: 3px solid #b3261e;
    outline-offset: 2px;
  }
  .stamp {
    margin-left: auto;
    padding: 4px 10px;
    border: 3px double #b3261e;
    color: #b3261e;
    font: 700 18px/1.2 'Times New Roman', serif;
    letter-spacing: 0.2em;
    transform: rotate(-8deg);
    opacity: 0.85;
  }
  @container (min-width: 440px) {
    .stamp {
      position: absolute;
      right: 14px;
      top: 30px;
      transform: rotate(-12deg);
    }
  }
  .stamp.cleared {
    border-color: #1b6a3a;
    color: #1b6a3a;
  }
  .receipt {
    margin: 12px 0 0;
    padding: 6px 8px;
    border: 1px dashed #17361f;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font: inherit;
  }
`;

const fieldCss = `
  :host {
    display: block;
  }
  :host(.inline) {
    display: inline-block;
    vertical-align: middle;
  }
  input[type='text'],
  input[type='date'] {
    box-sizing: border-box;
    display: block;
    width: 100%;
    max-width: 240px;
    padding: 5px 7px;
    border: 1px solid #17361f;
    border-radius: 0;
    background: #fbfdf9;
    color: #17361f;
    font: 14px/1.3 'Courier New', Courier, monospace;
    letter-spacing: 0.3em;
    text-transform: uppercase;
  }
  input[type='date'] {
    letter-spacing: 0.05em;
  }
  input:user-invalid {
    border-color: #b3261e;
    box-shadow: inset 4px 0 0 #b3261e;
  }
  input:focus-visible {
    outline: 3px solid #b3261e;
    outline-offset: 2px;
  }
  input[type='checkbox'] {
    margin-right: 4px;
    accent-color: #17361f;
  }
`;

/**
 * A customs declaration whose fields are components with their inputs in a Shadow DOM. With `field: true` the
 * form around them validates them, reports an invalid field itself, reads their values with `FormData`, resets
 * them, a disabled fieldset leaves them out, and so does a field whose own input is disabled. The stamp and the receipt read what the form says.
 *
 * @returns The example.
 */
export const create = () => {
  const nothing = signal(false);
  const stamp = signal<'cleared' | 'refused' | ''>('');
  const receipt = signal('');
  const transit = signal(false);

  /**
   * Makes a field of the form: a component that hands its first input to the form.
   *
   * @param name - The name of the field, as `FormData` sees it.
   * @param control - The input.
   * @param inline - Whether the field sits in a line of text instead of filling the line.
   * @returns The field.
   */
  const Field = (name: string, control: HTMLInputElement, inline = false) =>
    em.Field({ css: fieldCss, field: true, name, class: inline ? 'inline' : undefined }, control);

  /**
   * Makes a checkbox for a good to declare.
   *
   * @param value - The value it submits when it is ticked.
   * @param title - What it says.
   * @returns The field.
   */
  const good = (value: string, title: string) =>
    label(
      Field('goods', input({ type: 'checkbox', value, 'aria-label': title }), true),
      span(title),
    );

  return em.Customs(
    { css },
    form(
      {
        novalidate: true,
        onsubmit: (event) => {
          event.preventDefault();
          const target = event.currentTarget as HTMLFormElement;
          if (!target.checkValidity()) {
            stamp.value = 'refused';
            receipt.value = '';
            target.reportValidity();
            return;
          }
          stamp.value = 'cleared';
          receipt.value = [...new FormData(target)]
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');
        },
        onreset: () => {
          stamp.value = '';
          receipt.value = '';
          nothing.value = false;
          transit.value = false;
        },
      },
      h4('Customs declaration'),
      p({ class: 'no' }, 'Form C-12 · sample'),
      label(
        'Passport, two letters and six digits',
        Field(
          'passport',
          input({
            type: 'text',
            required: true,
            pattern: '[A-Za-z]{2}[0-9]{6}',
            maxlength: 8,
            'aria-label': 'Passport, two letters and six digits',
          }),
        ),
      ),
      label(
        'Arrival date',
        Field(
          'arrival',
          input({
            type: 'date',
            required: true,
            value: '2026-11-21',
            disabled: transit,
            'aria-label': 'Arrival date',
          }),
        ),
      ),
      fieldset(
        { disabled: nothing },
        legend('Goods to declare'),
        good('seeds', 'Seeds'),
        good('cheese', 'Cheese'),
      ),
      label(
        { class: 'nothing' },
        input({ type: 'checkbox', bind: nothing }),
        ' Nothing to declare',
      ),
      label(
        { class: 'nothing' },
        input({ type: 'checkbox', bind: transit }),
        ' In transit: no arrival date',
      ),
      div(
        { class: 'acts' },
        button({ type: 'submit' }, 'Submit'),
        button({ type: 'reset' }, 'Reset'),
        div(
          {
            class: () => ({ stamp: true, cleared: stamp.value === 'cleared' }),
            hidden: () => stamp.value === '',
            role: 'status',
          },
          () => stamp.value.toUpperCase(),
        ),
      ),
      pre({ class: 'receipt', hidden: () => receipt.value === '' }, receipt),
    ),
  );
};
