import type {
  FoodDto,
  MealDto,
  MealItemsDto,
  MealPlanStatus,
  HomemadeMeasureDto,
  MealPlanSummaryDto,
  MealPlanTargetsDto,
  MealPlanEditRequest,
  MealPlanCreateRequest,
  MealPlanDetailResponse,
  MealPlanMacrosSummaryDto,
  MealPlanMicrosSummaryDto,
  MealPlanPagedFilterRequest,
  MealPlanListByPatientResponse,
} from 'src/types';

import { get, post } from 'src/utils/http-client';
import { extractFileNameFromContentDisposition } from 'src/utils/format-file';

import api from 'src/services/api';
import { MealPlanStatus as MealPlanStatusEnum } from 'src/types';

type ApiEnvelope<T> = T | { data?: T };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const toText = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

const toNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const unwrapResponse = <T>(response: ApiEnvelope<T>): T => {
  if (isRecord(response) && 'data' in response && response.data !== undefined) {
    return response.data as T;
  }

  return response as T;
};

const toMealPlanStatus = (status: unknown): MealPlanStatus => {
  if (typeof status === 'number') {
    if (status === MealPlanStatusEnum.ACTIVE) return MealPlanStatusEnum.ACTIVE;
    if (status === MealPlanStatusEnum.INACTIVE) return MealPlanStatusEnum.INACTIVE;
    if (status === MealPlanStatusEnum.SUSPENDED) return MealPlanStatusEnum.SUSPENDED;
    return MealPlanStatusEnum.ACTIVE;
  }

  if (typeof status === 'string') {
    const normalized = status.trim().toUpperCase();

    if (normalized === 'ACTIVE') return MealPlanStatusEnum.ACTIVE;
    if (normalized === 'INACTIVE') return MealPlanStatusEnum.INACTIVE;
    if (normalized === 'SUSPENDED') return MealPlanStatusEnum.SUSPENDED;

    const numeric = Number(normalized);
    if (!Number.isNaN(numeric)) {
      return toMealPlanStatus(numeric);
    }
  }

  return MealPlanStatusEnum.ACTIVE;
};

const DAY_NAME_TO_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const toDayIndex = (day: unknown): number | null => {
  if (typeof day === 'number' && day >= 0 && day <= 6) return day;

  if (typeof day === 'string') {
    const normalized = day.trim().toLowerCase();
    if (normalized in DAY_NAME_TO_INDEX) return DAY_NAME_TO_INDEX[normalized];

    const numeric = Number(normalized);
    if (Number.isFinite(numeric) && numeric >= 0 && numeric <= 6) return numeric;
  }

  return null;
};

const normalizeDaysOfWeek = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];

  const indexes = value
    .map(toDayIndex)
    .filter((day): day is number => day !== null);

  return [...new Set(indexes)].sort((a, b) => a - b);
};

const normalizeHomemadeMeasure = (value: unknown): HomemadeMeasureDto | null => {
  if (!isRecord(value)) return null;

  const id = toText(value.id);
  if (!id) return null;

  return {
    id,
    foodId: toText(value.foodId) ?? '',
    name: toText(value.name) ?? '',
    quantityInGrams: toNumber(value.quantityInGrams) ?? 0,
    isGlobal: Boolean(value.isGlobal),
  };
};

const normalizeFood = (value: unknown): FoodDto => {
  if (!isRecord(value)) {
    return {
      id: '',
      description: '',
    };
  }

  return {
    id: toText(value.id) ?? '',
    description: toText(value.description) ?? '',
  };
};

const normalizeMealItem = (value: unknown): MealItemsDto => {
  const item = isRecord(value) ? value : {};
  const rawEquivalents = Array.isArray(item.equivalents) ? item.equivalents : [];

  return {
    id: toText(item.id),
    foodDto: normalizeFood(item.food),
    quantity: toNumber(item.quantity) ?? null,
    quantityInGrams: toNumber(item.quantityInGrams) ?? null,
    homemadeMeasureDto: normalizeHomemadeMeasure(item.homemadeMeasureDto),
    notes: toText(item.notes) ?? '',
    order: toNumber(item.order) ?? null,
    isOptional: Boolean(item.isOptional),
    portionLabel: toText(item.portionLabel) ?? '',
    isEquivalentes: Boolean(item.isEquivalentes),
    parentMealItemId: toText(item.parentMealItemId) ?? null,
    equivalents: rawEquivalents.map(normalizeMealItem),
  };
};

const normalizeMeal = (value: unknown): MealDto => {
  const meal = isRecord(value) ? value : {};
  const rawItems = Array.isArray(meal.items) ? meal.items : [];
  const rawSubstitute = Array.isArray(meal.substitute) ? meal.substitute : [];

  return {
    id: toText(meal.id),
    name: toText(meal.name) ?? '',
    description: toText(meal.description) ?? '',
    time: toText(meal.time) ?? '',
    isSubstitute: Boolean(meal.isSubstitute),
    idPrincipalMeal: toText(meal.idPrincipalMeal) ?? null,
    items: rawItems.map(normalizeMealItem),
    substitute: rawSubstitute.map(normalizeMeal),
  };
};

