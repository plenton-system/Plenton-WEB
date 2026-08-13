import type {
  PagedResult,
  ServiceResponse,
  AdminAuditEvent,
  AdminAuditFilters,
  AdminReprocessOutcome,
  AdminPlatformDashboard,
  AdminOperationalReprocess,
  AdminOperationalEventDetail,
  AdminOperationalEventSource,
  AdminOperationalEventFilters,
  AdminOperationalEventListItem,
} from 'src/types/admin';

import { get } from 'src/utils/http-client';

import api from 'src/services/api';

export type DashboardWindowFilter = {
  failureWindowStartUtc?: string;
  failureWindowEndUtc?: string;
};

function unwrap<T>(response: ServiceResponse<T>): T {
  if (response.data === null) throw new Error(response.message);
  return response.data;
}

const eventQuery = (filter: AdminOperationalEventFilters) => ({
  Source: filter.source || undefined,
  TenantId: filter.tenantId || undefined,
  Type: filter.type || undefined,
  Status: filter.status || undefined,
  StartUtc: filter.startUtc || undefined,
  EndUtc: filter.endUtc || undefined,
  CorrelationId: filter.correlationId || undefined,
  Page: filter.page,
  PageSize: filter.pageSize,
});

const auditQuery = (filter: AdminAuditFilters) => ({
  AdministratorId: filter.administratorId || undefined,
  Action: filter.action || undefined,
  TargetType: filter.targetType || undefined,
  TargetId: filter.targetId || undefined,
  TenantId: filter.tenantId || undefined,
  StartUtc: filter.startUtc || undefined,
  EndUtc: filter.endUtc || undefined,
  Page: filter.page,
  PageSize: filter.pageSize,
});

export const adminOperationsService = {
  async getDashboard(filter: DashboardWindowFilter, signal?: AbortSignal) {
    const response = await get<ServiceResponse<AdminPlatformDashboard>>(
      '/api/admin/operations/dashboard',
      {
        params: {
          FailureWindowStartUtc: filter.failureWindowStartUtc || undefined,
          FailureWindowEndUtc: filter.failureWindowEndUtc || undefined,
        },
        signal,
      }
    );
    return unwrap(response);
  },

  async searchEvents(filter: AdminOperationalEventFilters, signal?: AbortSignal) {
    return unwrap(
      await get<ServiceResponse<PagedResult<AdminOperationalEventListItem>>>(
        '/api/admin/operations/events',
        { params: eventQuery(filter), signal }
      )
    );
  },

  async eventDetail(source: AdminOperationalEventSource, id: string, signal?: AbortSignal) {
    return unwrap(
      await get<ServiceResponse<AdminOperationalEventDetail>>(
        `/api/admin/operations/events/${encodeURIComponent(source)}/${encodeURIComponent(id)}`,
        { signal }
      )
    );
  },

  async reprocess(
    source: AdminOperationalEventSource,
    id: string,
    payload: { idempotencyKey: string; reason: string }
  ): Promise<AdminReprocessOutcome> {
    const response = await api.post<ServiceResponse<AdminOperationalReprocess>>(
      `/api/admin/operations/events/${encodeURIComponent(source)}/${encodeURIComponent(id)}/reprocess`,
      payload
    );
    return { result: unwrap(response.data), replayed: response.status === 200 };
  },

  async searchAudit(filter: AdminAuditFilters, signal?: AbortSignal) {
    return unwrap(
      await get<ServiceResponse<PagedResult<AdminAuditEvent>>>('/api/admin/audit-events', {
        params: auditQuery(filter),
        signal,
      })
    );
  },
};
