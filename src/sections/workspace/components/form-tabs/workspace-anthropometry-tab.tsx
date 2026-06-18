import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableSortLabel from '@mui/material/TableSortLabel';

import { useConfirm } from 'src/hooks/common/use-confirm';
import { useWorkspaceAnthropometries } from 'src/hooks/workspace/use-workspace-anthropometries';

import { fNumber } from 'src/utils/format-number';
import { fDateTimeLocale } from 'src/utils/format-time';

import { workspaceAnthropometryService } from 'src/services/workspace/workspaceAnthropometryService';

import { Loading } from 'src/components/loading';
import { Iconify } from 'src/components/iconify';
import { RowActionsMenu } from 'src/components/table/row-actions-menu';

import { WorkspaceAnthropometryDetailDrawer } from './workspace-anthropometry-detail-drawer';

type Props = {
  patientId?: string;
  onDone?: () => void;
};

type SortField = 'date' | 'weight' | 'bmi' | 'bodyFat' | 'tdee';
type NotifyState = { open: boolean; kind: 'success' | 'error' | 'info'; message: string };

const formatMetric = (
  value?: number | null,
  suffix = '',
  decimals = 1
) => (
  typeof value === 'number' && Number.isFinite(value)
    ? `${fNumber(value, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`
    : '-'
);

