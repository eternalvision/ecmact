import { bind } from '@em/render/bindings';
import type { Signal } from '@em/signals/signals';

/** The native elements that hold a value in a form. */
type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/** The name of the event a bound control dispatches when a signal changed it, so that a field around it can tell its form. */
export const fieldChangeEvent = 'ecmact:field-change';

/**
 * Reads a control as a number, for signals that hold numbers.
 *
 * @param element - The control.
 * @returns The number, or `NaN` for an empty or unfinished value.
 */
const toNumber = (element: Control) => (element.value === '' ? NaN : Number(element.value));

/**
 * Reads the value of a control in the shape its signal holds: a boolean for a checkbox, the value of the
 * checked button for a radio, the selected values for a multiple select, a number where the signal holds
 * one, and text otherwise.
 *
 * @param element - The control.
 * @param current - The value the signal holds now.
 * @returns The new value for the signal.
 */
const readControl = (element: Control, current: unknown): unknown => {
  if (element instanceof HTMLInputElement) {
    if (element.type === 'checkbox') return element.checked;
    if (element.type === 'radio') return element.checked ? element.value : current;
  }
  if (element instanceof HTMLSelectElement && element.multiple) {
    return Array.from(element.options)
      .filter((option) => option.selected)
      .map((option) => option.value);
  }
  return typeof current === 'number' ? toNumber(element) : element.value;
};

/**
 * Writes the value of a signal to a control. Text that the control already shows is not written again, so that
 * what the user is typing is left alone.
 *
 * @param element - The control.
 * @param value - The value of the signal.
 */
const writeControl = (element: Control, value: unknown) => {
  if (element instanceof HTMLInputElement && element.type === 'checkbox') {
    element.checked = value === true;
  } else if (element instanceof HTMLInputElement && element.type === 'radio') {
    element.checked = element.value === String(value);
  } else if (element instanceof HTMLSelectElement && element.multiple) {
    const selected = value as readonly string[];
    Array.from(element.options).forEach((option) => {
      option.selected = selected.includes(option.value);
    });
  } else if (typeof value === 'number') {
    if (!Object.is(toNumber(element), value))
      element.value = Number.isNaN(value) ? '' : String(value);
  } else {
    const text = value === null || value === undefined ? '' : String(value);
    if (element.value !== text) element.value = text;
  }
};

/**
 * Ties a control to a signal both ways: the control shows the signal, and what the user enters is written to it.
 *
 * @param element - An `input`, `select` or `textarea`.
 * @param source - The signal.
 */
export const bindControl = (element: Control, source: Signal<unknown>) => {
  bind(element, () => {
    writeControl(element, source.value);
    element.dispatchEvent(new Event(fieldChangeEvent, { bubbles: true }));
  });
  /**
   * Writes what the control holds to the signal.
   */
  const update = () => {
    source.value = readControl(element, source.peek());
  };
  element.addEventListener('input', update);
  element.addEventListener('change', update);
};
