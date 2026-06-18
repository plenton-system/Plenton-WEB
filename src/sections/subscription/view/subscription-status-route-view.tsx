import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from 'src/hooks/common/use-auth';
import { useCurrentSubscription } from 'src/hooks/subscription/use-current-subscription';

type Props = {
  state: 'success' | 'cancel' | 'expired';
};

export function SubscriptionStatusRouteView({ state }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const shouldPoll = state === 'success' && isAuthenticated;
  const current = useCurrentSubscription({ auto: shouldPoll, poll: shouldPoll, pollIntervalMs: 7000 });
  const copy = {
    success: {
      icon: 'solar:hourglass-bold',
      title: t('subscription.statusRoute.successTitle'),
      description: t('subscription.statusRoute.successDescription'),
      severity: 'info' as const,
    },
    cancel: {
      icon: 'solar:close-circle-bold',
      title: t('subscription.statusRoute.cancelTitle'),
      description: t('subscription.statusRoute.cancelDescription'),
      severity: 'warning' as const,
    },
    expired: {
      icon: 'solar:calendar-minimalistic-bold',
      title: t('subscription.statusRoute.expiredTitle'),
      description: t('subscription.statusRoute.expiredDescription'),
      severity: 'error' as const,
    },
  };
  const content = copy[state];

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 2 }}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Box component={Icon} icon={content.icon} sx={{ width: 44, height: 44, color: `${content.severity}.main` }} />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {content.title}
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>{content.description}</Typography>
          </Stack>

          <Alert severity={content.severity}>
            {state === 'success'
              ? t('subscription.statusRoute.waitingWebhook')
              : content.description}
          </Alert>

          {state === 'success' && !isAuthenticated && (
            <Alert severity="info" action={<Button onClick={() => navigate('/sign-in')}>{t('auth.signIn')}</Button>}>
              {t('subscription.statusRoute.signInAgain')}
            </Alert>
          )}

          {state === 'success' && current.loading && (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CircularProgress size={20} />
              <Typography variant="body2">{t('subscription.statusRoute.checking')}</Typography>
            </Stack>
          )}

          {state === 'success' && current.data?.status === 'active' && (
            <Alert severity="success" action={<Button onClick={() => navigate('/dashboard')}>{t('subscription.statusRoute.goToApp')}</Button>}>
              {t('subscription.statusRoute.active')}
            </Alert>
          )}

          {state === 'success' && current.error && (
            <Alert severity="warning" action={<Button onClick={current.reload}>{t('shared.retry')}</Button>}>
              {current.error}
            </Alert>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="contained" onClick={() => navigate('/#planos')}>
              {t('subscription.common.choosePlan')}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/settings/subscription')}>
              {t('subscription.common.mySubscription')}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
