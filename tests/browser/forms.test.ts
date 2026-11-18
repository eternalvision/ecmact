import { afterEach, describe, expect, it, vi } from 'vitest';
import { em, tags } from '@em';
import { mount } from '@em/utils/mount';

/** Puts a form with the given children into the document, as an application would. */
const makeForm = (...children: Parameters<typeof tags.form>) => {
  const form = tags.form(...children);
  mount(document.body, form);
  return form;
};

/** The control inside the shadow root of a field. */
const controlOf = <T extends HTMLElement>(field: HTMLElement, selector = 'input') =>
  field.shadowRoot!.querySelector(selector) as T;

/** What the user does to a text control: sets the value and lets the browser events run. */
const type = (control: HTMLInputElement, value: string) => {
  control.value = value;
  control.dispatchEvent(new Event('input', { bubbles: true }));
};

afterEach(() => {
  document.body.replaceChildren();
});

describe('form-associated field in a real form', () => {
  it('puts its value into FormData and follows what the user types', () => {
    const field = em.Field({ field: true, name: 'email' }, tags.input({ value: 'a@b.c' }));
    const form = makeForm(field);
    expect(new FormData(form).get('email')).toBe('a@b.c');
    type(controlOf(field), 'x@y.z');
    expect(new FormData(form).get('email')).toBe('x@y.z');
  });

  it('submits the value of a checkbox only while it is checked', () => {
    const field = em.Field(
      { field: true, name: 'agree' },
      tags.input({ type: 'checkbox', value: 'yes' }),
    );
    const form = makeForm(field);
    expect(new FormData(form).has('agree')).toBe(false);
    controlOf<HTMLInputElement>(field).click();
    expect(new FormData(form).get('agree')).toBe('yes');
  });

  it('submits several values of a multiple select under one name', () => {
    const field = em.Field(
      { field: true, name: 'tags' },
      tags.select(
        { multiple: true },
        tags.option({ value: 'a' }, 'a'),
        tags.option({ value: 'b' }, 'b'),
      ),
    );
    const form = makeForm(field);
    const select = controlOf<HTMLSelectElement>(field, 'select');
    Array.from(select.options).forEach((option) => (option.selected = true));
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(new FormData(form).getAll('tags')).toEqual(['a', 'b']);
  });

  it('puts the value back to its default on form.reset()', () => {
    const field = em.Field({ field: true, name: 'email' }, tags.input({ value: 'start' }));
    const form = makeForm(field);
    type(controlOf(field), 'typed');
    expect(new FormData(form).get('email')).toBe('typed');
    form.reset();
    expect(controlOf<HTMLInputElement>(field).value).toBe('start');
    expect(new FormData(form).get('email')).toBe('start');
  });

  it('checks a checkbox that starts checked again on form.reset()', () => {
    const field = em.Field(
      { field: true, name: 'agree' },
      tags.input({ type: 'checkbox', value: 'yes', checked: true }),
    );
    const form = makeForm(field);
    const control = controlOf<HTMLInputElement>(field);
    expect(new FormData(form).get('agree')).toBe('yes');
    control.click();
    expect(control.checked).toBe(false);
    expect(new FormData(form).has('agree')).toBe(false);
    form.reset();
    expect(control.checked).toBe(true);
    expect(new FormData(form).get('agree')).toBe('yes');
  });

  it('is disabled by a disabled fieldset and enabled again with it', () => {
    const field = em.Field({ field: true, name: 'email' }, tags.input({ value: 'a@b.c' }));
    const fieldset = tags.fieldset(field);
    const form = makeForm(fieldset);
    const control = controlOf<HTMLInputElement>(field);
    fieldset.disabled = true;
    expect(field.matches(':disabled')).toBe(true);
    expect(control.disabled).toBe(true);
    expect(new FormData(form).has('email')).toBe(false);
    fieldset.disabled = false;
    expect(field.matches(':disabled')).toBe(false);
    expect(control.disabled).toBe(false);
    expect(new FormData(form).get('email')).toBe('a@b.c');
  });

  it('forwards a click on its wrapping label to the control', () => {
    const field = em.Field(
      { field: true, name: 'agree' },
      tags.input({ type: 'checkbox', value: 'yes' }),
    );
    const label = tags.label(tags.span('I agree'), field);
    const form = makeForm(label);
    label.querySelector('span')!.click();
    expect(controlOf<HTMLInputElement>(field).checked).toBe(true);
    expect(new FormData(form).get('agree')).toBe('yes');
  });

  it('forwards a click on a label that points at it with for to the control', () => {
    const field = em.Field({ field: true, name: 'email', id: 'email' }, tags.input());
    const label = tags.label({ for: 'email' }, 'Email');
    makeForm(label, field);
    label.click();
    expect(field.shadowRoot!.activeElement).toBe(controlOf(field));
  });

  it('makes form.checkValidity() false and fires invalid while the control is invalid', () => {
    const field = em.Field({ field: true, name: 'email' }, tags.input({ required: true }));
    const form = makeForm(field);
    const onInvalid = vi.fn();
    field.addEventListener('invalid', onInvalid);
    expect(form.checkValidity()).toBe(false);
    expect(onInvalid).toHaveBeenCalledTimes(1);
    expect(field.matches(':invalid')).toBe(true);
    expect(form.elements.namedItem('email')).toBe(field);
    type(controlOf(field), 'a@b.c');
    expect(form.checkValidity()).toBe(true);
    expect(field.matches(':invalid')).toBe(false);
    expect(onInvalid).toHaveBeenCalledTimes(1);
  });
});
