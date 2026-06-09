export type SubscriptionBillingCycle = 'weekly' | 'monthly' | 'semiannually' | 'annually';

export type SubscriptionBillingType = 'Pix' | 'BankSlip' | 'CreditCard';

export type SubscriptionStatus =
  | 'pending'
  | 'trial'
  | 'active'
  | 'past_due'
  | 'overdue'
  | 'suspended'
  | 'canceled'
  | 'expired'
  | 'none'
  | 'unknown';

export type SubscriptionPlanPrice = {
  planPriceId: string;
  code: string;
  currency: string;
  value: number;
  billingCycle: SubscriptionBillingCycle;
  status: 'active' | 'inactive' | 'unknown';
};

export type SubscriptionPlan = {
  planId: string;
  code: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'unknown';
  displayOrder: number;
  isFeatured: boolean;
  trialDays: number;
  features: string[];
  prices: SubscriptionPlanPrice[];
};

export type StartSubscriptionRequest = {
  nutritionistId: string;
  planPriceId: string;
  billingType: SubscriptionBillingType;
  nextDueDate?: string;
};

export type SubscriptionPaymentDetails = {
  chargeUrl?: string | null;
  invoiceUrl?: string | null;
  bankSlipUrl?: string | null;
  pixQrCode?: string | null;
  pixCopyPaste?: string | null;
  checkoutUrl?: string | null;
  dueDate?: string | null;
  amount?: number | null;
  currency?: string | null;
};

export type StartSubscriptionResponse = {
  subscriptionId: string;
  paymentCustomerId?: string | null;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
  status: SubscriptionStatus;
  nextDueDate?: string | null;
  checkoutUrl?: string | null;
  payment?: SubscriptionPaymentDetails | null;
  raw?: unknown;
};

export type CurrentSubscription = {
  id?: string | null;
  status: SubscriptionStatus;
  planName?: string | null;
  planCode?: string | null;
  billingCycle?: SubscriptionBillingCycle | null;
  billingType?: SubscriptionBillingType | null;
  nextChargeDate?: string | null;
  dueDate?: string | null;
  expiresAt?: string | null;
};

export type ServiceResponse<T> = {
  message?: string;
  messages?: string[];
  status?: number;
  isSuccess?: boolean;
  data?: T;
};
