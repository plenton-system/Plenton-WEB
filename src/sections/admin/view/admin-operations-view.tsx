import type {
  AdminReprocessOutcome,
  AdminPlatformDashboard,
  AdminOperationalEventDetail,
  AdminOperationalEventSource,
  AdminOperationalEventFilters,
  AdminOperationalEventListItem,
} from 'src/types/admin';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';

import { useAdminResource } from 'src/hooks/admin/use-admin-resource';

import { readAdminQuery, updateAdminQuery } from 'src/utils/admin-query';
import {
  utcToLocalInput,
  validateUtcRange,
  isEventReprocessable,
  operationalStatusTone,
} from 'src/utils/admin-operations';

import { adminOperationsService } from 'src/services/admin/adminOperationsService';

import { AdminMetadata } from '../components/admin-data';
import { AdminReprocessDialog } from '../components/admin-reprocess-dialog';
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

const SOURCES: AdminOperationalEventSource[] = ['Webhook', 'Email'];
const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(
        new Date(value)
      )
    : '—';
const inputUtc = (value: string) => (value ? new Date(value).toISOString() : '');

function DashboardCards({ dashboard }: { dashboard: AdminPlatformDashboard }) {
  const { t } = useTranslation();
  const cards = [
    [
      t('admin.operations.cards.tenants'),
      dashboard.tenantsByStatus.reduce((sum, item) => sum + item.count, 0),
    ],
    [
      t('admin.operations.cards.users'),
      dashboard.usersByRole.reduce((sum, item) => sum + item.count, 0),
    ],
    [t('admin.operations.cards.patients'), dashboard.patientCount],
    [
      t('admin.operations.cards.subscriptions'),
      dashboard.subscriptionsByStatus.reduce((sum, item) => sum + item.count, 0),
    ],
    [t('admin.operations.cards.webhooks'), dashboard.failedWebhookCount],
    [t('admin.operations.cards.emails'), dashboard.failedEmailCount],
  ] as const;
  return (
    <>
      <Grid container spacing={2}>
        {cards.map(([label, count]) => (
          <Grid key={label} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card variant="outlined" sx={{ height: 1 }}>
              <CardContent>
                <Typography color="text.secondary">{label}</Typography>
                <Typography variant="h4">{count}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Typography variant="body2" color="text.secondary">
        {t('admin.operations.calculated', { date: formatDate(dashboard.calculatedAtUtc) })} ·{' '}
        {t('admin.operations.window', {
          start: formatDate(dashboard.failureWindow.startUtc),
          end: formatDate(dashboard.failureWindow.endUtc),
        })}
      </Typography>
    </>
  );
}

function EventDrawer({
  source,
  id,
  onClose,
  onRefreshList,
}: {
  source: AdminOperationalEventSource;
  id: string;
  onClose: () => void;
  onRefreshList: () => void;
}) {
  const { t } = useTranslation();
  const [dialog, setDialog] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    severity: 'success' | 'warning';
  } | null>(null);
  const state = useAdminResource(
    (signal) => adminOperationsService.eventDetail(source, id, signal),
    `${source}:${id}`
  );
  const event = state.data;
  const success = (outcome: AdminReprocessOutcome) => {
    setFeedback({
      severity: 'success',
      message: t(
        outcome.replayed
          ? 'admin.operations.reprocess.replayed'
          : 'admin.operations.reprocess.accepted',
        { correlation: outcome.result.correlationId }
      ),
    });
    state.refetch();
    onRefreshList();
  };
  return (
    <Drawer
      open
      anchor="right"
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: 1, sm: 560 }, p: 3 } }}
    >
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2">
            {t('admin.operations.detail')}
          </Typography>
          <IconButton aria-label={t('admin.operations.close')} onClick={onClose}>
            ×
          </IconButton>
        </Stack>
        {feedback && <Alert severity={feedback.severity}>{feedback.message}</Alert>}
        {state.loading && <AdminLoadingState />}
        {state.error && <AdminErrorState message={state.error.message} onRetry={state.refetch} />}
        {event && <EventDetail event={event} onReprocess={() => setDialog(true)} />}
      </Stack>
      {event && (
        <AdminReprocessDialog
          open={dialog}
          onClose={() => setDialog(false)}
          onConflict={() => {
            setFeedback({ severity: 'warning', message: t('admin.errors.conflictRefresh') });
            state.refetch();
            onRefreshList();
          }}
          onSubmit={(payload) => adminOperationsService.reprocess(event.source, event.id, payload)}
          onSuccess={success}
        />
      )}
    </Drawer>
  );
}

