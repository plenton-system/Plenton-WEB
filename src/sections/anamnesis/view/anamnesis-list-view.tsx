import { useMemo, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useTable } from 'src/hooks/common/use-table';
import { useConfirm } from 'src/hooks/common/use-confirm';
import { useAnamnesisList } from 'src/hooks/anamnesis/use-anamnesis-list';

import { Iconify } from 'src/components/iconify';
import { GenericTable } from 'src/components/table';

import { AnamneseTableRow } from '../components/anamnesis-table-row';

// ----------------------------------------------------------------------

type NotifyEvent = { kind: 'success'; message: string } | { kind: 'error'; message: string };

interface AnamnesisListViewProps {
  onCreate: () => void;
  onEdit: (id: string) => void;
  onNotify?: (evt: NotifyEvent) => void;
}

// ----------------------------------------------------------------------

export function AnamsnesisListView({ onEdit, onCreate, onNotify }: AnamnesisListViewProps) {
  const confirm = useConfirm();
  const table = useTable({ initialOrderBy: 'title' });

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
    deleteAnamnesis,
  } = useAnamnesisList({ initialFilters: { pageSize: 5 } });
  // Sempre normalize os IDs para string
  const data = useMemo(() => items.map((r) => ({ ...r, id: String(r.id) })), [items]);
  const validIds = useMemo(() => data.map((r) => r.id), [data]);

  const { syncSelection, removeFromSelection, onSelectAllRows, onSelectRow } = table;

  useEffect(() => {
    syncSelection?.(validIds);
  }, [syncSelection, validIds]);

  useEffect(() => {
    setFilters((f) => {
      if (f.orderByField === table.orderBy && f.order === table.order) return f;
      return { ...f, orderByField: table.orderBy, order: table.order };
    });

    setPageIndex(0);
  }, [table.order, table.orderBy, setFilters, setPageIndex]);

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Excluir questionário',
      description: 'Esta ação é irreversível. Deseja continuar?',
      confirmText: 'Excluir',
      destructive: true,
    });

    if (!ok) return;

    try {
      await deleteAnamnesis?.(id);

      removeFromSelection?.(id);
      onNotify?.({ kind: 'success', message: 'Questionário excluído com sucesso.' });
    } catch (e: any) {
      onNotify?.({ kind: 'error', message: e?.message ?? 'Falha ao excluir o questionário.' });
    }
  };

  return (
    <>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Questionários Anamnese
        </Typography>

        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          disabled={loading}
          onClick={onCreate}
        >
          Novo
        </Button>
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
        setFilterValue={(x: string) => setFilters((f) => ({ ...f, value: x }))}
        headLabel={[
          { id: 'title', label: 'Titulo' },
          { id: 'description', label: 'Descrição' },
          { id: 'actions', label: 'Ações', sortable: false, align: 'center' },
        ]}
        renderRow={(row, isSelected, onRowSelect) => (
          <AnamneseTableRow
            key={row.id}
            row={row}
            selected={isSelected}
            onSelectRow={onRowSelect}
            onEdit={() => onEdit?.(row.id)}
            onDelete={() => handleDelete?.(row.id)}
          />
        )}
      />
    </>
  );
}
