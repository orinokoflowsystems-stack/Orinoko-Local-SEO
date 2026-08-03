import { useCallback, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

export function useAsync<T>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(async (callback: () => Promise<T>) => {
    setState((current) => ({ ...current, isLoading: true, error: null }));
    try {
      const data = await callback();
      setState({ data, error: null, isLoading: false });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected async error.';
      setState({ data: null, error: message, isLoading: false });
      throw error;
    }
  }, []);

  return { ...state, execute, setState };
}

