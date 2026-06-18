import type { SubscriptionStatus, SubscriptionBillingType, SubscriptionBillingCycle } from 'src/types';

import i18n from 'src/i18n';
import { getCurrentLocale } from 'src/utils/format-time';

export const billingCycleLabel = (cycle?: SubscriptionBillingCycle | null) => {
  if (cycle === 'weekly') return i18n.t('subscription.billingCycle.weekly');
  if (cycle === 'semiannually') return i18n.t('subscription.billingCycle.semiannually');
  if (cycle === 'annually') return i18n.t('subscription.billingCycle.annually');
  return i18n.t('subscription.billingCycle.monthly');
};

export const billingTypeLabel = (type?: SubscriptionBillingType | null) => {
  if (type === 'Pix') return 'PIX';
  if (type === 'BankSlip') return i18n.t('subscription.billingType.bankSlip');
  if (type === 'CreditCard') return i18n.t('subscription.billingType.creditCard');
  return i18n.t('subscription.notProvided');
};

export const statusLabel = (status?: SubscriptionStatus | null) => {
  if (status === 'trial') return i18n.t('subscription.status.trial');
  if (status === 'active') return i18n.t('subscription.status.active');
  if (status === 'pending') return i18n.t('subscription.status.pending');
  if (status === 'past_due' || status === 'overdue') return i18n.t('subscription.status.overdue');
  if (status === 'suspended') return i18n.t('subscription.status.suspended');
  if (status === 'canceled') return i18n.t('subscription.status.canceled');
  if (status === 'expired') return i18n.t('subscription.status.expired');
  if (status === 'none') return i18n.t('subscription.status.none');
  return i18n.t('subscription.status.undefined');
};

export const statusColor = (status?: SubscriptionStatus | null) => {
  if (status === 'active') return 'success';
  if (status === 'trial') return 'info';
  if (status === 'pending') return 'warning';
  if (status === 'canceled' || status === 'expired' || status === 'past_due' || status === 'overdue') {
    return 'error';
  }
  return 'default';
};

export const formatMoney = (value: number, currency = 'BRL') =>
  new Intl.NumberFormat(getCurrentLocale(), {
    style: 'currency',
    currency,
  }).format(value);

export const formatDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(getCurrentLocale()).format(date);
};
