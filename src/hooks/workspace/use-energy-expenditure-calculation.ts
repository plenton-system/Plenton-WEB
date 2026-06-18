import type { CalculateEnergyRequest, EnergyCalculationResult } from 'src/types';

import { useState, useCallback } from 'react';

import { extractApiErrorMessage } from 'src/utils/api-error';

import i18n from 'src/i18n';
import { workspaceAnthropometryService } from 'src/services/workspace/workspaceAnthropometryService';

type UseEnergyExpenditureCalculationReturn = {
  result: EnergyCalculationResult | null;
  loading: boolean;
  error: string | null;
  calculate: (dto: CalculateEnergyRequest) => Promise<EnergyCalculationResult>;
  setResult: React.Dispatch<React.SetStateAction<EnergyCalculationResult | null>>;
  reset: () => void;
};

export function useEnergyExpenditureCalculation(
  patientId?: string
): UseEnergyExpenditureCalculationReturn {
  const [result, setResult] = useState<EnergyCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  const calculate = useCallback(
    async (dto: CalculateEnergyRequest) => {
      if (!patientId) {
        throw new Error(i18n.t('workspace.errors.patientRequired'));
      }

      setLoading(true);
      setError(null);

      try {
        const response = await workspaceAnthropometryService.calculateEnergy(patientId, dto);
        setResult(response);
        return response;
      } catch (requestError) {
        const message = extractApiErrorMessage(
          requestError,
          i18n.t('workspace.errors.calculateEnergy')
        );
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [patientId]
  );

  return { result, loading, error, calculate, setResult, reset };
}
