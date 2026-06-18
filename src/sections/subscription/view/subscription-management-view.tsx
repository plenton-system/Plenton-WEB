import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useCurrentSubscription } from 'src/hooks/subscription/use-current-subscription';

import { formatDate, statusColor, statusLabel, billingTypeLabel, billingCycleLabel } from '../utils';

export function SubscriptionManagementView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, loading, error, empty, reload } = useCurrentSubscription();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {t('subscription.common.mySubscription')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {t('subscription.management.description')}
          </Typography>
        </Box>

        {loading && (
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={22} />
              <Typography>{t('subscription.common.loading')}</Typography>
            </Stack>
          </Paper>
        )}

        {error && (
          <Alert severity="error" action={<Button onClick={reload}>{t('shared.retry')}</Button>}>
            {error}
          </Alert>
        )}

        {empty && (
          <Alert severity="info" action={<Button onClick={() => navigate('/#planos')}>{t('subscription.common.choosePlan')}</Button>}>
            {t('subscription.common.empty')}
          </Alert>
        )}

        {data && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Stack spacing={2}>
                  <Chip
                    label={statusLabel(data.status)}
                    color={statusColor(data.status) as any}
                    sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
                  />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {data.planName ?? t('subscription.common.planUnknown')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {data.planCode ?? t('subscription.common.codeUnknown')}
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {t('subscription.common.cycle')}
                      </Typography>
                      <Typography>{billingCycleLabel(data.billingCycle)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {t('subscription.common.payment')}
                      </Typography>
                      <Typography>{billingTypeLabel(data.billingType)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {t('subscription.common.nextCharge')}
                      </Typography>
                      <Typography>{formatDate(data.nextChargeDate ?? data.dueDate) ?? t('subscription.notProvided')}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {t('subscription.common.expiresAt')}
                      </Typography>
                      <Typography>{formatDate(data.expiresAt) ?? t('subscription.notProvided')}</Typography>
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Stack spacing={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {t('subscription.common.actions')}
                  </Typography>
                  {[
                    ['solar:refresh-circle-bold', t('subscription.management.changePlan')],
                    ['solar:card-2-bold', t('subscription.management.changePayment')],
                    ['solar:bill-list-bold', t('subscription.management.viewCharges')],
                    ['solar:trash-bin-trash-bold', t('subscription.management.cancel')],
                  ].map(([icon, label]) => (
                    <Button
                      key={label}
                      variant="outlined"
                      disabled
                      startIcon={<Box component={Icon} icon={icon} />}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      {label}
                    </Button>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Stack>
    </Container>
  );
}
