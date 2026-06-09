import type {
  ServiceResponse,
  SubscriptionPlan,
  SubscriptionStatus,
  CurrentSubscription,
  SubscriptionBillingType,
  SubscriptionBillingCycle,
  StartSubscriptionRequest,
  StartSubscriptionResponse,
} from 'src/types';

import { get, post } from 'src/utils/http-client';

type AnyRecord = Record<string, any>;

const BILLING_TYPE_TO_API: Record<SubscriptionBillingType, number> = {
  BankSlip: 1,
  CreditCard: 2,
  Pix: 3,
};

const unwrap = <T>(payload: T | ServiceResponse<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as AnyRecord)) {
    return (payload as ServiceResponse<T>).data as T;
  }

  return payload as T;
};

const normalizeEnum = (value: unknown) => String(value ?? '').trim().toLowerCase();

const normalizePlanStatus = (value: unknown): SubscriptionPlan['status'] => {
  if (value === 1 || normalizeEnum(value) === 'active') return 'active';
  if (value === 2 || normalizeEnum(value) === 'inactive') return 'inactive';
  return 'unknown';
};

const normalizePriceStatus = (value: unknown): SubscriptionPlan['prices'][number]['status'] => {
  if (value === 1 || normalizeEnum(value) === 'active') return 'active';
  if (value === 2 || normalizeEnum(value) === 'inactive') return 'inactive';
  return 'unknown';
};

const normalizeBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;

  const normalized = normalizeEnum(value);
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'sim';
};

export const normalizeBillingCycle = (value: unknown): SubscriptionBillingCycle => {
  if (value === 1 || normalizeEnum(value) === 'weekly') return 'weekly';
  if (value === 3 || normalizeEnum(value) === 'semiannually') return 'semiannually';
  if (value === 4 || normalizeEnum(value) === 'annually') return 'annually';
  return 'monthly';
};

export const normalizeSubscriptionStatus = (value: unknown): SubscriptionStatus => {
  const normalized = normalizeEnum(value).replace(/[_\s-]/g, '');

  if (value === 1 || normalized === 'pendingpayment' || normalized === 'pending') return 'pending';
  if (value === 2 || normalized === 'trialing' || normalized === 'trial') return 'trial';
  if (value === 3 || normalized === 'active' || normalized === 'ativa') return 'active';
  if (value === 4 || normalized === 'pastdue') return 'past_due';
  if (value === 5 || normalized === 'overdue' || normalized === 'vencida') return 'overdue';
  if (value === 6 || normalized === 'suspended' || normalized === 'suspensa') return 'suspended';
  if (value === 7 || normalized === 'canceled' || normalized === 'cancelada') return 'canceled';
  if (value === 8 || normalized === 'expired' || normalized === 'expirada') return 'expired';
  if (normalized === 'none' || normalized === 'empty') return 'none';
  return 'unknown';
};

const normalizeBillingType = (value: unknown): SubscriptionBillingType | null => {
  const normalized = normalizeEnum(value).replace(/[_\s-]/g, '');

  if (value === 1 || normalized === 'bankslip' || normalized === 'boleto') return 'BankSlip';
  if (value === 2 || normalized === 'creditcard') return 'CreditCard';
  if (value === 3 || normalized === 'pix') return 'Pix';
  return null;
};

const normalizePlanFeatures = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((feature) => String(feature ?? '').trim())
    .filter((feature) => feature.length > 0);
};

const normalizePlan = (item: AnyRecord): SubscriptionPlan => ({
  planId: String(item.planId ?? item.id ?? ''),
  code: String(item.code ?? ''),
  name: String(item.name ?? 'Plano'),
  description: String(item.description ?? ''),
  status: normalizePlanStatus(item.status),
  displayOrder: Number(item.displayOrder ?? item.order ?? 0),
  isFeatured: normalizeBoolean(item.isFeatured ?? item.featured),
  trialDays: Number(item.trialDays ?? item.TrialDays ?? 0),
  features: normalizePlanFeatures(item.features),
  prices: (Array.isArray(item.prices) ? item.prices : [])
    .map((price: AnyRecord) => ({
      planPriceId: String(price.planPriceId ?? price.id ?? ''),
      code: String(price.code ?? ''),
      currency: typeof price.currency === 'string' ? price.currency : price.currency === 1 ? 'BRL' : 'BRL',
      value: Number(price.value ?? price.amount ?? 0),
      billingCycle: normalizeBillingCycle(price.billingCycle),
      status: normalizePriceStatus(price.status),
    }))
    .filter((price) => price.planPriceId && price.status === 'active'),
});

