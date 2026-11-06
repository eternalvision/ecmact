import { getConfig, type ErrorPhase } from '@em/core/config';
import { contextRequestEvent, type ContextRequest } from '@em/core/context';
import { effect, untracked } from '@em/signals/signals';
import type { ComponentProps, ElementOf, RenderState, ResolvedProps } from '@em/types';
import { propsEqual } from '@em/props/propsEqual';
import { resolveProps } from '@em/props/resolveProps';
import { render } from '@em/render/render';
import { registerComponent } from '@em/utils/registry';
import { warn } from '@em/utils/warn';
import { readFormValue, readValidity, resetControl } from '@em/forms/formControl';

const Base =
  typeof HTMLElement === 'undefined' ? (Object as unknown as typeof HTMLElement) : HTMLElement;

/**
 * The custom element behind every component: it renders its props into one inner element,
 * follows signals while it is in the document, runs the lifecycle hooks and answers context requests.
 *
 * @template K - The tag of the inner element.
 */
export class Component<K extends string = string> extends Base {
  /** Lets a component take part in the submission and validation of the form around it, see the `field` prop. */
  static readonly formAssociated = true;

  #props: ComponentProps<K>;
  #last: ResolvedProps | null = null;
  #root: ParentNode | null = null;
  #stop: (() => void) | null = null;
  #cleanup: (() => void) | void = undefined;
  #internals: ElementInternals | null = null;
  readonly #state: RenderState = {
    element: null,
    attributes: new Set(),
    styles: new Set(),
    listeners: new Map(),
    properties: new Map(),
    ownSheet: null,
    sheetText: undefined,
    sheetKey: '',
    sheetNodes: [],
  };

  /**
   * Creates the element. Elements are normally created through the `em` and `tags` factories.
   *
   * @param props - The initial props.
   */
  constructor(props: ComponentProps<K> = {} as ComponentProps<K>) {
    super();
    this.#props = props;
    registerComponent(this);
    this.addEventListener(contextRequestEvent, this.#answer);
  }

  /**
   * Called by the browser when the element is added to a document. Paints if the props changed while
   * it was detached, starts following signals and runs `mounted`.
   */
  connectedCallback() {
    untracked(() => {
      const resolved = resolveProps(this.#props as ComponentProps);
      if (!this.#last || (!propsEqual(resolved, this.#last) && !this.#vetoes(resolved))) {
        this.#paint(resolved);
      }
      this.#watch();
      this.#cleanup = this.#guard('mounted', () =>
        this.#hooks.mounted?.(this.#element, this.#self),
      );
    });
  }

  /**
   * Called by the browser when the element is removed from a document. Stops following signals,
   * runs the cleanup returned by `mounted` and then `unmounted`.
   */
  disconnectedCallback() {
    this.#stop?.();
    this.#stop = null;
    const cleanup = this.#cleanup;
    this.#cleanup = undefined;
    if (cleanup) this.#guard('cleanup', cleanup);
    this.#guard('unmounted', () => this.#hooks.unmounted?.(this.#element, this.#self));
  }

  /**
   * Merges `newProps` into the current props and updates the element in place.
   *
   * @example
   * card.setState({ content: 'Saved' });
   *
   * @param newProps - The props to change.
   */
  setState(newProps: Partial<ComponentProps<K>>) {
    this.props = { ...this.#props, ...newProps } as ComponentProps<K>;
  }

  /**
   * Reads the current props, as they were passed (signals are not unwrapped).
   *
   * @returns The current props.
   */
  get props() {
    return this.#props;
  }

  /**
   * Replaces all props and updates the element in place. `beforeUpdate` can cancel the update.
   *
   * @param newProps - The new props.
   */
  set props(newProps: ComponentProps<K>) {
    untracked(() => {
      const resolved = resolveProps(newProps as ComponentProps);
      if (this.#last && this.#vetoes(resolved)) return;
      this.#props = newProps;
      this.#paint(resolved);
      if (this.#stop) this.#watch();
    });
  }

  /**
   * Reads the inner element.
   *
   * @returns The inner element, or `null` before the first render.
   */
  get element() {
    return this.#state.element as ElementOf<K> | null;
  }

  /**
   * Reads the hooks and other behavior props, which are never signals.
   *
   * @returns The current props viewed as resolved props.
   */
  get #hooks() {
    return this.#props as unknown as ResolvedProps;
  }

  /**
   * Reads this component with the loosest type, for passing to hooks and handlers.
   *
   * @returns This component.
   */
  get #self() {
    return this as unknown as Component;
  }

  /**
   * Reads the inner element once it is known to exist.
   *
   * @returns The inner element.
   */
  get #element() {
    return this.#state.element as HTMLElement;
  }

  /**
   * Answers a context request that bubbles through this component, if it provides that context.
   * Requests that this component made itself are ignored.
   *
   * @param event - The `ecmact:context-request` event.
   */
  readonly #answer = (event: Event) => {
    const { context, host, respond } = (event as CustomEvent<ContextRequest>).detail;
    if (host === this) return;
    const provision = this.#hooks.provide?.find((candidate) => candidate.context === context);
    if (!provision) return;
    event.stopPropagation();
    respond(provision.value);
  };

  /**
   * Hands the value and the validity of the inner control to the form around the component.
   * Reads `name` and `disabled` from the props and puts them on the host, where forms look for them.
   *
   * @param element - The inner element.
   * @param props - The resolved props.
   */
  #syncField(element: HTMLElement, props: ResolvedProps) {
    if (!this.#internals) {
      if (typeof this.attachInternals !== 'function') return;
      this.#internals = this.attachInternals();
      this.#root?.addEventListener('input', this.#refresh);
      this.#root?.addEventListener('change', this.#refresh);
    }
    const { name, disabled } = props as { name?: unknown; disabled?: unknown };
    const label = typeof name === 'string' ? name : '';
    if (label) this.setAttribute('name', label);
    else this.removeAttribute('name');
    this.toggleAttribute('disabled', disabled === true);
    this.#internals.setFormValue(readFormValue(element, label));
    const { flags, message } = readValidity(element);
    this.#internals.setValidity(flags, message, message ? element : undefined);
  }

  /**
   * Hands the current state of the inner control to the form again, after the user changed it.
   */
  readonly #refresh = () => {
    this.#guard('render', () => this.#syncField(this.#element, this.#last as ResolvedProps));
  };

  /**
   * Called by the browser when the form around a field is reset. Puts the inner control back to its default.
   */
  formResetCallback() {
    resetControl(this.#element);
    this.#refresh();
  }

  /**
   * Called by the browser when a form or fieldset around a field is disabled or enabled.
   *
   * @param disabled - Whether the field is disabled now.
   */
  formDisabledCallback(disabled: boolean) {
    const element = this.#element;
    if ('disabled' in element)
      element.disabled = disabled || (this.#last as { disabled?: unknown }).disabled === true;
  }

  /**
   * Passes an error to the `error` prop or to the configured handler, or rethrows it if there is none.
   *
   * @param error - The error.
   * @param phase - Where it happened.
   * @param event - The event name, for the `event` phase.
   */
  #report(error: unknown, phase: ErrorPhase, event?: string) {
    const handler = this.#hooks.error ?? getConfig().onError;
    if (!handler) throw error;
    handler(error, { component: this.#self, phase, event });
  }

  /**
   * Runs `fn` and reports any error it throws.
   *
   * @template T - The result type of `fn`.
   * @param phase - Where `fn` is called from, for the report.
   * @param fn - The function to run.
   * @returns The result of `fn`, or `undefined` if it threw and the error was handled.
   */
  #guard<T>(phase: ErrorPhase, fn: () => T) {
    try {
      return fn();
    } catch (error) {
      this.#report(error, phase);
      return undefined;
    }
  }

  /**
   * Asks `beforeUpdate` whether an update with `next` must be cancelled.
   *
   * @param next - The resolved props of the update.
   * @returns `true` if `beforeUpdate` returned `false`.
   */
  #vetoes(next: ResolvedProps) {
    const current = this.#last as ResolvedProps;
    return (
      this.#guard('beforeUpdate', () => next.beforeUpdate?.(next, current, this.#self)) === false
    );
  }

  /**
   * Starts following the signals that the props read, repainting when one changes.
   * Restarts if it was already watching, so the dependencies match the current props.
   */
  #watch() {
    this.#stop?.();
    let initial = true;
    this.#stop = effect(() => {
      const resolved = resolveProps(this.#props as ComponentProps);
      if (initial) {
        initial = false;
        return;
      }
      untracked(() => {
        if (!this.#vetoes(resolved)) this.#paint(resolved);
      });
    });
  }

  /**
   * Renders resolved props into the inner element and runs `updated` for every render but the first.
   *
   * @param resolved - The props with signals unwrapped.
   */
  #paint(resolved: ResolvedProps) {
    const previous = this.#last;
    const wantsShadow = (resolved.shadow ?? getConfig().shadow) !== false;
    this.#root ??= wantsShadow ? this.attachShadow({ mode: 'open' }) : this;
    if (previous && wantsShadow !== (this.#root !== this)) {
      warn('shadow cannot change after the first render');
    }
    const root = this.#root;
    const element = this.#guard('render', () =>
      render(root, resolved, this.#state, (error, event) => this.#report(error, 'event', event)),
    );
    this.#last = resolved;
    if (element && resolved.field) this.#guard('render', () => this.#syncField(element, resolved));
    if (previous && element) {
      this.#guard('updated', () => resolved.updated?.(element, this.#self, previous));
    }
  }
}
