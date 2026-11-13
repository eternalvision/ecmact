import { em, signal, tags } from 'ecmact';

const { button, form, input, pre } = tags;

const css = `
  :host { display: block; margin-bottom: 0.5rem; }
  input {
    width: 100%;
    box-sizing: border-box;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    color: var(--text);
    font: inherit;
  }
  input:invalid { border-color: var(--danger); }
`;

/**
 * A native form whose fields are components with their inputs in a Shadow DOM. With `field: true` they still take
 * part in the form: it validates them, blocks an invalid submit and reads their values with `FormData`.
 *
 * @returns The demo.
 */
export const create = () => {
  const result = signal('Submit the form to see its data.');

  return form(
    {
      onsubmit: (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget as HTMLFormElement);
        result.value = JSON.stringify(Object.fromEntries(data), null, 2);
      },
    },
    em.Email(
      { css, field: true, name: 'email' },
      input({
        type: 'email',
        required: true,
        placeholder: 'you@example.com',
        'aria-label': 'Email',
      }),
    ),
    em.Name(
      { css, field: true, name: 'name' },
      input({ minlength: 2, placeholder: 'Your name (2+ letters)', 'aria-label': 'Name' }),
    ),
    button(
      {
        type: 'submit',
        style: {
          padding: '0.5rem 1rem',
          border: 0,
          borderRadius: 10,
          background: 'var(--primary)',
          color: 'white',
          font: 'inherit',
          fontWeight: 600,
          cursor: 'pointer',
        },
      },
      'Send',
    ),
    pre(result),
  );
};
