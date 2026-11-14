import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createContext, signal } from '@em';
import { applyProperties, applyProps } from '@em/render/props';
import { resetWarnings } from '@em/utils/warn';

let spy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  spy.mockRestore();
  resetWarnings();
});

const make = (props: Record<string, unknown>, tag = 'div') => {
  const element = document.createElement(tag);
  applyProps(element, props);
  return element;
};

describe('applyProps: attributes', () => {
  it('sets strings and numbers, and true as an empty attribute', () => {
    const element = make({ id: 'a', tabindex: 2, hidden: true, 'data-x': 'y' });
    expect(element.getAttribute('id')).toBe('a');
    expect(element.getAttribute('tabindex')).toBe('2');
    expect(element.getAttribute('hidden')).toBe('');
    expect(element.getAttribute('data-x')).toBe('y');
  });

  it('leaves out false, null and undefined without a warning', () => {
    const element = make({ a: false, b: null, c: undefined });
    expect(element.attributes).toHaveLength(0);
    expect(spy).not.toHaveBeenCalled();
  });

  it('skips objects with a warning', () => {
    const element = make({ title: { a: 1 } });
    expect(element.hasAttribute('title')).toBe(false);
    expect(spy).toHaveBeenCalledWith(
      'ecmact: attribute "title" was ignored, object values cannot be set',
    );
  });

  it('follows a signal and removes the attribute when it is switched off', () => {
    const title = signal<string | null>('one');
    const element = make({ title });
    expect(element.getAttribute('title')).toBe('one');
    title.value = 'two';
    expect(element.getAttribute('title')).toBe('two');
    title.value = null;
    expect(element.hasAttribute('title')).toBe(false);
  });

  it('follows a function', () => {
    const done = signal(false);
    const element = make({ class: () => done.value && 'done' });
    expect(element.hasAttribute('class')).toBe(false);
    done.value = true;
    expect(element.className).toBe('done');
  });

  it('does not set the reserved props as attributes', () => {
    const element = make({
      html: 'x',
      ref: () => {},
      bind: undefined,
      css: 'a {}',
      shadow: true,
      field: true,
      mounted: () => {},
      unmounted: () => {},
    });
    expect(element.attributes).toHaveLength(0);
  });
});

describe('applyProps: class', () => {
  it('takes text', () => {
    expect(make({ class: 'a b' }).className).toBe('a b');
  });

  it('joins a list and leaves out what is empty', () => {
    expect(make({ class: ['a', false, null, undefined, '', ['b', 'c'], 5] }).className).toBe(
      'a b c 5',
    );
  });

  it('takes the keys of an object whose values are true', () => {
    expect(make({ class: { a: true, b: false, c: 1, d: null } }).className).toBe('a c');
  });

  it('follows signals and functions anywhere in it', () => {
    const on = signal(false);
    const name = signal('x');
    const element = make({ class: ['base', name, () => on.value && 'on', { active: on }] });
    expect(element.className).toBe('base x');
    on.value = true;
    name.value = 'y';
    expect(element.className).toBe('base y on active');
  });

  it('follows a function that returns the whole value', () => {
    const done = signal(false);
    const element = make({ class: () => ['todo', done.value && 'done'] });
    expect(element.className).toBe('todo');
    done.value = true;
    expect(element.className).toBe('todo done');
  });

  it('removes the attribute when there are no names', () => {
    const on = signal(true);
    const element = make({ class: { on } });
    on.value = false;
    expect(element.hasAttribute('class')).toBe(false);
    expect(make({ class: null }).hasAttribute('class')).toBe(false);
    expect(make({ class: true }).hasAttribute('class')).toBe(false);
  });
});

