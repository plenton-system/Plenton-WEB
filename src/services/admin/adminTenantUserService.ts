import type {
  PagedResult,
  ServiceResponse,
  AdminAccessFlow,
  AdminUserDetail,
  AdminTenantStatus,
  AdminTenantDetail,
  AdminUserListItem,
  AdminUserTransition,
  AdminTenantListItem,
  AdminTenantTransition,
} from 'src/types/admin';

import { get, post } from 'src/utils/http-client';

export type TenantSearch = {
  query?: string;
  status?: AdminTenantStatus;
  page: number;
  pageSize: number;
};
export type UserSearch = {
  query?: string;
  role?: string;
  tenantId?: string;
  isLocked?: boolean;
  emailConfirmed?: boolean;
  page: number;
  pageSize: number;
};
export type StateChange = { reason: string; concurrencyStamp: string };
export type ResendAccess = StateChange & { flow: AdminAccessFlow };

function unwrap<T>(response: ServiceResponse<T>) {
  if (!response.data) throw new Error(response.message);
  return response.data;
}

const query = (value: TenantSearch | UserSearch) =>
  Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      `${key[0].toUpperCase()}${key.slice(1)}`,
      item === '' ? undefined : item,
    ])
  );

export const adminTenantService = {
  async search(filter: TenantSearch, signal?: AbortSignal) {
    return unwrap(
      await get<ServiceResponse<PagedResult<AdminTenantListItem>>>('/api/admin/tenants', {
        params: query(filter),
        signal,
      })
    );
  },
  async detail(identifier: string, signal?: AbortSignal) {
    return unwrap(
      await get<ServiceResponse<AdminTenantDetail>>(
        `/api/admin/tenants/${encodeURIComponent(identifier)}`,
        { signal }
      )
    );
  },
  async suspend(identifier: string, payload: StateChange) {
    return unwrap(
      await post<ServiceResponse<AdminTenantTransition>>(
        `/api/admin/tenants/${encodeURIComponent(identifier)}/suspend`,
        payload
      )
    );
  },
  async reactivate(identifier: string, payload: StateChange) {
    return unwrap(
      await post<ServiceResponse<AdminTenantTransition>>(
        `/api/admin/tenants/${encodeURIComponent(identifier)}/reactivate`,
        payload
      )
    );
  },
};

export const adminUserService = {
  async search(filter: UserSearch, signal?: AbortSignal) {
    return unwrap(
      await get<ServiceResponse<PagedResult<AdminUserListItem>>>('/api/admin/users', {
        params: query(filter),
        signal,
      })
    );
  },
  async detail(id: string, signal?: AbortSignal) {
    return unwrap(
      await get<ServiceResponse<AdminUserDetail>>(`/api/admin/users/${encodeURIComponent(id)}`, {
        signal,
      })
    );
  },
  async block(id: string, payload: StateChange) {
    return unwrap(
      await post<ServiceResponse<AdminUserTransition>>(
        `/api/admin/users/${encodeURIComponent(id)}/block`,
        payload
      )
    );
  },
  async unblock(id: string, payload: StateChange) {
    return unwrap(
      await post<ServiceResponse<AdminUserTransition>>(
        `/api/admin/users/${encodeURIComponent(id)}/unblock`,
        payload
      )
    );
  },
  async revokeSessions(id: string, payload: StateChange) {
    return unwrap(
      await post<ServiceResponse<AdminUserTransition>>(
        `/api/admin/users/${encodeURIComponent(id)}/sessions/revoke`,
        payload
      )
    );
  },
  async resendAccess(id: string, payload: ResendAccess) {
    return unwrap(
      await post<ServiceResponse<AdminUserTransition>>(
        `/api/admin/users/${encodeURIComponent(id)}/access/resend`,
        payload
      )
    );
  },
};
