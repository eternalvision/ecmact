import type { ResolvedProps } from '@em/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const shallowEqual = (a: Record<string, unknown>, b: Record<string, unknown>) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((key) => Object.is(a[key], b[key]));
};

export const propsEqual = (a: ResolvedProps, b: ResolvedProps) => {
  const first: Record<string, unknown> = a;
  const second: Record<string, unknown> = b;
  return [...new Set([...Object.keys(first), ...Object.keys(second)])].every((key) => {
    const [x, y] = [first[key], second[key]];
    return key === 'style' && isRecord(x) && isRecord(y) ? shallowEqual(x, y) : Object.is(x, y);
  });
};
