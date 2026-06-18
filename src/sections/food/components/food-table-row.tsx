import type { FoodListProps } from 'src/types';

import { useTranslation } from 'react-i18next';

import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';

import { RowActionsMenu, type RowActionItem } from 'src/components/table';

// ----------------------------------------------------------------------

type FoodTableRowProps = {
  row: FoodListProps;
  selected: boolean;
  onSelectRow: () => void;
  onEdit: (food: FoodListProps) => void;
  onDelete?: (food: FoodListProps) => void;
};

// ----------------------------------------------------------------------

export function FoodTableRow({ row, selected, onSelectRow, onEdit, onDelete }: FoodTableRowProps) {
  const { t } = useTranslation();
  const actions: RowActionItem[] = [
    {
      label: t('actions.edit'),
      icon: 'solar:pen-bold',
      onClick: () => onEdit(row),
    },
  ];

  if (onDelete) {
    actions.push({
      label: t('actions.delete'),
      icon: 'solar:trash-bin-trash-bold',
      color: 'error',
      onClick: () => onDelete(row),
    });
  }

  return (
    <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
      </TableCell>

      <TableCell>{row.description}</TableCell>
      <TableCell>{row.group || '-'}</TableCell>
      <TableCell>{row.energyKcal ?? '-'}</TableCell>
      <TableCell>{row.protein ?? '-'}</TableCell>
      <TableCell>{row.carbs ?? '-'}</TableCell>
      <TableCell>{row.fat ?? '-'}</TableCell>
      <TableCell align="center">
        <RowActionsMenu actions={actions} />
      </TableCell>
    </TableRow>
  );
}
