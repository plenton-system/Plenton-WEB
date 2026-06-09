import type { ReactNode } from 'react';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import TableSortLabel from '@mui/material/TableSortLabel';
import TableContainer from '@mui/material/TableContainer';

import { Loading } from 'src/components/loading';
import { RowActionsMenu } from 'src/components/table';

import type {
  MealPlanSortKey,
  MealPlanUiStatus,
  MealPlanSortState,
  MealPlanListItemVM,
} from '../types/meal-plan-list';

// ----------------------------------------------------------------------

const DEFAULT_SORT_STATE: MealPlanSortState = {
  orderBy: 'updatedAt',
  order: 'desc',
};

const STATUS_LABEL: Record<Exclude<MealPlanUiStatus, null>, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  SUSPENDED: 'Suspenso',
};

const STATUS_COLOR: Record<Exclude<MealPlanUiStatus, null>, 'default' | 'warning' | 'success'> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  SUSPENDED: 'default',
};

const getStatusOrder = (status: MealPlanUiStatus) => {
  if (status === 'ACTIVE') return 0;
  if (status === 'INACTIVE') return 1;
  if (status === 'SUSPENDED') return 2;
  return 3;
};

const getStatusChip = (status: MealPlanUiStatus) => {
  if (!status) {
    return (
      <Typography variant="body2" color="text.secondary">
        -
      </Typography>
    );
  }

  return (
    <Chip
      size="small"
      label={STATUS_LABEL[status]}
      color={STATUS_COLOR[status]}
      variant={status === 'SUSPENDED' ? 'outlined' : 'filled'}
    />
  );
};

const getNextSort = (
  currentState: MealPlanSortState,
  orderBy: MealPlanSortKey
): MealPlanSortState => ({
  orderBy,
  order: currentState.orderBy === orderBy && currentState.order === 'asc' ? 'desc' : 'asc',
});

const compareOptionalTimestamps = (
  left?: number,
  right?: number,
  direction: 'asc' | 'desc' = 'asc'
) => {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;

  return direction === 'asc' ? left - right : right - left;
};

type MealPlanListCardProps = {
  title?: string;
  createLabel?: string;
  items: MealPlanListItemVM[];
  loading: boolean;
  sortState?: MealPlanSortState;
  defaultSortState?: MealPlanSortState;
  onSortChange?: (state: MealPlanSortState) => void;
  onCreate: () => void;
  onEdit: (item: MealPlanListItemVM) => void;
  onDelete?: (item: MealPlanListItemVM) => void;
  headerActions?: ReactNode;
  renderStatus?: (item: MealPlanListItemVM) => ReactNode;
  renderRowActions?: (item: MealPlanListItemVM) => ReactNode;
};

// ----------------------------------------------------------------------

