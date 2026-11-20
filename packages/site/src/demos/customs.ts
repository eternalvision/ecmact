import { em, signal, tags } from 'ecmact';

const { button, div, fieldset, form, h4, input, label, legend, p, pre, span } = tags;

/** The switch that a checkbox is drawn as, shared by the plain checkboxes and the ones inside the fields. */
const switchRule = `
  input[type='checkbox'] {
    flex: none;
    appearance: none;
    -webkit-appearance: none;
    width: 44px;
    height: 26px;
    margin: 0;
    border-radius: 999px;
    background: radial-gradient(circle closest-side, #ffffff 74%, transparent 80%) 0 0 / 26px 26px
      no-repeat #7a80aa;
    box-shadow: inset 0 1px 3px rgba(27, 31, 59, 0.3);
    cursor: pointer;
  }
  input[type='checkbox']:checked {
    background-position: 18px 0;
    background-color: #3b5bff;
  }
  input[type='checkbox']:disabled {
    cursor: not-allowed;
  }
  @media (prefers-reduced-motion: no-preference) {
    input[type='checkbox'] {
      transition: background-position 0.2s;
    }
  }
`;

const css = `
  :host {
    display: block;
    position: relative;
    container-type: inline-size;
    color-scheme: light;
    padding: 18px;
    background:
      radial-gradient(70% 55% at 0% 0%, #ffb3d9 0, transparent 70%),
      radial-gradient(60% 55% at 100% 25%, #8fd0ff 0, transparent 70%),
      radial-gradient(70% 60% at 55% 100%, #8ff0d2 0, transparent 70%), #eef0ff;
    color: #1b1f3b;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
  form {
    box-sizing: border-box;
    max-width: 520px;
    margin: 0 auto;
    padding: 20px 18px 18px;
    border-radius: 28px;
    background: #ffffff;
    box-shadow: 0 12px 30px rgba(60, 50, 140, 0.18);
  }
  @supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
    form {
      background: rgba(255, 255, 255, 0.5);
      -webkit-backdrop-filter: blur(18px) saturate(1.4);
      backdrop-filter: blur(18px) saturate(1.4);
      box-shadow:
        0 12px 30px rgba(60, 50, 140, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.95),
        inset 0 0 0 1px rgba(255, 255, 255, 0.5);
    }
  }
  h4 {
    margin: 0;
    font-size: 21px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  .no {
    margin: 2px 0 6px;
    font-size: 13.5px;
    color: #4a4f78;
  }
  label {
    display: block;
    margin-top: 12px;
    font-size: 13.5px;
    font-weight: 600;
  }
  fieldset {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 18px;
    margin: 14px 0 0;
    padding: 12px 14px;
    border: 0;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.45);
  }
  legend {
    float: left;
    width: 100%;
    padding: 0;
    font-size: 13.5px;
    font-weight: 600;
  }
  fieldset:disabled {
    opacity: 0.7;
  }
  fieldset label,
  .nothing {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-top: 0;
    font-size: 15px;
    font-weight: 500;
  }
  .nothing {
    margin-top: 12px;
    padding-left: 14px;
  }
  ${switchRule}
  .acts {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-top: 18px;
  }
  button {
    min-height: 44px;
    padding: 0 22px;
    border: 0;
    border-radius: 999px;
    font: inherit;
    font-size: 15px;
    font-weight: 650;
    cursor: pointer;
  }
  button[type='submit'] {
    background: linear-gradient(135deg, #3b5bff, #5b5bf0);
    color: #ffffff;
    box-shadow: 0 6px 14px rgba(59, 91, 255, 0.4);
  }
  button[type='reset'] {
    background: rgba(255, 255, 255, 0.8);
    color: #1b1f3b;
  }
  :focus-visible {
    outline: 3px solid #1b1f3b;
    outline-offset: 3px;
  }
  .stamp {
    margin-left: auto;
    padding: 3px 12px;
    border: 3px solid currentColor;
    border-radius: 12px;
    color: #9c0f45;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.08em;
    transform: rotate(-8deg);
  }
  .stamp.cleared {
    color: #08593c;
  }
  @container (min-width: 440px) {
    .stamp {
      position: absolute;
      right: 14px;
      top: 30px;
      transform: rotate(-12deg);
    }
  }
  .receipt {
    margin: 14px 0 0;
    padding: 10px 14px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.8);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font: inherit;
    font-size: 14px;
  }
  @media (prefers-reduced-motion: no-preference) {
    .stamp {
      animation: thud 0.35s cubic-bezier(0.2, 1.4, 0.4, 1);
    }
    @keyframes thud {
      from {
        opacity: 0;
        transform: rotate(-24deg) scale(1.6);
      }
    }
  }
`;

const fieldCss = `
  :host {
    display: block;
  }
  :host(.inline) {
    display: inline-flex;
    vertical-align: middle;
  }
  input[type='text'],
  input[type='date'] {
    box-sizing: border-box;
    display: block;
    width: 100%;
    margin-top: 6px;
    padding: 11px 16px;
    border: 0;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.82);
    box-shadow:
      inset 0 0 0 2px #6a70a0,
      inset 0 1px 3px rgba(27, 31, 59, 0.16);
    color: #1b1f3b;
    font: inherit;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }
  input:disabled {
    background: rgba(255, 255, 255, 0.5);
    box-shadow: none;
    color: #4a4f78;
    cursor: not-allowed;
  }
  input:user-invalid {
    box-shadow: inset 0 0 0 3px #b3261e;
  }
  ${switchRule}
  input:focus-visible,
  input[type='date']:focus-within {
    outline: 3px solid #1b1f3b;
    outline-offset: 3px;
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
