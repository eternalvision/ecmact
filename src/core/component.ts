import { getConfig } from '@em/core/config';
import { build, type AnyProps } from '@em/core/element';
import { guard } from '@em/core/errors';
import { notifyAttached } from '@em/core/context';
import { fieldChangeEvent } from '@em/forms/bindControl';
import { readFormValue, readValidity, resetControl } from '@em/forms/formControl';
import { owned } from '@em/signals/signals';
import { applyStyleSheets } from '@em/render/applyStyleSheets';
import { bind, isReactive, pause, read, resume } from '@em/render/bindings';
import type { Child, ComponentProps, SheetState } from '@em/types';
import { warn } from '@em/utils/warn';

const Base =
  typeof HTMLElement === 'undefined' ? (Object as unknown as typeof HTMLElement) : HTMLElement;

/** The name of the method that fills a component, kept off its public surface. */
export const init = Symbol('ecmact.init');

/**
 * The custom element behind every component made with `em`: it holds its children in a shadow root (or in
 * itself), scopes a stylesheet to them, runs the lifecycle hooks and releases the signals its content follows
 * while it is out of the document.
 */
export class Component extends Base {
  /** Lets a component take part in the submission and validation of the form around it, see the `field` prop. */
  static readonly formAssociated = true;

  #root: Element | ShadowRoot = this;
  #mounted: ComponentProps['mounted'];
  #unmounted: ComponentProps['unmounted'];
  #cleanup: (() => void) | undefined;
  #internals: ElementInternals | undefined;
  readonly #sheets: SheetState = {
    ownSheet: null,
    sheetText: undefined,
    sheetKey: '',
    sheetNodes: [],
  };

  /**
   * Fills the component: applies the props to the custom element and puts the children into its root.
   * Called once by the factory, right after the element is created.
   *
   * @param props - The props.
   * @param children - The children.
   */
  [init](props: AnyProps, children: Child[]) {
    const { css, shadow = getConfig().shadow, field, mounted, unmounted } = props;
    this.#mounted = mounted as ComponentProps['mounted'];
    this.#unmounted = unmounted as ComponentProps['unmounted'];
    if (shadow) {
      const root = this.attachShadow({ mode: 'open' });
      this.#root = root;
      if (isReactive(css)) bind(this, () => this.#adopt(root, read(css)));
      else this.#adopt(root, css);
    } else if (css !== undefined) {
      warn('css is ignored when shadow is false');
    }
    build(this, this.#root, props, children);
    if (field && typeof this.attachInternals === 'function') {
      this.#internals = this.attachInternals();
      this.#root.addEventListener('input', this.#syncField);
      this.#root.addEventListener('change', this.#syncField);
      this.#root.addEventListener(fieldChangeEvent, this.#syncField);
      this.addEventListener('click', this.#forwardClick);
      this.#syncField();
    }
  }

  /**
   * Called by the browser when the element is added to a document. Starts following signals again if the
   * component had left the document, and runs `mounted`. Effects and resources created in `mounted` are
   * collected, to stop them when the component leaves.
   */
  connectedCallback() {
    resume(this);
    notifyAttached();
    if (this.#internals) this.#syncField();
    const [cleanup, dispose] = owned(() => guard(this, 'mounted', () => this.#mounted?.(this)));
    /**
     * Runs the cleanup that `mounted` returned, then stops what it created.
     */
    this.#cleanup = () => {
      try {
        cleanup?.();
      } finally {
        dispose();
      }
    };
  }

  /**
   * Called by the browser when the element is removed from a document. Runs the cleanup returned by `mounted`,
   * stops the effects and resources that `mounted` created, and then runs `unmounted`. If the component is not
   * put back at once, as it is when it is only moved, it stops following signals.
   */
  disconnectedCallback() {
    const cleanup = this.#cleanup;
    this.#cleanup = undefined;
    if (cleanup) guard(this, 'cleanup', cleanup);
    guard(this, 'unmounted', () => this.#unmounted?.(this));
    queueMicrotask(() => {
      if (!this.isConnected) pause(this);
    });
  }

  /**
   * Called by the browser when the form around a field is reset. Puts the control back to its default.
   */
  formResetCallback() {
    if (!this.#internals) return;
    resetControl(this.#control());
    this.#syncField();
  }

  /**
   * Called by the browser when the field, or a form or fieldset around it, is disabled or enabled.
   *
   * @param disabled - Whether the field is disabled now.
   */
  formDisabledCallback(disabled: boolean) {
    const control = this.#control();
    if (this.#internals && 'disabled' in control) control.disabled = disabled;
  }

  /**
   * Gives the shadow root the shared stylesheets and the `css` of the component.
   *
   * @param root - The shadow root.
   * @param css - The stylesheet text, or nothing.
   */
  #adopt(root: ShadowRoot, css: unknown) {
    const stale = this.#sheets.sheetNodes;
    const text = typeof css === 'string' ? css : undefined;
    if (!applyStyleSheets(root, text, this.#sheets)) return;
    stale.forEach((node) => node.remove());
    root.prepend(...this.#sheets.sheetNodes);
  }

  /**
   * Finds the control of a field: the first `input`, `select` or `textarea` inside the component.
   *
   * @returns The control, or the component itself when there is none.
   */
  #control(): Element {
    return this.#root.querySelector('input, select, textarea') ?? this;
  }

  /**
   * Hands the value and the validity of the control to the form around the component.
   */
  readonly #syncField = () => {
    const internals = this.#internals as ElementInternals;
    const control = this.#control();
    internals.setFormValue(readFormValue(control, this.getAttribute('name') ?? ''));
    const { flags, message } = readValidity(control);
    internals.setValidity(flags, message, message ? (control as HTMLElement) : undefined);
  };

  /**
   * A `<label>` that wraps a field, or points at it, activates the host, because a form-associated host is the
   * labelable element and not the control inside it. Forwards that click to the control, so that clicking the
   * label toggles a checkbox and focuses a text field as it does for a native control. A click that started
   * inside the component is left alone.
   *
   * @param event - The click.
   */
  readonly #forwardClick = (event: Event) => {
    const control = this.#control() as HTMLElement;
    if (event.composedPath()[0] !== this || control === this) return;
    control.focus();
    control.click();
  };
}
