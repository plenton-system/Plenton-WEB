import type { WorkspaceStatus } from 'src/types';

import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import { useTranslation } from 'react-i18next';

import { getWorkspaceStatusColor, getWorkspaceStatusLabel } from '../../constants/status';

// ----------------------------------------------------------------------

type WorkspaceTableRowProps = {
    row: {
        id: string;
        patientId: string;
        patientName: string;
        nextAppointment?: string;
        lastAnthropometry?: string;
        lastAnamnesis?: string;
        lastSend?: string;
        planStatus: WorkspaceStatus | null;
        anthropometryStatus: WorkspaceStatus | null;
        anamnesisStatus: WorkspaceStatus | null;
    };
    selected: boolean;
    onSelectRow: () => void;
    onOpen: (patientId: string, patientName: string) => void;
};

// ----------------------------------------------------------------------

export function WorkspaceTableRow({ row, selected, onSelectRow, onOpen }: WorkspaceTableRowProps) {
    const { t } = useTranslation();
    const renderStatus = (value: WorkspaceStatus | null) => {
        if (!value) {
            return '-';
        }

        return (
            <Chip
                label={getWorkspaceStatusLabel(value)}
                color={getWorkspaceStatusColor(value)}
                size="small"
                variant="outlined"
            />
        );
    };

    return (
        <TableRow hover tabIndex={-1} selected={selected}>
            <TableCell padding="checkbox">
                <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
            </TableCell>
            <TableCell align="center">
                <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onOpen(row.patientId, row.patientName)}
                    aria-label={t('workspace.list.open')}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            </TableCell>
            <TableCell>{row.patientName}</TableCell>
            <TableCell>{row.nextAppointment || '-'}</TableCell>
            <TableCell>{renderStatus(row.planStatus)}</TableCell>
            <TableCell>{row.lastAnthropometry || '-'}</TableCell>
            <TableCell>{row.lastAnamnesis || '-'}</TableCell>
            <TableCell>{row.lastSend || '-'}</TableCell>
        </TableRow>
    );
}
