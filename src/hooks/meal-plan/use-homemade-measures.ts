import type { HomemadeMeasureDto } from 'src/types';

import { useState, useEffect, useCallback } from 'react';

import i18n from 'src/i18n';
import { homemadeMeasureService } from 'src/services/mealPlan/homemadeMeasureService';

// ----------------------------------------------------------------------

type UseHomemadeMeasuresOptions = {
    foodId?: string | null;
};

export function useHomemadeMeasures({ foodId }: UseHomemadeMeasuresOptions) {
    const [measures, setMeasures] = useState<HomemadeMeasureDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMeasures = useCallback(async () => {
        if (!foodId) {
            setMeasures([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await homemadeMeasureService.getByFood(foodId);
            setMeasures(data);
        } catch (err) {
            setError((err as Error).message || i18n.t('mealplan.errors.loadMeasures'));
        } finally {
            setLoading(false);
        }
    }, [foodId]);

    useEffect(() => {
        fetchMeasures();
    }, [fetchMeasures]);

    return {
        measures,
        loading,
        error,
        refetch: fetchMeasures,
    };
}
