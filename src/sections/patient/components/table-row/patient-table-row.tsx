import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';

import { Label } from 'src/components/label';
import { RowActionsMenu } from 'src/components/table';

import type { PatientListProps } from '../../../../types';

// ----------------------------------------------------------------------

type PatientTableRowProps = {
  row: PatientListProps;
  selected: boolean;
  onSelectRow: () => void;
  onEdit: (patient: PatientListProps) => void;
  onDelete: (patient: PatientListProps) => void;
};

const STATUS_LABELS: Record<string, string> = {
  PendingPayment: 'Pagamento Pendente',
  Pending: 'Pendente',
  Active: 'Ativo',
  Inactive: 'Inativo',
};

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  Active: 'success',
  Pending: 'warning',
  PendingPayment: 'warning',
  Inactive: 'error',
};

export function PatientTableRow({ row, selected, onSelectRow, onEdit, onDelete }: PatientTableRowProps) {
  return (
    <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
      </TableCell>

      <TableCell component="th" scope="row">
        <Box
          sx={{
            gap: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Avatar
            alt={row.name}
            src={
              typeof row.profilePhoto === 'string' ?
                row.profilePhoto : row.profilePhoto instanceof File ?
                  URL.createObjectURL(row.profilePhoto) : undefined
            }
          />
          {row.name}
        </Box>
      </TableCell>

      <TableCell>
        {row.birthDate ? new Date(row.birthDate).toLocaleDateString('pt-BR') : '-'}
      </TableCell>

      <TableCell>
        <Label color={(row.status && STATUS_COLORS[row.status as string]) || 'default'}>
          {(row.status && STATUS_LABELS[row.status as string]) || '-'}
        </Label>
      </TableCell>

      <TableCell align="center">
        <RowActionsMenu
          menuWidth={140}
          actions={[
            {
              label: 'Editar',
              icon: 'solar:pen-bold',
              onClick: () => onEdit(row),
            },
            {
              label: 'Excluir',
              icon: 'solar:trash-bin-trash-bold',
              color: 'error',
              onClick: () => onDelete(row),
            },
          ]}
        />
      </TableCell>
    </TableRow>
  );
}