describe('applyProps: events', () => {
  it('attaches a function as a listener, with a lowercase event name', () => {
    const onClick = vi.fn();
    make({ onClick }).click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('attaches a handler with options', () => {
    const handler = vi.fn();
    const element = make({ onclick: { handler, once: true } });
    element.click();
    element.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('listens in the capture phase', () => {
    const order: string[] = [];
    const parent = make({ onclick: { handler: () => order.push('parent'), capture: true } });
    const child = make({ onclick: () => order.push('child') });
    parent.append(child);
    child.click();
    expect(order).toEqual(['parent', 'child']);
  });

  it('ignores empty handlers silently and other values with a warning', () => {
    make({ onclick: undefined, oninput: false, onkeydown: null });
    expect(spy).not.toHaveBeenCalled();
    make({ onclick: 'alert(1)' });
    expect(spy).toHaveBeenCalledWith('ecmact: handler "onclick" is not a function and was ignored');
    make({ onfocus: { handler: 'nope' } });
    expect(spy).toHaveBeenCalledWith('ecmact: handler "onfocus" is not a function and was ignored');
  });

  it('rethrows an error of a handler when nothing handles it', () => {
    // A browser reports an error thrown by a listener instead of passing it to `click()`, so the listener is called directly.
    const element = document.createElement('div');
    const add = vi.spyOn(element, 'addEventListener');
    applyProps(element, {
      onclick: () => {
        throw new Error('boom');
      },
    });
    expect(add).toHaveBeenCalledOnce();
    expect(add.mock.calls[0][0]).toBe('click');
    const listener = add.mock.calls[0][1] as EventListener;
    expect(() => listener(new MouseEvent('click'))).toThrow('boom');
  });

  it('reports an error of a handler to the error prop', () => {
    const error = vi.fn();
    const failure = new Error('boom');
    const element = make({
      error,
      onclick: () => {
        throw failure;
      },
    });
    element.click();
    expect(error).toHaveBeenCalledWith(failure, { element, phase: 'event', event: 'click' });
  });
});

describe('applyProps: style', () => {
  it('applies an object of styles', () => {
    const element = make({ style: { backgroundColor: 'red', zIndex: 2 } });
    expect(element.style.getPropertyValue('background-color')).toBe('red');
    expect(element.style.getPropertyValue('z-index')).toBe('2');
  });

  it('follows reactive values of the object one by one', () => {
    const color = signal<string | null>('red');
    const element = make({ style: { color, width: () => '10px' } });
    expect(element.style.color).toBe('red');
    expect(element.style.width).toBe('10px');
    color.value = null;
    expect(element.style.color).toBe('');
  });

  it('follows a reactive object and removes what is gone', () => {
    const style = signal<Record<string, string> | null>({ color: 'red', width: '1px' });
    const element = make({ style });
    style.value = { color: 'blue' };
    expect(element.style.color).toBe('blue');
    expect(element.style.width).toBe('');
    style.value = null;
    expect(element.style.color).toBe('');
  });
});

describe('applyProps: provide', () => {
  it('answers context requests from below', () => {
    const context = createContext<number>('n');
    const element = make({ provide: [context.provide(7)] });
    const child = document.createElement('span');
    element.append(child);
    expect(context.use(child)).toBe(7);
  });

  it('takes one provision without a list', () => {
    const context = createContext<number>('n');
    const element = make({ provide: context.provide(8) });
    const child = document.createElement('span');
    element.append(child);
    expect(context.use(child)).toBe(8);
  });
});

describe('applyProperties', () => {
  it('writes value as a property after the attribute was set', () => {
    const input = make({ value: 'a' }, 'input') as HTMLInputElement;
    input.value = 'typed';
    applyProperties(input, { value: 'b' });
    expect(input.value).toBe('b');
    expect(input.getAttribute('value')).toBe('a');
  });

  it('writes numbers as text and empty values as an empty string', () => {
    const input = document.createElement('input');
    applyProperties(input, { value: 5 });
    expect(input.value).toBe('5');
    applyProperties(input, { value: null });
    expect(input.value).toBe('');
  });

  it('writes checked, selected and indeterminate as booleans', () => {
    const box = document.createElement('input');
    box.type = 'checkbox';
    applyProperties(box, { checked: true, indeterminate: true });
    expect(box.checked).toBe(true);
    expect(box.indeterminate).toBe(true);
    applyProperties(box, { checked: false });
    expect(box.checked).toBe(false);
    const option = document.createElement('option');
    applyProperties(option, { selected: true });
    expect(option.selected).toBe(true);
  });

  it('follows reactive values', () => {
    const value = signal('a');
    const input = document.createElement('input');
    applyProperties(input, { value });
    input.value = 'typed';
    value.value = 'b';
    expect(input.value).toBe('b');
  });

  it('leaves elements without the property and props that are absent alone', () => {
    const div = document.createElement('div');
    applyProperties(div, { value: 'x', checked: true });
    expect('value' in div).toBe(false);
    const input = document.createElement('input');
    input.value = 'kept';
    applyProperties(input, {});
    expect(input.value).toBe('kept');
  });
});
