import { describe, expect, it } from 'vitest';
import { InterceptorManager } from '@em/http/interceptors';

describe('InterceptorManager', () => {
  it('lists the interceptors in the order they were added', () => {
    const manager = new InterceptorManager<number>();
    const a = (v: number) => v + 1;
    const b = (v: number) => v + 2;
    manager.use(a);
    manager.use(b);
    expect(manager.list().map((handler) => handler.fulfilled)).toEqual([a, b]);
  });

  it('keeps the rejection handler and the options', () => {
    const manager = new InterceptorManager<number>();
    const rejected = () => 1;
    const runWhen = () => false;
    manager.use(undefined, rejected, { runWhen });
    expect(manager.list()[0]).toEqual({ fulfilled: undefined, rejected, runWhen });
  });

  it('gives every interceptor its own id', () => {
    const manager = new InterceptorManager<number>();
    expect(manager.use()).not.toBe(manager.use());
  });

  it('ejects one interceptor, and ignores an unknown or repeated id', () => {
    const manager = new InterceptorManager<number>();
    const first = manager.use((v) => v);
    manager.use((v) => v);
    manager.eject(first);
    manager.eject(first);
    manager.eject(999);
    expect(manager.list()).toHaveLength(1);
  });

  it('clears all of them', () => {
    const manager = new InterceptorManager<number>();
    manager.use();
    manager.use();
    manager.clear();
    expect(manager.list()).toEqual([]);
  });
});
