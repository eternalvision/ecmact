import { describe, expect, it, vi } from 'vitest';
import { computed, signal } from '@em';
import { bind, isReactive, pause, read, resume } from '@em/render/bindings';

describe('isReactive', () => {
  it('is true for signals, computed values and functions', () => {
    expect(isReactive(signal(1))).toBe(true);
    expect(isReactive(computed(() => 1))).toBe(true);
    expect(isReactive(() => 1)).toBe(true);
  });

  it('is false for plain values', () => {
    expect(isReactive('a')).toBe(false);
    expect(isReactive({})).toBe(false);
    expect(isReactive(null)).toBe(false);
  });
});

describe('read', () => {
  it('reads a signal and calls a function', () => {
    expect(read(signal(2))).toBe(2);
    expect(read(() => 3)).toBe(3);
  });
});

describe('bind', () => {
  it('runs now and again when a signal changes', () => {
    const count = signal(0);
    const node = document.createElement('div');
    bind(node, () => {
      node.textContent = String(count.value);
    });
    expect(node.textContent).toBe('0');
    count.value = 1;
    expect(node.textContent).toBe('1');
  });

  it('keeps several bindings of one node', () => {
    const a = signal('a');
    const b = signal('b');
    const node = document.createElement('div');
    bind(node, () => node.setAttribute('a', a.value));
    bind(node, () => node.setAttribute('b', b.value));
    a.value = 'x';
    b.value = 'y';
    expect(node.getAttribute('a')).toBe('x');
    expect(node.getAttribute('b')).toBe('y');
  });
});

describe('pause and resume', () => {
  it('stops the bindings of a node and of everything below it', () => {
    const count = signal(0);
    const parent = document.createElement('div');
    const child = document.createElement('span');
    parent.append(child);
    const run = vi.fn(() => void count.value);
    bind(child, run);
    pause(parent);
    count.value = 1;
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('reaches into shadow roots', () => {
    const count = signal(0);
    const host = document.createElement('div');
    const inside = document.createElement('span');
    host.attachShadow({ mode: 'open' }).append(inside);
    const run = vi.fn(() => void count.value);
    bind(inside, run);
    pause(host);
    count.value = 1;
    expect(run).toHaveBeenCalledTimes(1);
    resume(host);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('resume runs the bindings once to catch up and follows again', () => {
    const count = signal(0);
    const node = document.createElement('div');
    bind(node, () => {
      node.textContent = String(count.value);
    });
    pause(node);
    count.value = 5;
    expect(node.textContent).toBe('0');
    resume(node);
    expect(node.textContent).toBe('5');
    count.value = 6;
    expect(node.textContent).toBe('6');
  });

  it('pausing twice and resuming a node that was not paused do nothing', () => {
    const count = signal(0);
    const node = document.createElement('div');
    const run = vi.fn(() => void count.value);
    bind(node, run);
    resume(node);
    expect(run).toHaveBeenCalledTimes(1);
    pause(node);
    pause(node);
    resume(node);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('does not start a binding twice when a paused node is inside a resumed one', () => {
    const count = signal(0);
    const parent = document.createElement('div');
    const child = document.createElement('span');
    parent.append(child);
    const run = vi.fn(() => void count.value);
    bind(child, run);
    pause(child);
    pause(parent);
    resume(parent);
    resume(child);
    expect(run).toHaveBeenCalledTimes(2);
    count.value = 1;
    expect(run).toHaveBeenCalledTimes(3);
  });

  it('skips a child that a binding moved away during the walk', () => {
    const parent = document.createElement('div');
    const first = document.createElement('span');
    const second = document.createElement('span');
    parent.append(first, second);
    const run = vi.fn();
    bind(first, () => second.remove());
    bind(second, run);
    pause(parent);
    parent.append(second);
    resume(parent);
    expect(run).toHaveBeenCalledTimes(1);
  });
});
