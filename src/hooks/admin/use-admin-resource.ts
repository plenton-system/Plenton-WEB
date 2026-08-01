import type { AdminApiError } from 'src/types/admin';

import { useRef, useState, useEffect, useCallback } from 'react';

import { mapAdminApiError } from 'src/utils/admin-api-error';

export function useAdminResource<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  dependencyKey: string
) {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<AdminApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const refetch = useCallback(() => setVersion((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    loaderRef
      .current(controller.signal)
      .then(setData)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(mapAdminApiError(reason));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [dependencyKey, version]);
  return { data, setData, error, setError, loading, refetch };
}
