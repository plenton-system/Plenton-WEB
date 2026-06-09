import type { SubscriptionPlan } from 'src/types';

import { useState, useEffect, useCallback } from 'react';

import { subscriptionService } from 'src/services';

type Options = {
  auto?: boolean;
};

export function useSubscriptionCatalog({ auto = true }: Options = {}) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await subscriptionService.getActivePlans();
      setPlans(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível carregar os planos.';
      setError(message);
      setPlans([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auto) void reload();
  }, [auto, reload]);

  return {
    plans,
    loading,
    error,
    empty: !loading && !error && plans.length === 0,
    hasCatalog: plans.length > 0,
    reload,
  };
}
