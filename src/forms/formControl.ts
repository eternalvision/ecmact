import { fieldChangeEvent } from '@em/forms/bindControl';

/** The native elements that hold a value in a form. */
type ControlElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const validityKeys = [
  'badInput',
  'customError',
  'patternMismatch',
  'rangeOverflow',
  'rangeUnderflow',
  'stepMismatch',
  'tooLong',
  'tooShort',
  'typeMismatch',
  'valueMissing',
] as const;

/**
 * Writes the disabled attribute and tells any surrounding fields when the control's state changes.
 *
 * @param control - The element whose disabled attribute changed.
 * @param value - The attribute value, or `null` to remove it.
 */
const setDisabledAttribute = (control: Element, value: string | null) => {
  const changed = control.hasAttribute('disabled') !== (value !== null);
  if (value === null) control.removeAttribute('disabled');
  else control.setAttribute('disabled', value);
  if (changed && isControl(control)) {
    control.dispatchEvent(new Event(fieldChangeEvent, { bubbles: true }));
  }
};

/** The control's own disabled attribute and the number of fields temporarily overriding it. */
interface DisabledOverride {
  /** The attribute value to restore when the last field is enabled. */
  value: string | null;
  /** Field hosts that currently keep this control disabled. */
  fields: number;
}

const disabledOverrides = new WeakMap<Element, DisabledOverride>();

/**
 * Applies an authored disabled attribute, or remembers it while the field keeps the control disabled.
 *
 * @param control - The element whose disabled prop changed.
 * @param value - The attribute value, or `null` to remove it.
 */
export const writeDisabled = (control: Element, value: string | null) => {
  const override = disabledOverrides.get(control);
  if (override) override.value = value;
  else setDisabledAttribute(control, value);
};

/**
 * Keeps a control disabled until its field enables it again.
 *
 * @param control - The control inside the field.
 */
export const disableFromField = (control: Element) => {
  const override = disabledOverrides.get(control);
  if (override) {
    override.fields++;
    return;
  }
  const value = control.getAttribute('disabled');
  disabledOverrides.set(control, { value, fields: 1 });
  if (value === null) setDisabledAttribute(control, '');
};

/**
 * Restores the control's own disabled attribute after its field is enabled again.
 *
 * @param control - The control that the field disabled.
 */
export const restoreOwnDisabled = (control: Element) => {
  const override = disabledOverrides.get(control);
  if (!override) return;
  override.fields--;
  if (override.fields > 0) return;
  disabledOverrides.delete(control);
  writeDisabled(control, override.value);
};

/**
 * Tells whether an element is a native form control that has a value and constraints.
 *
 * @param element - The element.
 * @returns `true` for `input`, `select` and `textarea`.
 */
export const isControl = (element: Element): element is ControlElement =>
  element instanceof HTMLInputElement ||
  element instanceof HTMLSelectElement ||
  element instanceof HTMLTextAreaElement;

/**
 * Reads what a control contributes to a form submission.
 *
 * @param element - The inner element of a field.
 * @param name - The field name, used for the entries of a multiple select.
 * @returns The value, the entries of a multiple select, or `null` if nothing is submitted (a disabled control, an unchecked box, a button).
 */
export const readFormValue = (element: Element, name: string): string | FormData | null => {
  if (!isControl(element) || element.disabled) return null;
  if (element instanceof HTMLInputElement) {
    if (element.type === 'checkbox' || element.type === 'radio') {
      return element.checked ? element.value || 'on' : null;
    }
    if (element.type === 'file' || element.type === 'button' || element.type === 'submit') {
      return null;
    }
  }
  if (element instanceof HTMLSelectElement && element.multiple) {
    const data = new FormData();
    Array.from(element.selectedOptions).forEach((option) => data.append(name, option.value));
    return data;
  }
  return element.value;
};

/**
 * Reads the validity of a control in the form `ElementInternals.setValidity` takes.
 *
 * @param element - The inner element of a field.
 * @returns The flags that are set and the message; the flags are empty for a valid or unvalidated element.
 */
export const readValidity = (element: Element) => {
  if (!isControl(element) || element.disabled || element.validity.valid)
    return { flags: {}, message: '' };
  const flags = Object.fromEntries(validityKeys.map((key) => [key, element.validity[key]]));
  return { flags: flags as ValidityStateFlags, message: element.validationMessage };
};

/**
 * Puts a control back to the state its markup describes, as `form.reset()` does for native controls.
 *
 * @param element - The inner element of a field.
 */
export const resetControl = (element: Element) => {
  if (element instanceof HTMLInputElement) {
    element.value = element.defaultValue;
    element.checked = element.defaultChecked;
  } else if (element instanceof HTMLTextAreaElement) {
    element.value = element.defaultValue;
  } else if (element instanceof HTMLSelectElement) {
    Array.from(element.options).forEach((option) => {
      option.selected = option.defaultSelected;
    });
  }
};
