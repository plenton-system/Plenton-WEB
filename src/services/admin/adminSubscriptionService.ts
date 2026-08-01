import type {
  PagedResult,
  ServiceResponse,
  AdminSubscriptionDetail,
  AdminSubscriptionFilters,
  AdminSubscriptionCommand,
  AdminSubscriptionListItem,
  AdminSubscriptionPlanCommand,
  AdminSubscriptionCommandResult,
  AdminSubscriptionReactivateCommand,
} from 'src/types/admin';

import { get, post } from 'src/utils/http-client';

function unwrap<T>(response: ServiceResponse<T>): T {
  if (response.data === null) throw new Error(response.message);
  return response.data;
}

function query(filters: AdminSubscriptionFilters) {
  return {
    TenantId: filters.tenantId || undefined,
    PlanId: filters.planId || undefined,
    Status: filters.status,
    InvoiceStatus: filters.invoiceStatus,
    ProviderCustomerId: filters.providerCustomerId || undefined,
    Page: filters.page,
    PageSize: filters.pageSize,
  };
}

export const adminSubscriptionService = {
  async search(filters: AdminSubscriptionFilters, signal?: AbortSignal) {
    return unwrap(
      await get<ServiceResponse<PagedResult<AdminSubscriptionListItem>>>(
        '/api/admin/subscriptions',
        { params: query(filters), signal }
      )
    );
  },

  async detail(id: string, tenantId: string, signal?: AbortSignal) {
    return unwrap(
      await get<ServiceResponse<AdminSubscriptionDetail>>(
        `/api/admin/subscriptions/${encodeURIComponent(id)}`,
        { params: { tenantId }, signal }
      )
    );
  },

  async changePlan(id: string, payload: AdminSubscriptionPlanCommand) {
    return unwrap(
      await post<ServiceResponse<AdminSubscriptionCommandResult>>(
        `/api/admin/subscriptions/${encodeURIComponent(id)}/plan`,
        payload
      )
    );
  },

  async suspend(id: string, payload: AdminSubscriptionCommand) {
    return unwrap(
      await post<ServiceResponse<AdminSubscriptionCommandResult>>(
        `/api/admin/subscriptions/${encodeURIComponent(id)}/cancel`,
        payload
      )
    );
  },

  async reactivate(id: string, payload: AdminSubscriptionReactivateCommand) {
    return unwrap(
      await post<ServiceResponse<AdminSubscriptionCommandResult>>(
        `/api/admin/subscriptions/${encodeURIComponent(id)}/reactivate`,
        payload
      )
    );
  },
};
