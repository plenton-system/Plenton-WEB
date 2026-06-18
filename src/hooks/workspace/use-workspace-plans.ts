import type { WorkspacePlanItem } from 'src/types';

import { useState, useEffect, useCallback } from 'react';

import { extractApiErrorMessage } from 'src/utils/api-error';

import i18n from 'src/i18n';
import { workspacePlanService } from 'src/services/workspace/workspacePlanService';

// ----------------------------------------------------------------------

type UseWorkspacePlansReturn = {
  items: WorkspacePlanItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

// ----------------------------------------------------------------------

export function useWorkspacePlans(patientId?: string): UseWorkspacePlansReturn {
  const [items, setItems] = useState<WorkspacePlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await workspacePlanService.getAll({ patientId });
      setItems(data?.items ?? []);
    } catch (err) {
      setError(extractApiErrorMessage(err, i18n.t('workspace.errors.loadPlans')));
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { items, loading, error, refetch: fetchData };
}
