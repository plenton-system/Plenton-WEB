import type { ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

export function PortalLoading({ label }: { label?: string }) {
  const { t } = useTranslation();
  return (
    <Box role="status" aria-live="polite" aria-label={label ?? t('patientPortal.states.loading')}>
      <Skeleton variant="rounded" height={160} />
    </Box>
  );
}

export function PortalError({ onRetry, message }: { onRetry: () => void; message?: string }) {
  const { t } = useTranslation();
  return (
    <Alert
      severity="error"
      role="alert"
      action={
        <Button color="inherit" size="small" onClick={onRetry}>
          {t('patientPortal.actions.retry')}
        </Button>
      }
    >
      {message ?? t('patientPortal.states.error')}
    </Alert>
  );
}

export function PortalEmpty({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Box
      role="status"
      sx={{
        p: { xs: 3, md: 5 },
        textAlign: 'center',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6">{title}</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: action ? 2 : 0 }}>
        {description}
      </Typography>
      {action}
    </Box>
  );
}

export function CapabilityUnavailable() {
  const { t } = useTranslation();
  return <Alert severity="info">{t('patientPortal.states.capabilityUnavailable')}</Alert>;
}
