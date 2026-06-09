import { useState, useCallback } from 'react';

// ----------------------------------------------------------------------

type UseTableOptions = {
    initialOrderBy?: string;
    initialRowsPerPage?: number;
};

// ----------------------------------------------------------------------

export function useTable(opts: UseTableOptions = {}) {
    const [page, setPage] = useState(0);
    const [selected, setSelected] = useState<string[]>([]);
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [orderBy, setOrderBy] = useState(opts.initialOrderBy ?? 'name');
    const [rowsPerPage, setRowsPerPage] = useState(opts.initialRowsPerPage ?? 5);

    const onSort = useCallback(
        (id: string) => {
            setOrder(prev => (orderBy === id && prev === 'asc' ? 'desc' : 'asc'));
            setOrderBy(id);
        },
        [orderBy]
    );

    const onSelectAllRows = useCallback((checked: boolean, ids: string[]) => {
        setSelected(prev => {
            const set = new Set(prev);
            if (checked) ids.forEach(id => set.add(id));
            else ids.forEach(id => set.delete(id));
            return Array.from(set);
        });
    }, []);


    const onSelectRow = useCallback((id: string) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
        );
    }, []);

    const clearSelection = useCallback(() => setSelected([]), []);

    const removeFromSelection = useCallback((ids: string | string[]) => {
        const toRemove = new Set(Array.isArray(ids) ? ids : [ids]);
        setSelected(prev => prev.filter(id => !toRemove.has(id)));
    }, []);

    const syncSelection = useCallback((validIds: string[]) => {
        const valid = new Set(validIds);
        setSelected(prev => {
            // mantém apenas os válidos
            const next = prev.filter(id => valid.has(id));

            // se não mudou, retorna o mesmo array para evitar re-render desnecessário
            if (next.length === prev.length && prev.every(id => valid.has(id))) {
                return prev; // mesma referência => React não atualiza
            }
            return next;
        });
    }, []);

    const isSelected = useCallback((id: string) => selected.includes(id), [selected]);

    const onResetPage = useCallback(() => setPage(0), []);

    const onChangePage = useCallback((_: unknown, newPage: number) => setPage(newPage), []);

    const onChangeRowsPerPage = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            onResetPage();
        },
        [onResetPage]
    );

    return {
        // estado
        page,
        order,
        orderBy,
        rowsPerPage,
        selected,

        // ações tabelares
        onSort,
        onSelectRow,
        onSelectAllRows,
        onResetPage,
        onChangePage,
        onChangeRowsPerPage,

        // helpers de seleção
        isSelected,
        clearSelection,
        removeFromSelection,
        syncSelection,
        setSelected, // exposto caso você queira uso direto
    };
}