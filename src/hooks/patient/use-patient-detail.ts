import type { PatientViewProps, PatientDetailProps } from "src/types";

import { useState, useEffect, useCallback } from "react";

import { extractApiErrorMessage } from "src/utils/api-error";

import i18n from "src/i18n";
import { patientService } from "src/services/patient/patientService";

// ----------------------------------------------------------------------

type UsePatientDetailOptions = {
    id?: string | null;
    autoLoad?: boolean;
};

type UsePatientDetailReturn = {
    data: PatientDetailProps | null;
    loading: boolean;
    error: string | null;

    createOrUpdate: (dto: PatientDetailProps) => Promise<boolean>;
    setData: React.Dispatch<React.SetStateAction<PatientDetailProps | null>>;
};

// ----------------------------------------------------------------------

/**
 * Mapeia um PatientViewProps para PatientDetailProps
 */
function mapApiToPatientDetail(apiData: PatientViewProps): PatientDetailProps {
    return {
        id: apiData.id,
        name: apiData.name,
        phone: apiData.phone,
        email: apiData.email,
        document: apiData.document,
        status: apiData.status ?? null,
        birthDate: apiData.birthDate ? String(apiData.birthDate).slice(0, 10) : null,
        gender: apiData.gender ?? null,
        profilePhoto: apiData.profilePhoto,
        addressDto: {
            street: apiData.street || '',
            neighborhood: apiData.neighborhood || '',
            city: apiData.city || '',
            state: apiData.state || '',
            zipCode: apiData.zipCode || '',
        }
    }
}

// ----------------------------------------------------------------------

export function usePatientDetail({ id, autoLoad = true }: UsePatientDetailOptions): UsePatientDetailReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<PatientDetailProps | null>(null);

    const setStates = (isLoading: boolean = true) => {
        setError(null);
        setLoading(isLoading);
    };

    const fetchDetail = useCallback(async () => {
        if (!autoLoad) return;

        setStates();

        try {
            const result = await patientService.getById(id!);
            const mappedPatient = mapApiToPatientDetail(result);

            setData(mappedPatient);
        } catch (erro) {
            setError(extractApiErrorMessage(erro, i18n.t('patient.errors.load')));
        } finally {
            setLoading(false);
        }
    }, [autoLoad, id]);

    const createOrUpdate = useCallback(async (values: PatientDetailProps): Promise<boolean> => {
        setStates();

        try {
            if (autoLoad) {
                await patientService.update(id!, values);
            } else {
                await patientService.create(values);
            }

            setData(null);
            return true;
        } catch (erro) {
            const message = extractApiErrorMessage(erro, i18n.t('patient.errors.save'));
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
