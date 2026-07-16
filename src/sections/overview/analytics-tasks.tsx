import type { CardProps } from '@mui/material/Card';
import type { PlannerTask, PlannerTaskPriority } from 'src/types';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { usePlanner } from 'src/hooks/planner/use-planner';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';

type Props = CardProps & { title?: string; subheader?: string };

const priorityColor = (priority: PlannerTaskPriority) => {
  if (priority === 'High') return 'error' as const;
  if (priority === 'Medium') return 'warning' as const;
  return 'success' as const;
};

const priorityLabelKey = (priority: PlannerTaskPriority) => {
  if (priority === 'High') return 'planner.priority.high' as const;
  if (priority === 'Medium') return 'planner.priority.medium' as const;
  return 'planner.priority.low' as const;
};

export function AnalyticsTasks({ title, subheader, sx, ...other }: Props) {
  const { t } = useTranslation();
  const planner = usePlanner();
  const tasks = useMemo(
    () => planner.tasks.filter((task) => task.status !== 'Completed' && task.status !== 'Canceled'),
    [planner.tasks]
  );

  return (
    <Card sx={[{ minWidth: 0, overflow: 'hidden' }, ...(Array.isArray(sx) ? sx : [sx])]} {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 1 }} />

      {planner.error && (
        <Alert severity="error" sx={{ mx: 2, mb: 1 }}>
          {planner.error}
        </Alert>
      )}

      {!planner.loading && tasks.length === 0 && (
        <Typography color="text.secondary" sx={{ px: 3, py: 2 }}>
          {t('planner.empty')}
        </Typography>
      )}

      <Scrollbar sx={{ minHeight: 0 }}>
        <Stack
          divider={<Divider sx={{ borderStyle: 'dashed' }} />}
          sx={{ minWidth: 0, width: 1 }}
        >
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </Stack>
      </Scrollbar>
    </Card>
  );
}

function TaskItem({ task }: { task: PlannerTask }) {
  const { t } = useTranslation();
  const overdue = Boolean(task.dueDate && dayjs(task.dueDate).isBefore(dayjs()));

  return (
    <Box
      sx={{
        px: { xs: 1.5, sm: 2 },
        py: 1.5,
        gap: 1,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
        <Typography variant="body2" noWrap title={task.title}>
          {task.title}
        </Typography>

        {task.dueDate && (
          <Typography
            variant="caption"
            color={overdue ? 'error.main' : 'text.secondary'}
            sx={{ display: 'block' }}
          >
            {dayjs(task.dueDate).format('DD/MM/YYYY HH:mm')}
          </Typography>
        )}
      </Box>

      <Label
        color={priorityColor(task.priority)}
        sx={{ flexShrink: 0, display: { xs: 'none', sm: 'inline-flex' } }}
      >
        {t(priorityLabelKey(task.priority))}
      </Label>

    </Box>
  );
}