function EventDetail({
  event,
  onReprocess,
}: {
  event: AdminOperationalEventDetail;
  onReprocess: () => void;
}) {
  const { t } = useTranslation();
  const rows = [
    [t('admin.operations.fields.source'), event.source],
    [t('admin.operations.fields.tenant'), event.tenantId],
    [t('admin.operations.fields.type'), event.type],
    [t('admin.operations.fields.status'), event.status],
    [t('admin.operations.fields.attempts'), event.attemptCount],
    [t('admin.operations.fields.occurred'), formatDate(event.occurredAtUtc)],
    [t('admin.operations.fields.lastAttempt'), formatDate(event.lastAttemptAtUtc)],
    [t('admin.operations.fields.completed'), formatDate(event.completedAtUtc)],
    [t('admin.operations.fields.correlation'), event.correlationId],
    [t('admin.operations.fields.error'), event.errorSummary ?? '—'],
  ];
  return (
    <Stack spacing={2}>
      {isEventReprocessable(event.status) && (
        <Button variant="contained" onClick={onReprocess}>
          {t('admin.operations.reprocess.action')}
        </Button>
      )}
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
      <Typography variant="h6">{t('admin.operations.metadata')}</Typography>
      <AdminMetadata metadata={event.safeMetadata} />
    </Stack>
  );
}

