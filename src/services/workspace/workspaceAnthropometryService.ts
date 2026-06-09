import type {
  CalculateEnergyRequest,
  EnergyCalculationResult,
  SaveAnthropometryRequest,
  WorkspaceAnthropometryDetail,
  WorkspaceAnthropometryListItem,
  WorkspaceAnthropometryProtocol,
  WorkspaceAnthropometryResponse,
} from 'src/types';

import { del, get, put, post } from 'src/utils/http-client';

type ApiEnvelope<T> = {
  data?: T | null;
  isSuccess?: boolean;
  message?: string | null;
  messages?: string[];
  status?: number;
};

type WorkspaceAnthropometryListApiItem = {
  id?: string | null;
  evaluationDateUtc?: string | null;
  weight?: number | null;
  height?: number | null;
  bmi?: number | null;
  bodyFatPercentage?: number | null;
  leanMass?: number | null;
  abdominalCircumference?: number | null;
  hipCircumference?: number | null;
  whr?: number | null;
  hasNutritionGoal?: boolean | null;
  energyProtocol?: string | null;
  tdeeKcal?: number | null;
  createdAt?: string | null;
};

type WorkspaceAnthropometryDetailApi = {
  id?: string | null;
  patientId?: string | null;
  evaluationDateUtc?: string | null;
  weight?: number | null;
  height?: number | null;
  bmi?: number | null;
  bodyFatPercentage?: number | null;
  musclePercentage?: number | null;
  abdominalCircumference?: number | null;
  hipCircumference?: number | null;
  rightRelaxedArmCircumference?: number | null;
  leftRelaxedArmCircumference?: number | null;
  rightFlexedArmCircumference?: number | null;
  leftFlexedArmCircumference?: number | null;
  rightForearmCircumference?: number | null;
  leftForearmCircumference?: number | null;
  rightWristCircumference?: number | null;
  leftWristCircumference?: number | null;
  neckCircumference?: number | null;
  shoulderCircumference?: number | null;
  chestCircumference?: number | null;
  waistCircumference?: number | null;
  rightCalfCircumference?: number | null;
  leftCalfCircumference?: number | null;
  rightThighCircumference?: number | null;
  leftThighCircumference?: number | null;
  rightProximalThighCircumference?: number | null;
  leftProximalThighCircumference?: number | null;
  whr?: number | null;
  leanMass?: number | null;
  fatMass?: number | null;
  notes?: string | null;
  nutritionGoal?: {
    id?: string | null;
    protocol?: string | null;
    activityFactor?: number | null;
    tmbKcal?: number | null;
    tdeeKcal?: number | null;
    calculatedAtUtc?: string | null;
  } | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const DEFAULT_RESPONSE: WorkspaceAnthropometryResponse = {
  currentPage: 0,
  totalPages: 0,
  totalCount: 0,
  pageSize: 0,
  items: [],
};

const toNullableNumber = (value: unknown): number | null | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : value == null ? null : undefined;

const toProtocol = (value: unknown): WorkspaceAnthropometryProtocol | null => {
  if (typeof value !== 'string') return null;
  if (value === 'MifflinStJeor' || value === 'HarrisBenedict' || value === 'FaoOms') return value;
  return null;
};

const unwrapEnvelope = <T>(response: T | ApiEnvelope<T>): T | null => {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ApiEnvelope<T>).data ?? null;
  }

  return (response as T) ?? null;
};

const mapListItem = (item: WorkspaceAnthropometryListApiItem): WorkspaceAnthropometryListItem => ({
  id: String(item.id ?? ''),
  evaluationDateUtc: item.evaluationDateUtc ?? '',
  weight: toNullableNumber(item.weight),
  height: toNullableNumber(item.height),
  bmi: toNullableNumber(item.bmi),
  bodyFatPercentage: toNullableNumber(item.bodyFatPercentage),
  leanMass: toNullableNumber(item.leanMass),
  abdominalCircumference: toNullableNumber(item.abdominalCircumference),
  hipCircumference: toNullableNumber(item.hipCircumference),
  whr: toNullableNumber(item.whr),
  hasNutritionGoal: Boolean(item.hasNutritionGoal),
  energyProtocol: toProtocol(item.energyProtocol),
  tdeeKcal: toNullableNumber(item.tdeeKcal),
  createdAt: item.createdAt ?? '',
});

