import { describe, expect, it } from 'vitest';
import { syncProperties } from '@em/utils/syncProperties';

const sync = (
  element: HTMLElement,
  props: Record<string, unknown>,
  previous = new Map<string, string>(),
) => syncProperties(element, props as never, previous);

describe('syncProperties', () => {
  it('writes the value as a property', () => {
    const input = document.createElement('input');
    sync(input, { value: 'abc' });
    expect(input.value).toBe('abc');
  });

  it('writes numbers as strings', () => {
    const input = document.createElement('input');
    sync(input, { value: 5 });
    expect(input.value).toBe('5');
  });

  it('writes checked, selected and indeterminate', () => {
    const input = document.createElement('input');
    input.type = 'checkbox';
    sync(input, { checked: true, indeterminate: true });
    expect(input.checked).toBe(true);
    expect(input.indeterminate).toBe(true);
    const option = document.createElement('option');
    sync(option, { selected: true });
    expect(option.selected).toBe(true);
  });

  it('overrides what the user did when the prop changes', () => {
    const input = document.createElement('input');
    const first = sync(input, { value: 'a' });
    input.value = 'typed';
    sync(input, { value: 'b' }, first);
    expect(input.value).toBe('b');
  });

  it('keeps what the user did while the prop stays the same', () => {
    const input = document.createElement('input');
    const first = sync(input, { value: 'a' });
    input.value = 'typed';
    sync(input, { value: 'a' }, first);
    expect(input.value).toBe('typed');
  });

  it('resets the property when the prop is removed', () => {
    const input = document.createElement('input');
    input.type = 'checkbox';
    const first = sync(input, { value: 'a', checked: true });
    sync(input, {}, first);
    expect(input.value).toBe('');
    expect(input.checked).toBe(false);
  });

  it('treats false as absent', () => {
    const input = document.createElement('input');
    input.type = 'checkbox';
    const first = sync(input, { checked: true });
    sync(input, { checked: false }, first);
    expect(input.checked).toBe(false);
  });

  it('skips elements that have no such property', () => {
    const div = document.createElement('div');
    sync(div, { value: 'a', checked: true });
    expect('value' in div).toBe(false);
    expect('checked' in div).toBe(false);
  });

  it('returns what it wrote', () => {
    const input = document.createElement('input');
    expect(sync(input, { value: 'a', checked: true, selected: false })).toEqual(
      new Map([
        ['value', 'a'],
        ['checked', ''],
      ]),
    );
  });
});
