import { useCallback, useEffect, useRef } from 'react';

/** Commit `value` after `delay` ms once `ready` is true. Cleanup cancels the timer. */
export function useDelayedCommit(
  value: string,
  ready: boolean,
  commit: (value: string) => void,
  delay = 80,
): () => void {
  const commitRef = useRef(commit);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    commitRef.current = commit;
  });

  const cancel = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    const id = window.setTimeout(() => {
      if (timer.current === id) timer.current = null;
      commitRef.current(value);
    }, delay);
    timer.current = id;
    return () => {
      window.clearTimeout(id);
      if (timer.current === id) timer.current = null;
    };
  }, [ready, value, delay]);

  useEffect(() => cancel, [cancel]);

  return cancel;
}
