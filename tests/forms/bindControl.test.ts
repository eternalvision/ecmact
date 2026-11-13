import { describe, expect, it, vi } from 'vitest';
import { signal, tags, type Signal } from '@em';
import { bindControl, fieldChangeEvent } from '@em/forms/bindControl';

const { input, option, select, textarea } = tags;

const type = (element: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
};

const selected = (field: HTMLSelectElement) =>
  Array.from(field.options)
    .filter((item) => item.selected)
    .map((item) => item.value);

const change = (element: Element) => element.dispatchEvent(new Event('change', { bubbles: true }));

describe('bind', () => {
  it('ties a text field to a signal both ways', () => {
    const text = signal('a');
    const field = input({ bind: text });
    expect(field.value).toBe('a');
    type(field, 'typed');
    expect(text.value).toBe('typed');
    text.value = 'set';
    expect(field.value).toBe('set');
  });

  it('shows nothing for null and undefined', () => {
    const text = signal<string | null>(null);
    const field = textarea({ bind: text as Signal<string> });
    expect(field.value).toBe('');
    type(field, 'x');
    expect(text.value).toBe('x');
  });

  it('does not write text that the field already shows', () => {
    const text = signal('a');
    const field = input({ bind: text });
    const write = vi.spyOn(field, 'value', 'set');
    type(field, 'b');
    expect(write).toHaveBeenCalledTimes(1);
  });

  it('ties a checkbox to a boolean', () => {
    const agreed = signal(false);
    const box = input({ type: 'checkbox', bind: agreed });
    document.body.append(box);
    expect(box.checked).toBe(false);
    box.click();
    expect(agreed.value).toBe(true);
    agreed.value = false;
    expect(box.checked).toBe(false);
  });

  it('ties radio buttons to the value of the checked one', () => {
    const plan = signal('free');
    const free = input({ type: 'radio', name: 'plan', value: 'free', bind: plan });
    const pro = input({ type: 'radio', name: 'plan', value: 'pro', bind: plan });
    expect(free.checked).toBe(true);
    expect(pro.checked).toBe(false);
    pro.checked = true;
    change(pro);
    change(free);
    expect(plan.value).toBe('pro');
    plan.value = 'free';
    expect(free.checked).toBe(true);
    expect(pro.checked).toBe(false);
  });

  it('keeps a number in a signal that holds a number', () => {
    const amount = signal(2);
    const field = input({ type: 'number', bind: amount });
    expect(field.value).toBe('2');
    type(field, '5');
    expect(amount.value).toBe(5);
    type(field, '');
    expect(amount.value).toBeNaN();
    expect(field.value).toBe('');
    amount.value = 7;
    expect(field.value).toBe('7');
    amount.value = NaN;
    expect(field.value).toBe('');
  });

  it('keeps text in a signal that holds text, for a number input too', () => {
    const amount = signal('2');
    const field = input({ type: 'number', bind: amount });
    type(field, '5');
    expect(amount.value).toBe('5');
  });

  it('ties a select to the value of its selected option', () => {
    const plan = signal('pro');
    const field = select({ bind: plan }, option({ value: 'free' }), option({ value: 'pro' }));
    expect(field.value).toBe('pro');
    field.value = 'free';
    change(field);
    expect(plan.value).toBe('free');
  });

  it('ties a multiple select to the list of selected values', () => {
    const picked = signal(['b']);
    const field = select(
      { multiple: true, bind: picked },
      option({ value: 'a' }),
      option({ value: 'b' }),
      option({ value: 'c' }),
    );
    expect(selected(field)).toEqual(['b']);
    field.options[2].selected = true;
    change(field);
    expect(picked.value).toEqual(['b', 'c']);
    picked.value = ['a'];
    expect(selected(field)).toEqual(['a']);
  });

  it('tells the fields around it when a signal changed the control', () => {
    const text = signal('a');
    const field = input();
    const listener = vi.fn();
    const wrapper = tags.div(field);
    wrapper.addEventListener(fieldChangeEvent, listener);
    bindControl(field, text as Signal<unknown>);
    text.value = 'b';
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('is typed for form controls only', () => {
    // @ts-expect-error a div takes no bind
    tags.div({ bind: signal('') });
    // @ts-expect-error bind takes a signal
    input({ bind: 'text' });
    expect(true).toBe(true);
  });
});
