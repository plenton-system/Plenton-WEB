import type { PatientAnamnesisItem } from 'src/types';

import { useState, useEffect, useCallback } from 'react';

import { extractApiErrorMessage } from 'src/utils/api-error';

import { anamnesisService } from 'src/services/anamnesis/anamnesisService';

// ----------------------------------------------------------------------

type UseAnamnesisByPatientReturn = {
    items: PatientAnamnesisItem[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
};

// ----------------------------------------------------------------------

export function useAnamnesisByPatient(patientId?: string | null): UseAnamnesisByPatientReturn {
    const [items, setItems] = useState<PatientAnamnesisItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchList = useCallback(async () => {
        if (!patientId) {
            setItems([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await anamnesisService.getByPatient(patientId);
            setItems(data);
        } catch (erro: any) {
            setError(extractApiErrorMessage(erro, 'Erro ao carregar anamneses do paciente'));
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    return { items, loading, error, refetch: fetchList };
}
