import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useTable } from 'src/hooks/common/use-table';
import { useConfirm } from 'src/hooks/common/use-confirm';
import { usePatientList } from 'src/hooks/patient/use-patient-list';

import { Iconify } from 'src/components/iconify';
import { GenericTable } from 'src/components/table';

import { PatientTableRow } from '../components/table-row/patient-table-row';

// ----------------------------------------------------------------------

type NotifyEvent = | { kind: 'success'; message: string } | { kind: 'error'; message: string };

interface PatientListViewProps {
    onCreate: () => void;
    onEdit: (id: string) => void;
    onNotify?: (evt: NotifyEvent) => void;
}

// ----------------------------------------------------------------------

export function PatientListView({
    onEdit,
    onCreate,
    onNotify
}: PatientListViewProps) {
    const { t } = useTranslation();
    const confirm = useConfirm();
    const table = useTable({ initialOrderBy: 'name' });

    const {
        items,
        total,
        loading,
        filters,
        setFilters,
        pageIndex,
        pageSize,
        setPageIndex,
        setPageSize,
        deletePatient,
        createAccess
    } = usePatientList({ initialFilters: { pageSize: 5 } });

    const data = useMemo(() => items.map(r => ({ ...r, id: String(r.id) })), [items]);
    const validIds = useMemo(() => data.map(r => r.id), [data]);

    const { syncSelection, removeFromSelection, onSelectAllRows, onSelectRow } = table;

    useEffect(() => {
        syncSelection?.(validIds);
    }, [syncSelection, validIds]);

    useEffect(() => {
        setFilters(f => {
            if (f.orderByField === table.orderBy && f.order === table.order) return f;
            return { ...f, orderByField: table.orderBy, order: table.order };
        });

        setPageIndex(0);
    }, [table.order, table.orderBy, setFilters, setPageIndex]);

    const handleDelete = async (id: string) => {
        const ok = await confirm({
            title: t('patient.list.delete.title'),
            description: t('patient.list.delete.description'),
            confirmText: t('actions.delete'),
            destructive: true,
        });

        if (!ok) return;

        try {
            await deletePatient?.(id);

            removeFromSelection?.(id);
            onNotify?.({ kind: 'success', message: t('patient.list.deleteSuccess') });
        } catch (e: any) {
            onNotify?.({ kind: 'error', message: e?.message ?? t('patient.list.deleteError') });
        }
    };

    const handleCreateAccess = async (id: string) => {
        const ok = await confirm({
            title: t('patient.actions.createAccess.title'),
            description: t('patient.actions.createAccess.description'),
            confirmText: t('patient.actions.createAccess.confirm'),
        });

        if (!ok) return;

        try {
            await createAccess?.(id);
            onNotify?.({
                kind: 'success',
                message: t('patient.actions.createAccessSuccess'),
            });
        } catch (e: any) {
            onNotify?.({
                kind: 'error',
                message: e?.message ?? t('patient.actions.createAccessError'),
            });
        }
    };

    return (
        <>
            <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ flexGrow: 1 }}>
                    {t('patient.list.title')}
                </Typography>
                {onCreate && (
                    <Button
                        variant="contained"
                        startIcon={<Iconify icon="mingcute:add-line" />}
                        disabled={loading}
                        onClick={onCreate}
                    >
                        {t('actions.new')}
                    </Button>
                )}
            </Box>

            <GenericTable
                data={items}
                total={total}
                loading={loading}
                table={{
                    order: table.order,
                    orderBy: table.orderBy,
                    selected: table.selected,
                    initialized: true,
                    page: pageIndex,
                    rowsPerPage: pageSize,
                    onSort: table.onSort,
                    onSelectAllRows: (checked, ids) => onSelectAllRows(checked, ids.map(String)),
                    onSelectRow: (id) => onSelectRow(String(id)),
                    onChangePage: (_: unknown, newPage: number) => setPageIndex(newPage),
                    onChangeRowsPerPage: (e: React.ChangeEvent<HTMLInputElement>) => {
                        const size = parseInt(e.target.value, 10);
                        setPageSize(size);
                        setPageIndex(0);
                    },
                }}
                filterValue={filters.value}
                setFilterValue={(x: string) => setFilters(f => ({ ...f, value: x }))}
                headLabel={[
                    { id: 'name', label: t('patient.list.columns.name') },
                    { id: 'birthDate', label: t('patient.list.columns.birthDate') },
                    { id: 'status', label: t('patient.list.columns.status') },
                    { id: 'actions', label: t('patient.list.columns.actions'), sortable: false, align: 'center' },
                ]}
                renderRow={(row, isSelected, onRowSelect) => (
                    <PatientTableRow
                        key={row.id}
                        row={row}
                        selected={isSelected}
                        onSelectRow={onRowSelect}
                        onEdit={() => onEdit?.(row.id)}
                        onDelete={() => handleDelete?.(row.id)}
                        onCreateAccess={() => handleCreateAccess(row.id)}
                    />
                )}
            />
        </>
    );
}
