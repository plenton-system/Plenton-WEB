import type {
  PagedResult,
  PagedRequest,
  FoodListProps,
  FoodListQuery,
  FoodListFilters,
} from 'src/types';

import { useState, useEffect, useCallback } from 'react';

import { foodService } from 'src/services/food/foodService';

// ----------------------------------------------------------------------

type UseFoodListOptions = {
  initialFilters?: Partial<FoodListFilters & PagedRequest>;
};

type UseFoodListReturn = {
  data: PagedResult<FoodListProps> | null;
  total: number;
  items: FoodListProps[];
  loading: boolean;
  pageIndex: number;
  pageSize: number;
  error: string | null;

  filters: FoodListFilters;
  setFilters: React.Dispatch<React.SetStateAction<FoodListFilters>>;

  setPageIndex: (i: number) => void;
  setPageSize: (s: number) => void;
  deleteFood?: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
};

type BackendMacronutrients = {
  carbohydrates?: number | null;
  proteins?: number | null;
  fats?: number | null;
};

type BackendFoodItem = {
  id: string;
  description?: string;
  foodGroup?: {
    id?: string;
    name?: string | null;
  } | null;
  foodGroupName?: string | null;
  tableType?: number | string | null;
  macronutrients?: BackendMacronutrients | null;
  energyKcal?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  group?: string | null;
  source?: FoodListProps['source'];
};

const normalizeSource = (
  raw: unknown,
  fallback?: FoodListProps['source']
): FoodListProps['source'] => {
  if (raw === 'custom' || raw === 'taco') return raw;
  if (typeof raw === 'string') {
    const normalized = raw.trim().toLowerCase();
    if (normalized === 'custom') return 'custom';
    if (normalized === 'taco') return 'taco';
  }
  if (fallback) return fallback;
  if (typeof raw === 'number') {
    if (raw === 0) return 'custom';
    if (raw === 1) return 'taco';
  }
  return 'taco';
};

const mapFoodItem = (
  item: BackendFoodItem,
  fallbackSource?: FoodListProps['source']
): FoodListProps => {
  const macronutrients = item?.macronutrients ?? {};
  const protein =
    typeof item?.protein === 'number'
      ? item.protein
      : typeof macronutrients?.proteins === 'number'
        ? macronutrients.proteins
        : null;
  const carbs =
    typeof item?.carbs === 'number'
      ? item.carbs
      : typeof macronutrients?.carbohydrates === 'number'
        ? macronutrients.carbohydrates
        : null;
  const fat =
    typeof item?.fat === 'number'
      ? item.fat
      : typeof macronutrients?.fats === 'number'
        ? macronutrients.fats
        : null;

  return {
    id: String(item?.id ?? ''),
    description: item?.description ?? '',
    group: item?.group ?? item?.foodGroup?.name ?? item?.foodGroupName ?? null,
    energyKcal: typeof item?.energyKcal === 'number' ? item.energyKcal : null,
    protein,
    carbs,
    fat,
    source: normalizeSource(item?.source ?? item?.tableType, fallbackSource),
  };
};

export function useFoodList({ initialFilters }: UseFoodListOptions): UseFoodListReturn {
  const [data, setData] = useState<PagedResult<FoodListProps> | null>(null);
  const [items, setItems] = useState<FoodListProps[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pageIndex, setPageIndex] = useState(initialFilters?.pageIndex ?? 0);
  const [pageSize, setPageSize] = useState(initialFilters?.pageSize ?? 5);

  const [filters, setFilters] = useState<FoodListFilters>({
    value: initialFilters?.value ?? '',
    source: initialFilters?.source ?? 'taco',
    orderBy: initialFilters?.orderBy ?? 'description',
    order: initialFilters?.order ?? 'asc',
  });

  const fetchList = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const query: FoodListQuery = {
          value: filters.value,
          source: filters.source,
          orderBy: filters.orderBy,
          order: filters.order,
          pageIndex,
          pageSize,
        };

        const response = await foodService.getAllByTable(query, { signal });
        const page = (response as { data?: PagedResult<BackendFoodItem> })?.data ?? response;
        const rawItems = Array.isArray(page?.items) ? page.items : [];
        const mappedItems = rawItems.map((item) => mapFoodItem(item, filters.source));
        const totalCount =
          typeof page?.totalCount === 'number' ? page.totalCount : mappedItems.length;
        const pageSizeValue =
          typeof page?.pageSize === 'number' && page.pageSize > 0 ? page.pageSize : pageSize;
        const totalPages =
          typeof page?.totalPages === 'number'
            ? page.totalPages
            : Math.max(1, Math.ceil(totalCount / (pageSizeValue > 0 ? pageSizeValue : 1)));

        setData({
          currentPage: typeof page?.currentPage === 'number' ? page.currentPage : pageIndex,
          pageSize: pageSizeValue,
          totalCount,
          totalPages,
          items: mappedItems,
        });
        setItems(mappedItems);
        setTotal(totalCount);
      } catch (err) {
        if ((err as any)?.name === 'CanceledError' || (err as any)?.code === 'ERR_CANCELED') return;
        if ((err as any)?.name === 'AbortError') return;
        setError((err as Error).message || 'Erro ao carregar alimentos');
      } finally {
        setLoading(false);
      }
    },
    [filters, pageIndex, pageSize]
  );

  const deleteFood = useCallback(
    async (id: string): Promise<boolean> => {
      if (!id) return false;

      setLoading(true);
      setError(null);

      try {
        await foodService.delete(id);
        await fetchList();
        return true;
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || 'Erro ao excluir alimento';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [fetchList]
  );

  const refetch = useCallback(async () => {
    await fetchList();
  }, [fetchList]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchList(controller.signal);
    return () => controller.abort();
  }, [fetchList]);

  return {
    data,
    items,
    total,
    loading,
    pageIndex,
    pageSize,
    error,
    filters,
    setFilters,
    setPageIndex,
    setPageSize,
    deleteFood,
    refetch,
  };
}
