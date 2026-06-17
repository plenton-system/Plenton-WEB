export type NotificationType =
  | 'AppointmentCreated'
  | 'AppointmentUpdated'
  | 'AppointmentCanceled'
  | 'PaymentConfirmed'
  | 'PaymentFailed'
  | 'SubscriptionOverdue'
  | 'SubscriptionExpired'
  | 'AnamnesisAnswered';

export type Notification = {
  id: string;
  type: NotificationType | string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string | null;
};

export type NotificationListQuery = {
  pageIndex?: number;
  pageSize?: number;
};
