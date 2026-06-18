import type { WorkspaceAnthropometryListItem } from 'src/types';

import { useState, useEffect, useCallback } from 'react';

import { extractApiErrorMessage } from 'src/utils/api-error';

import i18n from 'src/i18n';
import { workspaceAnthropometryService } from 'src/services/workspace/workspaceAnthropometryService';

// ----------------------------------------------------------------------

type UseWorkspaceAnthropometriesReturn = {
  items: WorkspaceAnthropometryListItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

// ----------------------------------------------------------------------

export function useWorkspaceAnthropometries(patientId?: string): UseWorkspaceAnthropometriesReturn {
  const [items, setItems] = useState<WorkspaceAnthropometryListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await workspaceAnthropometryService.getAll(patientId);
      setItems(data?.items ?? []);
    } catch (err) {
      setError(extractApiErrorMessage(err, i18n.t('workspace.errors.loadAnthropometry')));
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { items, loading, error, refetch: fetchData };
}
