import type {
    AnamnesisListProps,
    AnamnesisSendPublicLinkResponseDto,
    AnamnesisSendPublicEmailResponseDto,
} from 'src/types';

import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { extractApiErrorMessage } from 'src/utils/api-error';

import i18n from 'src/i18n';
import { anamnesisService } from 'src/services/anamnesis/anamnesisService';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Channel = 'copy' | 'whatsapp' | 'email';

type Props = {
    open: boolean;
    onClose: () => void;
    patient: {
        id?: string;
        name?: string;
        email?: string;
        phone?: string;
    };
    onNotify?: (evt: { kind: 'success' | 'error'; message: string }) => void;
    onSent?: () => void;
};

type FormState = {
    anamnesisId: string;
    email: string;
    phone: string;
    expiresAtLocal: string;
};

// ----------------------------------------------------------------------

function toIsoFromLocal(value: string): string | null {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
}

/**
 * Remove tudo que não é dígito. Se sobrar só DDD+número (10–11 dígitos), prefixa 55.
 */
function sanitizePhoneForWhatsApp(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length <= 11 && !digits.startsWith('55')) return `55${digits}`;
    return digits;
}

// ----------------------------------------------------------------------

export function WorkspaceSendAnamnesisDialog({ open, onClose, patient, onNotify, onSent }: Props) {
    const { t } = useTranslation();
    const [templates, setTemplates] = useState<AnamnesisListProps[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [form, setForm] = useState<FormState>({
        anamnesisId: '',
        email: patient.email ?? '',
        phone: patient.phone ?? '',
        expiresAtLocal: '',
    });
    const [submittingChannel, setSubmittingChannel] = useState<Channel | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lastLink, setLastLink] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setForm({
            anamnesisId: '',
            email: patient.email ?? '',
            phone: patient.phone ?? '',
            expiresAtLocal: '',
        });
        setLastLink(null);
        setError(null);
        setSubmittingChannel(null);
    }, [open, patient.email, patient.phone]);

    useEffect(() => {
        if (!open) return () => { };

        let cancelled = false;
        setLoadingTemplates(true);

        anamnesisService
            .getAll({ pageIndex: 0, pageSize: 100, value: '', orderByField: 'title', order: 'asc' })
            .then((page) => {
                if (!cancelled) setTemplates(page?.items ?? []);
            })
            .catch(() => {
                if (!cancelled) setError(t('workspace.anamnesis.sendDialog.loadError'));
            })
            .finally(() => {
                if (!cancelled) setLoadingTemplates(false);
            });

        return () => {
            cancelled = true;
        };
    }, [open, t]);

    const handleChange =
        (field: keyof FormState) =>
            (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                setForm((prev) => ({ ...prev, [field]: event.target.value }));
            };

    const validateBase = (channel: Channel): string | null => {
        if (!form.anamnesisId) return t('workspace.anamnesis.sendDialog.selectRequired');
        if (channel === 'email' && !form.email.trim()) return t('workspace.anamnesis.sendDialog.emailRequired');
        if (channel === 'whatsapp' && !form.phone.trim())
            return t('workspace.anamnesis.sendDialog.phoneRequired');
        return null;
    };

    const ensureLink = useCallback(
        async (channel: Channel): Promise<AnamnesisSendPublicLinkResponseDto | null> => {
            if (lastLink) {
                return {
                    responseId: '',
                    token: '',
                    url: lastLink,
                    expiresAtUtc: toIsoFromLocal(form.expiresAtLocal),
                };
            }

            try {
                const dto = {
                    patientId: patient.id ?? null,
                    patientName: patient.name?.trim() || null,
                    patientEmail: channel === 'email' ? form.email.trim() : patient.email ?? null,
                    patientPhone: channel === 'whatsapp' ? form.phone.trim() : patient.phone ?? null,
                    expiresAtUtc: toIsoFromLocal(form.expiresAtLocal),
                    language: i18n.resolvedLanguage ?? i18n.language,
                };
                const result = await anamnesisService.sendPublic(form.anamnesisId, dto);
                setLastLink(result.url);
                onSent?.();
                return result;
            } catch (e: any) {
                const message = extractApiErrorMessage(e, t('workspace.anamnesis.sendDialog.linkError'));
                setError(message);
                onNotify?.({ kind: 'error', message });
                return null;
            }
        },
        [lastLink, form.anamnesisId, form.email, form.phone, form.expiresAtLocal, patient.id, patient.name, patient.email, patient.phone, onNotify, onSent, t]
    );

    const handleCopy = async () => {
        const validationError = validateBase('copy');
        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null);
        setSubmittingChannel('copy');

        try {
            const link = await ensureLink('copy');
            if (!link) return;

            await navigator.clipboard.writeText(link.url);
            onNotify?.({ kind: 'success', message: t('workspace.anamnesis.sendDialog.copied') });
        } catch {
            onNotify?.({ kind: 'error', message: t('workspace.anamnesis.sendDialog.clipboardError') });
        } finally {
            setSubmittingChannel(null);
        }
    };

    const handleWhatsApp = async () => {
        const validationError = validateBase('whatsapp');
        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null);
        setSubmittingChannel('whatsapp');

        try {
            const link = await ensureLink('whatsapp');
            if (!link) return;

            const phone = sanitizePhoneForWhatsApp(form.phone);
            const text = encodeURIComponent(
                patient.name?.trim()
                    ? t('workspace.anamnesis.sendDialog.whatsappGreeting', {
                        name: patient.name.trim(),
                        link: link.url,
                    })
                    : t('workspace.anamnesis.sendDialog.whatsappGreetingGeneric', { link: link.url })
            );
            const url = `https://wa.me/${phone}?text=${text}`;
            window.open(url, '_blank', 'noopener,noreferrer');
            onNotify?.({ kind: 'success', message: t('workspace.anamnesis.sendDialog.whatsappOpened') });
        } finally {
            setSubmittingChannel(null);
        }
    };

    const handleEmail = async () => {
        const validationError = validateBase('email');
        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null);
        setSubmittingChannel('email');

        try {
            const dto = {
                email: form.email.trim(),
                patientId: patient.id ?? null,
                patientName: patient.name?.trim() || null,
                patientPhone: patient.phone || null,
                expiresAtUtc: toIsoFromLocal(form.expiresAtLocal),
                language: i18n.resolvedLanguage ?? i18n.language,
            };
            const result: AnamnesisSendPublicEmailResponseDto = await anamnesisService.sendPublicEmail(
                form.anamnesisId,
                dto
            );

            setLastLink(result.url);
            onSent?.();

            if (result.emailSent) {
                onNotify?.({
                    kind: 'success',
                    message: t('workspace.anamnesis.sendDialog.emailSent', { email: dto.email }),
                });
            } else {
                onNotify?.({
                    kind: 'error',
                    message: t('workspace.anamnesis.sendDialog.emailPartialError'),
                });
            }
        } catch (e: any) {
            const message = extractApiErrorMessage(e, t('workspace.anamnesis.sendDialog.emailError'));
            setError(message);
            onNotify?.({ kind: 'error', message });
        } finally {
            setSubmittingChannel(null);
        }
    };

    const closing = submittingChannel !== null;

    return (
        <Dialog open={open} onClose={closing ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pr: 1,
                }}
            >
                <span>{t('workspace.anamnesis.sendDialog.title')}</span>
                <IconButton
                    aria-label={t('actions.close')}
                    onClick={onClose}
                    disabled={closing}
                    size="small"
                >
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2}>
                    {patient.name && (
                        <Typography variant="body2" color="text.secondary">
                            {t('workspace.anamnesis.sendDialog.patient', { name: patient.name })}
                        </Typography>
                    )}

                    <TextField
                        select
                        label={t('workspace.anamnesis.sendDialog.questionnaire')}
                        value={form.anamnesisId}
                        onChange={handleChange('anamnesisId')}
                        fullWidth
                        disabled={loadingTemplates || closing}
                        helperText={loadingTemplates ? t('workspace.anamnesis.sendDialog.loadingQuestionnaires') : undefined}
                    >
                        {templates.length === 0 && !loadingTemplates && (
                            <MenuItem value="" disabled>
                                {t('workspace.anamnesis.sendDialog.emptyQuestionnaires')}
                            </MenuItem>
                        )}
                        {templates.map((template) => (
                            <MenuItem key={template.id} value={template.id}>
                                {template.title}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label={t('workspace.anamnesis.sendDialog.email')}
                        type="email"
                        value={form.email}
                        onChange={handleChange('email')}
                        fullWidth
                        disabled={closing}
                        helperText={t('workspace.anamnesis.sendDialog.emailHint')}
                    />

                    <TextField
                        label={t('workspace.anamnesis.sendDialog.phone')}
                        value={form.phone}
                        onChange={handleChange('phone')}
                        fullWidth
                        disabled={closing}
                        helperText={t('workspace.anamnesis.sendDialog.phoneHint')}
                    />

                    <TextField
                        label={t('workspace.anamnesis.sendDialog.expiresAt')}
                        type="datetime-local"
                        value={form.expiresAtLocal}
                        onChange={handleChange('expiresAtLocal')}
                        fullWidth
                        disabled={closing}
                        slotProps={{ inputLabel: { shrink: true } }}
                        helperText={t('workspace.anamnesis.sendDialog.expiresHint')}
                    />

                    {lastLink && (
                        <Alert severity="info">
                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                {t('workspace.anamnesis.sendDialog.generatedLink', { link: lastLink })}
                            </Typography>
                        </Alert>
                    )}

                    {error && <Alert severity="error">{error}</Alert>}

                    <Box sx={{ pt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            {t('workspace.anamnesis.sendDialog.chooseChannel')}
                        </Typography>
                    </Box>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <Tooltip title={t('workspace.anamnesis.sendDialog.copyTooltip')}>
                            <Button
                                fullWidth
                                variant="outlined"
                                disabled={closing}
                                onClick={handleCopy}
                                startIcon={
                                    submittingChannel === 'copy' ? (
                                        <CircularProgress size={16} color="inherit" />
                                    ) : (
                                        <Iconify icon="solar:copy-bold" />
                                    )
                                }
                            >
                                {t('workspace.anamnesis.sendDialog.copy')}
                            </Button>
                        </Tooltip>

                        <Tooltip title={t('workspace.anamnesis.sendDialog.whatsappTooltip')}>
                            <Button
                                fullWidth
                                variant="outlined"
                                disabled={closing}
                                onClick={handleWhatsApp}
                                startIcon={
                                    submittingChannel === 'whatsapp' ? (
                                        <CircularProgress size={16} color="inherit" />
                                    ) : (
                                        <Iconify icon="ic:baseline-whatsapp" />
                                    )
                                }
                            >
                                WhatsApp
                            </Button>
                        </Tooltip>

                        <Tooltip title={t('workspace.anamnesis.sendDialog.emailTooltip')}>
                            <Button
                                fullWidth
                                variant="contained"
                                disabled={closing}
                                onClick={handleEmail}
                                startIcon={
                                    submittingChannel === 'email' ? (
                                        <CircularProgress size={16} color="inherit" />
                                    ) : (
                                        <Iconify icon="solar:letter-bold" />
                                    )
                                }
                            >
                                E-mail
                            </Button>
                        </Tooltip>
                    </Stack>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
