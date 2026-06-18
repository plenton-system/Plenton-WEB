import type {
  SubscriptionBillingType,
  StartSubscriptionRequest,
  StartSubscriptionResponse,
} from 'src/types';

import { useState, useCallback } from 'react';

import i18n from 'src/i18n';
import { subscriptionService } from 'src/services';

type StartArgs = {
  nutritionistId: string;
  planPriceId: string;
  billingType: SubscriptionBillingType;
};

export function useStartSubscription() {
  const [data, setData] = useState<StartSubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async ({ nutritionistId, planPriceId, billingType }: StartArgs) => {
    setLoading(true);
    setError(null);

    try {
      const request: StartSubscriptionRequest = {
        nutritionistId,
        planPriceId,
        billingType,
      };
      const response = await subscriptionService.startSubscription(request);
      setData(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : i18n.t('subscription.errors.start');
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    setError,
    start,
  };
}
