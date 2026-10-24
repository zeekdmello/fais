import { useEffect, useRef, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { SaveQueue } from './saveQueue';
export function useAutosave(record, save) {
  const [status, setStatus] = useState('Saved'),
    [error, setError] = useState('');
  const queue = useRef(null),
    timer = useRef(null);
  if (!queue.current)
    queue.current = new SaveQueue(record, save, (state, e) => {
      setStatus(state);
      setError(e?.message || '');
    });
  const blocker = useBlocker(() => queue.current.dirty);
  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (window.confirm('Some edits have not saved. Leave and discard those edits?'))
        blocker.proceed();
      else blocker.reset();
    }
  }, [blocker]);
  useEffect(() => {
    const handler = (e) => {
      if (queue.current.dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener('beforeunload', handler);
    };
  }, []);
  return {
    status,
    error,
    queue: queue.current,
    change: (patch, immediate = false) => {
      queue.current.add(patch);
      clearTimeout(timer.current);
      if (immediate) queue.current.flush();
      else timer.current = setTimeout(() => queue.current.flush(), 700);
    },
    retry: () => queue.current.flush(),
  };
}
