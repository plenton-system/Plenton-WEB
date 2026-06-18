import type {
  WorkspaceAnthropometricEvolutionView,
  WorkspaceAnthropometricEvolutionSelectorOption,
} from 'src/types';

import { useState, useEffect, useCallback } from 'react';

import { extractApiErrorMessage } from 'src/utils/api-error';

import i18n from 'src/i18n';
import { workspaceAnthropometricEvolutionService } from 'src/services/workspace/workspaceAnthropometricEvolutionService';

type UseWorkspaceAnthropometricEvolutionReturn = {
  options: WorkspaceAnthropometricEvolutionSelectorOption[];
  selectedEvaluationIds: string[];
  validationError: string | null;
  loadingOptions: boolean;
  loadingEvolution: boolean;
  optionsError: string | null;
  evolutionError: string | null;
  result: WorkspaceAnthropometricEvolutionView | null;
  setSelectedEvaluationIds: (value: string[]) => void;
  fetchEvolution: () => Promise<void>;
  refetchOptions: () => Promise<void>;
};

export function useWorkspaceAnthropometricEvolution(
  patientId?: string
): UseWorkspaceAnthropometricEvolutionReturn {
  const [options, setOptions] = useState<WorkspaceAnthropometricEvolutionSelectorOption[]>([]);
  const [selectedEvaluationIds, setSelectedEvaluationIdsState] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingEvolution, setLoadingEvolution] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [evolutionError, setEvolutionError] = useState<string | null>(null);
  const [result, setResult] = useState<WorkspaceAnthropometricEvolutionView | null>(null);

  const refetchOptions = useCallback(async () => {
    setLoadingOptions(true);
    setOptionsError(null);

    try {
      const data = await workspaceAnthropometricEvolutionService.getSelectableEvaluations(patientId);
      setOptions(data);
    } catch (err) {
      setOptions([]);
      setOptionsError(extractApiErrorMessage(err, i18n.t('workspace.errors.loadEvaluations')));
    } finally {
      setLoadingOptions(false);
    }
  }, [patientId]);

  useEffect(() => {
    setSelectedEvaluationIdsState([]);
    setValidationError(null);
    setEvolutionError(null);
    setResult(null);
  }, [patientId]);

  useEffect(() => {
    refetchOptions();
  }, [refetchOptions]);

  const setSelectedEvaluationIds = useCallback((value: string[]) => {
    setSelectedEvaluationIdsState(value);
    setValidationError(null);
    setEvolutionError(null);
    setResult(null);
  }, []);

  const fetchEvolution = useCallback(async () => {
    if (!patientId) {
      setEvolutionError(i18n.t('workspace.errors.evolutionPatientRequired'));
      return;
    }

    if (selectedEvaluationIds.length < 2) {
      setValidationError(i18n.t('workspace.errors.evolutionMinimum'));
      return;
    }

    setValidationError(null);
    setEvolutionError(null);
    setLoadingEvolution(true);

    try {
      const data = await workspaceAnthropometricEvolutionService.getEvolution({
        patientId,
        evaluationIds: selectedEvaluationIds,
      });

      setResult(data);
    } catch (err) {
      setResult(null);
      setEvolutionError(extractApiErrorMessage(err, i18n.t('workspace.errors.loadEvolution')));
    } finally {
      setLoadingEvolution(false);
    }
  }, [patientId, selectedEvaluationIds]);

  return {
    options,
    selectedEvaluationIds,
    validationError,
    loadingOptions,
    loadingEvolution,
    optionsError,
    evolutionError,
    result,
    setSelectedEvaluationIds,
    fetchEvolution,
    refetchOptions,
  };
}
