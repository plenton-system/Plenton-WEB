import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';

import { fDateLocale } from 'src/utils/format-time';

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
  onCreateAccess: (patient: PatientListProps) => void;
};

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  Active: 'success',
  Pending: 'warning',
  PendingPayment: 'warning',
  Inactive: 'error',
};

export function PatientTableRow({
  row,
  selected,
  onSelectRow,
  onEdit,
  onDelete,
  onCreateAccess,
}: PatientTableRowProps) {
  const { t } = useTranslation();
  const statusLabels: Record<string, string> = {
    PendingPayment: t('patient.status.pendingPayment'),
    Pending: t('patient.status.pending'),
    Active: t('patient.status.active'),
    Inactive: t('patient.status.inactive'),
  };

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
        {row.birthDate ? fDateLocale(row.birthDate) : '-'}
      </TableCell>

      <TableCell>
        <Label color={(row.status && STATUS_COLORS[row.status as string]) || 'default'}>
          {(row.status && statusLabels[row.status as string]) || '-'}
        </Label>
      </TableCell>

      <TableCell align="center">
        <RowActionsMenu
          menuWidth={140}
          actions={[
            ...(!row.hasAccess ? [{
              label: t('actions.createAccess'),
              icon: 'mingcute:add-line' as const,
              onClick: () => onCreateAccess(row),
            }] : []),
            {
              label: t('actions.edit'),
              icon: 'solar:pen-bold',
              onClick: () => onEdit(row),
            },
            {
              label: t('actions.delete'),
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
