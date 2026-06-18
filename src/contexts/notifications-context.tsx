import type { ReactNode } from 'react';
import type { Notification } from 'src/types';
import type { HubConnection } from '@microsoft/signalr';

import { useRef, useMemo, useState, useEffect, useCallback, createContext } from 'react';

import { useAuth } from 'src/hooks/common/use-auth';

import i18n from 'src/i18n';
import { notificationService } from 'src/services';
import { createNotificationHubConnection } from 'src/services/notifications/notificationHub';

type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

export const NotificationsContext = createContext<NotificationsContextType | null>(null);

const PAGE_SIZE = 10;

const mergeNotification = (items: Notification[], incoming: Notification) => [
  incoming,
  ...items.filter((item) => item.id !== incoming.id),
].slice(0, PAGE_SIZE);

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : i18n.t('notifications.loadError');

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const connectionRef = useRef<HubConnection | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (authLoading || !isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [page, count] = await Promise.all([
        notificationService.getAll({ pageIndex: 1, pageSize: PAGE_SIZE }),
        notificationService.getUnreadCount(),
      ]);

      setNotifications(page.items ?? []);
      setUnreadCount(count ?? 0);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const markAsRead = useCallback(
    async (id: string) => {
      const wasUnread = notifications.some((notification) => notification.id === id && !notification.isRead);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      );

      if (wasUnread) {
        setUnreadCount((current) => Math.max(current - 1, 0));
      }

      try {
        await notificationService.markAsRead(id);
        setUnreadCount(await notificationService.getUnreadCount());
      } catch (requestError) {
        setError(getErrorMessage(requestError));
        await refresh();
      }
    },
    [notifications, refresh]
  );

  const markAllAsRead = useCallback(async () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
    setUnreadCount(0);

    try {
      await notificationService.markAllAsRead();
      setUnreadCount(await notificationService.getUnreadCount());
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      await refresh();
    }
  }, [refresh]);

  useEffect(() => {
    if (authLoading) return undefined;

    if (!isAuthenticated) {
      connectionRef.current?.stop().catch(() => undefined);
      connectionRef.current = null;
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return undefined;
    }

    let active = true;
    void refresh();

    const connection = createNotificationHubConnection();
    connectionRef.current = connection;

    connection.on('ReceiveNotification', (notification: Notification) => {
      if (!active) return;

      setNotifications((current) => mergeNotification(current, notification));

      if (!notification.isRead) {
        setUnreadCount((current) => current + 1);
      }
    });

    connection.on('UpdateUnreadCount', (count: number) => {
      if (active) {
        setUnreadCount(count ?? 0);
      }
    });

    connection.start().catch((connectionError) => {
      if (active) {
        setError(getErrorMessage(connectionError));
      }
    });

    return () => {
      active = false;
      if (connectionRef.current === connection) {
        connectionRef.current = null;
      }
      connection.stop().catch(() => undefined);
    };
  }, [authLoading, isAuthenticated, refresh]);

  const value = useMemo<NotificationsContextType>(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      refresh,
      markAsRead,
      markAllAsRead,
    }),
    [error, loading, markAllAsRead, markAsRead, notifications, refresh, unreadCount]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
