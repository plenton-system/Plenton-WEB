import type {
  AdminStatus,
  AdminInvoiceStatus,
  AdminSubscriptionDetail,
  AdminSubscriptionStatus,
  AdminSubscriptionCommandResult,
} from 'src/types/admin';

export const subscriptionStatusTone: Record<AdminSubscriptionStatus, AdminStatus> = {
  1: 'warning',
  2: 'info',
  3: 'success',
  4: 'warning',
  5: 'error',
  6: 'warning',
  7: 'neutral',
  8: 'neutral',
};

export const invoiceStatusTone: Record<AdminInvoiceStatus, AdminStatus> = {
  1: 'warning',
  2: 'success',
  3: 'error',
  4: 'neutral',
  5: 'info',
  6: 'error',
};

export function applySubscriptionCommand(
  current: AdminSubscriptionDetail,
  result: AdminSubscriptionCommandResult,
  plan?: { name: string; code: string }
): AdminSubscriptionDetail {
  return {
    ...current,
    id: result.subscriptionId,
    tenantId: result.tenantId,
    status: result.status,
    planId: result.planId,
    planPriceId: result.planPriceId,
    ...(plan ? { planName: plan.name, planCode: plan.code } : {}),
    nextDueDate: result.nextDueDate,
    version: result.version,
  };
}

export function futureDateToUtc(value: string, now = new Date()): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getTime() <= now.getTime()) return null;
  return date.toISOString();
}
