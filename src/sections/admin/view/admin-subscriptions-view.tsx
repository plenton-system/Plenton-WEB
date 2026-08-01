import type {
  AdminInvoiceStatus,
  AdminSubscriptionStatus,
  AdminSubscriptionListItem,
} from 'src/types/admin';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Container from '@mui/material/Container';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { useAdminResource } from 'src/hooks/admin/use-admin-resource';
import { useSubscriptionCatalog } from 'src/hooks/subscription/use-subscription-catalog';

import { readAdminQuery, updateAdminQuery } from 'src/utils/admin-query';
import { invoiceStatusTone, subscriptionStatusTone } from 'src/utils/admin-subscriptions';

import { adminSubscriptionService } from 'src/services/admin/adminSubscriptionService';

import {
  AdminFilterBar,
  AdminPageHeader,
  AdminErrorState,
  AdminEmptyState,
  AdminServerTable,
  AdminStatusBadge,
  AdminLoadingState,
  AdminDebouncedSearchField,
} from '../components/admin-shared';

const SUBSCRIPTION_STATUSES = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const INVOICE_STATUSES = [1, 2, 3, 4, 5, 6] as const;

export function AdminSubscriptionsView() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const parsed = useMemo(() => readAdminQuery(params), [params]);
  const catalog = useSubscriptionCatalog();
  const filter = useMemo(
    () => ({
      tenantId: parsed.filters.tenantId,
      planId: parsed.filters.planId,
      status: parsed.filters.status
        ? (Number(parsed.filters.status) as AdminSubscriptionStatus)
        : undefined,
      invoiceStatus: parsed.filters.invoiceStatus
        ? (Number(parsed.filters.invoiceStatus) as AdminInvoiceStatus)
        : undefined,
      providerCustomerId: parsed.filters.providerCustomerId,
      page: parsed.page,
      pageSize: parsed.pageSize,
    }),
    [parsed]
  );
  const state = useAdminResource(
    (signal) => adminSubscriptionService.search(filter, signal),
    JSON.stringify(filter)
  );
  const update = (patch: Record<string, string | number>) =>
    setParams(updateAdminQuery(params, patch, { resetPage: !('page' in patch) }));

  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        <AdminPageHeader
          title={t('admin.subscriptionManagement.title')}
          description={t('admin.subscriptionManagement.description')}
        />
        <AdminFilterBar sx={{ '& .MuiFormControl-root': { minWidth: { md: 160 } } }}>
          <AdminDebouncedSearchField
            label={t('admin.filters.tenant')}
            value={filter.tenantId ?? ''}
            onDebouncedChange={(value) => update({ tenantId: value })}
          />
          <FormControl size="small">
            <InputLabel shrink>{t('admin.subscriptionManagement.fields.plan')}</InputLabel>
            <Select
              displayEmpty
              label={t('admin.subscriptionManagement.fields.plan')}
              value={filter.planId ?? ''}
              onChange={(event) => update({ planId: event.target.value })}
            >
              <MenuItem value="">{t('admin.filters.all')}</MenuItem>
              {catalog.plans.map((plan) => (
                <MenuItem key={plan.planId} value={plan.planId}>
                  {plan.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel shrink>{t('admin.filters.status')}</InputLabel>
            <Select
              displayEmpty
              label={t('admin.filters.status')}
              value={filter.status ?? ''}
              onChange={(event) => update({ status: String(event.target.value) })}
            >
              <MenuItem value="">{t('admin.filters.all')}</MenuItem>
              {SUBSCRIPTION_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {t(`admin.subscriptionStatus.${status}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel shrink>{t('admin.subscriptionManagement.fields.invoiceStatus')}</InputLabel>
            <Select
              displayEmpty
              label={t('admin.subscriptionManagement.fields.invoiceStatus')}
              value={filter.invoiceStatus ?? ''}
              onChange={(event) => update({ invoiceStatus: String(event.target.value) })}
            >
              <MenuItem value="">{t('admin.filters.all')}</MenuItem>
              {INVOICE_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {t(`admin.invoiceStatus.${status}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <AdminDebouncedSearchField
            label={t('admin.subscriptionManagement.fields.providerCustomer')}
            value={filter.providerCustomerId ?? ''}
            onDebouncedChange={(value) => update({ providerCustomerId: value })}
          />
        </AdminFilterBar>
        {state.loading && <AdminLoadingState />}
        {state.error && <AdminErrorState message={state.error.message} onRetry={state.refetch} />}
        {state.data?.items.length === 0 && (
          <AdminEmptyState title={t('admin.subscriptionManagement.empty')} />
        )}
        {!!state.data?.items.length && (
          <AdminServerTable<AdminSubscriptionListItem>
            result={state.data}
            loading={state.loading}
            onPageChange={(page) => update({ page })}
            onPageSizeChange={(pageSize) => update({ pageSize })}
          >
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.fields.tenant')}</TableCell>
                <TableCell>{t('admin.subscriptionManagement.fields.plan')}</TableCell>
                <TableCell>{t('admin.filters.status')}</TableCell>
                <TableCell>{t('admin.subscriptionManagement.fields.invoiceStatus')}</TableCell>
                <TableCell>{t('admin.subscriptionManagement.fields.provider')}</TableCell>
                <TableCell>{t('admin.fields.nextDueDate')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {state.data.items.map((item) => (
                <TableRow hover key={item.id}>
                  <TableCell>{item.tenantId}</TableCell>
                  <TableCell>
                    <Link
                      component={RouterLink}
                      to={`/admin/subscriptions/${item.id}?tenantId=${encodeURIComponent(item.tenantId)}`}
                    >
                      {item.planName}
                    </Link>
                    <br />
                    {item.planCode}
                  </TableCell>
                  <TableCell>
                    <AdminStatusBadge
                      status={subscriptionStatusTone[item.status]}
                      label={t(`admin.subscriptionStatus.${item.status}`)}
                    />
                  </TableCell>
                  <TableCell>
                    {item.latestInvoiceStatus ? (
                      <AdminStatusBadge
                        status={invoiceStatusTone[item.latestInvoiceStatus]}
                        label={t(`admin.invoiceStatus.${item.latestInvoiceStatus}`)}
                      />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell sx={{ overflowWrap: 'anywhere' }}>
                    {item.providerCustomerId}
                    <br />
                    {item.providerSubscriptionId ?? '—'}
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat(undefined, {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    }).format(new Date(item.nextDueDate))}
                    <br />
                    <small>
                      {t('admin.subscriptionManagement.fields.version')}: {item.version}
                    </small>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </AdminServerTable>
        )}
      </Stack>
    </Container>
  );
}
