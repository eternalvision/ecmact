import { isSignal } from '@em/signals';
import type { ComponentProps, ResolvedProps } from '@em/types';

const unwrap = (value: unknown) => (isSignal(value) ? value.value : value);

const resolveStyle = (style: unknown) => {
  const resolved = unwrap(style);
  if (typeof resolved !== 'object' || resolved === null) return resolved;
  return Object.fromEntries(Object.entries(resolved).map(([key, value]) => [key, unwrap(value)]));
};

export const resolveProps = (props: ComponentProps): ResolvedProps =>
  Object.fromEntries(
    Object.entries(props).map(([key, value]) => [
      key,
      key === 'style' ? resolveStyle(value) : unwrap(value),
    ]),
  ) as ResolvedProps;
