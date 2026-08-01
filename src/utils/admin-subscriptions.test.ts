import { it, expect, describe } from 'vitest';

import { futureDateToUtc, applySubscriptionCommand } from './admin-subscriptions';

const detail = {
  id: 'subscription-id',
  tenantId: 'tenant-a',
  planId: 'old-plan',
  planPriceId: 'old-price',
  planName: 'Old',
  planCode: 'OLD',
  status: 6 as const,
  provider: 'Asaas',
  providerSubscriptionId: 'remote',
  providerCustomerId: 'customer',
  latestInvoiceStatus: 1 as const,
  currentPeriodStart: '2026-07-01T00:00:00Z',
  currentPeriodEnd: '2026-08-01T00:00:00Z',
  nextDueDate: '2026-08-01T00:00:00Z',
  version: 'old-version',
  invoices: [],
};

describe('admin subscription transitions', () => {
  it('replaces all command-confirmed visible fields and preserves read-only detail', () => {
    expect(
      applySubscriptionCommand(
        detail,
        {
          subscriptionId: 'subscription-id',
          tenantId: 'tenant-a',
          status: 3,
          planId: 'new-plan',
          planPriceId: 'new-price',
          nextDueDate: '2026-09-01T00:00:00Z',
          version: 'new-version',
        },
        { name: 'New', code: 'NEW' }
      )
    ).toMatchObject({
      status: 3,
      planId: 'new-plan',
      planPriceId: 'new-price',
      planName: 'New',
      planCode: 'NEW',
      nextDueDate: '2026-09-01T00:00:00Z',
      version: 'new-version',
      provider: 'Asaas',
    });
  });

  it('serializes only a future local date as UTC', () => {
    const now = new Date('2026-07-30T12:00:00.000Z');
    expect(futureDateToUtc('2026-07-31T12:00', now)).toMatch(/Z$/);
    expect(futureDateToUtc('2026-07-29T12:00', now)).toBeNull();
    expect(futureDateToUtc('invalid', now)).toBeNull();
  });
});
