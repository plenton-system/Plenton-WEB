import { useState } from 'react';

import {
    Box,
    Paper,
    Alert,
    Stack,
    Button,
    Divider,
    Checkbox,
    Container,
    Typography,
    FormControlLabel,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    title: string;
    termText: string;
    termVersion: string;
    onAccept: () => Promise<void> | void;
    submitting?: boolean;
    error?: string | null;
};

export function PublicAnamnesisConsent({
    title,
    termText,
    termVersion,
    onAccept,
    submitting = false,
    error,
}: Props) {
    const [accepted, setAccepted] = useState(false);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default',
            }}
        >
            {/* ── Header ── */}
            <Box
                sx={{
                    py: { xs: 3, md: 4 },
                    px: 3,
                    color: 'common.white',
                    background: (theme) =>
                        `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                }}
            >
                <Container maxWidth="md">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(255,255,255,0.18)',
                                flexShrink: 0,
                            }}
                        >
                            <Iconify
                                icon="solar:shield-keyhole-bold-duotone"
                                width={32}
                                sx={{ color: 'common.white' }}
                            />
                        </Box>
                        <Box>
                            <Typography
                                variant="overline"
                                sx={{ opacity: 0.85, letterSpacing: '0.12em' }}
                            >
                                Plenton · Privacidade
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {title}
                            </Typography>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            {/* ── Conteúdo ── */}
            <Container
                maxWidth="md"
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    py: { xs: 3, md: 4 },
                    gap: 2,
                }}
            >
                <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        Termo de tratamento de dados pessoais
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Antes de começar a anamnese, leia atentamente o termo abaixo e confirme
                        que está de acordo. Você pode revogar este consentimento a qualquer
                        momento junto ao nutricionista responsável.
                    </Typography>
                </Box>

                <Paper
                    variant="outlined"
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 320,
                        overflow: 'hidden',
                        borderRadius: 2,
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        sx={{
                            px: 2.5,
                            py: 1.5,
                            bgcolor: 'background.paper',
                            borderBottom: 1,
                            borderColor: 'divider',
                        }}
                    >
                        <Iconify
                            icon="solar:shield-keyhole-bold-duotone"
                            width={20}
                            sx={{ color: 'primary.main' }}
                        />
                        <Typography variant="subtitle2" fontWeight={600}>
                            Termo de Consentimento (LGPD)
                        </Typography>
                        <Box sx={{ flex: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                            versão {termVersion}
                        </Typography>
                    </Stack>

                    <Box
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            px: { xs: 2.5, md: 3 },
                            py: 2.5,
                            whiteSpace: 'pre-line',
                            bgcolor: 'background.default',
                        }}
                    >
                        <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.7 }}>
                            {termText}
                        </Typography>
                    </Box>
                </Paper>

                {!!error && <Alert severity="error">{error}</Alert>}
            </Container>

            {/* ── Footer (sticky CTA) ── */}
            <Box
                sx={{
                    position: 'sticky',
                    bottom: 0,
                    bgcolor: 'background.paper',
                    borderTop: 1,
                    borderColor: 'divider',
                    boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
                }}
            >
                <Container maxWidth="md" sx={{ py: 2.5 }}>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        alignItems={{ sm: 'center' }}
                        justifyContent="space-between"
                    >
                        <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                                <Checkbox
                                    checked={accepted}
                                    onChange={(e) => setAccepted(e.target.checked)}
                                    disabled={submitting}
                                />
                            }
                            label={
                                <Typography variant="body2">
                                    Li e aceito o tratamento dos meus dados conforme o termo acima.
                                </Typography>
                            }
                        />

                        <Button
                            type="button"
                            variant="contained"
                            size="large"
                            disabled={!accepted || submitting}
                            onClick={() => onAccept()}
                            endIcon={
                                <Iconify icon="eva:arrow-ios-forward-fill" width={18} />
                            }
                            sx={{ minWidth: 220, flexShrink: 0 }}
                        >
                            Começar anamnese
                        </Button>
                    </Stack>

                    <Divider sx={{ mt: 2, opacity: 0.5 }} />

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', textAlign: 'center', mt: 1 }}
                    >
                        Seus dados são tratados conforme a Lei nº 13.709/2018 (LGPD).
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
}
