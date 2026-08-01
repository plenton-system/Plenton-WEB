import type { AdminSubscriptionCommandResult } from 'src/types/admin';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams, Link as RouterLink } from 'react-router-dom';

import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';

import { useAdminResource } from 'src/hooks/admin/use-admin-resource';
import { useSubscriptionCatalog } from 'src/hooks/subscription/use-subscription-catalog';

import {
  invoiceStatusTone,
  subscriptionStatusTone,
  applySubscriptionCommand,
} from 'src/utils/admin-subscriptions';

import { adminSubscriptionService } from 'src/services/admin/adminSubscriptionService';

import { AdminSubscriptionDialog } from '../components/admin-subscription-dialog';
import {
  AdminPageHeader,
  AdminErrorState,
  AdminStatusBadge,
  AdminLoadingState,
} from '../components/admin-shared';

type Action = 'plan' | 'suspend' | 'reactivate';
type ActionPayload = {
  tenantId: string;
  expectedVersion: string;
  reason: string;
  planPriceId?: string;
  proration?: 1 | 2;
  nextDueDate?: string;
};

export function AdminSubscriptionDetailView() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const tenantId = params.get('tenantId') ?? '';
  const { t } = useTranslation();
  const [action, setAction] = useState<Action | null>(null);
  const [conflict, setConflict] = useState(false);
  const catalog = useSubscriptionCatalog();
  const state = useAdminResource(
    (signal) =>
      tenantId
        ? adminSubscriptionService.detail(id, tenantId, signal)
        : Promise.reject(new Error('Tenant context is required')),
    `${id}:${tenantId}`
  );
  const date = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(value))
      : '—';

  if (!tenantId)
    return (
      <Container>
        <AdminErrorState message={t('admin.subscriptionManagement.tenantRequired')} />
        <Button component={RouterLink} to="/admin/subscriptions">
          {t('admin.actions.backToList')}
        </Button>
      </Container>
    );
  if (state.loading) return <AdminLoadingState />;
  if (state.error)
    return (
      <Container>
        <AdminErrorState
          message={state.error.message}
          onRetry={state.error.kind === 'notFound' ? undefined : state.refetch}
        />
        <Button component={RouterLink} to="/admin/subscriptions">
          {t('admin.actions.backToList')}
        </Button>
      </Container>
    );
  if (!state.data) return null;
  const subscription = state.data;

  const submit = async (
    selectedAction: Action,
    payload: ActionPayload,
    idempotencyKey: string
  ): Promise<AdminSubscriptionCommandResult> => {
    const common = {
      tenantId: payload.tenantId,
      expectedVersion: payload.expectedVersion,
      reason: payload.reason,
      idempotencyKey,
    };
    let result: AdminSubscriptionCommandResult;
    if (selectedAction === 'plan') {
      result = await adminSubscriptionService.changePlan(id, {
        ...common,
        planPriceId: payload.planPriceId!,
        proration: payload.proration!,
      });
    } else if (selectedAction === 'suspend') {
      result = await adminSubscriptionService.suspend(id, common);
    } else {
      result = await adminSubscriptionService.reactivate(id, {
        ...common,
        nextDueDate: payload.nextDueDate!,
      });
    }
    const confirmedPlan = catalog.plans.find(
      (plan) =>
        plan.planId === result.planId ||
        plan.prices.some((price) => price.planPriceId === result.planPriceId)
    );
    state.setData(
      (current) =>
        current &&
        applySubscriptionCommand(
          current,
          result,
          confirmedPlan ? { name: confirmedPlan.name, code: confirmedPlan.code } : undefined
        )
    );
    if (selectedAction === 'plan' && !confirmedPlan) state.refetch();
    setConflict(false);
    return result;
  };

  return (
    <Container maxWidth="lg">
      <Stack spacing={3}>
        <AdminPageHeader
          title={`${subscription.planName} · ${subscription.tenantId}`}
          description={t('admin.subscriptionManagement.detailDescription')}
          actions={
            <Button component={RouterLink} to="/admin/subscriptions">
              {t('admin.actions.backToList')}
            </Button>
          }
        />
        {conflict && <Alert severity="warning">{t('admin.errors.conflictRefresh')}</Alert>}
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                <AdminStatusBadge
                  status={subscriptionStatusTone[subscription.status]}
                  label={t(`admin.subscriptionStatus.${subscription.status}`)}
                />
                <Button variant="outlined" onClick={() => setAction('plan')}>
                  {t('admin.subscriptionManagement.actions.plan')}
                </Button>
                <Button
                  color="warning"
                  variant="outlined"
                  disabled={[6, 7, 8].includes(subscription.status)}
                  onClick={() => setAction('suspend')}
                >
                  {t('admin.subscriptionManagement.actions.suspend')}
                </Button>
                <Button
                  color="success"
                  variant="outlined"
                  disabled={subscription.status !== 6}
                  onClick={() => setAction('reactivate')}
                >
                  {t('admin.subscriptionManagement.actions.reactivate')}
                </Button>
              </Stack>
              <Divider />
              <Typography>
                <strong>{t('admin.fields.tenant')}:</strong> {subscription.tenantId}
              </Typography>
              <Typography>
                <strong>{t('admin.subscriptionManagement.fields.plan')}:</strong>{' '}
                {subscription.planName} · {subscription.planCode}
              </Typography>
              <Typography>
                <strong>{t('admin.subscriptionManagement.fields.provider')}:</strong>{' '}
                {subscription.provider} · {subscription.providerCustomerId} ·{' '}
                {subscription.providerSubscriptionId ?? '—'}
              </Typography>
              <Typography>
                <strong>{t('admin.subscriptionManagement.fields.currentPeriod')}:</strong>{' '}
                {date(subscription.currentPeriodStart)} — {date(subscription.currentPeriodEnd)}
              </Typography>
              <Typography>
                <strong>{t('admin.fields.nextDueDate')}:</strong> {date(subscription.nextDueDate)}
              </Typography>
              <Typography sx={{ overflowWrap: 'anywhere' }}>
                <strong>{t('admin.subscriptionManagement.fields.version')}:</strong>{' '}
                {subscription.version}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                <Link
                  component={RouterLink}
                  to={`/admin/tenants/${encodeURIComponent(subscription.tenantId)}`}
                >
                  {t('admin.subscriptionManagement.links.tenant')}
                </Link>
                <Link
                  component={RouterLink}
                  to={`/admin/audit?tenantId=${encodeURIComponent(subscription.tenantId)}&target=${subscription.id}`}
                >
                  {t('admin.links.audit')}
                </Link>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('admin.subscriptionManagement.invoices')}
            </Typography>
            {subscription.invoices.length === 0 ? (
              <Typography color="text.secondary">
                {t('admin.subscriptionManagement.noInvoices')}
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('admin.subscriptionManagement.fields.dueDate')}</TableCell>
                      <TableCell>{t('admin.subscriptionManagement.fields.value')}</TableCell>
                      <TableCell>{t('admin.filters.status')}</TableCell>
                      <TableCell>{t('admin.subscriptionManagement.fields.paidAt')}</TableCell>
                      <TableCell>{t('admin.subscriptionManagement.fields.paymentId')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subscription.invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{date(invoice.dueDate)}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat(undefined, {
                            style: 'currency',
                            currency: invoice.currency,
                          }).format(invoice.value)}
                        </TableCell>
                        <TableCell>
                          <AdminStatusBadge
                            status={invoiceStatusTone[invoice.status]}
                            label={t(`admin.invoiceStatus.${invoice.status}`)}
                          />
                        </TableCell>
                        <TableCell>{date(invoice.paidAt)}</TableCell>
                        <TableCell sx={{ overflowWrap: 'anywhere' }}>
                          {invoice.providerPaymentId ?? '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
        {action && (
          <AdminSubscriptionDialog
            open
            action={action}
            subscription={subscription}
            plans={catalog.plans}
            plansLoading={catalog.loading}
            plansError={!!catalog.error}
            onReloadPlans={catalog.reload}
            onClose={() => setAction(null)}
            onSubmit={submit}
            onConflict={() => {
              setConflict(true);
              state.refetch();
            }}
          />
        )}
      </Stack>
    </Container>
  );
}
