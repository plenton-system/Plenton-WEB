import { useContext } from 'react';

import { NotificationsContext } from 'src/contexts/notifications-context';

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationsProvider');
  return context;
}
