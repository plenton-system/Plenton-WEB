import type { SystemSettingsProps, SystemSettingsViewProps } from 'src/types/domain/system-settings';

import { useState, useEffect, useCallback } from 'react';

import { extractApiErrorMessage } from 'src/utils/api-error';

import { systemSettingsService } from 'src/services/systemSettings/systemSettingsService';

type UseSystemSettingsOptions = {
  userId?: string | null;
  autoLoad?: boolean;
};

function mapApiToSystemSettingsDetail(apiData: SystemSettingsProps): SystemSettingsViewProps {
  return {
    id: apiData.id,
    userId: apiData.userId,
    generalDto: apiData.generalDto,
    anamnesisDto: apiData.anamnesisDto,
    preferenceDto: apiData.preferenceDto,
    appSystemSettingsDto: apiData.appSystemSettingsDto,
  };
}

export function useSystemSettingsDetail({ userId, autoLoad = true }: UseSystemSettingsOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SystemSettingsProps | null>(null);

  const setStates = (isLoading: boolean = true) => {
    setError(null);
    setLoading(isLoading);
  };

  setStates();

  const fetchDetail = useCallback(async () => {
    if (!autoLoad) return;
    setStates();
    try {
      const result = await systemSettingsService.getByUserId(userId!);
      const mapped = mapApiToSystemSettingsDetail(result);

      setData(mapped);
    } catch (erro) {
      setError(extractApiErrorMessage(erro, 'Erro ao buscar paciente'));
    } finally {
      setLoading(false);
    }
  }, [autoLoad, userId]);

  useEffect(() => {
    fetchDetail();
  }, [userId, fetchDetail]);

  return {
    data,
    loading,
    error,
    setData,
  };
}
