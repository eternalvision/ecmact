import { em, tags } from 'ecmact';

const buttonCss = `
  button {
    padding: 0.5rem 1rem;
    border: 0;
    border-radius: 10px;
    background: var(--primary);
    color: white;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }
`;

const fieldCss = `
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
 * A native form whose fields are ECMact components in a Shadow DOM. With `field: true` they still take part in
 * the form: it validates them, blocks an invalid submit and reads their values with `FormData`.
 *
 * @returns The demo.
 */
export const create = () => {
  const result = document.createElement('pre');
  result.textContent = 'Submit the form to see its data.';

  const form = document.createElement('form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    result.textContent = JSON.stringify(Object.fromEntries(new FormData(form)), null, 2);
  });

  form.append(
    em.Email({
      shadow: true,
      css: fieldCss,
      field: true,
      tag: 'input',
      type: 'email',
      name: 'email',
      required: true,
      placeholder: 'you@example.com',
      'aria-label': 'Email',
    }),
    em.Name({
      shadow: true,
      css: fieldCss,
      field: true,
      tag: 'input',
      name: 'name',
      minlength: 2,
      placeholder: 'Your name (2+ letters)',
      'aria-label': 'Name',
    }),
    tags.button({ shadow: true, css: buttonCss, type: 'submit', content: 'Send' }),
    result,
  );
  return form;
};
