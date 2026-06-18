import type { SaveAnthropometryRequest, WorkspaceAnthropometryDetail } from 'src/types';

import { useState, useEffect, useCallback } from 'react';

import { extractApiErrorMessage } from 'src/utils/api-error';

import i18n from 'src/i18n';
import { workspaceAnthropometryService } from 'src/services/workspace/workspaceAnthropometryService';

type UseWorkspaceAnthropometryDetailReturn = {
  data: WorkspaceAnthropometryDetail | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  saveError: string | null;
  refetch: () => Promise<void>;
  save: (dto: SaveAnthropometryRequest) => Promise<WorkspaceAnthropometryDetail>;
  reset: () => void;
};

export function useWorkspaceAnthropometryDetail(
  patientId?: string,
  evaluationId?: string | null,
  open = false
): UseWorkspaceAnthropometryDetailReturn {
  const [data, setData] = useState<WorkspaceAnthropometryDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setSaveError(null);
    setLoading(false);
    setSaving(false);
  }, []);

  const refetch = useCallback(async () => {
    if (!open || !patientId || !evaluationId) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const detail = await workspaceAnthropometryService.getById(patientId, evaluationId);
      setData(detail);
    } catch (fetchError) {
      setError(extractApiErrorMessage(fetchError, i18n.t('workspace.errors.loadAnthropometryDetail')));
    } finally {
      setLoading(false);
    }
  }, [evaluationId, open, patientId]);

  const save = useCallback(
    async (dto: SaveAnthropometryRequest) => {
      if (!patientId) {
        throw new Error(i18n.t('workspace.errors.patientRequired'));
      }

      setSaving(true);
      setSaveError(null);

      try {
        const result = evaluationId
          ? await workspaceAnthropometryService.update(patientId, evaluationId, dto)
          : await workspaceAnthropometryService.create(patientId, dto);

        setData(result);
        return result;
      } catch (saveRequestError) {
        const message = extractApiErrorMessage(
          saveRequestError,
          i18n.t('workspace.errors.saveAnthropometry')
        );
        setSaveError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [evaluationId, patientId]
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, saving, error, saveError, refetch, save, reset };
}
