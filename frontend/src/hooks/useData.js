import { useState, useEffect, useCallback, useRef } from 'react';
export function useData(loader, deps = []) {
  const [data, setData] = useState(null),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true);
  const generation = useRef(0);
  const reload = useCallback(async () => {
    const current = ++generation.current;
    setError('');
    try {
      const next = await loader();
      if (current === generation.current) setData(next);
    } catch (e) {
      if (current === generation.current) setError(e.message);
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, deps);
  useEffect(() => {
    setLoading(true);
    reload();
    return () => {
      generation.current++;
    };
  }, [reload]);
  return { data, error, loading, reload };
}
