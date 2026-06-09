import type { PublicOpenResponse } from 'src/types';

import {
    Box,
    Chip,
    Alert,
    Typography,
} from '@mui/material';

// ----------------------------------------------------------------------

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

type Props = {
    openData: PublicOpenResponse;
    readOnly: boolean;
    saveState: SaveState;
    error?: string | null;
};

export function PublicAnamnesisHeader({
    openData,
    readOnly,
    saveState,
    error,
}: Props) {
    return (
        <>
            <Typography variant="h4" fontWeight={700} gutterBottom>
                {openData.title}
            </Typography>

            {!!openData.description && (
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    {openData.description}
                </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                <Chip label={`Status: ${openData.status}`} />

                {openData.expiresAtUtc && (
                    <Chip label={`Expira: ${new Date(openData.expiresAtUtc).toLocaleString()}`} />
                )}

                {!readOnly && (
                    <Typography variant="body2" color="text.secondary">
                        {saveState === 'saving' && 'Salvando...'}
                        {saveState === 'saved' && 'Rascunho salvo ✅'}
                        {saveState === 'error' && 'Erro ao salvar ⚠️'}
                    </Typography>
                )}
            </Box>

            {!!error && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {readOnly && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Formulário já enviado em {new Date(openData.submittedAtUtc!).toLocaleString()}.
                </Alert>
            )}
        </>
    );
}