import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from '@site/demos/customs';

/** Stands in for `ElementInternals`, which happy-dom has not: it keeps what a field hands to its form. */
class Internals {
  value: unknown = null;
  flags: Record<string, boolean> = {};
  setFormValue(value: unknown) {
    this.value = value;
  }
  setValidity(flags: Record<string, boolean>) {
    this.flags = flags;
  }
}

type Field = HTMLElement & {
  formDisabledCallback: (disabled: boolean) => void;
  formResetCallback: () => void;
};

const proto = HTMLElement.prototype as unknown as { attachInternals?: () => unknown };
let internals = new Map<Element, Internals>();

beforeEach(() => {
  internals = new Map();
  proto.attachInternals = function (this: Element) {
    const fake = new Internals();
    internals.set(this, fake);
    return fake;
  };
  // happy-dom builds `FormData` from native controls only. A browser also adds the form-associated components.
  vi.stubGlobal(
    'FormData',
    class {
      readonly entries: [string, string][];
      constructor(form: HTMLFormElement) {
        this.entries = [...form.querySelectorAll('[name]')].flatMap((field) => {
          const value = internals.get(field)?.value;
          return typeof value === 'string' ? [[field.getAttribute('name')!, value]] : [];
        });
      }
      [Symbol.iterator]() {
        return this.entries[Symbol.iterator]();
      }
    },
  );
});

afterEach(() => {
  delete proto.attachInternals;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

const open = () => {
  const demo = create() as HTMLElement;
  document.body.append(demo);
  const root = demo.shadowRoot!;
  const form = root.querySelector('form')!;
  const fields = () => [...form.querySelectorAll<Field>('[name]')];
  const field = (name: string, index = 0) =>
    fields().filter((item) => item.getAttribute('name') === name)[index]!;
  const control = (name: string, index = 0) =>
    field(name, index).shadowRoot!.querySelector('input')!;
  const type = (name: string, value: string) => {
    const text = control(name);
    text.value = value;
    text.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const tick = (good: string) => {
    const box = [...form.querySelectorAll('[name="goods"]')]
      .map((item) => (item as HTMLElement).shadowRoot!.querySelector('input')!)
      .find((item) => item.value === good)!;
    box.checked = !box.checked;
    box.dispatchEvent(new Event('change', { bubbles: true }));
  };
  const nothing = form.querySelector<HTMLInputElement>('.nothing input')!;
  const goods = form.querySelector('fieldset')!;
  // Does what a browser does for form-associated components: asks them whether the form is valid, and tells them
  // when their fieldset is disabled or the form is reset.
  const valid = () =>
    [...internals.values()].every((item) => Object.values(item.flags).every((flag) => !flag));
  const checkValidity = vi.spyOn(form, 'checkValidity').mockImplementation(valid);
  const reportValidity = vi.spyOn(form, 'reportValidity').mockImplementation(valid);
  const tellDisabled = () =>
    fields()
      .filter((item) => goods.contains(item))
      .forEach((item) => item.formDisabledCallback(goods.disabled));
  const submit = () => form.dispatchEvent(new Event('submit', { cancelable: true }));
  const stamp = () => root.querySelector<HTMLElement>('.stamp')!;
  const receipt = () => root.querySelector<HTMLElement>('.receipt')!;
  return {
    root,
    form,
    fields,
    field,
    control,
    type,
    tick,
    nothing,
    goods,
    checkValidity,
    reportValidity,
    tellDisabled,
    submit,
    stamp,
    receipt,
  };
};

describe('customs example', () => {
  it('has four shadow fields in a native form, with a sample arrival date', () => {
    const { fields, control, stamp, receipt, goods } = open();
    expect(fields().map((field) => field.getAttribute('name'))).toEqual([
      'passport',
      'arrival',
      'goods',
      'goods',
    ]);
    expect(control('arrival').value).toBe('2026-11-21');
    expect(goods.disabled).toBe(false);
    expect(stamp().hidden).toBe(true);
    expect(receipt().hidden).toBe(true);
  });

  it('refuses a declaration with a wrong passport and reports the field through the form', () => {
    const { type, submit, stamp, reportValidity, receipt, field } = open();
    type('passport', 'AB12');
    expect(internals.get(field('passport'))?.flags.patternMismatch).toBe(true);
    submit();
    expect(stamp().textContent).toBe('REFUSED');
    expect(stamp().hidden).toBe(false);
    expect(stamp().classList.contains('cleared')).toBe(false);
    expect(reportValidity).toHaveBeenCalledTimes(1);
    expect(receipt().hidden).toBe(true);
  });

  it('clears a good declaration and submits the values of its shadow fields in FormData', () => {
    const { type, tick, submit, stamp, receipt, reportValidity } = open();
    type('passport', 'ab123456');
    tick('seeds');
    submit();
    expect(stamp().textContent).toBe('CLEARED');
    expect(stamp().classList.contains('cleared')).toBe(true);
    expect(receipt().textContent).toBe('passport=ab123456\narrival=2026-11-21\ngoods=seeds');
    expect(reportValidity).not.toHaveBeenCalled();
  });

  it('leaves the goods out of FormData while nothing to declare is ticked', () => {
    const { type, tick, nothing, goods, tellDisabled, submit, receipt, field } = open();
    type('passport', 'ab123456');
    tick('seeds');
    tick('cheese');
    nothing.checked = true;
    nothing.dispatchEvent(new Event('change', { bubbles: true }));
    expect(goods.disabled).toBe(true);
    tellDisabled();
    expect(internals.get(field('goods'))?.value).toBeNull();
    submit();
    expect(receipt().textContent).toBe('passport=ab123456\narrival=2026-11-21');
    nothing.checked = false;
    nothing.dispatchEvent(new Event('change', { bubbles: true }));
    expect(goods.disabled).toBe(false);
    tellDisabled();
    submit();
    expect(receipt().textContent).toBe(
      'passport=ab123456\narrival=2026-11-21\ngoods=seeds\ngoods=cheese',
    );
  });

  it('restores the defaults on reset', () => {
    const { form, type, control, tick, nothing, goods, submit, stamp, receipt, fields } = open();
    type('passport', 'ab123456');
    type('arrival', '2027-01-02');
    tick('cheese');
    nothing.checked = true;
    nothing.dispatchEvent(new Event('change', { bubbles: true }));
    submit();
    form.reset();
    fields().forEach((field) => field.formResetCallback());
    expect(control('passport').value).toBe('');
    expect(control('arrival').value).toBe('2026-11-21');
    expect(
      (form.querySelectorAll('[name="goods"]')[1] as HTMLElement).shadowRoot!.querySelector(
        'input',
      )!.checked,
    ).toBe(false);
    expect(nothing.checked).toBe(false);
    expect(goods.disabled).toBe(false);
    expect(stamp().hidden).toBe(true);
    expect(receipt().hidden).toBe(true);
  });
});