function OperationsResults({
  filter,
  params,
  update,
}: {
  filter: AdminOperationalEventFilters;
  params: URLSearchParams;
  update: (patch: Record<string, string | number>) => void;
}) {
  const { t } = useTranslation();
  const dashboard = useAdminResource(
    (signal) =>
      adminOperationsService.getDashboard(
        { failureWindowStartUtc: filter.startUtc, failureWindowEndUtc: filter.endUtc },
        signal
      ),
    `${filter.startUtc}:${filter.endUtc}`
  );
  const events = useAdminResource(
    (signal) => adminOperationsService.searchEvents(filter, signal),
    JSON.stringify(filter)
  );
  const selectedId = params.get('eventId');
  const selectedSource = params.get('eventSource') as AdminOperationalEventSource | null;
  const closeDrawer = () => update({ eventId: '', eventSource: '' });
  return (
    <>
      {dashboard.loading && <AdminLoadingState />}
      {dashboard.error && (
        <AdminErrorState message={dashboard.error.message} onRetry={dashboard.refetch} />
      )}
      {dashboard.data && <DashboardCards dashboard={dashboard.data} />}
      {events.loading && <AdminLoadingState />}
      {events.error && <AdminErrorState message={events.error.message} onRetry={events.refetch} />}
      {events.data?.items.length === 0 && <AdminEmptyState title={t('admin.operations.empty')} />}
      {!!events.data?.items.length && (
        <AdminServerTable<AdminOperationalEventListItem>
          result={events.data}
          loading={events.loading}
          onPageChange={(page) => update({ page })}
          onPageSizeChange={(pageSize) => update({ pageSize })}
        >
          <TableHead>
            <TableRow>
              <TableCell>{t('admin.operations.fields.source')}</TableCell>
              <TableCell>{t('admin.operations.fields.tenant')}</TableCell>
              <TableCell>{t('admin.operations.fields.type')}</TableCell>
              <TableCell>{t('admin.operations.fields.status')}</TableCell>
              <TableCell>{t('admin.operations.fields.attempts')}</TableCell>
              <TableCell>{t('admin.operations.fields.occurred')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.data.items.map((event) => (
              <TableRow hover key={`${event.source}:${event.id}`}>
                <TableCell>
                  <Link
                    component="button"
                    onClick={() => update({ eventId: event.id, eventSource: event.source })}
                  >
                    {event.source}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    component={RouterLink}
                    to={`/admin/tenants/${encodeURIComponent(event.tenantId)}`}
                  >
                    {event.tenantId}
                  </Link>
                </TableCell>
                <TableCell>
                  {event.type}
                  <br />
                  <small>{event.correlationId}</small>
                </TableCell>
                <TableCell>
                  <AdminStatusBadge
                    status={operationalStatusTone(event.status)}
                    label={event.status}
                  />
                </TableCell>
                <TableCell>{event.attemptCount}</TableCell>
                <TableCell>{formatDate(event.occurredAtUtc)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </AdminServerTable>
      )}
      {selectedId && selectedSource && SOURCES.includes(selectedSource) && (
        <EventDrawer
          source={selectedSource}
          id={selectedId}
          onClose={closeDrawer}
          onRefreshList={events.refetch}
        />
      )}
    </>
  );
}

export function AdminOperationsView() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const parsed = useMemo(() => readAdminQuery(params), [params]);
  const filter = useMemo<AdminOperationalEventFilters>(
    () => ({
      source: parsed.filters.source as AdminOperationalEventSource | undefined,
      tenantId: parsed.filters.tenantId,
      type: parsed.filters.type,
      status: parsed.filters.status,
      startUtc: parsed.filters.startUtc,
      endUtc: parsed.filters.endUtc,
      correlationId: parsed.filters.correlationId,
      page: parsed.page,
      pageSize: parsed.pageSize,
    }),
    [parsed]
  );
  const rangeError = validateUtcRange(filter.startUtc, filter.endUtc);
  const update = (patch: Record<string, string | number>) =>
    setParams(
      updateAdminQuery(params, patch, {
        resetPage: !('page' in patch) && !('eventId' in patch) && !('eventSource' in patch),
      })
    );
  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        <AdminPageHeader
          title={t('admin.operations.title')}
          description={t('admin.operations.description')}
        />
        <AdminFilterBar sx={{ '& .MuiFormControl-root': { minWidth: { md: 150 } } }}>
          <FormControl size="small">
            <InputLabel shrink>{t('admin.operations.fields.source')}</InputLabel>
            <Select
              displayEmpty
              label={t('admin.operations.fields.source')}
              value={filter.source ?? ''}
              onChange={(e) => update({ source: String(e.target.value) })}
            >
              <MenuItem value="">{t('admin.filters.all')}</MenuItem>
              {SOURCES.map((source) => (
                <MenuItem value={source} key={source}>
                  {source}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <AdminDebouncedSearchField
            label={t('admin.filters.tenant')}
            value={filter.tenantId ?? ''}
            onDebouncedChange={(value) => update({ tenantId: value })}
          />
          <AdminDebouncedSearchField
            label={t('admin.operations.fields.type')}
            value={filter.type ?? ''}
            onDebouncedChange={(value) => update({ type: value })}
          />
          <AdminDebouncedSearchField
            label={t('admin.filters.status')}
            value={filter.status ?? ''}
            onDebouncedChange={(value) => update({ status: value })}
          />
          <AdminDebouncedSearchField
            label={t('admin.operations.fields.correlation')}
            value={filter.correlationId ?? ''}
            onDebouncedChange={(value) => update({ correlationId: value })}
          />
          <TextField
            size="small"
            type="datetime-local"
            label={t('admin.operations.start')}
            value={utcToLocalInput(filter.startUtc)}
            onChange={(e) => update({ startUtc: inputUtc(e.target.value) })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            size="small"
            type="datetime-local"
            label={t('admin.operations.end')}
            value={utcToLocalInput(filter.endUtc)}
            onChange={(e) => update({ endUtc: inputUtc(e.target.value) })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </AdminFilterBar>
        {rangeError ? (
          <Alert severity="error">{t(`admin.range.${rangeError}`)}</Alert>
        ) : (
          <OperationsResults filter={filter} params={params} update={update} />
        )}
      </Stack>
    </Container>
  );
}
