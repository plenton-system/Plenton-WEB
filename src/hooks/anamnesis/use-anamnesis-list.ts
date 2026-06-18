// src/hooks/anamnesis/use-anamnesis-list.ts
import type { PagedResult, PagedRequest, AnamnesisFilters, AnamnesisListProps, AnamnesisListQuery } from 'src/types';

import { useState, useEffect, useCallback } from 'react';

import { extractApiErrorMessage } from 'src/utils/api-error';

import i18n from 'src/i18n';
import { anamnesisService } from 'src/services/anamnesis/anamnesisService';

type UseAnamnesisListOptions = {
    initialFilters?: Partial<AnamnesisFilters & PagedRequest>;
};

type UseAnamnesisListReturn = {
    data: PagedResult<AnamnesisListProps> | null;
    items: AnamnesisListProps[];
    total: number;
    pageIndex: number;
    pageSize: number;
    loading: boolean;
    error: string | null;

    // filtros controlados
    filters: AnamnesisFilters;
    setFilters: React.Dispatch<React.SetStateAction<AnamnesisFilters>>;

    setPageIndex: (i: number) => void;
    setPageSize: (s: number) => void;
    deleteAnamnesis?: (id: string) => Promise<boolean>;
};

export function useAnamnesisList({ initialFilters }: UseAnamnesisListOptions = {}): UseAnamnesisListReturn {
    const [data, setData] = useState<PagedResult<AnamnesisListProps> | null>(null);
    const [items, setItems] = useState<AnamnesisListProps[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [pageIndex, setPageIndex] = useState(initialFilters?.pageIndex ?? 0);
    const [pageSize, setPageSize] = useState(initialFilters?.pageSize ?? 5);

    const [filters, setFilters] = useState<AnamnesisFilters>({
        value: initialFilters?.value ?? '',
        orderByField: initialFilters?.orderByField ?? 'title',
        order: initialFilters?.order ?? 'asc',
    });

    const fetchList = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const query: AnamnesisListQuery = {
                value: filters.value,
                orderByField: filters.orderByField,
                order: filters.order,
                pageIndex,
                pageSize,
            };

            const response = await anamnesisService.getAll(query);

            setData(response);
            setItems(response?.items ?? []);
            setTotal(response?.totalCount ?? 0);
        } catch (erro: any) {
            setError(extractApiErrorMessage(erro, i18n.t('anamnesis.errors.loadList')));
        } finally {
            setLoading(false);
        }
    }, [filters.value, filters.orderByField, filters.order, pageIndex, pageSize]);

    const deleteAnamnesis = useCallback(async (id: string): Promise<boolean> => {
        if (!id)
            return false;

        setLoading(true);
        setError(null);

        try {
            await anamnesisService.delete(id);
            await fetchList();
            return true;
        } catch (erro: any) {
            const message = extractApiErrorMessage(erro, i18n.t('anamnesis.errors.delete'));
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }

    }, [fetchList]);

    useEffect(() => {
        const controller = new AbortController();
        fetchList().then(() => { });

        return () => controller.abort();
    }, [fetchList]);

    return {
        data,
        items,
        total,
        pageIndex,
        pageSize,
        loading,
        error,
        filters,
        setFilters,
        setPageIndex,
        setPageSize,
        deleteAnamnesis
    };
}
