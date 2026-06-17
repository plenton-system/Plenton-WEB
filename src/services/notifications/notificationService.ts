import type {
  PagedResult,
  Notification,
  ServiceResponse,
  NotificationListQuery,
} from 'src/types';

import { get, put } from 'src/utils/http-client';

const unwrap = <T>(payload: T | ServiceResponse<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return (payload as ServiceResponse<T>).data as T;
  }

  return payload as T;
};

const emptyPage = (query?: NotificationListQuery): PagedResult<Notification> => ({
  items: [],
  totalCount: 0,
  totalPages: 0,
  currentPage: query?.pageIndex ?? 1,
  pageSize: query?.pageSize ?? 10,
});

export const notificationService = {
  getAll: async (query: NotificationListQuery = {}): Promise<PagedResult<Notification>> => {
    const response = await get<ServiceResponse<PagedResult<Notification>> | PagedResult<Notification>>(
      '/api/notification',
      { params: { pageIndex: query.pageIndex ?? 1, pageSize: query.pageSize ?? 10 } }
    );

    return unwrap(response) ?? emptyPage(query);
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await get<ServiceResponse<number> | number>('/api/notification/unread-count');
    return unwrap(response) ?? 0;
  },

  markAsRead: async (id: string): Promise<boolean> => {
    const response = await put<ServiceResponse<boolean> | boolean>(`/api/notification/${id}/read`);
    return unwrap(response) ?? false;
  },

  markAllAsRead: async (): Promise<boolean> => {
    const response = await put<ServiceResponse<boolean> | boolean>('/api/notification/read-all');
    return unwrap(response) ?? false;
  },
};
