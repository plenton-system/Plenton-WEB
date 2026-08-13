import { it, vi, expect, describe, beforeEach } from 'vitest';

import api from 'src/services/api';

import { normalizeDayOfWeek, patientPortalService } from './patientPortalService';

vi.mock('src/services/api', () => ({
  default: { get: vi.fn(), put: vi.fn() },
}));

const getMock = vi.mocked(api.get);
const putMock = vi.mocked(api.put);
const httpError = (status: number) => ({ isAxiosError: true, response: { status } });

describe('patientPortalService', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    ['Sunday', 0],
    ['monday', 1],
    ['6', 6],
    [3, 3],
    ['invalid', null],
  ])('normalizes weekday %j', (value, expected) => {
    expect(normalizeDayOfWeek(value)).toBe(expected);
  });

  it('loads only the authenticated patient evolution endpoint', async () => {
    getMock.mockResolvedValueOnce({
      data: { data: { totalEvaluations: 0, trends: [], points: [] } },
    });

    await expect(patientPortalService.getEvolution()).resolves.toMatchObject({
      totalEvaluations: 0,
    });
    expect(getMock).toHaveBeenCalledWith('/api/patient/me/anthropometry/evolution');
    expect(JSON.stringify(getMock.mock.calls)).not.toContain('patientId');
  });

  it('normalizes list envelopes and comma-separated weekdays', async () => {
    getMock.mockResolvedValueOnce({
      data: { data: [{ id: 'plan-1', name: 'Plan', daysOfWeek: 'Monday,Friday' }] },
    });

    await expect(patientPortalService.getMealPlans()).resolves.toEqual([
      expect.objectContaining({ daysOfWeek: ['Monday', 'Friday'] }),
    ]);
    expect(getMock).toHaveBeenCalledWith('/api/patient/me/meal-plans');
  });

  it('uses only allowlisted self-profile fields and endpoints', async () => {
    const payload = {
      phone: '11999999999',
      profilePhoto: 'photo',
      addressDto: {
        street: 'Street',
        number: '1',
        neighborhood: 'Center',
        city: 'City',
        state: 'SP',
        zipCode: '00000-000',
      },
    };
    putMock.mockResolvedValueOnce({ data: { data: { ...payload, address: payload.addressDto } } });

    await patientPortalService.updateProfile(payload);
    expect(putMock).toHaveBeenCalledWith('/api/patient/me/profile', payload);
    expect(JSON.stringify(putMock.mock.calls)).not.toContain('patientId');
  });

  it('returns unavailable for a profile capability missing from an older backend', async () => {
    getMock.mockRejectedValueOnce(httpError(404));
    await expect(patientPortalService.getProfile()).resolves.toEqual({
      status: 'unavailable',
      data: null,
    });
  });

  it('does not disguise a missing Patient identity as empty clinical data', async () => {
    getMock.mockRejectedValueOnce(httpError(404));
    await expect(patientPortalService.getEvolution()).rejects.toMatchObject({
      response: { status: 404 },
    });

    getMock.mockRejectedValueOnce(httpError(404));
    await expect(patientPortalService.getMealPlans()).rejects.toMatchObject({
      response: { status: 404 },
    });
  });

  it('keeps endpoint-specific not-found semantics', async () => {
    getMock.mockRejectedValueOnce(httpError(404));
    await expect(patientPortalService.getNutritionist()).resolves.toBeNull();

    getMock.mockRejectedValueOnce(httpError(404));
    await expect(patientPortalService.getMealPlan('removed-plan')).resolves.toBeNull();

    getMock.mockRejectedValueOnce(httpError(405));
    await expect(patientPortalService.getPreferences()).resolves.toEqual({
      status: 'unavailable',
      data: null,
    });
  });

  it('normalizes canonical preference values', async () => {
    getMock.mockResolvedValueOnce({ data: { data: { theme: 'Dark', preferredLanguage: 'en' } } });
    await expect(patientPortalService.getPreferences()).resolves.toEqual({
      status: 'available',
      data: { theme: 'dark', preferredLanguage: 'en-US' },
    });
  });
});
