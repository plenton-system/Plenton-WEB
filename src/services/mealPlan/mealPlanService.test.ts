import type { MealPlanCreateRequest } from 'src/types';

import { it, vi, expect, describe, beforeEach } from 'vitest';

import { post } from 'src/utils/http-client';

import { MealPlanStatus } from 'src/types';

import { mealPlanService } from './mealPlanService';

const { deleteMock } = vi.hoisted(() => ({ deleteMock: vi.fn() }));

vi.mock('src/utils/http-client', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));
vi.mock('src/services/api', () => ({ default: { delete: deleteMock } }));

const postMock = vi.mocked(post);
const payload: MealPlanCreateRequest = {
  name: 'Plano semanal',
  status: MealPlanStatus.ACTIVE,
  daysOfWeek: [1, 3, 5],
  nutritionistId: 'nutritionist-1',
  patientId: 'patient-1',
  meals: [],
};

describe('mealPlanService.create', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    ['direct id', 'plan-1'],
    ['id envelope', { data: { id: 'plan-1' } }],
    ['mealPlanId envelope', { data: { mealPlanId: 'plan-1' } }],
  ])('preserves the created identity from a %s response', async (_, response) => {
    postMock.mockResolvedValueOnce(response);

    await expect(mealPlanService.create(payload)).resolves.toMatchObject({
      ...payload,
      id: 'plan-1',
    });
    expect(postMock).toHaveBeenCalledWith('/api/MealPlan/create-meal-plan', payload);
  });

  it('rejects a successful response without an identity to prevent duplicate creates', async () => {
    postMock.mockResolvedValueOnce({ data: {} });

    await expect(mealPlanService.create(payload)).rejects.toThrow();
  });
});

describe('mealPlanService.delete', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([{ data: true }, { data: { data: true } }])(
    'deletes by id and validates a successful envelope',
    async (response) => {
      deleteMock.mockResolvedValueOnce(response);

      await expect(mealPlanService.delete('plan-1')).resolves.toBe(true);
      expect(deleteMock).toHaveBeenCalledWith('/api/MealPlan/plan-1');
    }
  );

  it('rejects an unsuccessful envelope', async () => {
    deleteMock.mockResolvedValueOnce({ data: { data: false } });
    await expect(mealPlanService.delete('plan-1')).rejects.toThrow();
  });

  it('propagates API errors', async () => {
    const error = new Error('request failed');
    deleteMock.mockRejectedValueOnce(error);
    await expect(mealPlanService.delete('plan-1')).rejects.toBe(error);
  });
});
