import { offer, type Provision } from '@em/core/context';
import { bindControl } from '@em/forms/bindControl';
import type { ErrorHandler } from '@em/core/config';
import { catchErrors, report } from '@em/core/errors';
import { applyStyle, setStyle } from '@em/render/applyStyle';
import { bind, isReactive, read } from '@em/render/bindings';
import type { Signal } from '@em/signals/signals';
import type { EventHandlerOptions, Styles } from '@em/types';
import { warn } from '@em/utils/warn';

/** The props that are not attributes. */
const reservedKeys = new Set([
  'html',
  'style',
  'ref',
  'provide',
  'error',
  'bind',
  'css',
  'shadow',
  'field',
  'mounted',
  'unmounted',
]);

/** The props that are also written as DOM properties, so they keep working after the user changed the control. */
const liveKeys = ['value', 'checked', 'selected', 'indeterminate'];

/**
 * Applies a value now, or follows it if it is a signal or a function.
 *
 * @param element - The element the value belongs to.
 * @param value - The value, plain or reactive.
 * @param apply - Writes a plain value to the element.
 */
const follow = (element: HTMLElement, value: unknown, apply: (value: unknown) => void) => {
  if (isReactive(value)) {
    bind(element, () => {
      apply(read(value));
    });
  } else {
    apply(value);
  }
};

/**
 * Tells whether a value switches a prop off.
 *
 * @param value - The value.
 * @returns `true` for `false`, `null` and `undefined`.
 */
const isOff = (value: unknown) => value === undefined || value === null || value === false;

/**
 * Sets or removes an attribute. Strings and numbers are set, `true` sets an empty attribute, `false`, `null`
 * and `undefined` remove it, and anything else is skipped with a warning.
 *
 * @param element - The element.
 * @param key - The attribute name.
 * @param value - The value.
 */
const setAttribute = (element: HTMLElement, key: string, value: unknown) => {
  if (typeof value === 'string' || typeof value === 'number') {
    element.setAttribute(key, String(value));
  } else if (value === true) {
    element.setAttribute(key, '');
  } else {
    element.removeAttribute(key);
    if (!isOff(value)) warn(`attribute "${key}" was ignored, ${typeof value} values cannot be set`);
  }
};

/**
 * Turns the `class` prop into text. A list is joined, leaving out what is empty; an object gives the names
 * whose values are true; signals and functions anywhere in it are read.
 *
 * @param value - The `class` prop, or a part of it.
 * @returns The class names, separated by spaces.
 */
const toClassText = (value: unknown): string => {
  if (isReactive(value)) return toClassText(read(value));
  if (Array.isArray(value)) return value.map(toClassText).filter(Boolean).join(' ');
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value)
      .filter(([, on]) => (isReactive(on) ? read(on) : on))
      .map(([name]) => name)
      .join(' ');
  }
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
};

/**
 * Applies the `class` prop: text, a list, an object of switches, or a signal or a function that returns one.
 *
 * @param element - The element.
 * @param value - The `class` prop.
 */
const applyClass = (element: HTMLElement, value: unknown) => {
  /**
   * Writes the class names, or removes the attribute when there are none.
   */
  const write = () => {
    setAttribute(element, 'class', toClassText(value) || null);
  };
  if (typeof value === 'object' || typeof value === 'function') bind(element, write);
  else write();
};

/**
 * Tells whether a prop value is a handler with options.
 *
 * @param value - The prop value.
 * @returns `true` for an object with a function `handler`.
 */
const isDescriptor = (value: unknown): value is EventHandlerOptions =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { handler?: unknown }).handler === 'function';

/**
 * Attaches an `on<event>` handler. A handler is a function, or an object with a `handler` and the `capture`,
 * `passive` and `once` options. Errors it throws are reported instead of thrown.
 *
 * @param element - The element to listen on.
 * @param key - The prop name, such as `onclick`.
 * @param value - The handler.
 */
const listen = (element: HTMLElement, key: string, value: unknown) => {
  const event = key.slice(2).toLowerCase();
  const descriptor = isDescriptor(value) ? value : undefined;
  const handler = descriptor ? descriptor.handler : value;
  if (typeof handler !== 'function') {
    if (!isOff(value)) warn(`handler "${key}" is not a function and was ignored`);
    return;
  }
  element.addEventListener(
    event,
    (nativeEvent) => {
      try {
        (handler as EventListener)(nativeEvent);
      } catch (error) {
        report(error, element, 'event', event);
      }
    },
    descriptor,
  );
};

/**
 * Applies the `style` prop: an object whose values may be reactive, or a reactive object.
 *
 * @param element - The element to style.
 * @param style - The `style` prop.
 */
const applyStyles = (element: HTMLElement, style: unknown) => {
  if (isReactive(style)) {
    let applied = new Set<string>();
    bind(element, () => {
      applied = applyStyle(element, read(style) as Styles, applied);
    });
    return;
  }
  Object.entries(style as object).forEach(([key, value]) =>
    follow(element, value, (plain) => setStyle(element, key, plain)),
  );
};

/**
 * Applies everything in the props that does not depend on the children: attributes, styles, listeners, the
 * provided context values and the error handler.
 *
 * @param element - The element.
 * @param props - The props.
 */
export const applyProps = (element: HTMLElement, props: Record<string, unknown>) => {
  Object.entries(props).forEach(([key, value]) => {
    if (reservedKeys.has(key)) return;
    if (key.startsWith('on')) listen(element, key, value);
    else if (key === 'class') applyClass(element, value);
    else follow(element, value, (plain) => setAttribute(element, key, plain));
  });
  if (props.style) applyStyles(element, props.style);
  if (props.provide) offer(element, [props.provide as Provision | Provision[]].flat());
  if (props.error) catchErrors(element, props.error as ErrorHandler);
};

/**
 * Writes one live value to the element, but only if the element has such a property.
 *
 * @param element - The element.
 * @param key - The property name.
 * @param value - The value of the prop.
 */
const write = (element: HTMLElement, key: string, value: unknown) => {
  if (!(key in element)) return;
  const target = element as unknown as Record<string, unknown>;
  target[key] = key === 'value' ? (isOff(value) ? '' : String(value)) : value === true;
};

/**
 * Sets the live state of form controls. `value`, `checked`, `selected` and `indeterminate` are written as DOM
 * properties, so they keep working after the user has interacted with the control, which an attribute does not.
 * The `bind` prop ties a control to a signal both ways. Call it after the children are in place, so that a
 * `select` can take the value of one of its options.
 *
 * @param element - The element.
 * @param props - The props.
 */
export const applyProperties = (element: HTMLElement, props: Record<string, unknown>) => {
  liveKeys.forEach((key) => {
    if (key in props) follow(element, props[key], (plain) => write(element, key, plain));
  });
  if (props.bind) bindControl(element as HTMLInputElement, props.bind as Signal<unknown>);
};
