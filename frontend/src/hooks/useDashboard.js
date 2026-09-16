import { useEffect, useState } from 'react';
import { getDashboard } from '../api/dashboard';
import { errorMessage } from '../api/client';
export default function useDashboard(year, revision = 0) {
  const [state, setState] = useState({ data: null, error: '' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, error: '' });
    getDashboard(year, controller.signal)
      .then(({ data }) => {
        if (!controller.signal.aborted) setState({ data, error: '' });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setState({ data: null, error: errorMessage(error) });
      });
    return () => controller.abort();
  }, [year, revision, attempt]);
  return { ...state, retry: () => setAttempt((value) => value + 1) };
}
