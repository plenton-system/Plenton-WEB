import type { CurrentSubscription } from 'src/types';

import { useRef, useState, useEffect, useCallback } from 'react';

import { subscriptionService } from 'src/services';

type Options = {
  auto?: boolean;
  poll?: boolean;
  pollIntervalMs?: number;
};

export function useCurrentSubscription({
  auto = true,
  poll = false,
  pollIntervalMs = 8000,
}: Options = {}) {
  const [data, setData] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await subscriptionService.getCurrentSubscription();
      setData(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível carregar a assinatura.';
      setError(message);
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auto) void reload();
  }, [auto, reload]);

  useEffect(() => {
    if (!poll) return undefined;

    timerRef.current = setInterval(() => {
      void reload();
    }, pollIntervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [poll, pollIntervalMs, reload]);

  return {
    data,
    loading,
    error,
    empty: !loading && !error && !data,
    reload,
  };
}
