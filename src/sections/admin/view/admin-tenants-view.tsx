import type { AdminTenantStatus, AdminTenantListItem } from 'src/types/admin';

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

import { readAdminQuery, updateAdminQuery } from 'src/utils/admin-query';

import { adminTenantService } from 'src/services/admin/adminTenantUserService';

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

export function AdminTenantsView() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const parsed = useMemo(() => readAdminQuery(params), [params]);
  const filter = useMemo(
    () => ({
      query: parsed.filters.query,
      status: parsed.filters.status as AdminTenantStatus | undefined,
      page: parsed.page,
      pageSize: parsed.pageSize,
    }),
    [parsed]
  );
  const state = useAdminResource(
    (signal) => adminTenantService.search(filter, signal),
    JSON.stringify(filter)
  );
  const update = (patch: Record<string, string | number>) =>
    setParams(updateAdminQuery(params, patch, { resetPage: !('page' in patch) }));

  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        <AdminPageHeader
          title={t('admin.tenants.title')}
          description={t('admin.tenants.description')}
        />
        <AdminFilterBar>
          <AdminDebouncedSearchField
            label={t('admin.filters.search')}
            value={filter.query ?? ''}
            onDebouncedChange={(value) => update({ query: value })}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel shrink>{t('admin.filters.status')}</InputLabel>
            <Select
              displayEmpty
              label={t('admin.filters.status')}
              value={filter.status ?? ''}
              onChange={(event) => update({ status: String(event.target.value) })}
            >
              <MenuItem value="">{t('admin.filters.all')}</MenuItem>
              <MenuItem value="Active">{t('admin.tenantStatus.active')}</MenuItem>
              <MenuItem value="Suspended">{t('admin.tenantStatus.suspended')}</MenuItem>
            </Select>
          </FormControl>
        </AdminFilterBar>
        {state.loading && <AdminLoadingState />}
        {state.error && <AdminErrorState message={state.error.message} onRetry={state.refetch} />}
        {state.data && state.data.items.length === 0 && (
          <AdminEmptyState title={t('admin.tenants.empty')} />
        )}
        {state.data && state.data.items.length > 0 && (
          <AdminServerTable<AdminTenantListItem>
            result={state.data}
            loading={state.loading}
            onPageChange={(page) => update({ page })}
            onPageSizeChange={(pageSize) => update({ pageSize })}
          >
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.fields.tenant')}</TableCell>
                <TableCell>{t('admin.fields.owner')}</TableCell>
                <TableCell>{t('admin.filters.status')}</TableCell>
                <TableCell>{t('admin.fields.usage')}</TableCell>
                <TableCell>{t('admin.fields.timestamps')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {state.data.items.map((tenant) => (
                <TableRow hover key={tenant.id}>
                  <TableCell>
                    <Link
                      component={RouterLink}
                      to={`/admin/tenants/${encodeURIComponent(tenant.identifier)}`}
                    >
                      {tenant.identifier}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {tenant.nutritionistName ?? '—'}
                    <br />
                    {tenant.nutritionistEmail ?? '—'}
                  </TableCell>
                  <TableCell>
                    <AdminStatusBadge
                      status={tenant.status === 'Active' ? 'success' : 'warning'}
                      label={t(
                        tenant.status === 'Active'
                          ? 'admin.tenantStatus.active'
                          : 'admin.tenantStatus.suspended'
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    {tenant.userCount} / {tenant.patientCount}
                  </TableCell>
                  <TableCell>
                    {t('admin.fields.created')}: {new Date(tenant.createdAtUtc).toLocaleString()}
                    <br />
                    {tenant.suspendedAtUtc
                      ? `${t('admin.fields.suspended')}: ${new Date(tenant.suspendedAtUtc).toLocaleString()}`
                      : `${t('admin.fields.updated')}: ${new Date(tenant.updatedAtUtc).toLocaleString()}`}
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
