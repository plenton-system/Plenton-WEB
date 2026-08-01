import { vi, it, expect, describe, beforeEach } from 'vitest';

import { get, post } from 'src/utils/http-client';

import { adminSubscriptionService } from './adminSubscriptionService';

vi.mock('src/utils/http-client', () => ({ get: vi.fn(), post: vi.fn() }));

const mockedGet = vi.mocked(get);
const mockedPost = vi.mocked(post);
const ok = <T>(data: T) => ({ data, message: '', status: 200, isSuccess: true });
const result = {
  subscriptionId: 'subscription-id',
  tenantId: 'tenant-a',
  status: 3 as const,
  planId: 'plan-id',
  planPriceId: 'price-id',
  nextDueDate: '2026-09-01T03:00:00Z',
  version: '2026-07-30T12:00:00Z',
};

describe('adminSubscriptionService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('maps every list filter and deterministic paging to the API contract', async () => {
    mockedGet.mockResolvedValue(
      ok({ items: [], currentPage: 3, pageSize: 25, totalPages: 3, totalCount: 60 })
    );
    await adminSubscriptionService.search({
      tenantId: 'tenant-a',
      planId: 'plan-id',
      status: 6,
      invoiceStatus: 4,
      providerCustomerId: 'customer-id',
      page: 3,
      pageSize: 25,
    });
    expect(mockedGet).toHaveBeenCalledWith('/api/admin/subscriptions', {
      params: {
        TenantId: 'tenant-a',
        PlanId: 'plan-id',
        Status: 6,
        InvoiceStatus: 4,
        ProviderCustomerId: 'customer-id',
        Page: 3,
        PageSize: 25,
      },
      signal: undefined,
    });
  });

  it('requires tenant context in the detail query', async () => {
    mockedGet.mockResolvedValue(ok({}));
    await adminSubscriptionService.detail('subscription/id', 'tenant-a');
    expect(mockedGet).toHaveBeenCalledWith('/api/admin/subscriptions/subscription%2Fid', {
      params: { tenantId: 'tenant-a' },
      signal: undefined,
    });
  });

  it.each([
    [1, 'FutureOnly'],
    [2, 'IncludePendingPayments'],
  ] as const)(
    'sends proration %s (%s), active price and idempotent contract',
    async (proration, _label) => {
      mockedPost.mockResolvedValue(ok(result));
      const payload = {
        tenantId: 'tenant-a',
        idempotencyKey: 'stable-key',
        expectedVersion: '2026-07-30T10:00:00Z',
        reason: 'commercial request',
        planPriceId: 'active-price-id',
        proration,
      };
      await adminSubscriptionService.changePlan('subscription-id', payload);
      expect(mockedPost).toHaveBeenCalledWith(
        '/api/admin/subscriptions/subscription-id/plan',
        payload
      );
    }
  );

  it('exposes only reversible suspension and reactivation command endpoints', async () => {
    mockedPost.mockResolvedValue(ok(result));
    const common = {
      tenantId: 'tenant-a',
      idempotencyKey: 'stable-key',
      expectedVersion: '2026-07-30T10:00:00Z',
      reason: 'commercial request',
    };
    await adminSubscriptionService.suspend('subscription-id', common);
    await adminSubscriptionService.reactivate('subscription-id', {
      ...common,
      nextDueDate: '2026-09-01T03:00:00.000Z',
    });
    expect(mockedPost.mock.calls.map(([url]) => url)).toEqual([
      '/api/admin/subscriptions/subscription-id/cancel',
      '/api/admin/subscriptions/subscription-id/reactivate',
    ]);
    expect(JSON.stringify(mockedPost.mock.calls)).not.toMatch(/invoice|payment.*override|delete/i);
  });
});
