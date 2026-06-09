import type { HomemadeMeasureDto } from 'src/types';

import { get, post } from 'src/utils/http-client';

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

const normalizeHomemadeMeasure = (value: unknown): HomemadeMeasureDto => {
  const item = isRecord(value) ? value : {};

  return {
    id: toText(item.id) ?? '',
    foodId: toText(item.foodId) ?? '',
    name: toText(item.description) ?? toText(item.name) ?? '',
    quantityInGrams: toNumber(item.quantityInGrams) ?? 0,
    isGlobal: Boolean(item.isGlobal),
  };
};

export const homemadeMeasureService = {
  getByFood: async (foodId: string): Promise<HomemadeMeasureDto[]> => {
    const response = await get<ApiEnvelope<HomemadeMeasureDto[]>>('/api/homemade-measures', {
      params: { foodId },
    });

    const data = unwrapResponse(response);
    return Array.isArray(data) ? data.map(normalizeHomemadeMeasure) : [];
  },

  create: async (payload: Omit<HomemadeMeasureDto, 'id'>): Promise<HomemadeMeasureDto> => {
    const response = await post<ApiEnvelope<HomemadeMeasureDto>>('/api/homemade-measures', {
        foodId: payload.foodId,
        description: payload.name,
        quantityInGrams: payload.quantityInGrams,
        isGlobal: payload.isGlobal,
    });

    return normalizeHomemadeMeasure(unwrapResponse(response));
  },
};
