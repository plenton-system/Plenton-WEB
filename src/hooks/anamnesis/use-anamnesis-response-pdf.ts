import { useState, useCallback } from 'react';

import { triggerBrowserDownload } from 'src/utils/format-file';

import { anamnesisService } from 'src/services/anamnesis/anamnesisService';

// ----------------------------------------------------------------------

export function useAnamnesisResponsePdf() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const download = useCallback(async (responseId: string) => {
        if (!responseId) return;

        setLoading(true);
        setError(null);

        try {
            const { blob, fileName } = await anamnesisService.downloadResponsePdf(responseId);
            triggerBrowserDownload(blob, fileName);
        } catch (err) {
            setError(extractMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    return { download, loading, error };
}

// ----------------------------------------------------------------------

const extractMessage = (err: unknown): string => {
    if (err instanceof Error && err.message) return err.message;
    return 'Erro ao gerar o PDF da anamnese.';
};
