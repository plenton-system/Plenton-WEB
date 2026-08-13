export type ServiceResponse<T> = {
  data: T | null;
  message: string;
  messages?: string[] | null;
  status: number;
  isSuccess: boolean;
};

export type PagedResult<T> = {
  items: T[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
};

export type ApiErrorKind =
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'notFound'
  | 'conflict'
  | 'providerUncertain'
  | 'network'
  | 'unknown';

export type AdminApiError = {
  kind: ApiErrorKind;
  status?: number;
  message: string;
  retryable: boolean;
  fieldErrors?: Record<string, string[]>;
};

export type AdminStatus = 'success' | 'info' | 'warning' | 'error' | 'neutral';

export type AdminOperationalCount = { name: string; count: number };
export type AdminOperationalWindow = { startUtc: string; endUtc: string };
export type AdminPlatformDashboard = {
  calculatedAtUtc: string;
  failureWindow: AdminOperationalWindow;
  tenantsByStatus: AdminOperationalCount[];
  usersByRole: AdminOperationalCount[];
  patientCount: number;
  subscriptionsByStatus: AdminOperationalCount[];
  failedWebhookCount: number;
  failedEmailCount: number;
};

export type AdminTenantStatus = 'Active' | 'Suspended';
export type AdminAccessFlow = 1 | 2;

export type AdminTenantListItem = {
  id: string;
  identifier: string;
  status: AdminTenantStatus;
  nutritionistName: string | null;
  nutritionistEmail: string | null;
  patientCount: number;
  userCount: number;
  createdAtUtc: string;
  updatedAtUtc: string;
  suspendedAtUtc: string | null;
  concurrencyStamp: string;
};

export type AdminTenantDetail = AdminTenantListItem & {
  suspensionReason: string | null;
  reactivatedAtUtc: string | null;
  subscription: {
    subscriptionId: string | null;
    status: number | null;
    planName: string | null;
    planCode: string | null;
    currentPeriodEndUtc: string | null;
    nextDueDateUtc: string | null;
  };
  usage: {
    userCount: number;
    nutritionistCount: number;
    patientCount: number;
    subscriptionCount: number;
  };
};

export type AdminTenantTransition = Pick<
  AdminTenantDetail,
  | 'identifier'
  | 'status'
  | 'concurrencyStamp'
  | 'updatedAtUtc'
  | 'suspensionReason'
  | 'suspendedAtUtc'
  | 'reactivatedAtUtc'
> & { changed: boolean };

export type AdminUserListItem = {
  id: string;
  name: string | null;
  email: string | null;
  tenantId: string;
  roles: string[];
  emailConfirmed: boolean;
  lockoutEnabled: boolean;
  lockoutEndUtc: string | null;
  isLocked: boolean;
  concurrencyStamp: string;
};

export type AdminUserDetail = AdminUserListItem;
export type AdminUserTransition = Omit<AdminUserListItem, 'name'> & {
  changed: boolean;
  revokedSessionCount: number;
};

export type AdminSubscriptionStatus = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type AdminInvoiceStatus = 1 | 2 | 3 | 4 | 5 | 6;
export type AdminSubscriptionProration = 1 | 2;

export type AdminSubscriptionFilters = {
  tenantId?: string;
  planId?: string;
  status?: AdminSubscriptionStatus;
  invoiceStatus?: AdminInvoiceStatus;
  providerCustomerId?: string;
  page: number;
  pageSize: number;
};

export type AdminSubscriptionListItem = {
  id: string;
  tenantId: string;
  planId: string;
  planName: string;
  planCode: string;
  status: AdminSubscriptionStatus;
  providerSubscriptionId: string | null;
  providerCustomerId: string;
  latestInvoiceStatus: AdminInvoiceStatus | null;
  nextDueDate: string;
  version: string;
};

export type AdminSubscriptionInvoice = {
  id: string;
  providerPaymentId: string | null;
  status: AdminInvoiceStatus;
  value: number;
  currency: string;
  dueDate: string;
  paidAt: string | null;
};

export type AdminSubscriptionDetail = AdminSubscriptionListItem & {
  planPriceId: string;
  provider: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  invoices: AdminSubscriptionInvoice[];
};

export type AdminSubscriptionCommandResult = {
  subscriptionId: string;
  tenantId: string;
  status: AdminSubscriptionStatus;
  planId: string;
  planPriceId: string;
  nextDueDate: string;
  version: string;
};

export type AdminSubscriptionCommand = {
  tenantId: string;
  idempotencyKey: string;
  expectedVersion: string;
  reason: string;
};

export type AdminSubscriptionPlanCommand = AdminSubscriptionCommand & {
  planPriceId: string;
  proration: AdminSubscriptionProration;
};

export type AdminSubscriptionReactivateCommand = AdminSubscriptionCommand & {
  nextDueDate: string;
};

export type AdminOperationalEventSource = 'Webhook' | 'Email';
export type AdminUtcRange = { startUtc?: string; endUtc?: string };

export type AdminOperationalEventFilters = AdminUtcRange & {
  source?: AdminOperationalEventSource;
  tenantId?: string;
  type?: string;
  status?: string;
  correlationId?: string;
  page: number;
  pageSize: number;
};

export type AdminOperationalEventListItem = {
  id: string;
  source: AdminOperationalEventSource;
  tenantId: string;
  type: string;
  status: string;
  attemptCount: number;
  occurredAtUtc: string;
  lastAttemptAtUtc: string | null;
  completedAtUtc: string | null;
  errorSummary: string | null;
  correlationId: string;
};

export type AdminOperationalEventDetail = AdminOperationalEventListItem & {
  safeMetadata: Record<string, string | null>;
};

export type AdminOperationalReprocess = {
  idempotencyKey: string;
  source: AdminOperationalEventSource;
  eventId: string;
  status: string;
  message: string;
  acceptedAtUtc: string;
  correlationId: string;
};

export type AdminReprocessOutcome = {
  result: AdminOperationalReprocess;
  replayed: boolean;
};

export type AdminAuditFilters = AdminUtcRange & {
  administratorId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  tenantId?: string;
  page: number;
  pageSize: number;
};

export type AdminAuditEvent = {
  id: string;
  administratorId: string;
  action: string;
  targetType: string;
  targetId: string;
  tenantId: string | null;
  reason: string;
  beforeState: Record<string, string | null>;
  afterState: Record<string, string | null>;
  occurredAtUtc: string;
  ipAddress: string;
  correlationId: string;
};
