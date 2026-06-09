import type { SubscriptionStatus, SubscriptionBillingType, SubscriptionBillingCycle } from 'src/types';

export const billingCycleLabel = (cycle?: SubscriptionBillingCycle | null) => {
  if (cycle === 'weekly') return 'semanal';
  if (cycle === 'semiannually') return 'semestral';
  if (cycle === 'annually') return 'anual';
  return 'mensal';
};

export const billingTypeLabel = (type?: SubscriptionBillingType | null) => {
  if (type === 'Pix') return 'PIX';
  if (type === 'BankSlip') return 'Boleto';
  if (type === 'CreditCard') return 'Cartao de credito';
  return 'Nao informado';
};

export const statusLabel = (status?: SubscriptionStatus | null) => {
  if (status === 'trial') return 'Trial';
  if (status === 'active') return 'Ativa';
  if (status === 'pending') return 'Pendente';
  if (status === 'past_due' || status === 'overdue') return 'Vencida';
  if (status === 'suspended') return 'Suspensa';
  if (status === 'canceled') return 'Cancelada';
  if (status === 'expired') return 'Expirada';
  if (status === 'none') return 'Sem assinatura';
  return 'Indefinida';
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
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);

export const formatDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR').format(date);
};
