import { useCallback, useState } from 'react';

interface UseLoadingReturn {
  loading: boolean;
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
}

export function useLoading(initial = false): UseLoadingReturn {
  const [loading, setLoading] = useState(initial);

  const withLoading = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, withLoading };
}
