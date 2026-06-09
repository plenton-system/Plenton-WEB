import type { PagedResult, PagedRequest, PatientFilters, PatientListProps, PatientListQuery } from 'src/types';

import { useState, useEffect, useCallback } from 'react';

import { extractApiErrorMessage } from 'src/utils/api-error';

import { patientService } from 'src/services/patient/patientService';

// ----------------------------------------------------------------------

type UsePatientListOptions = {
    initialFilters?: Partial<PatientFilters & PagedRequest>;
};

type UsePatientListReturn = {
    data: PagedResult<PatientListProps> | null;
    items: PatientListProps[];
    total: number;
    pageIndex: number;
    pageSize: number;
    loading: boolean;
    error: string | null;

    // filtros controlados
    filters: PatientFilters;
    setFilters: React.Dispatch<React.SetStateAction<PatientFilters>>;

    setPageIndex: (i: number) => void;
    setPageSize: (s: number) => void;
    deletePatient?: (id: string) => Promise<boolean>;
};

// ----------------------------------------------------------------------

export function usePatientList({ initialFilters }: UsePatientListOptions = {}): UsePatientListReturn {
    const [data, setData] = useState<PagedResult<PatientListProps> | null>(null);
    const [items, setItems] = useState<PatientListProps[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [pageIndex, setPageIndex] = useState(initialFilters?.pageIndex ?? 0);
    const [pageSize, setPageSize] = useState(initialFilters?.pageSize ?? 5);

    const [filters, setFilters] = useState<PatientFilters>({
        value: initialFilters?.value ?? '',
        orderByField: initialFilters?.orderByField ?? 'name',
        order: initialFilters?.order ?? 'asc',
    });

    const fetchList = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const query: PatientListQuery = {
                value: filters.value,
                orderByField: filters.orderByField,
                order: filters.order,
                pageIndex,
                pageSize,
            };

            const response = await patientService.getAll(query);

            setData(response);
            setItems(response?.items ?? []);
            setTotal(response?.totalCount ?? 0);
        } catch (erro) {
            setError(extractApiErrorMessage(erro, 'Erro ao carregar a lista de pacientes'));
        } finally {
            setLoading(false);
        }
    }, [filters.value, filters.orderByField, filters.order, pageIndex, pageSize]);

    const deletePatient = useCallback(async (id: string): Promise<boolean> => {
        if (!id)
            return false;

        setLoading(true);
        setError(null);

        try {
            await patientService.delete(id);
            await fetchList();
            return true;
        } catch (erro) {
            const message = extractApiErrorMessage(erro, 'Erro ao excluir o paciente');
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
        deletePatient
    };
}
