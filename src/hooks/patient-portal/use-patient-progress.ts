import type { AnthropometricEvolution } from 'src/types/domain/patient-portal';

import { useState, useEffect, useCallback } from 'react';

import { patientPortalService } from 'src/services/patientPortal/patientPortalService';

type RemoteState<T> = {
  data: T;
  loading: boolean;
  error: boolean;
};

export function usePatientProgress() {
  const [evolution, setEvolution] = useState<RemoteState<AnthropometricEvolution | null>>({
    data: null,
    loading: true,
    error: false,
  });
  const loadEvolution = useCallback(async () => {
    setEvolution((current) => ({ ...current, loading: true, error: false }));
    try {
      const data = await patientPortalService.getEvolution();
      setEvolution({ data, loading: false, error: false });
    } catch {
      setEvolution({ data: null, loading: false, error: true });
    }
  }, []);

  useEffect(() => {
    void loadEvolution();
  }, [loadEvolution]);

  return {
    evolution,
    retryEvolution: loadEvolution,
  };
}
