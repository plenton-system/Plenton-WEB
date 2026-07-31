import type { AdminApiError, AdminPlatformDashboard } from 'src/types/admin';
import type { DashboardWindowFilter } from 'src/services/admin/adminOperationsService';

import { useState, useEffect, useCallback } from 'react';

import { mapAdminApiError } from 'src/utils/admin-api-error';

import { adminOperationsService } from 'src/services/admin/adminOperationsService';

export function useAdminDashboard(filter: DashboardWindowFilter) {
  const { failureWindowEndUtc, failureWindowStartUtc } = filter;
  const [data, setData] = useState<AdminPlatformDashboard | null>(null);
  const [error, setError] = useState<AdminApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const refetch = useCallback(() => setReload((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setData(null);
    adminOperationsService
      .getDashboard({ failureWindowEndUtc, failureWindowStartUtc }, controller.signal)
      .then(setData)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(mapAdminApiError(reason));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [failureWindowEndUtc, failureWindowStartUtc, reload]);

  return { data, error, loading, refetch };
}
