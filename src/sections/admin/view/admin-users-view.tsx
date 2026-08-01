import type { AdminUserListItem } from 'src/types/admin';

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

import { adminUserService } from 'src/services/admin/adminTenantUserService';

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

const boolValue = (value?: string) =>
  value === 'true' ? true : value === 'false' ? false : undefined;

export function AdminUsersView() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const parsed = useMemo(() => readAdminQuery(params), [params]);
  const filter = useMemo(
    () => ({
      query: parsed.filters.query,
      role: parsed.filters.role,
      tenantId: parsed.filters.tenantId,
      isLocked: boolValue(parsed.filters.isLocked),
      emailConfirmed: boolValue(parsed.filters.emailConfirmed),
      page: parsed.page,
      pageSize: parsed.pageSize,
    }),
    [parsed]
  );
  const state = useAdminResource(
    (signal) => adminUserService.search(filter, signal),
    JSON.stringify(filter)
  );
  const update = (patch: Record<string, string | number>) =>
    setParams(updateAdminQuery(params, patch, { resetPage: !('page' in patch) }));
  const booleanFilter = (key: string, label: string, value?: boolean) => (
    <FormControl size="small" sx={{ minWidth: 160 }}>
      <InputLabel shrink>{label}</InputLabel>
      <Select
        displayEmpty
        label={label}
        value={value === undefined ? '' : String(value)}
        onChange={(event) => update({ [key]: event.target.value })}
      >
        <MenuItem value="">{t('admin.filters.all')}</MenuItem>
        <MenuItem value="true">{t('admin.filters.yes')}</MenuItem>
        <MenuItem value="false">{t('admin.filters.no')}</MenuItem>
      </Select>
    </FormControl>
  );
  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        <AdminPageHeader
          title={t('admin.users.title')}
          description={t('admin.users.description')}
        />
        <AdminFilterBar
          sx={{ '& .MuiTextField-root, & .MuiFormControl-root': { minWidth: { md: 150 } } }}
        >
          <AdminDebouncedSearchField
            label={t('admin.filters.search')}
            value={filter.query ?? ''}
            onDebouncedChange={(value) => update({ query: value })}
          />
          <AdminDebouncedSearchField
            label={t('admin.filters.role')}
            value={filter.role ?? ''}
            onDebouncedChange={(value) => update({ role: value })}
          />
          <AdminDebouncedSearchField
            label={t('admin.filters.tenant')}
            value={filter.tenantId ?? ''}
            onDebouncedChange={(value) => update({ tenantId: value })}
          />
          {booleanFilter('isLocked', t('admin.filters.locked'), filter.isLocked)}
          {booleanFilter(
            'emailConfirmed',
            t('admin.filters.emailConfirmed'),
            filter.emailConfirmed
          )}
        </AdminFilterBar>
        {state.loading && <AdminLoadingState />}
        {state.error && <AdminErrorState message={state.error.message} onRetry={state.refetch} />}
        {state.data && state.data.items.length === 0 && (
          <AdminEmptyState title={t('admin.users.empty')} />
        )}
        {state.data && state.data.items.length > 0 && (
          <AdminServerTable<AdminUserListItem>
            result={state.data}
            loading={state.loading}
            onPageChange={(page) => update({ page })}
            onPageSizeChange={(pageSize) => update({ pageSize })}
          >
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.fields.identity')}</TableCell>
                <TableCell>{t('admin.fields.tenant')}</TableCell>
                <TableCell>{t('admin.filters.role')}</TableCell>
                <TableCell>{t('admin.fields.access')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {state.data.items.map((user) => (
                <TableRow hover key={user.id}>
                  <TableCell>
                    <Link component={RouterLink} to={`/admin/users/${user.id}`}>
                      {user.name ?? '—'}
                    </Link>
                    <br />
                    {user.email ?? '—'}
                  </TableCell>
                  <TableCell>{user.tenantId}</TableCell>
                  <TableCell>{user.roles.join(', ') || '—'}</TableCell>
                  <TableCell>
                    <Stack gap={0.5} alignItems="flex-start">
                      <AdminStatusBadge
                        status={user.isLocked ? 'error' : 'success'}
                        label={t(
                          user.isLocked ? 'admin.userStatus.blocked' : 'admin.userStatus.active'
                        )}
                      />
                      <AdminStatusBadge
                        status={user.emailConfirmed ? 'success' : 'warning'}
                        label={t(
                          user.emailConfirmed
                            ? 'admin.userStatus.emailConfirmed'
                            : 'admin.userStatus.emailPending'
                        )}
                      />
                    </Stack>
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
