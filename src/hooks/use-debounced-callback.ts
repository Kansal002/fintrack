import { useCallback, useEffect, useMemo, useRef } from "react";

/**
 * Returns a debounced version of `callback` plus a `cancel` function. The latest
 * callback is always invoked, so callers never hit stale closures.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay = 300,
) {
  const callbackRef = useRef(callback);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => clearTimeout(timer.current), []);
  useEffect(() => cancel, [cancel]);

  const run = useCallback(
    (...args: Args) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => callbackRef.current(...args), delay);
    },
    [delay],
  );

  return useMemo(() => ({ run, cancel }), [run, cancel]);
}
