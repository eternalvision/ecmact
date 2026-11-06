import type { ResolvedProps } from '@em/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const shallowEqual = (a: object, b: object) => {
  const first = a as Record<string, unknown>;
  const second = b as Record<string, unknown>;
  const keys = new Set([...Object.keys(first), ...Object.keys(second)]);
  return [...keys].every((key) => Object.is(first[key], second[key]));
};

export const propsEqual = (a: ResolvedProps, b: ResolvedProps) => {
  const first: Record<string, unknown> = a;
  const second: Record<string, unknown> = b;
  return [...new Set([...Object.keys(first), ...Object.keys(second)])].every((key) => {
    const [x, y] = [first[key], second[key]];
    const comparable =
      (key === 'style' && isRecord(x) && isRecord(y)) ||
      (key === 'children' && Array.isArray(x) && Array.isArray(y));
    return comparable ? shallowEqual(x, y) : Object.is(x, y);
  });
};
