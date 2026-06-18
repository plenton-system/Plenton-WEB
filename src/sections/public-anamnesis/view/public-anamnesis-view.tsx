import type {
    PublicAnamnesisSubmitRequestDto,
} from 'src/types';

import { useFormik } from 'formik';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
    Box,
    Stack,
    Alert,
    Paper,
    Button,
    Divider,
    Container,
    Typography,
} from '@mui/material';

import { usePatientAnamnesis } from 'src/hooks/public/use-public-anamnesis';

import { fDateTimeLocale } from 'src/utils/format-time';

import { Loading } from 'src/components/loading';
import { Iconify } from 'src/components/iconify';

import { buildValidation } from '../validation';
import {
    buildPayload,
    buildInitialValues,
} from '../utils/public-anamnesis-utils';
import { PublicAnamnesisConsent } from '../components/form-consent/public-anamnesis-consent';
import { PublicAnamnesisQuestion } from '../components/form-question/public-anamnesis-question';

// ----------------------------------------------------------------------

function formatDate(value?: string | null) {
    if (!value) return null;
    return fDateTimeLocale(value) || null;
}

// ----------------------------------------------------------------------

export function PublicAnamnesisView() {
    const { t } = useTranslation();
    const { tenantId, token } = useParams();

    const {
        data: openData,
        loading,
        error,
        submit,
        acceptConsent,
    } = usePatientAnamnesis({
        tenantId,
        token,
        autoLoad: true,
    });

    const [consenting, setConsenting] = useState(false);

    const initialValues = useMemo(
        () => (openData ? buildInitialValues(openData) : {}),
        [openData]
    );

    const validationSchema = useMemo(
        () => (openData ? buildValidation(openData, t) : undefined),
        [openData, t]
    );

    const sortedQuestions = useMemo(
        () => (openData ? [...openData.questions].sort((a, b) => a.order - b.order) : []),
        [openData]
    );

    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema,
        onSubmit: async (values) => {
            if (!openData) return;

            try {
                // `submit` já recarrega o formulário (estado "enviado") internamente.
                await submit(buildPayload(openData, values) as PublicAnamnesisSubmitRequestDto);
            } catch {
                // erro exibido pelo hook
            }
        },
    });

    const isInitialLoading = loading && !openData;

    if (isInitialLoading) {
        return (
            <Loading message={t('publicAnamnesis.view.loading')} />
        );
    }

    if (!openData && error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!openData) return null;

    const readOnly = !!openData.submittedAtUtc;
    const needsConsent = !readOnly && !openData.consentAcceptedAtUtc;
    const submittedAt = formatDate(openData.submittedAtUtc);
    const expiresAt = formatDate(openData.expiresAtUtc);

    const handleAcceptConsent = async () => {
        setConsenting(true);
        try {
            await acceptConsent();
        } catch {
            // erro já é exibido pelo hook
        } finally {
            setConsenting(false);
        }
    };

    if (needsConsent) {
        return (
            <PublicAnamnesisConsent
                title={openData.title}
                termText={openData.consentTermText}
                termVersion={openData.consentTermVersion}
                onAccept={handleAcceptConsent}
                submitting={consenting}
                error={error}
            />
        );
    }

    return (
        <Box
            component="form"
            onSubmit={formik.handleSubmit}
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
                                icon="solar:clipboard-list-bold-duotone"
                                width={32}
                                sx={{ color: 'common.white' }}
                            />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                variant="overline"
                                sx={{ opacity: 0.85, letterSpacing: '0.12em' }}
                            >
                                {t('publicAnamnesis.view.brand')}
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {openData.title}
                            </Typography>
                            {openData.description && (
                                <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                                    {openData.description}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                </Container>
            </Box>

            {/* ── Conteúdo ── */}
            <Container
                maxWidth="md"
                sx={{
                    flex: 1,
                    py: { xs: 3, md: 4 },
                }}
            >
                {readOnly && (
                    <Alert
                        severity="success"
                        icon={<Iconify icon="solar:check-circle-bold" width={22} />}
                        sx={{ mb: 3 }}
                    >
                        {submittedAt
                            ? t('publicAnamnesis.view.submittedWithDate', { date: submittedAt })
                            : t('publicAnamnesis.view.submitted')}
                    </Alert>
                )}

                {!!error && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {!readOnly && expiresAt && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        {t('publicAnamnesis.view.expires', { date: expiresAt })}
                    </Alert>
                )}

                <Paper
                    variant="outlined"
                    sx={{
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        px: { xs: 2, md: 3 },
                        py: 2,
                    }}
                >
                    <Stack spacing={2.5}>
                        {sortedQuestions.map((question) => (
                            <PublicAnamnesisQuestion
                                key={question.id}
                                question={question}
                                formik={formik}
                                readOnly={readOnly}
                            />
                        ))}
                    </Stack>
                </Paper>
            </Container>

            {/* ── Footer sticky com CTA ── */}
            {!readOnly && (
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
                            <Typography variant="caption" color="text.secondary">
                                {t('publicAnamnesis.view.confirmBeforeSubmit')}
                            </Typography>

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={formik.isSubmitting}
                                endIcon={
                                    <Iconify icon="eva:arrow-ios-forward-fill" width={18} />
                                }
                                sx={{ minWidth: 220, flexShrink: 0 }}
                            >
                                {t('publicAnamnesis.view.submit')}
                            </Button>
                        </Stack>

                        <Divider sx={{ mt: 2, opacity: 0.5 }} />

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', textAlign: 'center', mt: 1 }}
                        >
                            {t('publicAnamnesis.view.consentNote')}
                        </Typography>
                    </Container>
                </Box>
            )}
        </Box>
    );
}
