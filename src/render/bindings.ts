import { isSignal, watch } from '@em/signals/signals';
import type { Getter } from '@em/types';

/** A piece of the DOM that follows signals: the function that writes it, and how to stop it while it runs. */
interface Binding {
  /**
   * Reads the signals and writes the DOM. It may return a cleanup.
   */
  run: () => void | (() => void);
  /** Stops following the signals, or `null` while the binding is paused. */
  stop: (() => void) | null;
}

const bindings = new WeakMap<Node, Binding[]>();
const paused = new WeakSet<Node>();
let current: Node | null = null;

/**
 * Reads the node whose binding is running, so that code called from a reactive function knows where it is.
 *
 * @returns The node, or `null` outside of a binding.
 */
export const currentNode = () => current;

/**
 * Tells whether a value is read again when it changes: a signal or a function.
 *
 * @param value - The value.
 * @returns `true` for signals and functions.
 */
export const isReactive = (value: unknown): value is Getter<unknown> =>
  typeof value === 'function' || isSignal(value);

/**
 * Reads a reactive value: the value of a signal, or the result of a function.
 *
 * @template T - The type of the value.
 * @param source - The signal or the function.
 * @returns The current value.
 */
export const read = <T>(source: Getter<T>): T =>
  typeof source === 'function' ? source() : source.value;

/**
 * Runs `run` now and again whenever a signal it read changes, and ties that to a node, so that it stops when
 * the node is paused and starts again when the node is resumed.
 *
 * @param node - The node that the binding writes to.
 * @param write - Reads the signals and writes the DOM.
 */
export const bind = (node: Node, write: Binding['run']) => {
  /**
   * Runs the binding with its node as the current one.
   *
   * @returns The cleanup of the binding, if any.
   */
  const run = () => {
    const previous = current;
    current = node;
    try {
      return write();
    } finally {
      current = previous;
    }
  };
  const list = bindings.get(node) ?? [];
  bindings.set(node, list);
  list.push({ run, stop: watch(run) });
};

/**
 * Visits the bindings of a node and of everything below it, shadow roots included. A child that a binding
 * moved away while the walk was running is skipped.
 *
 * @param node - The node to start from.
 * @param visit - Receives each binding.
 */
const walk = (node: Node, visit: (binding: Binding) => void) => {
  bindings.get(node)?.forEach(visit);
  const { shadowRoot } = node as Element;
  if (shadowRoot) walk(shadowRoot, visit);
  Array.from(node.childNodes).forEach((child) => {
    if (child.parentNode === node) walk(child, visit);
  });
};

/**
 * Stops the bindings of a node and of everything below it, so that signals no longer hold on to it.
 *
 * @param node - The node that left the document.
 */
export const pause = (node: Node) => {
  paused.add(node);
  walk(node, (binding) => {
    binding.stop?.();
    binding.stop = null;
  });
};

/**
 * Starts the bindings of a node that was paused, and of everything below it. They run once to catch up.
 * A node that was not paused is left alone.
 *
 * @param node - The node that came back.
 */
export const resume = (node: Node) => {
  if (!paused.delete(node)) return;
  walk(node, (binding) => {
    binding.stop ??= watch(binding.run);
  });
};
