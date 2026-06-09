import type {
    PublicOpenResponse,
    PublicAnamnesisSubmitRequestDto,
    PublicAnamnesisSubmitResponseDto,
    PublicAnamnesisSaveDraftRequestDto,
    PublicAnamnesisSaveDraftResponseDto,
    PublicAnamnesisAcceptConsentResponseDto,
} from 'src/types';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { extractApiErrorMessage } from 'src/utils/api-error';

import { QuestionType } from 'src/enums/anamnesis';
import { publicAnamnesisService } from 'src/services/public/publicAnamnesisService';

// ----------------------------------------------------------------------

type UsePatientAnamnesisOptions = {
    tenantId?: string | null;
    token?: string | null;
    autoLoad?: boolean;
};

type UsePatientAnamnesisReturn = {
    data: PublicOpenResponse | null;
    loading: boolean;
    error: string | null;

    // ajuda a popular um form (Formik, React Hook Form, etc.)
    initialValues: Record<string, any>;

    reload: () => Promise<void>;

    acceptConsent: () => Promise<PublicAnamnesisAcceptConsentResponseDto>;
    saveDraft: (dto: PublicAnamnesisSaveDraftRequestDto) => Promise<PublicAnamnesisSaveDraftResponseDto>;
    submit: (dto: PublicAnamnesisSubmitRequestDto) => Promise<PublicAnamnesisSubmitResponseDto>;

    setData: React.Dispatch<React.SetStateAction<PublicOpenResponse | null>>;
};

// ----------------------------------------------------------------------

function safeParse(valueJson?: string | null) {
    if (!valueJson) return undefined;
    try {
        return JSON.parse(valueJson);
    } catch {
        return undefined;
    }
}

/**
 * Define default por tipo (ajuste se quiser)
 */
function getDefaultValueByType(type: QuestionType) {
    switch (type) {
        case QuestionType.Boolean:
            return false;
        case QuestionType.MultiSelect:
            return [];
        case QuestionType.Number:
            return ''; // deixa vazio pra usuário digitar
        case QuestionType.Select:
        case QuestionType.Text:
        default:
            return '';
    }
}

/**
 * Constrói initialValues do form a partir das perguntas + answers existentes.
 */
function mapOpenToInitialValues(open: PublicOpenResponse): Record<string, any> {
    const values: Record<string, any> = {};

    // defaults
    for (const q of open.questions ?? []) {
        values[q.id] = getDefaultValueByType(q.type);
    }

    // aplica respostas existentes
    for (const a of open.answers ?? []) {
        const parsed = safeParse(a.valueJson);
        if (parsed !== undefined) values[a.questionId] = parsed;
    }

    return values;
}

// ----------------------------------------------------------------------

export function usePatientAnamnesis({
    tenantId,
    token,
    autoLoad = true,
}: UsePatientAnamnesisOptions): UsePatientAnamnesisReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<PublicOpenResponse | null>(null);

    // evita salvar rascunho antes de carregar (útil se você usar autosave no form)
    const loadedOnceRef = useRef(false);

    const setStates = (isLoading: boolean = true) => {
        setError(null);
        setLoading(isLoading);
    };

    const reload = useCallback(async () => {
        if (!tenantId || !token) return;

        setStates();

        try {
            const result = await publicAnamnesisService.open(tenantId, token);
            setData(result);
            loadedOnceRef.current = true;
        } catch (erro) {
            setError(extractApiErrorMessage(erro, 'Erro ao abrir anamnese'));
        } finally {
            setLoading(false);
        }
    }, [tenantId, token]);

    const acceptConsent = useCallback(async () => {
        if (!tenantId || !token) throw new Error('tenantId/token não informado.');
        if (!loadedOnceRef.current || !data) throw new Error('Formulário ainda não foi carregado.');

        setStates();

        try {
            const resp = await publicAnamnesisService.acceptConsent(tenantId, token, {
                version: data.consentTermVersion,
            });

            setData((prev) =>
                prev
                    ? {
                          ...prev,
                          consentAcceptedAtUtc: resp.acceptedAtUtc,
                          consentVersionAccepted: resp.version,
                      }
                    : prev
            );

            return resp;
        } catch (erro: any) {
            const message = extractApiErrorMessage(erro, 'Erro ao registrar consentimento');
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, [tenantId, token, data]);

    const saveDraft = useCallback(async (dto: PublicAnamnesisSaveDraftRequestDto) => {
        if (!tenantId || !token) throw new Error('tenantId/token não informado.');
        if (!loadedOnceRef.current) throw new Error('Formulário ainda não foi carregado.');

        setStates();

        try {
            return await publicAnamnesisService.saveDraft(tenantId, token, dto);
        } catch (erro: any) {
            const message = extractApiErrorMessage(erro, 'Erro ao salvar rascunho');
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, [tenantId, token]);

    const submit = useCallback(async (dto: PublicAnamnesisSubmitRequestDto) => {
        if (!tenantId || !token) throw new Error('tenantId/token não informado.');
        if (!loadedOnceRef.current) throw new Error('Formulário ainda não foi carregado.');

        setStates();

        try {
            const resp = await publicAnamnesisService.submit(tenantId, token, dto);
            await reload();
            return resp;
        } catch (erro: any) {
            const message = extractApiErrorMessage(erro, 'Erro ao enviar respostas');
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, [tenantId, token, reload]);

    useEffect(() => {
        if (!autoLoad) return;
        if (!tenantId || !token) return;

        reload();
    }, [autoLoad, tenantId, token, reload]);

    const initialValues = useMemo(() => (data ? mapOpenToInitialValues(data) : {}), [data]);

    return {
        data,
        loading,
        error,
        initialValues,
        reload,
        acceptConsent,
        saveDraft,
        submit,
        setData,
    };
}