export function WorkspaceAnthropometryTab({ patientId, onDone }: Props) {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const { items, loading, error, refetch } = useWorkspaceAnthropometries(patientId);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderBy, setOrderBy] = useState<SortField>('date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [notify, setNotify] = useState<NotifyState>({ open: false, kind: 'info', message: '' });
  const [deletingEvaluationId, setDeletingEvaluationId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const direction = order === 'asc' ? 1 : -1;
    return [...items].sort((left, right) => {
      switch (orderBy) {
        case 'weight':
          return direction * ((left.weight ?? 0) - (right.weight ?? 0));
        case 'bmi':
          return direction * ((left.bmi ?? 0) - (right.bmi ?? 0));
        case 'bodyFat':
          return direction * ((left.bodyFatPercentage ?? 0) - (right.bodyFatPercentage ?? 0));
        case 'tdee':
          return direction * ((left.tdeeKcal ?? 0) - (right.tdeeKcal ?? 0));
        case 'date':
        default:
          return (
            direction *
            dayValue(left.evaluationDateUtc).localeCompare(dayValue(right.evaluationDateUtc))
          );
      }
    });
  }, [items, order, orderBy]);

  const handleSort = (field: SortField) => {
    setOrder((current) => (field === orderBy && current === 'asc' ? 'desc' : 'asc'));
    setOrderBy(field);
  };

  const handleEdit = (evaluationId: string) => {
    setSelectedEvaluationId(evaluationId);
    setDrawerOpen(true);
  };

  const handleRemove = async (evaluationId: string) => {
    if (!patientId || deletingEvaluationId) return;

    const ok = await confirm({
      title: t('workspace.anthropometry.deleteTitle'),
      description: t('workspace.anthropometry.deleteDescription'),
      confirmText: t('actions.delete'),
      destructive: true,
    });

    if (!ok) return;

    try {
      setDeletingEvaluationId(evaluationId);
      const deleted = await workspaceAnthropometryService.delete(patientId, evaluationId);

      if (!deleted) {
        throw new Error(t('workspace.anthropometry.deleteError'));
      }

      await refetch();
      setNotify({
        open: true,
        kind: 'success',
        message: t('workspace.anthropometry.deleteSuccess'),
      });
      onDone?.();
    } catch (err: any) {
      setNotify({
        open: true,
        kind: 'error',
        message: err?.message ?? t('workspace.anthropometry.deleteError'),
      });
    } finally {
      setDeletingEvaluationId(null);
    }
  };

  return (
    <>
      <Card variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ sm: 'center' }}
          >
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {t('workspace.anthropometry.title')}
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setSelectedEvaluationId(null);
                setDrawerOpen(true);
              }}
              startIcon={<Iconify icon="mingcute:add-line" />}
              disabled={!patientId || !!deletingEvaluationId}
            >
              {t('workspace.new')}
            </Button>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          {loading ? <Loading inline message={t('workspace.anthropometry.loadingList')} /> : null}

          {!loading ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sortDirection={orderBy === 'date' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'date'}
                      direction={orderBy === 'date' ? order : 'desc'}
                      onClick={() => handleSort('date')}
                    >
                      {t('workspace.anthropometry.columns.date')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={orderBy === 'weight' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'weight'}
                      direction={orderBy === 'weight' ? order : 'asc'}
                      onClick={() => handleSort('weight')}
                    >
                      {t('workspace.anthropometry.columns.weight')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>{t('workspace.anthropometry.columns.height')}</TableCell>
                  <TableCell sortDirection={orderBy === 'bmi' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'bmi'}
                      direction={orderBy === 'bmi' ? order : 'asc'}
                      onClick={() => handleSort('bmi')}
                    >
                      {t('workspace.anthropometry.columns.bmi')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={orderBy === 'bodyFat' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'bodyFat'}
                      direction={orderBy === 'bodyFat' ? order : 'asc'}
                      onClick={() => handleSort('bodyFat')}
                    >
                      {t('workspace.anthropometry.columns.bodyFat')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>{t('workspace.anthropometry.columns.leanMass')}</TableCell>
                  <TableCell>{t('workspace.anthropometry.columns.energy')}</TableCell>
                  <TableCell align="center">{t('workspace.anthropometry.columns.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sorted.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{fDateTimeLocale(row.evaluationDateUtc)}</TableCell>
                    <TableCell>{formatMetric(row.weight, ' kg')}</TableCell>
                    <TableCell>{formatMetric(row.height, ' m', 2)}</TableCell>
                    <TableCell>{formatMetric(row.bmi, '', 1)}</TableCell>
                    <TableCell>{formatMetric(row.bodyFatPercentage, '%', 1)}</TableCell>
                    <TableCell>{formatMetric(row.leanMass, ' kg')}</TableCell>
                    <TableCell>
                      {row.hasNutritionGoal ? (
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          {row.energyProtocol ? (
                            <Chip size="small" variant="outlined" label={row.energyProtocol} />
                          ) : null}
                          <Typography variant="body2" color="text.secondary">
                            {formatMetric(row.tdeeKcal, ' kcal', 0)}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {t('workspace.anthropometry.noCalculation')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <RowActionsMenu
                        menuWidth={160}
                        actions={[
                          {
                            label: t('actions.edit'),
                            icon: 'solar:pen-bold',
                            disabled: deletingEvaluationId === row.id,
                            onClick: () => handleEdit(row.id),
                          },
                          {
                            label: t('actions.remove'),
                            icon: 'solar:trash-bin-trash-bold',
                            color: 'error',
                            disabled: !!deletingEvaluationId,
                            onClick: () => handleRemove(row.id),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}

                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary">
                        {t('workspace.anthropometry.empty')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          ) : null}
        </Stack>
      </Card>

      <WorkspaceAnthropometryDetailDrawer
        open={drawerOpen}
        patientId={patientId}
        evaluationId={selectedEvaluationId}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedEvaluationId(null);
        }}
        onSaved={async () => {
          await refetch();
          setDrawerOpen(false);
          setSelectedEvaluationId(null);
          onDone?.();
        }}
      />

      <Snackbar
        open={notify.open}
        autoHideDuration={4000}
        onClose={() => setNotify((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={notify.kind}
          variant="filled"
          onClose={() => setNotify((current) => ({ ...current, open: false }))}
        >
          {notify.message}
        </Alert>
      </Snackbar>
    </>
  );
}

const dayValue = (value?: string | null) => String(value ?? '');
