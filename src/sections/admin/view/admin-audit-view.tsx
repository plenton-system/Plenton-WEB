import type { AdminAuditEvent, AdminAuditFilters } from 'src/types/admin';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useAdminResource } from 'src/hooks/admin/use-admin-resource';

import { readAdminQuery, updateAdminQuery } from 'src/utils/admin-query';
import { utcToLocalInput, validateUtcRange } from 'src/utils/admin-operations';

import { adminOperationsService } from 'src/services/admin/adminOperationsService';

import { AdminStateDiff } from '../components/admin-data';
import {
  AdminFilterBar,
  AdminPageHeader,
  AdminErrorState,
  AdminEmptyState,
  AdminServerTable,
  AdminLoadingState,
  AdminDebouncedSearchField,
} from '../components/admin-shared';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value)
  );
const inputUtc = (value: string) => (value ? new Date(value).toISOString() : '');

function AuditDrawer({ event, onClose }: { event: AdminAuditEvent; onClose: () => void }) {
  const { t } = useTranslation();
  const rows = [
    [t('admin.audit.fields.administrator'), event.administratorId],
    [t('admin.audit.fields.action'), event.action],
    [t('admin.audit.fields.target'), `${event.targetType} · ${event.targetId}`],
    [t('admin.audit.fields.tenant'), event.tenantId ?? '—'],
    [t('admin.audit.fields.reason'), event.reason],
    [t('admin.audit.fields.ip'), event.ipAddress],
    [t('admin.audit.fields.correlation'), event.correlationId],
    [t('admin.audit.fields.occurred'), formatDate(event.occurredAtUtc)],
  ];
  return (
    <Drawer
      open
      anchor="right"
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: 1, sm: 680 }, p: 3 } }}
    >
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2">
            {t('admin.audit.detail')}
          </Typography>
          <IconButton aria-label={t('admin.audit.close')} onClick={onClose}>
            ×
          </IconButton>
        </Stack>
        <Box component="dl" sx={{ m: 0 }}>
          {rows.map(([key, value]) => (
            <Box key={key} sx={{ mb: 1 }}>
              <Typography component="dt" variant="caption" color="text.secondary">
                {key}
              </Typography>
              <Typography component="dd" sx={{ m: 0, overflowWrap: 'anywhere' }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
        <Typography variant="h6">{t('admin.audit.diff')}</Typography>
        <AdminStateDiff before={event.beforeState} after={event.afterState} />
      </Stack>
    </Drawer>
  );
}

function AuditResults({
  filter,
  selectedId,
  update,
}: {
  filter: AdminAuditFilters;
  selectedId: string | null;
  update: (patch: Record<string, string | number>) => void;
}) {
  const { t } = useTranslation();
  const state = useAdminResource(
    (signal) => adminOperationsService.searchAudit(filter, signal),
    JSON.stringify(filter)
  );
  const selected = state.data?.items.find((item) => item.id === selectedId);
  return (
    <>
      {state.loading && <AdminLoadingState />}
      {state.error && <AdminErrorState message={state.error.message} onRetry={state.refetch} />}
      {state.data?.items.length === 0 && <AdminEmptyState title={t('admin.audit.empty')} />}
      {!!state.data?.items.length && (
        <AdminServerTable<AdminAuditEvent>
          result={state.data}
          loading={state.loading}
          onPageChange={(page) => update({ page })}
          onPageSizeChange={(pageSize) => update({ pageSize })}
        >
          <TableHead>
            <TableRow>
              <TableCell>{t('admin.audit.fields.administrator')}</TableCell>
              <TableCell>{t('admin.audit.fields.action')}</TableCell>
              <TableCell>{t('admin.audit.fields.target')}</TableCell>
              <TableCell>{t('admin.audit.fields.tenant')}</TableCell>
              <TableCell>{t('admin.audit.fields.reason')}</TableCell>
              <TableCell>{t('admin.audit.fields.occurred')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {state.data.items.map((event) => (
              <TableRow hover key={event.id}>
                <TableCell>
                  <Link component="button" onClick={() => update({ auditId: event.id })}>
                    {event.administratorId}
                  </Link>
                </TableCell>
                <TableCell>{event.action}</TableCell>
                <TableCell>
                  {event.targetType}
                  <br />
                  <small>{event.targetId}</small>
                </TableCell>
                <TableCell>
                  {event.tenantId ? (
                    <Link
                      component={RouterLink}
                      to={`/admin/tenants/${encodeURIComponent(event.tenantId)}`}
                    >
                      {event.tenantId}
                    </Link>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>{event.reason}</TableCell>
                <TableCell>{formatDate(event.occurredAtUtc)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </AdminServerTable>
      )}
      {selected && <AuditDrawer event={selected} onClose={() => update({ auditId: '' })} />}
    </>
  );
}

export function AdminAuditView() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const parsed = useMemo(() => readAdminQuery(params), [params]);
  const filter = useMemo<AdminAuditFilters>(
    () => ({
      administratorId: parsed.filters.administratorId,
      action: parsed.filters.action,
      targetType: parsed.filters.targetType,
      targetId: parsed.filters.targetId ?? parsed.filters.target,
      tenantId: parsed.filters.tenantId,
      startUtc: parsed.filters.startUtc,
      endUtc: parsed.filters.endUtc,
      page: parsed.page,
      pageSize: parsed.pageSize,
    }),
    [parsed]
  );
  const rangeError = validateUtcRange(filter.startUtc, filter.endUtc);
  const update = (patch: Record<string, string | number>) =>
    setParams(
      updateAdminQuery(params, patch, { resetPage: !('page' in patch) && !('auditId' in patch) })
    );
  const fields: [keyof AdminAuditFilters, string][] = [
    ['administratorId', t('admin.audit.fields.administrator')],
    ['action', t('admin.audit.fields.action')],
    ['targetType', t('admin.audit.fields.targetType')],
    ['targetId', t('admin.audit.fields.targetId')],
    ['tenantId', t('admin.audit.fields.tenant')],
  ];
  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        <AdminPageHeader
          title={t('admin.audit.title')}
          description={t('admin.audit.description')}
        />
        <AdminFilterBar>
          {fields.map(([key, label]) => (
            <AdminDebouncedSearchField
              key={key}
              label={label}
              value={String(filter[key] ?? '')}
              onDebouncedChange={(value) => update({ [key]: value })}
            />
          ))}
          <TextField
            size="small"
            type="datetime-local"
            label={t('admin.audit.start')}
            value={utcToLocalInput(filter.startUtc)}
            onChange={(e) => update({ startUtc: inputUtc(e.target.value) })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            size="small"
            type="datetime-local"
            label={t('admin.audit.end')}
            value={utcToLocalInput(filter.endUtc)}
            onChange={(e) => update({ endUtc: inputUtc(e.target.value) })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </AdminFilterBar>
        {rangeError ? (
          <Alert severity="error">{t(`admin.range.${rangeError}`)}</Alert>
        ) : (
          <AuditResults filter={filter} selectedId={params.get('auditId')} update={update} />
        )}
      </Stack>
    </Container>
  );
}
