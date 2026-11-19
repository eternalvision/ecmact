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

/** The control's own disabled attribute while a field temporarily overrides it. */
const ownDisabled = new WeakMap<Element, string | null>();

/**
 * Applies an authored disabled attribute, or remembers it while the field keeps the control disabled.
 *
 * @param control - The element whose disabled prop changed.
 * @param value - The attribute value, or `null` to remove it.
 */
export const writeDisabled = (control: Element, value: string | null) => {
  if (ownDisabled.has(control)) ownDisabled.set(control, value);
  else if (value === null) control.removeAttribute('disabled');
  else control.setAttribute('disabled', value);
};

/**
 * Keeps a control disabled until its field enables it again.
 *
 * @param control - The control inside the field.
 */
export const disableFromField = (control: Element) => {
  const value = control.getAttribute('disabled');
  ownDisabled.set(control, value);
  if (value === null) control.setAttribute('disabled', '');
};

/**
 * Restores the control's own disabled attribute after its field is enabled again.
 *
 * @param control - The control that the field disabled.
 */
export const restoreOwnDisabled = (control: Element) => {
  const value = ownDisabled.get(control);
  ownDisabled.delete(control);
  if (value !== undefined) writeDisabled(control, value);
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
 * @returns The value, the entries of a multiple select, or `null` if nothing is submitted (an unchecked box, a button).
 */
export const readFormValue = (element: Element, name: string): string | FormData | null => {
  if (!isControl(element)) return null;
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
  if (!isControl(element) || element.validity.valid) return { flags: {}, message: '' };
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
