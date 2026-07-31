import type { ServiceResponse, AdminPlatformDashboard } from 'src/types/admin';

import { get } from 'src/utils/http-client';

export type DashboardWindowFilter = {
  failureWindowStartUtc?: string;
  failureWindowEndUtc?: string;
};

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
    if (!response.data) {
      throw new Error(response.message);
    }
    return response.data;
  },
};
