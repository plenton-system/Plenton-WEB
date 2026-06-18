import type { Notification } from 'src/types';
import type { IconButtonProps } from '@mui/material/IconButton';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';

import { useRouter } from 'src/routes/hooks';

import { useNotifications } from 'src/hooks/common/use-notifications';

import { fToNow } from 'src/utils/format-time';

import { Scrollbar } from 'src/components/scrollbar';
import { Iconify, type IconifyName } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type NotificationsPopoverProps = IconButtonProps;

export function NotificationsPopover({ sx, ...other }: NotificationsPopoverProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    void markAllAsRead();
  }, [markAllAsRead]);

  const handleClickNotification = useCallback(
    (notification: Notification) => {
      if (!notification.isRead) {
        void markAsRead(notification.id);
      }

      handleClosePopover();

      if (notification.link) {
        router.push(notification.link);
      }
    },
    [handleClosePopover, markAsRead, router]
  );

  return (
    <>
      <IconButton
        color={openPopover ? 'primary' : 'default'}
        onClick={handleOpenPopover}
        sx={sx}
        {...other}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Iconify width={24} icon="solar:bell-bing-bold-duotone" />
        </Badge>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: 320, sm: 380 },
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <Box
          sx={{
            py: 2,
            pl: 2.5,
            pr: 1.5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1">{t('notifications.title')}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('notifications.unread', { count: unreadCount })}
            </Typography>
          </Box>

          {unreadCount > 0 && (
            <Tooltip title={t('notifications.markAll')}>
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <Iconify icon="eva:done-all-fill" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar fillContent sx={{ minHeight: 240, maxHeight: { xs: 360, sm: 480 } }}>
          <List
            disablePadding
            subheader={
              <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                {t('notifications.recent')}
              </ListSubheader>
            }
          >
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleClickNotification(notification)}
              />
            ))}

            {!loading && notifications.length === 0 && (
              <Box sx={{ px: 2.5, py: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('notifications.empty')}
                </Typography>
              </Box>
            )}

            {loading && notifications.length === 0 && (
              <Box sx={{ px: 2.5, py: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('common.loading')}
                </Typography>
              </Box>
            )}
          </List>
        </Scrollbar>
      </Popover>
    </>
  );
}

// ----------------------------------------------------------------------

function NotificationItem({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick: () => void;
}) {
  const icon = getNotificationIcon(notification.type);

  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        alignItems: 'flex-start',
        ...(notification.isRead === false && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral', color: icon.color }}>
          <Iconify icon={icon.name} width={22} />
        </Avatar>
      </ListItemAvatar>

      <ListItemText
        primary={
          <Typography variant="subtitle2" sx={{ mb: 0.25 }}>
            {notification.title}
          </Typography>
        }
        secondary={
          <Box component="span" sx={{ display: 'block' }}>
            <Typography
              component="span"
              variant="body2"
              sx={{
                color: 'text.secondary',
                display: 'block',
              }}
            >
              {notification.message}
            </Typography>

            <Typography
              component="span"
              variant="caption"
              sx={{
                mt: 0.75,
                gap: 0.5,
                display: 'flex',
                alignItems: 'center',
                color: 'text.disabled',
              }}
            >
              <Iconify width={14} icon="solar:clock-circle-outline" />
              {fToNow(notification.createdAt)}
            </Typography>
          </Box>
        }
      />
    </ListItemButton>
  );
}

// ----------------------------------------------------------------------

function getNotificationIcon(type: string): { name: IconifyName; color: string } {
  if (type.startsWith('Appointment')) {
    return { name: 'solar:clock-circle-outline', color: 'info.main' };
  }

  if (type === 'PaymentConfirmed') {
    return { name: 'solar:check-circle-bold', color: 'success.main' };
  }

  if (type === 'PaymentFailed' || type.startsWith('Subscription')) {
    return { name: 'eva:trending-down-fill', color: 'error.main' };
  }

  if (type === 'AnamnesisAnswered') {
    return { name: 'solar:clipboard-list-bold-duotone', color: 'primary.main' };
  }

  return { name: 'solar:bell-bing-bold-duotone', color: 'text.secondary' };
}