const mapDetail = (item: WorkspaceAnthropometryDetailApi): WorkspaceAnthropometryDetail => ({
  id: String(item.id ?? ''),
  patientId: String(item.patientId ?? ''),
  evaluationDateUtc: item.evaluationDateUtc ?? '',
  weight: toNullableNumber(item.weight),
  height: toNullableNumber(item.height),
  bmi: toNullableNumber(item.bmi),
  bodyFatPercentage: toNullableNumber(item.bodyFatPercentage),
  musclePercentage: toNullableNumber(item.musclePercentage),
  abdominalCircumference: toNullableNumber(item.abdominalCircumference),
  hipCircumference: toNullableNumber(item.hipCircumference),
  rightRelaxedArmCircumference: toNullableNumber(item.rightRelaxedArmCircumference),
  leftRelaxedArmCircumference: toNullableNumber(item.leftRelaxedArmCircumference),
  rightFlexedArmCircumference: toNullableNumber(item.rightFlexedArmCircumference),
  leftFlexedArmCircumference: toNullableNumber(item.leftFlexedArmCircumference),
  rightForearmCircumference: toNullableNumber(item.rightForearmCircumference),
  leftForearmCircumference: toNullableNumber(item.leftForearmCircumference),
  rightWristCircumference: toNullableNumber(item.rightWristCircumference),
  leftWristCircumference: toNullableNumber(item.leftWristCircumference),
  neckCircumference: toNullableNumber(item.neckCircumference),
  shoulderCircumference: toNullableNumber(item.shoulderCircumference),
  chestCircumference: toNullableNumber(item.chestCircumference),
  waistCircumference: toNullableNumber(item.waistCircumference),
  rightCalfCircumference: toNullableNumber(item.rightCalfCircumference),
  leftCalfCircumference: toNullableNumber(item.leftCalfCircumference),
  rightThighCircumference: toNullableNumber(item.rightThighCircumference),
  leftThighCircumference: toNullableNumber(item.leftThighCircumference),
  rightProximalThighCircumference: toNullableNumber(item.rightProximalThighCircumference),
  leftProximalThighCircumference: toNullableNumber(item.leftProximalThighCircumference),
  whr: toNullableNumber(item.whr),
  leanMass: toNullableNumber(item.leanMass),
  fatMass: toNullableNumber(item.fatMass),
  notes: item.notes ?? null,
  nutritionGoal: item.nutritionGoal
    ? {
        id: String(item.nutritionGoal.id ?? ''),
        protocol: toProtocol(item.nutritionGoal.protocol) ?? 'MifflinStJeor',
        activityFactor: item.nutritionGoal.activityFactor ?? 0,
        tmbKcal: item.nutritionGoal.tmbKcal ?? 0,
        tdeeKcal: item.nutritionGoal.tdeeKcal ?? 0,
        calculatedAtUtc: item.nutritionGoal.calculatedAtUtc ?? '',
      }
    : null,
  createdAt: item.createdAt ?? '',
  updatedAt: item.updatedAt ?? null,
});

export const workspaceAnthropometryService = {
  getAll: async (patientId?: string): Promise<WorkspaceAnthropometryResponse> => {
    if (!patientId) return DEFAULT_RESPONSE;

    const response = await get<ApiEnvelope<WorkspaceAnthropometryListApiItem[]>>(
      `/api/patient/${patientId}/evaluations`
    );

    const items = (unwrapEnvelope(response) ?? []).map(mapListItem);

    return {
      currentPage: 0,
      totalPages: items.length ? 1 : 0,
      totalCount: items.length,
      pageSize: items.length,
      items,
    };
  },

  getById: async (
    patientId: string,
    evaluationId: string
  ): Promise<WorkspaceAnthropometryDetail> => {
    const response = await get<ApiEnvelope<WorkspaceAnthropometryDetailApi>>(
      `/api/patient/${patientId}/evaluations/${evaluationId}`
    );

    const data = unwrapEnvelope(response);
    if (!data) {
      throw new Error('Avaliação antropométrica não encontrada.');
    }

    return mapDetail(data);
  },

  getLatest: async (patientId: string): Promise<WorkspaceAnthropometryDetail | null> => {
    const list = await workspaceAnthropometryService.getAll(patientId);
    const latestId = list.items[0]?.id;

    if (!latestId) return null;

    return workspaceAnthropometryService.getById(patientId, latestId);
  },

  create: async (
    patientId: string,
    dto: SaveAnthropometryRequest
  ): Promise<WorkspaceAnthropometryDetail> => {
    const response = await post<ApiEnvelope<WorkspaceAnthropometryDetailApi>>(
      `/api/patient/${patientId}/evaluations`,
      dto
    );

    const data = unwrapEnvelope(response);
    if (!data) {
      throw new Error('Não foi possível salvar a avaliação antropométrica.');
    }

    return mapDetail(data);
  },

  update: async (
    patientId: string,
    evaluationId: string,
    dto: SaveAnthropometryRequest
  ): Promise<WorkspaceAnthropometryDetail> => {
    const response = await put<ApiEnvelope<WorkspaceAnthropometryDetailApi>>(
      `/api/patient/${patientId}/evaluations/${evaluationId}`,
      dto
    );

    const data = unwrapEnvelope(response);
    if (!data) {
      throw new Error('Não foi possível atualizar a avaliação antropométrica.');
    }

    return mapDetail(data);
  },

  delete: async (patientId: string, evaluationId: string): Promise<boolean> => {
    const status = await del(`/api/patient/${patientId}/evaluations/${evaluationId}`);
    return status === 204;
  },

  calculateEnergy: async (
    patientId: string,
    dto: CalculateEnergyRequest
  ): Promise<EnergyCalculationResult> => {
    const response = await post<ApiEnvelope<EnergyCalculationResult>>(
      `/api/patient/${patientId}/evaluations/calculate-energy`,
      dto
    );

    const data = unwrapEnvelope(response);
    if (!data) {
      throw new Error('Não foi possível calcular o gasto energético.');
    }

    return data;
  },
};
