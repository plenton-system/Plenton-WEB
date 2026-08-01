import type { AdminApiError, AdminTenantTransition } from 'src/types/admin';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link as RouterLink } from 'react-router-dom';

import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { useAdminResource } from 'src/hooks/admin/use-admin-resource';

import { mapAdminApiError } from 'src/utils/admin-api-error';
import { applyTenantTransition } from 'src/utils/admin-transitions';

import { adminTenantService } from 'src/services/admin/adminTenantUserService';

import { AdminCommandDialog } from '../components/admin-command-dialog';
import {
  AdminPageHeader,
  AdminErrorState,
  AdminStatusBadge,
  AdminLoadingState,
} from '../components/admin-shared';

type Command = { action: 'suspend' | 'reactivate'; stamp: string };
const subscriptionStatusKey = {
  1: 'admin.subscriptionStatus.1',
  2: 'admin.subscriptionStatus.2',
  3: 'admin.subscriptionStatus.3',
  4: 'admin.subscriptionStatus.4',
  5: 'admin.subscriptionStatus.5',
  6: 'admin.subscriptionStatus.6',
  7: 'admin.subscriptionStatus.7',
  8: 'admin.subscriptionStatus.8',
} as const;

export function AdminTenantDetailView() {
  const { identifier = '' } = useParams();
  const { t } = useTranslation();
  const state = useAdminResource(
    (signal) => adminTenantService.detail(identifier, signal),
    identifier
  );
  const [command, setCommand] = useState<Command | null>(null);
  const [commandError, setCommandError] = useState<AdminApiError | null>(null);
  const [busy, setBusy] = useState(false);
  const applyTransition = (transition: AdminTenantTransition) =>
    state.setData((current) => current && applyTenantTransition(current, transition));
  const submit = async (reason: string) => {
    if (!command) return;
    setBusy(true);
    setCommandError(null);
    try {
      const payload = { reason, concurrencyStamp: command.stamp };
      const transition =
        command.action === 'suspend'
          ? await adminTenantService.suspend(identifier, payload)
          : await adminTenantService.reactivate(identifier, payload);
      applyTransition(transition);
      setCommand(null);
    } catch (cause: unknown) {
      const error = mapAdminApiError(cause);
      setCommandError(error);
      if (error.kind === 'conflict') state.refetch();
    } finally {
      setBusy(false);
    }
  };
  if (state.loading) return <AdminLoadingState />;
  if (state.error?.kind === 'notFound')
    return (
      <Container>
        <AdminErrorState message={state.error.message} />
        <Link component={RouterLink} to="/admin/tenants">
          {t('admin.actions.backToList')}
        </Link>
      </Container>
    );
  if (state.error)
    return (
      <Container>
        <AdminErrorState message={state.error.message} onRetry={state.refetch} />
      </Container>
    );
  if (!state.data) return null;
  const tenant = state.data;
  return (
    <Container maxWidth="lg">
      <Stack spacing={3}>
        <AdminPageHeader
          title={tenant.identifier}
          description={t('admin.tenants.detailDescription')}
          actions={
            <Button component={RouterLink} to="/admin/tenants">
              {t('admin.actions.backToList')}
            </Button>
          }
        />
        {commandError?.kind === 'conflict' && (
          <Alert severity="warning">{t('admin.errors.conflictRefresh')}</Alert>
        )}
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
                <AdminStatusBadge
                  status={tenant.status === 'Active' ? 'success' : 'warning'}
                  label={t(
                    tenant.status === 'Active'
                      ? 'admin.tenantStatus.active'
                      : 'admin.tenantStatus.suspended'
                  )}
                />
                <Button
                  color={tenant.status === 'Active' ? 'warning' : 'success'}
                  variant="contained"
                  onClick={() => {
                    setCommandError(null);
                    setCommand({
                      action: tenant.status === 'Active' ? 'suspend' : 'reactivate',
                      stamp: tenant.concurrencyStamp,
                    });
                  }}
                >
                  {t(
                    tenant.status === 'Active'
                      ? 'admin.actions.suspendTenant'
                      : 'admin.actions.reactivateTenant'
                  )}
                </Button>
              </Stack>
              <Divider />
              <Typography>
                <strong>{t('admin.fields.owner')}:</strong> {tenant.nutritionistName ?? '—'} ·{' '}
                {tenant.nutritionistEmail ?? '—'}
              </Typography>
              <Typography>
                <strong>{t('admin.fields.usage')}:</strong> {tenant.usage.userCount}{' '}
                {t('admin.fields.users')}, {tenant.usage.patientCount} {t('admin.fields.patients')},{' '}
                {tenant.usage.nutritionistCount} {t('admin.fields.nutritionists')}
                {', '}
                {tenant.usage.subscriptionCount} {t('admin.fields.subscriptions')}
              </Typography>
              <Typography>
                <strong>{t('admin.fields.subscription')}:</strong>{' '}
                {tenant.subscription.planName ?? '—'} · {tenant.subscription.planCode ?? '—'} ·{' '}
                {tenant.subscription.status == null
                  ? '—'
                  : t(
                      subscriptionStatusKey[
                        tenant.subscription.status as keyof typeof subscriptionStatusKey
                      ] ?? 'admin.subscriptionStatus.1'
                    )}
              </Typography>
              <Typography>
                <strong>{t('admin.fields.currentPeriodEnd')}:</strong>{' '}
                {tenant.subscription.currentPeriodEndUtc
                  ? new Date(tenant.subscription.currentPeriodEndUtc).toLocaleString()
                  : '—'}
              </Typography>
              <Typography>
                <strong>{t('admin.fields.nextDueDate')}:</strong>{' '}
                {tenant.subscription.nextDueDateUtc
                  ? new Date(tenant.subscription.nextDueDateUtc).toLocaleString()
                  : '—'}
              </Typography>
              <Typography>
                <strong>{t('admin.fields.created')}:</strong>{' '}
                {new Date(tenant.createdAtUtc).toLocaleString()}
              </Typography>
              <Typography>
                <strong>{t('admin.fields.updated')}:</strong>{' '}
                {new Date(tenant.updatedAtUtc).toLocaleString()}
              </Typography>
              <Typography>
                <strong>{t('admin.fields.suspendedAt')}:</strong>{' '}
                {tenant.suspendedAtUtc ? new Date(tenant.suspendedAtUtc).toLocaleString() : '—'}
              </Typography>
              <Typography>
                <strong>{t('admin.fields.reactivatedAt')}:</strong>{' '}
                {tenant.reactivatedAtUtc ? new Date(tenant.reactivatedAtUtc).toLocaleString() : '—'}
              </Typography>
              <Typography sx={{ overflowWrap: 'anywhere' }}>
                <strong>{t('admin.fields.concurrencyStamp')}:</strong> {tenant.concurrencyStamp}
              </Typography>
              {tenant.suspensionReason && (
                <Alert severity="warning">{tenant.suspensionReason}</Alert>
              )}
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                <Link
                  component={RouterLink}
                  to={`/admin/users?tenantId=${encodeURIComponent(tenant.id)}`}
                >
                  {t('admin.links.users')}
                </Link>
                <Link
                  component={RouterLink}
                  to={`/admin/subscriptions?tenantId=${encodeURIComponent(tenant.identifier)}`}
                >
                  {t('admin.links.subscription')}
                </Link>
                <Link
                  component={RouterLink}
                  to={`/admin/audit?tenantId=${encodeURIComponent(tenant.identifier)}&target=${encodeURIComponent(tenant.id)}`}
                >
                  {t('admin.links.audit')}
                </Link>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
        <AdminCommandDialog
          open={!!command}
          busy={busy}
          error={commandError?.message}
          title={t(
            command?.action === 'suspend'
              ? 'admin.actions.suspendTenant'
              : 'admin.actions.reactivateTenant'
          )}
          consequence={t(
            command?.action === 'suspend'
              ? 'admin.consequences.tenantSuspend'
              : 'admin.consequences.tenantReactivate'
          )}
          onClose={() => {
            setCommand(null);
            setCommandError(null);
          }}
          onConfirm={submit}
        />
      </Stack>
    </Container>
  );
}