const normalizeTargets = (value: unknown): MealPlanTargetsDto | null => {
  if (!isRecord(value)) return null;

  return {
    calories: toNumber(value.calories) ?? 0,
    protein: toNumber(value.protein) ?? 0,
    carbs: toNumber(value.carbs) ?? 0,
    fat: toNumber(value.fat) ?? 0,
    fiber: toNumber(value.fiber) ?? 0,
  };
};

const normalizeMacrosSummary = (value: unknown): MealPlanMacrosSummaryDto => {
  const macros = isRecord(value) ? value : {};

  return {
    calories: toNumber(macros.calories) ?? 0,
    protein: toNumber(macros.protein) ?? 0,
    carbs: toNumber(macros.carbs) ?? 0,
    fat: toNumber(macros.fat) ?? 0,
    fiber: toNumber(macros.fiber) ?? 0,
  };
};

const normalizeMicrosSummary = (value: unknown): MealPlanMicrosSummaryDto => {
  const micros = isRecord(value) ? value : {};

  return {
    vitaminA: toNumber(micros.vitaminA) ?? 0,
    vitaminC: toNumber(micros.vitaminC) ?? 0,
    vitaminD: toNumber(micros.vitaminD) ?? 0,
    calcium: toNumber(micros.calcium) ?? 0,
    iron: toNumber(micros.iron) ?? 0,
    zinc: toNumber(micros.zinc) ?? 0,
    potassium: toNumber(micros.potassium) ?? 0,
    sodium: toNumber(micros.sodium) ?? 0,
  };
};

const normalizeSummary = (value: unknown): MealPlanSummaryDto | null => {
  if (!isRecord(value)) return null;

  return {
    macros: normalizeMacrosSummary(value.macros),
    micros: normalizeMicrosSummary(value.micros),
  };
};

const normalizeDetail = (value: unknown, fallbackId: string): MealPlanDetailResponse => {
  const detail = isRecord(value) ? value : {};
  const rawMeals = Array.isArray(detail.meals) ? detail.meals : [];

  return {
    id: toText(detail.id) ?? fallbackId,
    name: toText(detail.name) ?? '',
    status: toMealPlanStatus(detail.status),
    daysOfWeek: normalizeDaysOfWeek(detail.daysOfWeek),
    nutritionistId: toText(detail.nutritionistId) ?? '',
    patientId: toText(detail.patientId) ?? '',
    meals: rawMeals.map(normalizeMeal),
    targets: normalizeTargets(detail.targets),
    summary: normalizeSummary(detail.summary),
  };
};

const emptyListResponse: MealPlanListByPatientResponse = {
  currentPage: 0,
  totalPages: 0,
  totalCount: 0,
  pageSize: 0,
  items: [],
};

const toEditPayload = (payload: MealPlanEditRequest) => {
  const basePayload = {
    name: payload.name,
    status: payload.status,
    daysOfWeek: payload.daysOfWeek,
    meals: payload.meals,
  };

  if (payload.targets) {
    return { ...basePayload, targets: payload.targets };
  }

  return basePayload;
};

export const mealPlanService = {
  getByPatient: async (
    payload: MealPlanPagedFilterRequest
  ): Promise<MealPlanListByPatientResponse> => {
    const response = await post<ApiEnvelope<MealPlanListByPatientResponse>>(
      '/api/MealPlan/get-meal-plan-by-patient-paged',
      payload
    );

    const page = unwrapResponse(response);
    return Array.isArray(page?.items) ? page : emptyListResponse;
  },

  getById: async (idMealPlan: string): Promise<MealPlanDetailResponse> => {
    const response = await get<ApiEnvelope<MealPlanDetailResponse>>(
      `/api/MealPlan/get-meal-plan/${idMealPlan}`
    );

    const raw = unwrapResponse(response);
    return normalizeDetail(raw, idMealPlan);
  },

  create: async (payload: MealPlanCreateRequest): Promise<void> => {
    await post('/api/MealPlan/create-meal-plan', payload);
  },

  edit: async (payload: MealPlanEditRequest): Promise<void> => {
    await post('/api/MealPlan/edit-meal-plan', toEditPayload(payload), {
      params: { idMealPlan: payload.id },
    });
  },

  downloadPdf: async (idMealPlan: string): Promise<{ blob: Blob; fileName: string }> => {
    const response = await api.get<Blob>(`/api/MealPlan/${idMealPlan}/pdf`, {
      responseType: 'blob',
    });

    const fileName =
      extractFileNameFromContentDisposition(response.headers?.['content-disposition']) ??
      `plano-alimentar-${idMealPlan}.pdf`;

    return { blob: response.data, fileName };
  },
};
