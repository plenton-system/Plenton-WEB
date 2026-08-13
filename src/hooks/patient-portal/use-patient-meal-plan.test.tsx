import type { PatientMealPlan } from 'src/types/domain/patient-portal';

import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { patientPortalService } from 'src/services/patientPortal/patientPortalService';

import { usePatientMealPlan } from './use-patient-meal-plan';

vi.mock('src/services/patientPortal/patientPortalService', () => ({
  normalizeDayOfWeek: (value: string | number) => {
    if (typeof value === 'number') return value;
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(
      value
    );
  },
  patientPortalService: {
    getMealPlans: vi.fn(),
    getMealPlan: vi.fn(),
  },
}));

const mondayPlan: PatientMealPlan = { id: 'monday', name: 'Monday', daysOfWeek: ['Monday'] };
const tuesdayPlan: PatientMealPlan = { id: 'tuesday', name: 'Tuesday', daysOfWeek: [2] };

describe('usePatientMealPlan', () => {
  beforeEach(() => vi.clearAllMocks());

  it('distinguishes an empty plan list from an error', async () => {
    vi.mocked(patientPortalService.getMealPlans).mockResolvedValue([]);
    const { result } = renderHook(() => usePatientMealPlan());
    await waitFor(() => expect(result.current.listLoading).toBe(false));
    expect(result.current.plans).toEqual([]);
    expect(result.current.listError).toBe(false);
  });

  it('matches string and numeric weekdays and reloads detail whenever the date changes', async () => {
    vi.mocked(patientPortalService.getMealPlans).mockResolvedValue([mondayPlan, tuesdayPlan]);
    vi.mocked(patientPortalService.getMealPlan).mockImplementation(async (id) => ({
      ...(id === 'monday' ? mondayPlan : tuesdayPlan),
      meals: [],
    }));
    const { result } = renderHook(() => usePatientMealPlan());
    await waitFor(() => expect(result.current.listLoading).toBe(false));

    act(() => result.current.setSelectedDate('2026-08-03'));
    await waitFor(() => expect(result.current.detail?.id).toBe('monday'));
    act(() => result.current.setSelectedDate('2026-08-04'));
    await waitFor(() => expect(result.current.detail?.id).toBe('tuesday'));
    act(() => result.current.setSelectedDate('2026-08-03'));
    await waitFor(() => expect(result.current.detail?.id).toBe('monday'));
    expect(patientPortalService.getMealPlan).toHaveBeenCalledTimes(3);
  });

  it('reloads detail when two dates are covered by the same plan', async () => {
    vi.mocked(patientPortalService.getMealPlans).mockResolvedValue([mondayPlan]);
    vi.mocked(patientPortalService.getMealPlan).mockResolvedValue({ ...mondayPlan, meals: [] });
    const { result } = renderHook(() => usePatientMealPlan());
    await waitFor(() => expect(result.current.listLoading).toBe(false));

    act(() => result.current.setSelectedDate('2026-08-03'));
    await waitFor(() => expect(result.current.detail?.id).toBe('monday'));
    act(() => result.current.setSelectedDate('2026-08-10'));
    await waitFor(() => expect(patientPortalService.getMealPlan).toHaveBeenCalledTimes(2));
  });

  it('discards an obsolete detail response after a rapid date change', async () => {
    let resolveMonday: ((value: PatientMealPlan) => void) | undefined;
    let resolveTuesday: ((value: PatientMealPlan) => void) | undefined;
    vi.mocked(patientPortalService.getMealPlans).mockResolvedValue([mondayPlan, tuesdayPlan]);
    vi.mocked(patientPortalService.getMealPlan).mockImplementation(
      (id) =>
        new Promise((resolve) => {
          if (id === 'monday') resolveMonday = resolve;
          else resolveTuesday = resolve;
        })
    );
    const { result } = renderHook(() => usePatientMealPlan());
    await waitFor(() => expect(result.current.listLoading).toBe(false));

    act(() => result.current.setSelectedDate('2026-08-03'));
    await waitFor(() => expect(resolveMonday).toBeDefined());
    act(() => result.current.setSelectedDate('2026-08-04'));
    await waitFor(() => expect(resolveTuesday).toBeDefined());
    await act(async () => {
      resolveMonday?.({ ...mondayPlan, meals: [] });
      resolveTuesday?.({ ...tuesdayPlan, meals: [] });
    });
    await waitFor(() => expect(result.current.detail?.id).toBe('tuesday'));
  });

  it('handles a cleared date without requesting or parsing a detail', async () => {
    vi.mocked(patientPortalService.getMealPlans).mockResolvedValue([mondayPlan]);
    const { result } = renderHook(() => usePatientMealPlan());
    await waitFor(() => expect(result.current.listLoading).toBe(false));
    act(() => result.current.setSelectedDate(''));
    expect(result.current.validSelectedDate).toBe(false);
    expect(result.current.selectedPlan).toBeNull();
    expect(result.current.detail).toBeNull();
  });

  it('discards a retry response after the selected date changes', async () => {
    let resolveRetry: ((value: PatientMealPlan) => void) | undefined;
    let resolveTuesday: ((value: PatientMealPlan) => void) | undefined;
    let mondayAttempts = 0;
    vi.mocked(patientPortalService.getMealPlans).mockResolvedValue([mondayPlan, tuesdayPlan]);
    vi.mocked(patientPortalService.getMealPlan).mockImplementation((id) => {
      if (id === 'monday') {
        mondayAttempts += 1;
        if (mondayAttempts === 1) return Promise.reject(new Error('temporary'));
        return new Promise((resolve) => {
          resolveRetry = resolve;
        });
      }
      return new Promise((resolve) => {
        resolveTuesday = resolve;
      });
    });
    const { result } = renderHook(() => usePatientMealPlan());
    await waitFor(() => expect(result.current.listLoading).toBe(false));
    act(() => result.current.setSelectedDate('2026-08-03'));
    await waitFor(() => expect(result.current.detailError).toBe(true));
    act(() => result.current.retryDetail());
    await waitFor(() => expect(resolveRetry).toBeDefined());
    act(() => result.current.setSelectedDate('2026-08-04'));
    await waitFor(() => expect(resolveTuesday).toBeDefined());
    await act(async () => {
      resolveRetry?.({ ...mondayPlan, meals: [] });
      resolveTuesday?.({ ...tuesdayPlan, meals: [] });
    });
    await waitFor(() => expect(result.current.detail?.id).toBe('tuesday'));
  });
});
