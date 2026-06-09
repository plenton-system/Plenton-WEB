import type { MouseEvent, ChangeEvent } from 'react';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { useTable } from 'src/hooks/common/use-table';
import { useWorkspaceList } from 'src/hooks/workspace/use-workspace-list';

import { Iconify } from 'src/components/iconify';
import { GenericTable } from 'src/components/table';

import { WorkspaceTableRow } from '../components/table-row/workspace-table-row';
import { WorkspaceTableToolbar } from '../components/layout/workspace-table-toolbar';
import { WORKSPACE_TABS, type WorkspaceTabId } from '../components/form-tabs/workspace-tabs';

// ----------------------------------------------------------------------

type WorkspaceListViewProps = {
  onOpen?: (id?: string, tab?: WorkspaceTabId, patientName?: string) => void;
};

export function WorkspaceListView({ onOpen }: WorkspaceListViewProps) {
  const navigate = useNavigate();
  const [newActionAnchorEl, setNewActionAnchorEl] = useState<null | HTMLElement>(null);
  const table = useTable({ initialOrderBy: 'patientName' });
  const { items, total, loading, filters, setFilters, pageIndex, pageSize, setPageIndex, setPageSize } =
    useWorkspaceList({ initialFilters: { pageSize: 5, orderByField: 'patientName' } });

  const isNewActionMenuOpen = Boolean(newActionAnchorEl);

  const handleOpenNewActionMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setNewActionAnchorEl(event.currentTarget);
  };

  const handleCloseNewActionMenu = () => {
    setNewActionAnchorEl(null);
  };

  const handleSelectNewAction = (tab: WorkspaceTabId) => {
    handleCloseNewActionMenu();

    if (onOpen) {
      onOpen(undefined, tab);
      return;
    }

    navigate('/workspace');
  };

  const handleSort = (id: string) => {
    const isAsc = table.orderBy === id && table.order === 'asc';
    table.onSort(id);
    setFilters((prev) => ({ ...prev, orderByField: id as any, order: isAsc ? 'desc' : 'asc' }));
    setPageIndex(0);
  };

  return (
    <>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Área de trabalho
        </Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenNewActionMenu}
        >
          Novo
        </Button>
        <Menu
          anchorEl={newActionAnchorEl}
          open={isNewActionMenuOpen}
          onClose={handleCloseNewActionMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {WORKSPACE_TABS.map((tab) => (
            <MenuItem key={tab.id} onClick={() => handleSelectNewAction(tab.id)}>
              {tab.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      <GenericTable
        data={items}
        total={total}
        loading={loading}
        filterValue={filters.value ?? ''}
        setFilterValue={(value) => {
          setFilters((prev) => ({ ...prev, value }));
          table.onResetPage();
          setPageIndex(0);
        }}
        headLabel={[
          { id: 'actions', label: 'Ações', sortable: false, align: 'center', width: 96 },
          { id: 'patientName', label: 'Paciente' },
          { id: 'nextAppointment', label: 'Próxima consulta' },
          { id: 'planStatus', label: 'Plano' },
          { id: 'lastAnthropometry', label: 'Última antropometria' },
          { id: 'lastAnamnesis', label: 'Última anamnese' },
          { id: 'lastSend', label: 'Último envio' },
        ]}
        table={{
          order: table.order,
          orderBy: table.orderBy,
          selected: table.selected,
          initialized: true,
          page: pageIndex,
          rowsPerPage: pageSize,
          onSort: handleSort,
          onSelectAllRows: (checked, ids) => table.onSelectAllRows(checked, ids.map(String)),
          onSelectRow: (id) => table.onSelectRow(String(id)),
          onChangePage: (_: unknown, newPage: number) => setPageIndex(newPage),
          onChangeRowsPerPage: (e: ChangeEvent<HTMLInputElement>) => {
            const size = parseInt(e.target.value, 10);
            setPageSize(size);
            setPageIndex(0);
          },
        }}
        renderRow={(row, selected, onSelectRow) => (
          <WorkspaceTableRow
            key={row.id}
            row={row}
            selected={selected}
            onSelectRow={onSelectRow}
            onOpen={(id, patientName) => {
              if (onOpen) onOpen(id, undefined, patientName);
              else navigate(`/workspace/${id}`);
            }}
          />
        )}
        renderToolbar={
          <WorkspaceTableToolbar
            filterValue={filters.value ?? ''}
            onFilterValue={(value) => {
              setFilters((prev) => ({ ...prev, value }));
              table.onResetPage();
              setPageIndex(0);
            }}
          />
        }
      />
    </>
  );
}
