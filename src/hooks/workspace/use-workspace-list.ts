import type { PagedResult, PagedRequest } from 'src/types/api';
import type { WorkspaceListItem, WorkspaceListQuery } from 'src/types';

import { useState, useEffect, useCallback } from 'react';

import i18n from 'src/i18n';
import { workspaceService } from 'src/services/workspace/workspaceService';

// ----------------------------------------------------------------------

type UseWorkspaceListOptions = {
  initialFilters?: Partial<WorkspaceListQuery & PagedRequest>;
};

type UseWorkspaceListReturn = {
  data: PagedResult<WorkspaceListItem> | null;
  items: WorkspaceListItem[];
  total: number;
  loading: boolean;
  error: string | null;
  pageIndex: number;
  pageSize: number;
  filters: WorkspaceListQuery;
  setFilters: React.Dispatch<React.SetStateAction<WorkspaceListQuery>>;
  setPageIndex: (idx: number) => void;
  setPageSize: (size: number) => void;
};

// ----------------------------------------------------------------------

export function useWorkspaceList({ initialFilters }: UseWorkspaceListOptions = {}): UseWorkspaceListReturn {
  const [data, setData] = useState<PagedResult<WorkspaceListItem> | null>(null);
  const [items, setItems] = useState<WorkspaceListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pageIndex, setPageIndex] = useState(initialFilters?.pageIndex ?? 0);
  const [pageSize, setPageSize] = useState(initialFilters?.pageSize ?? 5);

  const [filters, setFilters] = useState<WorkspaceListQuery>({
    value: initialFilters?.value ?? '',
    orderByField: initialFilters?.orderByField ?? 'patientName',
    order: initialFilters?.order ?? 'asc',
    pageIndex,
    pageSize,
  });

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query: WorkspaceListQuery = {
        value: filters.value,
        orderByField: filters.orderByField,
        order: filters.order,
        pageIndex,
        pageSize,
      };

      const response = await workspaceService.getList(query);
      setData(response);
      setItems(response?.items ?? []);
      setTotal(response?.totalCount ?? 0);
    } catch (err: any) {
      setError(err?.message ?? i18n.t('workspace.errors.loadList'));
    } finally {
      setLoading(false);
    }
  }, [filters.order, filters.orderByField, filters.value, pageIndex, pageSize]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return {
    data,
    items,
    total,
    loading,
    error,
    pageIndex,
    pageSize,
    filters,
    setFilters,
    setPageIndex,
    setPageSize,
  };
}
