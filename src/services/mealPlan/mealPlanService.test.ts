import type { MealPlanCreateRequest } from 'src/types';

import { it, vi, expect, describe, beforeEach } from 'vitest';

import { post } from 'src/utils/http-client';

import { MealPlanStatus } from 'src/types';

import { mealPlanService } from './mealPlanService';

vi.mock('src/utils/http-client', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

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
