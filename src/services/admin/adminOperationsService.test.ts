import { vi, it, expect, describe, beforeEach } from 'vitest';

import { get } from 'src/utils/http-client';

import api from 'src/services/api';

import { adminOperationsService } from './adminOperationsService';

vi.mock('src/utils/http-client', () => ({ get: vi.fn() }));
vi.mock('src/services/api', () => ({ default: { post: vi.fn() } }));

const mockedGet = vi.mocked(get);
const mockedPost = vi.mocked(api.post);
const ok = <T>(data: T) => ({ data, message: '', status: 200, isSuccess: true });

describe('adminOperationsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('maps operational and audit URL filters to server-side paging contracts', async () => {
    mockedGet.mockResolvedValue(
      ok({ items: [], currentPage: 2, pageSize: 25, totalPages: 2, totalCount: 30 })
    );
    await adminOperationsService.searchEvents({
      source: 'Webhook',
      tenantId: 'tenant',
      type: 'invoice',
      status: 'Failed',
      startUtc: 'start',
      endUtc: 'end',
      correlationId: 'correlation',
      page: 2,
      pageSize: 25,
    });
    expect(mockedGet).toHaveBeenLastCalledWith('/api/admin/operations/events', {
      params: {
        Source: 'Webhook',
        TenantId: 'tenant',
        Type: 'invoice',
        Status: 'Failed',
        StartUtc: 'start',
        EndUtc: 'end',
        CorrelationId: 'correlation',
        Page: 2,
        PageSize: 25,
      },
      signal: undefined,
    });
    await adminOperationsService.searchAudit({
      administratorId: 'admin',
      action: 'User.Block',
      targetType: 'User',
      targetId: 'user',
      tenantId: 'tenant',
      startUtc: 'start',
      endUtc: 'end',
      page: 2,
      pageSize: 25,
    });
    expect(mockedGet).toHaveBeenLastCalledWith('/api/admin/audit-events', {
      params: {
        AdministratorId: 'admin',
        Action: 'User.Block',
        TargetType: 'User',
        TargetId: 'user',
        TenantId: 'tenant',
        StartUtc: 'start',
        EndUtc: 'end',
        Page: 2,
        PageSize: 25,
      },
      signal: undefined,
    });
  });

  it.each([
    [202, false],
    [200, true],
  ])('distinguishes accepted %s from a replay', async (status, replayed) => {
    const result = {
      idempotencyKey: 'stable-key',
      source: 'Webhook',
      eventId: 'event',
      status: 'Accepted',
      message: 'ok',
      acceptedAtUtc: '2026-01-01T00:00:00Z',
      correlationId: 'correlation',
    };
    mockedPost.mockResolvedValue({ status, data: ok(result) });
    const outcome = await adminOperationsService.reprocess('Webhook', 'event/id', {
      idempotencyKey: 'stable-key',
      reason: 'investigation',
    });
    expect(outcome).toEqual({ result, replayed });
    expect(mockedPost).toHaveBeenCalledWith(
      '/api/admin/operations/events/Webhook/event%2Fid/reprocess',
      { idempotencyKey: 'stable-key', reason: 'investigation' }
    );
  });
});
