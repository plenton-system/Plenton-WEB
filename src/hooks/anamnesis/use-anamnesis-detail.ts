import type { AnamnesisCreateDto, AnamnesisFormViewProps } from 'src/types';

import { useState, useEffect, useCallback } from 'react';

import { extractApiErrorMessage } from 'src/utils/api-error';

import i18n from 'src/i18n';
import { anamnesisService } from 'src/services/anamnesis/anamnesisService';

// ----------------------------------------------------------------------

type UseAnamnesisDetailOptions = {
    id?: string | null;
    autoLoad?: boolean;
};

type UseAnamnesisDetailReturn = {
    data: AnamnesisFormViewProps | null;
    loading: boolean;
    error: string | null;

    createOrUpdate: (dto: AnamnesisCreateDto) => Promise<boolean>;
    setData: React.Dispatch<React.SetStateAction<AnamnesisFormViewProps | null>>;
};

// ----------------------------------------------------------------------

export function useAnamnesisDetail({ id, autoLoad = true }: UseAnamnesisDetailOptions): UseAnamnesisDetailReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<AnamnesisFormViewProps | null>(null);

    const setStates = (isLoading: boolean = true) => {
        setError(null);
        setLoading(isLoading);
    };

    const fetchDetail = useCallback(async () => {
        if (!autoLoad) return;

        setStates();

        try {
            const result = await anamnesisService.getById(id!);

            setData(result);
        } catch (erro: any) {
            setError(extractApiErrorMessage(erro, i18n.t('anamnesis.errors.load')));
        } finally {
            setLoading(false);
        }
    }, [autoLoad, id]);

    const createOrUpdate = useCallback(async (values: AnamnesisCreateDto): Promise<boolean> => {
        setStates();

        try {
            if (autoLoad) {
                await anamnesisService.update(id!, values);
            } else {
                await anamnesisService.create(values);
            }

            setData(null);
            return true;
        } catch (erro: any) {
            const message = extractApiErrorMessage(erro, i18n.t('anamnesis.errors.save'));
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, [autoLoad, id]);

    useEffect(() => {
        fetchDetail();
    }, [id, fetchDetail]);

    return {
        data,
        loading,
        error,
        createOrUpdate,
        setData,
    };
}