export function MealPlanListCard({
  title = 'Planos alimentares',
  createLabel = 'Novo',
  items,
  loading,
  sortState,
  defaultSortState = DEFAULT_SORT_STATE,
  onSortChange,
  onCreate,
  onEdit,
  onDelete,
  headerActions,
  renderStatus,
  renderRowActions,
}: MealPlanListCardProps) {
  const [internalSortState, setInternalSortState] = useState<MealPlanSortState>(defaultSortState);
  const theme = useTheme();
  const isCompactLayout = useMediaQuery(theme.breakpoints.down('lg'));

  const currentSortState = sortState ?? internalSortState;

  const handleSort = (property: MealPlanSortKey) => {
    const nextState = getNextSort(currentSortState, property);
    setInternalSortState(nextState);
    onSortChange?.(nextState);
  };

  const sorted = useMemo(() => {
    const data = [...items];
    const { order, orderBy } = currentSortState;
    const dir = order === 'asc' ? 1 : -1;

    data.sort((a, b) => {
      switch (orderBy) {
        case 'name':
          return dir * a.name.localeCompare(b.name);
        case 'status':
          return dir * (getStatusOrder(a.status) - getStatusOrder(b.status));
        case 'days':
          return dir * String(a.days ?? '').localeCompare(String(b.days ?? ''));
        case 'resume': {
          const totalA = (a.mealsCount ?? 0) + (a.itemsCount ?? 0);
          const totalB = (b.mealsCount ?? 0) + (b.itemsCount ?? 0);
          return dir * (totalA - totalB);
        }
        case 'lastDelivery':
          return compareOptionalTimestamps(
            a.lastDeliverySortValue,
            b.lastDeliverySortValue,
            order
          );
        case 'updatedAt':
        default:
          return compareOptionalTimestamps(a.updatedAtSortValue, b.updatedAtSortValue, order);
      }
    });

    return data;
  }, [currentSortState, items]);

  const isEmpty = !loading && items.length === 0;

  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ sm: 'center' }}
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        {headerActions}

        <Button
          variant="contained"
          onClick={onCreate}
          startIcon={<AddIcon />}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          {createLabel}
        </Button>
      </Stack>

      {loading && <Loading inline message="Carregando planos..." />}

      {isCompactLayout ? (
        isEmpty ? (
          <Box sx={{ py: 3 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              Nenhum plano cadastrado.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {sorted.map((item) => (
              <Card
                key={item.id}
                variant="outlined"
                sx={{ p: 1.5, borderRadius: 2, boxShadow: 'none' }}
              >
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                    justifyContent="space-between"
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ wordBreak: 'break-word' }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Atualizado: {item.updatedAt ?? '-'}
                      </Typography>
                    </Box>

                    <Box sx={{ flexShrink: 0 }}>
                      {renderRowActions ? (
                        renderRowActions(item)
                      ) : (
                        <RowActionsMenu
                          menuWidth={150}
                          actions={[
                            {
                              label: 'Editar',
                              icon: 'solar:pen-bold',
                              onClick: () => onEdit(item),
                            },
                            {
                              label: 'Remover',
                              icon: 'solar:trash-bin-trash-bold',
                              color: 'error',
                              disabled: !onDelete,
                              onClick: () => onDelete?.(item),
                            },
                          ]}
                        />
                      )}
                    </Box>
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap">
                    <Box>{renderStatus ? renderStatus(item) : getStatusChip(item.status)}</Box>
                    <Typography variant="body2" color="text.secondary">
                      {item.days ?? 'Todos os dias'}
                    </Typography>
                    <Typography variant="body2">
                      {item.mealsCount ?? 0} {(item.mealsCount ?? 0) === 1 ? 'refeição' : 'refeições'} ·{' '}
                      {item.itemsCount ?? 0} {(item.itemsCount ?? 0) === 1 ? 'item' : 'itens'}
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    Entrega: {item.lastDelivery ?? '—'}
                  </Typography>
                </Stack>
              </Card>
            ))}
          </Stack>
        )
      ) : (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 860 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sortDirection={currentSortState.orderBy === 'name' ? currentSortState.order : false}
                >
                  <TableSortLabel
                    active={currentSortState.orderBy === 'name'}
                    direction={currentSortState.orderBy === 'name' ? currentSortState.order : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Nome
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sortDirection={currentSortState.orderBy === 'status' ? currentSortState.order : false}
                >
                  <TableSortLabel
                    active={currentSortState.orderBy === 'status'}
                    direction={currentSortState.orderBy === 'status' ? currentSortState.order : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sortDirection={currentSortState.orderBy === 'days' ? currentSortState.order : false}
                >
                  <TableSortLabel
                    active={currentSortState.orderBy === 'days'}
                    direction={currentSortState.orderBy === 'days' ? currentSortState.order : 'asc'}
                    onClick={() => handleSort('days')}
                  >
                    Dias
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sortDirection={currentSortState.orderBy === 'resume' ? currentSortState.order : false}
                >
                  <TableSortLabel
                    active={currentSortState.orderBy === 'resume'}
                    direction={currentSortState.orderBy === 'resume' ? currentSortState.order : 'asc'}
                    onClick={() => handleSort('resume')}
                  >
                    Resumo
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sortDirection={
                    currentSortState.orderBy === 'updatedAt' ? currentSortState.order : false
                  }
                >
                  <TableSortLabel
                    active={currentSortState.orderBy === 'updatedAt'}
                    direction={
                      currentSortState.orderBy === 'updatedAt' ? currentSortState.order : 'desc'
                    }
                    onClick={() => handleSort('updatedAt')}
                  >
                    Última atualização
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sortDirection={
                    currentSortState.orderBy === 'lastDelivery' ? currentSortState.order : false
                  }
                >
                  <TableSortLabel
                    active={currentSortState.orderBy === 'lastDelivery'}
                    direction={
                      currentSortState.orderBy === 'lastDelivery' ? currentSortState.order : 'desc'
                    }
                    onClick={() => handleSort('lastDelivery')}
                  >
                    Entrega
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            {isEmpty ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Nenhum plano cadastrado.
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {sorted.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      {renderStatus ? renderStatus(item) : getStatusChip(item.status)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {item.days ?? 'Todos os dias'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.mealsCount ?? 0} refeições · {item.itemsCount ?? 0} itens
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{item.updatedAt ?? '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{item.lastDelivery ?? '—'}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      {renderRowActions ? (
                        renderRowActions(item)
                      ) : (
                        <RowActionsMenu
                          menuWidth={150}
                          actions={[
                            {
                              label: 'Editar',
                              icon: 'solar:pen-bold',
                              onClick: () => onEdit(item),
                            },
                            {
                              label: 'Remover',
                              icon: 'solar:trash-bin-trash-bold',
                              color: 'error',
                              disabled: !onDelete,
                              onClick: () => onDelete?.(item),
                            },
                          ]}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}
