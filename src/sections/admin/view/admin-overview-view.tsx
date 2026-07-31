import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { useAdminDashboard } from 'src/hooks/admin/use-admin-dashboard';

import {
  AdminPageHeader,
  AdminErrorState,
  AdminEmptyState,
  AdminLoadingState,
} from '../components/admin-shared';

function CountCard({ title, value, details }: { title: string; value: number; details?: string }) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Card variant="outlined" sx={{ height: 1 }}>
        <CardContent>
          <Typography color="text.secondary">{title}</Typography>
          <Typography variant="h3">{value}</Typography>
          {details && (
            <Typography variant="body2" color="text.secondary">
              {details}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}

function utcParamToInput(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16);
}

export function AdminOverviewView() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const filter = useMemo(
    () => ({
      failureWindowStartUtc: params.get('failureWindowStartUtc') || undefined,
      failureWindowEndUtc: params.get('failureWindowEndUtc') || undefined,
    }),
    [params]
  );
  const { data, error, loading, refetch } = useAdminDashboard(filter);
  const updateWindow = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, `${value}:00.000Z`);
    else next.delete(key);
    setParams(next);
  };

  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        <AdminPageHeader
          title={t('admin.overview.title')}
          description={t('admin.overview.description')}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
          <TextField
            label={t('admin.overview.windowStart')}
            type="datetime-local"
            value={utcParamToInput(params.get('failureWindowStartUtc'))}
            slotProps={{ inputLabel: { shrink: true } }}
            onChange={(e) => updateWindow('failureWindowStartUtc', e.target.value)}
          />
          <TextField
            label={t('admin.overview.windowEnd')}
            type="datetime-local"
            value={utcParamToInput(params.get('failureWindowEndUtc'))}
            slotProps={{ inputLabel: { shrink: true } }}
            onChange={(e) => updateWindow('failureWindowEndUtc', e.target.value)}
          />
        </Stack>
        {loading && <AdminLoadingState />}
        {error && <AdminErrorState message={error.message} onRetry={refetch} />}
        {!loading && !error && !data && <AdminEmptyState />}
        {data && (
          <>
            <Grid container spacing={2}>
              <CountCard
                title={t('admin.overview.tenants')}
                value={data.tenantsByStatus.reduce((sum, item) => sum + item.count, 0)}
                details={data.tenantsByStatus
                  .map((item) => `${item.name}: ${item.count}`)
                  .join(' · ')}
              />
              <CountCard
                title={t('admin.overview.users')}
                value={data.usersByRole.reduce((sum, item) => sum + item.count, 0)}
                details={data.usersByRole.map((item) => `${item.name}: ${item.count}`).join(' · ')}
              />
              <CountCard title={t('admin.overview.patients')} value={data.patientCount} />
              <CountCard
                title={t('admin.overview.subscriptions')}
                value={data.subscriptionsByStatus.reduce((sum, item) => sum + item.count, 0)}
                details={data.subscriptionsByStatus
                  .map((item) => `${item.name}: ${item.count}`)
                  .join(' · ')}
              />
              <CountCard title={t('admin.overview.webhooks')} value={data.failedWebhookCount} />
              <CountCard title={t('admin.overview.emails')} value={data.failedEmailCount} />
            </Grid>
            <Typography variant="caption" color="text.secondary">
              {t('admin.overview.calculatedAt', {
                date: new Date(data.calculatedAtUtc).toLocaleString(),
              })}{' '}
              · {new Date(data.failureWindow.startUtc).toLocaleString()} –{' '}
              {new Date(data.failureWindow.endUtc).toLocaleString()}
            </Typography>
          </>
        )}
      </Stack>
    </Container>
  );
}
