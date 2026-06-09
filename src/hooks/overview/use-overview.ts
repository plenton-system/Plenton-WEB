import type { OverviewDashboardView } from 'src/types/domain/overview';

import { useState, useEffect } from 'react';

import { overviewService } from 'src/services/overview/overviewService';

// ----------------------------------------------------------------------

export function useOverview() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<OverviewDashboardView | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await overviewService.getOverview();
            setData(result);
        } catch (erro: any) {
            setError(erro.message || 'Erro ao buscar dados');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        data,
        loading,
        error,
        refetch: fetchData
    };
}
