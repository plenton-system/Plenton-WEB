import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { auditDiffKind } from 'src/utils/admin-operations';

import { AdminStatusBadge } from './admin-shared';

const REDACTED_KEYS =
  /token|password|secret|credential|authorization|cookie|idempotency|payload|payment|card|cvv|bank|pix/i;

export function sanitizeAdminData(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(sanitizeAdminData);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        REDACTED_KEYS.test(key) ? '••••••' : sanitizeAdminData(item),
      ])
    );
  }
  return value;
}

function safeEntries(value: Record<string, unknown>) {
  return Object.entries(sanitizeAdminData(value) as Record<string, unknown>);
}

function SafeValue({ value }: { value: unknown }) {
  if (value === null || value === undefined)
    return <Typography color="text.secondary">—</Typography>;
  if (typeof value === 'object')
    return (
      <Box component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {JSON.stringify(value, null, 2)}
      </Box>
    );
  return <>{String(value)}</>;
}

export function AdminMetadata({ metadata }: { metadata: Record<string, unknown> }) {
  const { t } = useTranslation();
  return (
    <TableContainer>
      <Table size="small">
        <Box component="caption" sx={{ p: 1, color: 'text.secondary', textAlign: 'left' }}>
          {t('admin.data.metadataCaption')}
        </Box>
        <TableHead>
          <TableRow>
            <TableCell>{t('admin.data.field')}</TableCell>
            <TableCell>{t('admin.data.value')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {safeEntries(metadata).map(([key, value]) => (
            <TableRow key={key}>
              <TableCell component="th" scope="row">
                {key}
              </TableCell>
              <TableCell>
                <SafeValue value={value} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function AdminStateDiff({
  before,
  after,
}: {
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}) {
  const { t } = useTranslation();
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])];
  const safeBefore = sanitizeAdminData(before) as Record<string, unknown>;
  const safeAfter = sanitizeAdminData(after) as Record<string, unknown>;
  return (
    <TableContainer>
      <Table size="small">
        <Box component="caption" sx={{ p: 1, color: 'text.secondary', textAlign: 'left' }}>
          {t('admin.data.diffCaption')}
        </Box>
        <TableHead>
          <TableRow>
            <TableCell>{t('admin.data.field')}</TableCell>
            <TableCell>{t('admin.data.change')}</TableCell>
            <TableCell>{t('admin.data.before')}</TableCell>
            <TableCell>{t('admin.data.after')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {keys.map((key) => {
            const kind = auditDiffKind(
              safeBefore[key],
              safeAfter[key],
              Object.prototype.hasOwnProperty.call(safeBefore, key),
              Object.prototype.hasOwnProperty.call(safeAfter, key)
            );
            const tone =
              kind === 'added'
                ? 'success'
                : kind === 'removed'
                  ? 'error'
                  : kind === 'changed'
                    ? 'warning'
                    : 'neutral';
            return (
              <TableRow key={key} data-diff-kind={kind}>
                <TableCell component="th" scope="row">
                  {key}
                </TableCell>
                <TableCell>
                  <AdminStatusBadge status={tone} label={t(`admin.data.diff.${kind}`)} />
                </TableCell>
                <TableCell>
                  <SafeValue value={safeBefore[key]} />
                </TableCell>
                <TableCell>
                  <SafeValue value={safeAfter[key]} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
