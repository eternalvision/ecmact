import { describe, expect, it } from 'vitest';
import { isControl, readFormValue, readValidity, resetControl } from '@em/utils/formControl';

const fill = <T extends HTMLElement>(element: T, init: Record<string, unknown>) => {
  Object.entries(init).forEach(([key, value]) => {
    (element as unknown as Record<string, unknown>)[key] = value;
  });
  return element;
};
const makeInput = (init: Record<string, unknown> = {}) =>
  fill(document.createElement('input'), init);
const makeSelect = (init: Record<string, unknown> = {}) =>
  fill(document.createElement('select'), init);
const makeArea = (init: Record<string, unknown> = {}) =>
  fill(document.createElement('textarea'), init);
const makeDiv = () => document.createElement('div');

describe('isControl', () => {
  it('accepts input, select and textarea only', () => {
    expect(isControl(makeInput())).toBe(true);
    expect(isControl(makeSelect())).toBe(true);
    expect(isControl(makeArea())).toBe(true);
    expect(isControl(makeDiv())).toBe(false);
  });
});

describe('readFormValue', () => {
  it('reads the value of text controls', () => {
    expect(readFormValue(makeInput({ value: 'a' }), 'n')).toBe('a');
    expect(readFormValue(makeArea({ value: 'b' }), 'n')).toBe('b');
  });

  it('reads checkboxes and radios only when checked', () => {
    const box = makeInput({ type: 'checkbox', value: 'yes' });
    expect(readFormValue(box, 'n')).toBeNull();
    box.checked = true;
    expect(readFormValue(box, 'n')).toBe('yes');
    const plain = makeInput({ type: 'radio', checked: true });
    plain.removeAttribute('value');
    plain.value = '';
    expect(readFormValue(plain, 'n')).toBe('on');
  });

  it('submits nothing for files and buttons', () => {
    expect(readFormValue(makeInput({ type: 'file' }), 'n')).toBeNull();
    expect(readFormValue(makeInput({ type: 'button' }), 'n')).toBeNull();
    expect(readFormValue(makeInput({ type: 'submit' }), 'n')).toBeNull();
  });

  it('reads a single select', () => {
    const select = makeSelect();
    select.innerHTML = '<option value="a"></option><option value="b" selected></option>';
    expect(readFormValue(select, 'n')).toBe('b');
  });

  it('reads a multiple select as entries under the name', () => {
    const select = makeSelect({ multiple: true });
    select.innerHTML =
      '<option value="a" selected></option><option value="b"></option><option value="c" selected></option>';
    const data = readFormValue(select, 'tags') as FormData;
    expect(data.getAll('tags')).toEqual(['a', 'c']);
  });

  it('submits nothing for other elements', () => {
    expect(readFormValue(makeDiv(), 'n')).toBeNull();
  });
});

describe('readValidity', () => {
  it('has no flags for a valid control', () => {
    expect(readValidity(makeInput({ value: 'a' }))).toEqual({ flags: {}, message: '' });
  });

  it('has no flags for something that is not a control', () => {
    expect(readValidity(makeDiv())).toEqual({ flags: {}, message: '' });
  });

  it('copies the flags and the message of an invalid control', () => {
    const input = makeInput({ required: true });
    const { flags, message } = readValidity(input);
    expect((flags as { valueMissing: boolean }).valueMissing).toBe(true);
    expect(message).toBe(input.validationMessage);
  });
});

describe('resetControl', () => {
  it('restores the default value and checked state of an input', () => {
    const text = makeInput({ defaultValue: 'v' });
    text.value = 'x';
    resetControl(text);
    expect(text.value).toBe('v');
    const box = makeInput({ type: 'checkbox', defaultChecked: true });
    box.checked = false;
    resetControl(box);
    expect(box.checked).toBe(true);
  });

  it('restores a textarea', () => {
    const area = makeArea();
    area.defaultValue = 'start';
    area.value = 'typed';
    resetControl(area);
    expect(area.value).toBe('start');
  });

  it('restores the selected options of a select', () => {
    const select = makeSelect();
    select.innerHTML = '<option value="a" selected></option><option value="b"></option>';
    select.options[1].selected = true;
    resetControl(select);
    expect(select.options[0].selected).toBe(true);
    expect(select.options[1].selected).toBe(false);
  });

  it('ignores other elements', () => {
    expect(() => resetControl(makeDiv())).not.toThrow();
  });
});
