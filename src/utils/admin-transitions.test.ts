import { it, expect, describe } from 'vitest';

import { applyUserTransition, applyTenantTransition } from './admin-transitions';

describe('administrative transition snapshots', () => {
  it('replaces tenant state and concurrency stamp with the transition', () => {
    const current = {
      id: 'id',
      identifier: 'tenant',
      status: 'Active' as const,
      nutritionistName: null,
      nutritionistEmail: null,
      patientCount: 0,
      userCount: 0,
      createdAtUtc: 'created',
      updatedAtUtc: 'old',
      suspendedAtUtc: null,
      concurrencyStamp: 'old',
      suspensionReason: null,
      reactivatedAtUtc: null,
      subscription: {
        subscriptionId: null,
        status: null,
        planName: null,
        planCode: null,
        currentPeriodEndUtc: null,
        nextDueDateUtc: null,
      },
      usage: { userCount: 0, nutritionistCount: 0, patientCount: 0, subscriptionCount: 0 },
    };
    const result = applyTenantTransition(current, {
      identifier: 'tenant',
      status: 'Suspended',
      concurrencyStamp: 'new',
      updatedAtUtc: 'new-date',
      suspensionReason: 'reason',
      suspendedAtUtc: 'now',
      reactivatedAtUtc: null,
      changed: true,
    });
    expect(result).toMatchObject({
      status: 'Suspended',
      concurrencyStamp: 'new',
      suspensionReason: 'reason',
    });
  });

  it('replaces visible user access state with the transition', () => {
    const current = {
      id: 'u',
      name: 'Name',
      email: 'e',
      tenantId: 't',
      roles: ['Patient'],
      emailConfirmed: true,
      lockoutEnabled: true,
      lockoutEndUtc: null,
      isLocked: false,
      concurrencyStamp: 'old',
    };
    const result = applyUserTransition(current, {
      ...current,
      isLocked: true,
      concurrencyStamp: 'new',
      changed: true,
      revokedSessionCount: 2,
    });
    expect(result).toMatchObject({ name: 'Name', isLocked: true, concurrencyStamp: 'new' });
  });
});
