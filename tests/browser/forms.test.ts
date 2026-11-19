import { afterEach, describe, expect, it, vi } from 'vitest';
import { em, signal, tags } from '@em';
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

  it('omits an initially disabled control while keeping a same-name control', () => {
    const field = em.Field(
      { field: true, name: 'email' },
      tags.input({ value: 'disabled', disabled: true }),
    );
    const form = makeForm(field, tags.input({ name: 'email', value: 'native' }));
    expect(new FormData(form).getAll('email')).toEqual(['native']);
  });

  it('updates submission when reactive disabled changes and restores the current bound value', () => {
    const disabled = signal(false);
    const value = signal('initial');
    const field = em.Field({ field: true, name: 'email' }, tags.input({ disabled, bind: value }));
    const fieldset = tags.fieldset(field);
    const form = makeForm(fieldset);
    expect(new FormData(form).get('email')).toBe('initial');

    disabled.value = true;
    expect(new FormData(form).has('email')).toBe(false);
    disabled.value = false;
    expect(new FormData(form).get('email')).toBe('initial');

    fieldset.disabled = true;
    value.value = 'updated';
    expect(new FormData(form).has('email')).toBe(false);
    fieldset.disabled = false;
    expect(new FormData(form).get('email')).toBe('updated');
  });

  it('skips validation for a disabled control and resumes it when enabled', () => {
    const control = tags.input({ value: 'example' });
    const field = em.Field({ field: true, name: 'email' }, control);
    const form = makeForm(field);
    control.setCustomValidity('Invalid email');
    control.dispatchEvent(new Event('change', { bubbles: true }));
    expect(form.checkValidity()).toBe(false);

    control.disabled = true;
    control.dispatchEvent(new Event('change', { bubbles: true }));
    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).has('email')).toBe(false);

    control.disabled = false;
    control.dispatchEvent(new Event('change', { bubbles: true }));
    expect(form.checkValidity()).toBe(false);
    expect(new FormData(form).get('email')).toBe('example');
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

  it('keeps each control’s own disabled state over repeated fieldset toggles', () => {
    const lockedInput = tags.input({ disabled: true });
    const openInput = tags.input();
    const fieldset = tags.fieldset(
      em.Field({ field: true }, lockedInput),
      em.Field({ field: true }, openInput),
    );
    makeForm(fieldset);

    for (let cycle = 0; cycle < 2; cycle++) {
      fieldset.disabled = true;
      expect(lockedInput.disabled).toBe(true);
      expect(openInput.disabled).toBe(true);
      fieldset.disabled = false;
      expect(lockedInput.disabled).toBe(true);
      expect(openInput.disabled).toBe(false);
    }
  });

  it('restores a control’s own state when the host is enabled', () => {
    const input = tags.input({ disabled: true });
    const field = em.Field({ field: true }, input);
    makeForm(field);

    field.setAttribute('disabled', '');
    field.removeAttribute('disabled');
    expect(input.disabled).toBe(true);
  });

  it('enables a control shared by nested light-DOM fields when their fieldset is enabled', () => {
    const input = tags.input();
    const inner = em.InnerField({ field: true, shadow: false }, input);
    const outer = em.OuterField({ field: true, shadow: false }, inner);
    const fieldset = tags.fieldset(outer);
    makeForm(fieldset);

    fieldset.disabled = true;
    expect(input.disabled).toBe(true);
    fieldset.disabled = false;
    expect(input.disabled).toBe(false);
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