const pickPaymentDetails = (payload: AnyRecord) => {
  const payment = payload.payment ?? payload.paymentDetails ?? payload.invoice ?? {};

  return {
    chargeUrl: payment.chargeUrl ?? payment.invoiceUrl ?? payload.chargeUrl ?? payload.invoiceUrl ?? null,
    invoiceUrl: payment.invoiceUrl ?? payload.invoiceUrl ?? null,
    bankSlipUrl: payment.bankSlipUrl ?? payment.boletoUrl ?? payload.bankSlipUrl ?? payload.boletoUrl ?? null,
    pixQrCode: payment.pixQrCode ?? payment.qrCode ?? payload.pixQrCode ?? payload.qrCode ?? null,
    pixCopyPaste:
      payment.pixCopyPaste ?? payment.pixCopyAndPaste ?? payment.copyPaste ?? payload.pixCopyPaste ?? null,
    checkoutUrl: payment.checkoutUrl ?? payload.checkoutUrl ?? null,
    dueDate: payment.dueDate ?? payload.dueDate ?? payload.nextDueDate ?? null,
    amount: payment.amount ?? payload.amount ?? null,
    currency: payment.currency ?? payload.currency ?? null,
  };
};

const normalizeStartResponse = (payload: AnyRecord): StartSubscriptionResponse => ({
  subscriptionId: String(payload.subscriptionId ?? payload.id ?? ''),
  paymentCustomerId: payload.paymentCustomerId ?? null,
  providerCustomerId: payload.providerCustomerId ?? null,
  providerSubscriptionId: payload.providerSubscriptionId ?? null,
  status: normalizeSubscriptionStatus(payload.status),
  nextDueDate: payload.nextDueDate ?? payload.dueDate ?? null,
  checkoutUrl: payload.checkoutUrl ?? payload.payment?.checkoutUrl ?? null,
  payment: pickPaymentDetails(payload),
  raw: payload,
});

const normalizeCurrentSubscription = (payload: AnyRecord | null | undefined): CurrentSubscription | null => {
  if (!payload) return null;

  const status = normalizeSubscriptionStatus(payload.status ?? payload.subscriptionStatus);
  const plan = payload.plan ?? {};

  return {
    id: payload.subscriptionId ?? payload.id ?? null,
    status,
    planName: payload.planName ?? plan.name ?? null,
    planCode: payload.planCode ?? plan.code ?? null,
    billingCycle: payload.billingCycle ? normalizeBillingCycle(payload.billingCycle) : null,
    billingType: normalizeBillingType(payload.billingType),
    nextChargeDate: payload.nextChargeDate ?? payload.nextBillingDate ?? payload.currentPeriodEnd ?? null,
    dueDate: payload.dueDate ?? payload.nextDueDate ?? null,
    expiresAt: payload.expiresAt ?? payload.expirationDate ?? null,
  };
};

export const subscriptionService = {
  getActivePlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await get<ServiceResponse<AnyRecord[]> | AnyRecord[]>('/api/subscription-plans/active');
    const data = unwrap(response);
    return (Array.isArray(data) ? data : []).map(normalizePlan).filter((plan) => plan.prices.length > 0);
  },

  startSubscription: async (request: StartSubscriptionRequest): Promise<StartSubscriptionResponse> => {
    const response = await post<ServiceResponse<AnyRecord> | AnyRecord>('/api/subscriptions/asaas/start', {
      NutritionistId: request.nutritionistId,
      PlanPriceId: request.planPriceId,
      BillingType: BILLING_TYPE_TO_API[request.billingType],
      NextDueDate: request.nextDueDate,
    });

    return normalizeStartResponse(unwrap(response));
  },

  getCurrentSubscription: async (): Promise<CurrentSubscription | null> => {
    const response = await get<ServiceResponse<AnyRecord | null> | AnyRecord | null>('/api/subscriptions/current');
    return normalizeCurrentSubscription(unwrap(response));
  },
};
