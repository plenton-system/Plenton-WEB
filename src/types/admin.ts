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
