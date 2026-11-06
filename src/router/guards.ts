import type { Guard, GuardResult, RouteContext, RouterLocation } from '@em/router/router';

/**
 * Tells whether a guard result is a promise.
 *
 * @param value - What a guard returned.
 * @returns `true` for thenables.
 */
const isPromise = (value: unknown): value is Promise<GuardResult> =>
  typeof (value as Promise<GuardResult> | undefined)?.then === 'function';

/**
 * Runs guards one after another until one of them cancels or redirects. It stays synchronous while every guard
 * is synchronous, so a navigation without async guards still completes before `navigate` returns.
 *
 * @param guards - The guards, in the order they run.
 * @param to - Where the navigation is going.
 * @param from - Where it started.
 * @returns `true` to proceed, `false` to cancel, a path to redirect to, or a promise of one of those.
 */
export const runGuards = (
  guards: Guard[],
  to: RouteContext,
  from: RouterLocation,
): true | false | string | Promise<true | false | string> => {
  for (let index = 0; index < guards.length; index++) {
    const result = guards[index](to, from);
    if (isPromise(result)) {
      return result.then((resolved) =>
        resolved === undefined || resolved === true
          ? runGuards(guards.slice(index + 1), to, from)
          : resolved,
      );
    }
    if (result === false || typeof result === 'string') return result;
  }
  return true;
};
