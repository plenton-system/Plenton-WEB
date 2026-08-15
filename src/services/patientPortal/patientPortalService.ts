import type {
  PatientMealPlan,
  CapabilityResult,
  PatientPreferences,
  PatientSelfProfile,
  PatientNutritionist,
  AnthropometricEvolution,
} from 'src/types/domain/patient-portal';

import { isAxiosError } from 'axios';

import api from 'src/services/api';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from 'src/i18n';

type ApiEnvelope<T> = { data?: T | null } | T;

const hasStatus = (error: unknown, statuses: number[]) =>
  isAxiosError(error) && statuses.includes(error.response?.status ?? 0);

const unavailableCapability = (error: unknown) => hasStatus(error, [404, 405, 501]);

function unwrap<T>(value: ApiEnvelope<T>): T | null {
  if (value && typeof value === 'object' && 'data' in value) return value.data ?? null;
  return (value as T) ?? null;
}

const normalizeTheme = (value?: string | null): PatientPreferences['theme'] => {
  const normalized = value?.toLowerCase();
  return normalized === 'light' || normalized === 'dark' || normalized === 'system'
    ? normalized
    : 'system';
};

const normalizeLanguage = (value?: string | null): PatientPreferences['preferredLanguage'] => {
  if (value === 'en') return 'en-US';
  if (value === 'pt') return 'pt-BR';
  return SUPPORTED_LANGUAGES.includes(value as PatientPreferences['preferredLanguage'])
    ? (value as PatientPreferences['preferredLanguage'])
    : DEFAULT_LANGUAGE;
};

function normalizePreferences(value: Partial<PatientPreferences> | null): PatientPreferences {
  return {
    theme: normalizeTheme(value?.theme),
    preferredLanguage: normalizeLanguage(value?.preferredLanguage),
  };
}

function normalizeProfile(value: PatientSelfProfile): PatientSelfProfile {
  return {
    ...value,
    phone: value.phone ?? '',
    profilePhoto: value.profilePhoto ?? '',
  };
}

export const normalizeDayOfWeek = (value: string | number): number | null => {
  if (typeof value === 'number' && value >= 0 && value <= 6) return value;
  const numeric = Number(value);
  if (Number.isInteger(numeric) && numeric >= 0 && numeric <= 6) return numeric;

  const names = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const index = names.indexOf(String(value).trim().toLowerCase());
  return index >= 0 ? index : null;
};

function normalizePlan(plan: PatientMealPlan): PatientMealPlan {
  const rawDays = Array.isArray(plan.daysOfWeek)
    ? plan.daysOfWeek
    : String(plan.daysOfWeek ?? '')
        .split(',')
        .filter(Boolean);
  return { ...plan, daysOfWeek: rawDays };
}

export const patientPortalService = {
  async getEvolution(): Promise<AnthropometricEvolution | null> {
    const response = await api.get<ApiEnvelope<AnthropometricEvolution>>(
      '/api/patient/me/anthropometry/evolution'
    );
    return unwrap(response.data);
  },

  async getNutritionist(): Promise<PatientNutritionist | null> {
    try {
      const response = await api.get<ApiEnvelope<PatientNutritionist>>(
        '/api/patient/me/nutritionist'
      );
      const value = unwrap(response.data);
      if (!value) return null;
      const candidate = value as PatientNutritionist & {
        addressDto?: PatientNutritionist['address'];
      };
      return { ...value, address: value.address ?? candidate.addressDto ?? null };
    } catch (error) {
      if (hasStatus(error, [404])) return null;
      throw error;
    }
  },

  async getMealPlans(): Promise<PatientMealPlan[]> {
    const response = await api.get<ApiEnvelope<PatientMealPlan[]>>('/api/patient/me/meal-plans');
    return (unwrap(response.data) ?? []).map(normalizePlan);
  },

  async getMealPlan(id: string, signal?: AbortSignal): Promise<PatientMealPlan | null> {
    try {
      const response = await api.get<ApiEnvelope<PatientMealPlan>>(
        `/api/patient/me/meal-plans/${encodeURIComponent(id)}`,
        { signal }
      );
      const value = unwrap(response.data);
      return value ? normalizePlan(value) : null;
    } catch (error) {
      if (hasStatus(error, [404])) return null;
      throw error;
    }
  },

  async getProfile(): Promise<CapabilityResult<PatientSelfProfile>> {
    try {
      const response = await api.get<ApiEnvelope<PatientSelfProfile>>('/api/patient/me/profile');
      const value = unwrap(response.data);
      if (!value) return { status: 'unavailable', data: null };
      return { status: 'available', data: normalizeProfile(value) };
    } catch (error) {
      if (unavailableCapability(error)) return { status: 'unavailable', data: null };
      throw error;
    }
  },

  async getPreferences(): Promise<CapabilityResult<PatientPreferences>> {
    try {
      const response = await api.get<ApiEnvelope<PatientPreferences>>('/api/auth/preferences');
      return { status: 'available', data: normalizePreferences(unwrap(response.data)) };
    } catch (error) {
      if (unavailableCapability(error)) return { status: 'unavailable', data: null };
      throw error;
    }
  },

  async updatePreferences(payload: PatientPreferences): Promise<PatientPreferences> {
    const response = await api.put<ApiEnvelope<PatientPreferences>>(
      '/api/auth/preferences',
      payload
    );
    return normalizePreferences(unwrap(response.data) ?? payload);
  },
};
