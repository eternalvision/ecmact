import { afterEach, describe, expect, it } from 'vitest';
import { create } from '@site/demos/form';

afterEach(() => {
  delete (HTMLElement.prototype as { attachInternals?: unknown }).attachInternals;
  document.body.replaceChildren();
});

describe('form demo', () => {
  it('has two form-associated fields and a submit button', () => {
    const calls: unknown[] = [];
    (HTMLElement.prototype as { attachInternals?: unknown }).attachInternals = () => ({
      setFormValue: (value: unknown) => calls.push(value),
      setValidity: () => {},
    });
    const form = create() as HTMLFormElement;
    document.body.append(form);
    const fields = [...form.querySelectorAll('em-email, em-name')];
    expect(fields.map((field) => field.getAttribute('name'))).toEqual(['email', 'name']);
    expect(calls).toEqual(['', '', '', '']);
    expect(fields.map((field) => field.shadowRoot?.querySelector('input')?.type)).toEqual([
      'email',
      'text',
    ]);
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(button.textContent).toBe('Send');
    expect(button.style.borderRadius).toBe('10px');
  });

  it('shows the data on submit', () => {
    const form = create() as HTMLFormElement;
    document.body.append(form);
    const result = form.querySelector('pre')!;
    expect(result.textContent).toBe('Submit the form to see its data.');
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(result.textContent).toBe('{}');
  });
});
