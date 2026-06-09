import type {
  WorkspaceAnthropometricEvolutionView,
  WorkspaceAnthropometricEvolutionRequest,
  WorkspaceAnthropometricEvolutionSelectorOption,
} from 'src/types';

import { get, post } from 'src/utils/http-client';
import { fDateTimePtBr } from 'src/utils/format-time';

type ApiEnvelope<T> = {
  data?: T | null;
  isSuccess?: boolean;
  message?: string | null;
  messages?: string[];
  status?: number;
};

type SelectableEvaluationApiItem = {
  patientId?: string | null;
  evaluationId?: string | null;
  evaluationDateUtc?: string | null;
  description?: string | null;
};

const buildSelectorLabel = (item: SelectableEvaluationApiItem) => {
  const dateText = item.evaluationDateUtc ? fDateTimePtBr(item.evaluationDateUtc) || item.evaluationDateUtc : '-';
  return item.description?.trim() ? `${dateText} • ${item.description.trim()}` : dateText;
};

const unwrapEnvelope = <T>(response: ApiEnvelope<T> | T): T | null => {
  if (response && typeof response === 'object' && 'data' in response) {
    const envelope = response as ApiEnvelope<T>;

    if (envelope.isSuccess === false) {
      throw new Error(envelope.message ?? 'Não foi possível carregar os dados da evolução antropométrica.');
    }

    return envelope.data ?? null;
  }

  return (response as T) ?? null;
};

const mapSelectableEvaluation = (
  item: SelectableEvaluationApiItem
): WorkspaceAnthropometricEvolutionSelectorOption => ({
  patientId: String(item.patientId ?? ''),
  evaluationId: String(item.evaluationId ?? ''),
  evaluationDateUtc: item.evaluationDateUtc ?? '',
  description: item.description ?? null,
  label: buildSelectorLabel(item),
});

export const workspaceAnthropometricEvolutionService = {
  getSelectableEvaluations: async (patientId?: string): Promise<WorkspaceAnthropometricEvolutionSelectorOption[]> => {
    if (!patientId) return [];

    const response = await get<ApiEnvelope<SelectableEvaluationApiItem[]>>(
      `/api/Anthropometry/patient/${patientId}/evaluations/selectable`
    );

    return (unwrapEnvelope(response) ?? []).map(mapSelectableEvaluation);
  },

  getEvolution: async (
    request: WorkspaceAnthropometricEvolutionRequest
  ): Promise<WorkspaceAnthropometricEvolutionView> => {
    if (!request.patientId) {
      throw new Error('Paciente não informado para consultar a evolução antropométrica.');
    }

    if (request.evaluationIds.length < 2) {
      throw new Error('Selecione pelo menos duas avaliações para consultar a evolução.');
    }

    const response = await post<ApiEnvelope<WorkspaceAnthropometricEvolutionView>>(
      '/api/Anthropometry/evolution',
      request
    );

    const data = unwrapEnvelope(response);
    if (!data) {
      throw new Error('Não foi possível carregar a evolução antropométrica.');
    }

    return data;
  },
};
