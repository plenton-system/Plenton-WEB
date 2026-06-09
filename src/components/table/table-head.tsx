import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';

import type { TableHeadProps } from './types';

// Visualmente escondido para acessibilidade

export function GenericTableHead({
    order,
    onSort,
    orderBy,
    headLabel,
    selectable = true,
    visibleIds,
    selected,
    onSelectAllRows,
}: TableHeadProps) {
    const selectedSet = new Set(selected);
    const rowCount = visibleIds?.length;

    const allVisibleSelected =
        rowCount > 0 && visibleIds.every(id => selectedSet.has(id));

    const someVisibleSelected =
        !allVisibleSelected && visibleIds.some(id => selectedSet.has(id));

    return (
        <TableHead>
            <TableRow>
                {selectable && (
                    <TableCell padding="checkbox" sx={{ width: 48 }}>
                        <Checkbox
                            checked={allVisibleSelected}
                            indeterminate={someVisibleSelected}
                            onChange={() => onSelectAllRows(!allVisibleSelected, visibleIds)}
                        />
                    </TableCell>
                )}

                {headLabel.map((headCell) => {
                    const isActive = orderBy === headCell.id;
                    const isSortable = headCell.sortable !== false;

                    return (
                        <TableCell
                            key={headCell.id}
                            align={headCell.align || 'left'}
                            sortDirection={isSortable && isActive ? order : false}
                            sx={{
                                width: headCell.width,
                                minWidth: headCell.minWidth,
                                maxWidth: headCell.width ?? headCell.minWidth, // ajuda o ellipsis
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {isSortable ? (
                                <TableSortLabel
                                    hideSortIcon={false}
                                    active={isActive}
                                    direction={isActive ? order : 'asc'}
                                    onClick={() => onSort(headCell.id)}
                                    sx={{
                                        // texto do rótulo
                                        color: isActive ? 'text.primary' : 'text.secondary',
                                        fontWeight: isActive ? 700 : 500,
                                        '&:hover': { color: isActive ? 'text.primary' : 'text.secondary' },

                                        // ícone: sempre aparente, mas mais forte no ativo
                                        '& .MuiTableSortLabel-icon': {
                                            opacity: isActive ? 1 : 0.6,
                                            transition: 'opacity 120ms, transform 120ms',
                                        },
                                    }}
                                >
                                    {headCell.label}
                                    {isActive && (
                                        <Box sx={{
                                            border: 0,
                                            clip: 'rect(0 0 0 0)',
                                            height: 1,
                                            margin: -1,
                                            overflow: 'hidden',
                                            padding: 0,
                                            position: 'absolute',
                                            top: 20,
                                            width: 1
                                        }}>
                                            {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                        </Box>
                                    )}
                                </TableSortLabel>
                            ) : (
                                headCell.label
                            )}
                        </TableCell>
                    );
                })}

            </TableRow>
        </TableHead>
    );
}
