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
