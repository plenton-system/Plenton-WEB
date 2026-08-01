import type { PlannerTask } from 'src/types';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useConfirm } from 'src/hooks/common/use-confirm';
import { usePlanner } from 'src/hooks/planner/use-planner';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { PlannerTaskDialog } from 'src/sections/overview/components/planner-task-dialog';

const priorityKeys = {
  Low: 'planner.priority.low',
  Medium: 'planner.priority.medium',
  High: 'planner.priority.high',
} as const;

export function PlannerView() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();
  const patientId = searchParams.get('patientId') ?? undefined;
  const patientName = searchParams.get('patientName') ?? undefined;
  const planner = usePlanner({ patientId });
  const { setFilters } = planner;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PlannerTask | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFilters((current) => ({
        ...current,
        patientId,
        search: search.trim() || undefined,
      }));
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [patientId, search, setFilters]);

  const openCreate = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const openEdit = (task: PlannerTask) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDelete = async (task: PlannerTask) => {
    const accepted = await confirm({
      title: t('planner.delete.title'),
      description: t('planner.delete.description', { title: task.title }),
      confirmText: t('actions.delete'),
      destructive: true,
    });

    if (accepted) await planner.deleteTask(task.id);
  };

  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={3} sx={{ minWidth: 0 }}>
        <Box
          sx={{
            gap: 2,
            display: 'flex',
            alignItems: { xs: 'stretch', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h4">{t('planner.page.title')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('planner.page.description')}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={openCreate}
          >
            {t('planner.actions.add')}
          </Button>
        </Box>

        {patientId && (
          <Alert
            severity="info"
            action={(
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  setSearchParams({});
                  setFilters({});
                }}
              >
                {t('planner.filters.clear')}
              </Button>
            )}
          >
            {t('planner.filters.patient', { patient: patientName ?? patientId })}
          </Alert>
        )}

        <TextField
          fullWidth
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          label={t('planner.filters.search')}
          placeholder={t('planner.filters.searchPlaceholder')}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" />
                </InputAdornment>
              ),
            },
          }}
        />

        {planner.error && <Alert severity="error">{planner.error}</Alert>}

        {!planner.loading && planner.tasks.length === 0 && (
          <Typography color="text.secondary">
            {search ? t('planner.filters.noResults') : t('planner.empty')}
          </Typography>
        )}

        <Stack spacing={1.5}>
          {planner.tasks.map((task) => {
            const completed = task.status === 'Completed';
            const overdue = Boolean(
              !completed && task.dueDate && dayjs(task.dueDate).isBefore(dayjs())
            );

            return (
              <Box
                key={task.id}
                sx={{
                  p: { xs: 1.25, sm: 2 },
                  gap: 1,
                  minWidth: 0,
                  display: 'flex',
                  alignItems: 'center',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }}
              >
                <Tooltip title={completed ? t('planner.actions.reopen') : t('planner.actions.complete')}>
                  <Checkbox
                    checked={completed}
                    disabled={planner.mutating}
                    onChange={() => planner.toggleTask(task)}
                  />
                </Tooltip>

                <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      overflowWrap: 'anywhere',
                      ...(completed && { color: 'text.disabled', textDecoration: 'line-through' }),
                    }}
                  >
                    {task.title}
                  </Typography>

                  {task.patientName && (
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1.5 }}>
                      {task.patientName}
                    </Typography>
                  )}

                  {task.dueDate && (
                    <Typography variant="caption" color={overdue ? 'error.main' : 'text.secondary'}>
                      {dayjs(task.dueDate).format('DD/MM/YYYY HH:mm')}
                    </Typography>
                  )}

                  {task.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                      {task.description}
                    </Typography>
                  )}
                </Box>

                <Label
                  color={task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'success'}
                  sx={{ flexShrink: 0, display: { xs: 'none', md: 'inline-flex' } }}
                >
                  {t(priorityKeys[task.priority])}
                </Label>

                <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
                  <Tooltip title={t('actions.edit')}>
                    <IconButton size="small" onClick={() => openEdit(task)} disabled={planner.mutating}>
                      <Iconify icon="solar:pen-bold" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('actions.delete')}>
                    <IconButton size="small" color="error" onClick={() => handleDelete(task)} disabled={planner.mutating}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            );
          })}
        </Stack>

        <PlannerTaskDialog
          open={dialogOpen}
          task={editingTask}
          fixedPatientId={patientId}
          fixedPatientName={patientName}
          loading={planner.mutating}
          onClose={() => setDialogOpen(false)}
          onSave={(payload) => (
            editingTask
              ? planner.updateTask(editingTask.id, payload)
              : planner.createTask(payload)
          )}
        />
      </Stack>
    </DashboardContent>
  );
}
