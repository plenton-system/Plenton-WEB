import type { ReactNode } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';
import type { AdminStatus, PagedResult } from 'src/types/admin';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { Label } from 'src/components/label';

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
      <Box>
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        {description && <Typography color="text.secondary">{description}</Typography>}
      </Box>
      {actions}
    </Stack>
  );
}

export function AdminFilterBar({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, ...sx }}>
      <Stack direction={{ xs: 'column', md: 'row' }} flexWrap={{ md: 'wrap' }} useFlexGap gap={2}>
        {children}
      </Stack>
    </Paper>
  );
}

export function AdminServerTable<T>({
  result,
  loading,
  children,
  onPageChange,
  onPageSizeChange,
}: {
  result: PagedResult<T>;
  loading: boolean;
  children: ReactNode;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  return (
    <Paper variant="outlined">
      <TableContainer aria-busy={loading}>
        <Table>
          {children}
          <TableBody />
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={result.totalCount}
        page={Math.max(0, result.currentPage - 1)}
        rowsPerPage={result.pageSize}
        rowsPerPageOptions={[10, 25, 50, 100]}
        onPageChange={(_, page) => onPageChange(page + 1)}
        onRowsPerPageChange={(event) => onPageSizeChange(Number(event.target.value))}
      />
    </Paper>
  );
}

const statusColors: Record<AdminStatus, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  success: 'success',
  info: 'info',
  warning: 'warning',
  error: 'error',
  neutral: 'default',
};
const statusSymbols: Record<AdminStatus, string> = {
  success: '✓',
  info: 'ℹ',
  warning: '!',
  error: '×',
  neutral: '•',
};

export function AdminStatusBadge({ status, label }: { status: AdminStatus; label: string }) {
  return (
    <Label color={statusColors[status]}>
      {statusSymbols[status]} {label}
    </Label>
  );
}

export function AdminLoadingState() {
  const { t } = useTranslation();
  return (
    <Stack role="status" alignItems="center" gap={2} sx={{ py: 8 }}>
      <CircularProgress />
      <Typography>{t('admin.states.loading')}</Typography>
    </Stack>
  );
}

export function AdminEmptyState({ title, description }: { title?: string; description?: string }) {
  const { t } = useTranslation();
  return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h6">{title ?? t('admin.states.empty')}</Typography>
      {description && <Typography color="text.secondary">{description}</Typography>}
    </Box>
  );
}

export function AdminErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useTranslation();
  return (
    <Alert
      severity="error"
      action={
        onRetry && (
          <Button color="inherit" onClick={onRetry}>
            {t('admin.actions.retry')}
          </Button>
        )
      }
    >
      {message}
    </Alert>
  );
}

export function AdminSearchField(props: React.ComponentProps<typeof TextField>) {
  return <TextField size="small" {...props} />;
}

export function AdminDebouncedSearchField({
  value,
  onDebouncedChange,
  ...props
}: Omit<React.ComponentProps<typeof TextField>, 'value' | 'onChange'> & {
  value: string;
  onDebouncedChange: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (draft === value) return undefined;
    const timer = window.setTimeout(() => onDebouncedChange(draft), 400);
    return () => window.clearTimeout(timer);
  }, [draft, onDebouncedChange, value]);
  return (
    <AdminSearchField {...props} value={draft} onChange={(event) => setDraft(event.target.value)} />
  );
}
