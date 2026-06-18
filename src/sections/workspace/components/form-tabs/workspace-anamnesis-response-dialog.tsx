import type { TFunction } from 'i18next';
import type { AnamnesisResponseDetail, AnamnesisResponseQuestion } from 'src/types';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { useAnamnesisResponsePdf } from 'src/hooks/anamnesis/use-anamnesis-response-pdf';

import { fDateTimeLocale } from 'src/utils/format-time';

import { QuestionType } from 'src/enums/anamnesis';
import { anamnesisService } from 'src/services/anamnesis/anamnesisService';

import { Loading } from 'src/components/loading';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    responseId?: string | null;
};

// ----------------------------------------------------------------------

function safeParse(value?: string | null) {
    if (value == null || value === '') return undefined;
    try {
        return JSON.parse(value);
    } catch {
        return undefined;
    }
}

function formatAnswer(question: AnamnesisResponseQuestion, t: TFunction) {
    const parsed = safeParse(question.answerJson);

    if (parsed === undefined || parsed === null || parsed === '') {
        return { kind: 'empty' as const };
    }

    switch (question.type) {
        case QuestionType.Boolean:
            return {
                kind: 'text' as const,
                value: parsed
                    ? t('workspace.anamnesis.response.yes')
                    : t('workspace.anamnesis.response.no'),
            };
        case QuestionType.Number:
            return { kind: 'text' as const, value: String(parsed) };
        case QuestionType.MultiSelect:
            if (Array.isArray(parsed) && parsed.length > 0) {
                return { kind: 'chips' as const, value: parsed.map((x) => String(x)) };
            }
            return { kind: 'empty' as const };
        case QuestionType.Select:
        case QuestionType.Text:
        default:
            return { kind: 'text' as const, value: String(parsed) };
    }
}

function formatDate(value?: string | null) {
    if (!value) return null;
    return fDateTimeLocale(value) || null;
}

// ----------------------------------------------------------------------

export function WorkspaceAnamnesisResponseDialog({ open, onClose, responseId }: Props) {
    const { t } = useTranslation();
    const [data, setData] = useState<AnamnesisResponseDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { download: downloadPdf, loading: pdfLoading, error: pdfError } = useAnamnesisResponsePdf();

    useEffect(() => {
        if (!open || !responseId) {
            if (!open) {
                setData(null);
                setError(null);
            }
            return () => {};
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        anamnesisService
            .getResponseById(responseId)
            .then((result) => {
                if (!cancelled) setData(result);
            })
            .catch((e: any) => {
                if (!cancelled) {
                    setError(
                        e?.response?.data?.message ||
                            e?.message ||
                            t('workspace.anamnesis.response.loadError')
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [open, responseId, t]);

    const submittedAt = formatDate(data?.submittedAtUtc);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pr: 1,
                    gap: 1,
                }}
            >
                <span>{data?.title ?? t('workspace.anamnesis.response.title')}</span>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={
                            pdfLoading ? (
                                <CircularProgress size={14} />
                            ) : (
                                <Iconify icon="solar:file-download-bold" />
                            )
                        }
                        disabled={!responseId || pdfLoading || loading || Boolean(error)}
                        onClick={() => {
                            if (responseId) downloadPdf(responseId);
                        }}
                    >
                        {pdfLoading
                            ? t('workspace.anamnesis.response.generating')
                            : t('workspace.anamnesis.response.downloadPdf')}
                    </Button>
                    <IconButton aria-label={t('actions.close')} onClick={onClose} size="small">
                        <Iconify icon="mingcute:close-line" />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                {loading && <Loading inline message={t('workspace.anamnesis.response.loading')} />}

                {!loading && pdfError && (
                    <Alert severity="error" sx={{ mb: 2 }}>{pdfError}</Alert>
                )}

                {!loading && error && (
                    <Alert severity="error">{error}</Alert>
                )}

                {!loading && !error && data && (
                    <Stack spacing={2}>
                        {submittedAt && (
                            <Typography variant="body2" color="text.secondary">
                                {t('workspace.anamnesis.response.submittedAt', { date: submittedAt })}
                            </Typography>
                        )}

                        {data.description && (
                            <Typography variant="body2" color="text.secondary">
                                {data.description}
                            </Typography>
                        )}

                        <Divider />

                        <Stack spacing={2.5}>
                            {data.questions.map((question) => {
                                const answer = formatAnswer(question, t);
                                return (
                                    <Box key={question.id}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            {question.label}
                                            {question.required && (
                                                <Typography
                                                    component="span"
                                                    color="error"
                                                    sx={{ ml: 0.5 }}
                                                >
                                                    *
                                                </Typography>
                                            )}
                                        </Typography>

                                        {answer.kind === 'empty' && (
                                            <Typography variant="body2" color="text.disabled" fontStyle="italic">
                                                {t('workspace.anamnesis.response.noAnswer')}
                                            </Typography>
                                        )}

                                        {answer.kind === 'text' && (
                                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                                {answer.value}
                                            </Typography>
                                        )}

                                        {answer.kind === 'chips' && (
                                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                {answer.value.map((v) => (
                                                    <Chip key={v} label={v} size="small" />
                                                ))}
                                            </Stack>
                                        )}

                                        {question.helpText && (
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                display="block"
                                                sx={{ mt: 0.5 }}
                                            >
                                                {question.helpText}
                                            </Typography>
                                        )}
                                    </Box>
                                );
                            })}
                        </Stack>
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
}
