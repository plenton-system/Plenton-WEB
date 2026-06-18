import type { WorkspaceSectionItem, WorkspaceSectionKind } from 'src/types';

import { useState, useEffect, useCallback } from 'react';

import i18n from 'src/i18n';
import { workspaceService } from 'src/services/workspace/workspaceService';

// ----------------------------------------------------------------------

type UseWorkspaceSectionReturn = {
  items: WorkspaceSectionItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

// ----------------------------------------------------------------------

export function useWorkspaceSection(kind: WorkspaceSectionKind, patientId?: string): UseWorkspaceSectionReturn {
  const [items, setItems] = useState<WorkspaceSectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await workspaceService.getSectionItems(kind, patientId);
      setItems(data ?? []);
    } catch (err: any) {
      setError(err?.message ?? i18n.t('workspace.errors.loadSection'));
    } finally {
      setLoading(false);
    }
  }, [kind, patientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { items, loading, error, refetch: fetchData };
}
