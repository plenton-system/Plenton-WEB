import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import LinearProgress from '@mui/material/LinearProgress';
import TablePagination from '@mui/material/TablePagination';

import { Scrollbar } from 'src/components/scrollbar';

import { emptyRows } from './table-utils';
import { TableNoData } from './table-no-data';
import { GenericTableHead } from './table-head';
import { TableEmptyRows } from './table-empty-rows';
import { GenericTableToolbar } from './table-toolbar';
import { TableSkeleton } from './components/table-skeleton';

import type { TableProps } from './types';

export function GenericTable<T extends { id: string | number }>({
    data,
    total,
    loading,
    maxHeight,
    table,
    headLabel,
    filterValue,
    setFilterValue,
    renderRow,
    onDeleteSelected,
    renderToolbar,
    emptyRowsComponent,
    notFoundComponent,
}: TableProps<T>) {
    const { t } = useTranslation();

    const showNotFound = !data.length && !!filterValue;
    const emptyRowsCount = emptyRows(table.page, table.rowsPerPage, total);
    const visibleIds = useMemo(() => data.map(r => String(r.id)), [data]);
    const showSkeleton = loading && data.length === 0;
    const showProgress = loading && data.length > 0;

    // Renderização condicional do corpo da tabela
    const renderTableBody = () => {
        if (showSkeleton) {
            return <TableSkeleton rows={table.rowsPerPage} columns={headLabel.length} />;
        }

        return (
            <Scrollbar
                sx={
                    maxHeight
                        ? { height: maxHeight, maxHeight, minHeight: maxHeight }
                        : undefined
                }
            >
                <TableContainer sx={{ overflow: 'unset' }}>
                    <Table size="medium"
                        sx={{
                            minWidth: 800,
                            tableLayout: 'fixed', // 📌 colunas de largura fixa
                            '& th, & td': {
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            },
                        }}>
                        <GenericTableHead
                            order={table.order}
                            orderBy={table.orderBy}
                            onSort={table.onSort}
                            headLabel={headLabel}

                            // 🔹 Novos props: passe ids visíveis e seleção atual
                            visibleIds={visibleIds}
                            selected={table.selected.map(String)}
                            // 🔹 Toggle consciente: adiciona/remove somente os visíveis
                            onSelectAllRows={(checked: boolean) =>
                                table.onSelectAllRows(checked, visibleIds)
                            }
                        />

                        <TableBody>
                            {data.map((row) =>
                                renderRow(
                                    row,
                                    table.selected.includes(row.id),
                                    () => table.onSelectRow(row.id)
                                )
                            )}

                            {emptyRowsComponent ?? (
                                emptyRowsCount > 0 && (
                                    <TableEmptyRows height={68} emptyRows={emptyRowsCount} colSpan={headLabel.length} />
                                )
                            )}


                            {notFoundComponent ?? (
                                showNotFound && (
                                    <TableNoData searchQuery={filterValue} />
                                )
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Scrollbar>
        );
    };

    return (
        <Card>
            {renderToolbar ?? (
                <GenericTableToolbar
                    numSelected={table.selected.length}
                    filterValue={filterValue}
                    onFilterValue={e => {
                        setFilterValue(e.target.value);
                        table.onChangePage?.(undefined, 0);
                    }}
                    placeholder={t('shared.searchAction')}
                    onDeleteSelected={onDeleteSelected}
                />
            )}

            <Box sx={{ height: 3, mx: 2, my: 1 }}>
                <LinearProgress
                    sx={{ height: 3, visibility: showProgress ? 'visible' : 'hidden' }}
                />
            </Box>

            {renderTableBody()}

            <TablePagination
                component="div"
                page={table.page}
                count={total}
                rowsPerPage={table.rowsPerPage}
                onPageChange={table.onChangePage}
                rowsPerPageOptions={[5, 10, 25]}
                onRowsPerPageChange={table.onChangeRowsPerPage}
                disabled={loading}
            />
        </Card>
    );
}
