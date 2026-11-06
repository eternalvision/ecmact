import { describe, expect, it, vi } from 'vitest';
import { runGuards } from '@em/router/guards';
import type { Guard, RouteContext, RouterLocation } from '@em/router/router';

const from: RouterLocation = { path: '/', query: new URLSearchParams(), hash: '' };
const to = { ...from, path: '/a', params: {}, router: {} } as unknown as RouteContext;

describe('runGuards', () => {
  it('proceeds when there are no guards', () => {
    expect(runGuards([], to, from)).toBe(true);
  });

  it('proceeds when guards return true or nothing', () => {
    expect(runGuards([() => true, () => undefined], to, from)).toBe(true);
  });

  it('passes the destination and the origin', () => {
    const guard = vi.fn();
    runGuards([guard], to, from);
    expect(guard).toHaveBeenCalledWith(to, from);
  });

  it('stops at the first guard that cancels', () => {
    const later = vi.fn();
    expect(runGuards([() => false, later], to, from)).toBe(false);
    expect(later).not.toHaveBeenCalled();
  });

  it('stops at the first guard that redirects', () => {
    expect(runGuards([() => '/login', () => false], to, from)).toBe('/login');
  });

  it('waits for async guards and carries on after them', async () => {
    const order: string[] = [];
    const guards: Guard[] = [
      async () => {
        order.push('first');
      },
      () => {
        order.push('second');
        return true;
      },
    ];
    expect(await runGuards(guards, to, from)).toBe(true);
    expect(order).toEqual(['first', 'second']);
  });

  it('resolves async cancels and redirects', async () => {
    expect(await runGuards([async () => false], to, from)).toBe(false);
    expect(await runGuards([async () => '/x'], to, from)).toBe('/x');
  });
});
