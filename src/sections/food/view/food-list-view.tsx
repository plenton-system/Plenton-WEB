import type { ChangeEvent } from 'react';

import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useTable } from 'src/hooks/common/use-table';
import { useConfirm } from 'src/hooks/common/use-confirm';
import { useFoodList } from 'src/hooks/food/use-food-list';

import { Iconify } from 'src/components/iconify';
import { GenericTable } from 'src/components/table';

import { FoodTableRow } from '../components/food-table-row';
import { FoodTableToolbar } from '../components/food-table-toolbar';

// ----------------------------------------------------------------------

type NotifyEvent = { kind: 'success'; message: string } | { kind: 'error'; message: string };
export type FoodTab = 'custom' | 'taco';
const CREATE_ALLOWED_TABS: FoodTab[] = ['custom'];

type FoodListViewProps = {
  tab: FoodTab;
  onTabChange: (tab: FoodTab) => void;
  onCreate?: (tab: FoodTab) => void;
  onEdit?: (id: string, tab: FoodTab) => void;
  onNotify?: (evt: NotifyEvent) => void;
};

// ----------------------------------------------------------------------

export function FoodListView({ tab, onTabChange, onCreate, onEdit, onNotify }: FoodListViewProps) {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const table = useTable({ initialOrderBy: 'description' });
  const canCreateInCurrentTab = CREATE_ALLOWED_TABS.includes(tab);

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
    deleteFood,
  } = useFoodList({
    initialFilters: { pageIndex: 1, pageSize: 5, source: tab },
  });

  const data = useMemo(
    () => items.filter((r) => r.source === tab).map((r) => ({ ...r, id: String(r.id) })),
    [items, tab]
  );

  const validIds = useMemo(() => data.map((r) => r.id), [data]);

  const { syncSelection, removeFromSelection, onResetPage } = table;

  useEffect(() => {
    syncSelection?.(validIds);
  }, [syncSelection, validIds]);

  useEffect(() => {
    setFilters((f) => {
      if (f.orderBy === table.orderBy && f.order === table.order) return f;
      return { ...f, orderBy: table.orderBy as any, order: table.order };
    });
    setPageIndex(1);
  }, [table.orderBy, table.order, setFilters, setPageIndex]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, source: tab }));
    onResetPage();
    setPageIndex(1);
  }, [tab, setFilters, onResetPage, setPageIndex]);

  const handleDelete = async (id: string, source: FoodTab) => {
    if (source !== 'custom') {
      onNotify?.({ kind: 'error', message: t('food.list.delete.onlyCustom') });
      return;
    }

    const ok = await confirm({
      title: t('food.list.delete.title'),
      description: t('food.list.delete.description'),
      confirmText: t('actions.delete'),
      destructive: true,
    });

    if (!ok) return;

    try {
      await deleteFood?.(id);

      removeFromSelection?.(id);
      onNotify?.({ kind: 'success', message: t('food.list.deleteSuccess') });
    } catch (e: any) {
      onNotify?.({ kind: 'error', message: e?.message ?? t('food.list.deleteError') });
    }
  };

  const sorted = useMemo(() => {
    if (table.orderBy === 'description') {
      return data.sort((a, b) =>
        table.order === 'asc'
          ? a.description.localeCompare(b.description)
          : b.description.localeCompare(a.description)
      );
    }
    return data;
  }, [data, table.order, table.orderBy]);

  return (
    <>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {t('food.list.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          disabled={loading || !canCreateInCurrentTab}
          onClick={() => {
            if (!canCreateInCurrentTab) return;
            onCreate?.(tab);
          }}
        >
          {t('actions.new')}
        </Button>
      </Box>
      <GenericTable
        data={sorted}
        total={total}
        loading={loading}
        maxHeight="40vh"
        table={{
          order: table.order,
          orderBy: table.orderBy,
          selected: table.selected,
          initialized: true,
          page: Math.max(0, pageIndex - 1),
          rowsPerPage: pageSize,
          onSort: table.onSort,
          onSelectAllRows: (checked, ids) => table.onSelectAllRows(checked, ids.map(String)),
          onSelectRow: (id) => table.onSelectRow(String(id)),
          onChangePage: (_: unknown, newPage: number) => setPageIndex(newPage + 1),
          onChangeRowsPerPage: (e: ChangeEvent<HTMLInputElement>) => {
            const size = parseInt(e.target.value, 10);
            setPageSize(size);
            setPageIndex(1);
          },
        }}
        filterValue={filters.value ?? ''}
        setFilterValue={(x: string) => setFilters((f) => ({ ...f, value: x }))}
        headLabel={[
          { id: 'description', label: t('food.list.columns.description') },
          { id: 'group', label: t('food.list.columns.group') },
          { id: 'energyKcal', label: t('food.list.columns.kcal') },
          { id: 'protein', label: t('food.list.columns.protein') },
          { id: 'carbs', label: t('food.list.columns.carbs') },
          { id: 'fat', label: t('food.list.columns.fat') },
          { id: 'actions', label: t('food.list.columns.actions'), sortable: false, align: 'center', width: 96 },
        ]}
        renderRow={(row, selected, onRowSelect) => (
          <FoodTableRow
            key={row.id}
            row={row}
            selected={selected}
            onSelectRow={onRowSelect}
            onEdit={(food) => onEdit?.(food.id, tab)}
            onDelete={row.source === 'custom' ? (food) => handleDelete(food.id, food.source) : undefined}
          />
        )}
        renderToolbar={
          <>
            <FoodTableToolbar
              filterValue={filters.value ?? ''}
              onFilterValue={(value) => {
                setFilters((prev) => ({ ...prev, value }));
                table.onResetPage();
                setPageIndex(1);
              }}
            />

            <Tabs
              value={tab}
              onChange={(_, value: FoodTab) => onTabChange(value)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ px: 2, pt: 1 }}
            >
              <Tab label={t('food.list.tabs.custom')} value="custom" />
              <Tab label={t('food.list.tabs.taco')} value="taco" />
            </Tabs>
          </>
        }
      />
    </>
  );
}
