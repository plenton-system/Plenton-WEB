import type { TFunction } from 'i18next';
import type { PatientViewProps, PatientAnamnesisItem, PatientAnamnesisStatus } from 'src/types';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MuiAlert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import { useAnamnesisByPatient } from 'src/hooks/anamnesis/use-anamnesis-by-patient';

import { fDateTimeLocale } from 'src/utils/format-time';
import { extractApiErrorMessage } from 'src/utils/api-error';

import { patientService } from 'src/services/patient/patientService';

import { Loading } from 'src/components/loading';
import { Iconify } from 'src/components/iconify';

import { WorkspaceSendAnamnesisDialog } from './workspace-send-anamnesis-dialog';
import { WorkspaceAnamnesisResponseDialog } from './workspace-anamnesis-response-dialog';

// ----------------------------------------------------------------------

type Props = {
    patientId?: string;
};

type NotifyState = { open: boolean; kind: 'success' | 'error'; message: string };

const STATUS_LABEL: Record<PatientAnamnesisStatus, 'workspace.anamnesis.status.sent' | 'workspace.anamnesis.status.submitted' | 'workspace.anamnesis.status.expired'> = {
    Sent: 'workspace.anamnesis.status.sent',
    Submitted: 'workspace.anamnesis.status.submitted',
    Expired: 'workspace.anamnesis.status.expired',
};

const STATUS_COLOR: Record<PatientAnamnesisStatus, 'default' | 'success' | 'warning'> = {
    Sent: 'default',
    Submitted: 'success',
    Expired: 'warning',
};

function formatDate(value?: string | null) {
    if (!value) return null;
    return fDateTimeLocale(value) || null;
}

function buildSecondary(item: PatientAnamnesisItem, t: TFunction) {
    if (item.status === 'Submitted') {
        const submitted = formatDate(item.submittedAtUtc);
        return submitted
            ? t('workspace.anamnesis.submittedAt', { date: submitted })
            : t('workspace.anamnesis.status.submitted');
    }
    if (item.status === 'Expired') {
        const expired = formatDate(item.expiresAtUtc);
        return expired
            ? t('workspace.anamnesis.expiredAt', { date: expired })
            : t('workspace.anamnesis.status.expired');
    }
    const sent = formatDate(item.createdAtUtc);
    const expiresAt = formatDate(item.expiresAtUtc);
    const base = sent
        ? t('workspace.anamnesis.sentAt', { date: sent })
        : t('workspace.anamnesis.status.sent');
    return expiresAt ? t('workspace.anamnesis.expiresAt', { base, date: expiresAt }) : base;
}

// ----------------------------------------------------------------------

export function WorkspaceAnamnesisTab({ patientId }: Props) {
    const { t } = useTranslation();
    const [openSend, setOpenSend] = useState(false);
    const [openResponseId, setOpenResponseId] = useState<string | null>(null);
    const [patient, setPatient] = useState<PatientViewProps | null>(null);
    const [notify, setNotify] = useState<NotifyState>({
        open: false,
        kind: 'success',
        message: '',
    });

    const { items, loading, error, refetch } = useAnamnesisByPatient(patientId);

    useEffect(() => {
        if (!patientId) {
            setPatient(null);
            return () => { };
        }
        let cancelled = false;
        patientService
            .getById(patientId)
            .then((data) => {
                if (cancelled) return;
                setPatient(data);
                if (!data?.email && !data?.phone) {
                    setNotify({
                        open: true,
                        kind: 'error',
                        message:
                            t('workspace.anamnesis.patientMissingContact'),
                    });
                }
            })
            .catch((err) => {
                if (cancelled) return;
                setPatient(null);
                setNotify({
                    open: true,
                    kind: 'error',
                    message: extractApiErrorMessage(
                        err,
                        t('workspace.anamnesis.patientLoadError')
                    ),
                });
            });
        return () => {
            cancelled = true;
        };
    }, [patientId, t]);

    const handleNotify = (evt: { kind: 'success' | 'error'; message: string }) =>
        setNotify({ open: true, kind: evt.kind, message: evt.message });

    return (
        <>
            <Card variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">{t('workspace.anamnesis.title')}</Typography>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<Iconify icon="solar:plain-2-bold" />}
                            onClick={() => setOpenSend(true)}
                            disabled={!patientId}
                        >
                            {t('workspace.anamnesis.send')}
                        </Button>
                    </Stack>

                    {loading && <Loading inline message={t('workspace.anamnesis.loading')} />}

                    {!loading && error && (
                        <MuiAlert severity="error" variant="outlined">
                            {error}
                        </MuiAlert>
                    )}

                    {!loading && !error && items.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                            {t('workspace.anamnesis.empty')}
                        </Typography>
                    )}

                    {!loading && !error && items.length > 0 && (
                        <List disablePadding>
                            {items.map((item, idx) => {
                                const clickable = item.status === 'Submitted';
                                const chip = (
                                    <Chip
                                        label={t(STATUS_LABEL[item.status])}
                                        color={STATUS_COLOR[item.status]}
                                        size="small"
                                        variant="outlined"
                                    />
                                );

                                return (
                                    <Box key={item.id}>
                                        {idx > 0 && <Divider component="li" />}
                                        {clickable ? (
                                            <ListItemButton
                                                disableGutters
                                                onClick={() => setOpenResponseId(item.id)}
                                                sx={{ px: 1, borderRadius: 1 }}
                                            >
                                                <ListItemText
                                                    primary={item.title}
                                                    secondary={buildSecondary(item, t)}
                                                />
                                                {chip}
                                            </ListItemButton>
                                        ) : (
                                            <ListItem disableGutters secondaryAction={chip}>
                                                <ListItemText
                                                    primary={item.title}
                                                    secondary={buildSecondary(item, t)}
                                                />
                                            </ListItem>
                                        )}
                                    </Box>
                                );
                            })}
                        </List>
                    )}
                </Stack>
            </Card>

            <WorkspaceSendAnamnesisDialog
                open={openSend}
                onClose={() => setOpenSend(false)}
                patient={{
                    id: patient?.id ?? patientId,
                    name: patient?.name,
                    email: patient?.email,
                    phone: patient?.phone,
                }}
                onNotify={handleNotify}
                onSent={refetch}
            />

            <WorkspaceAnamnesisResponseDialog
                open={!!openResponseId}
                onClose={() => setOpenResponseId(null)}
                responseId={openResponseId}
            />

            <Snackbar
                open={notify.open}
                autoHideDuration={4000}
                onClose={() => setNotify((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <MuiAlert
                    severity={notify.kind}
                    variant="filled"
                    onClose={() => setNotify((s) => ({ ...s, open: false }))}
                >
                    {notify.message}
                </MuiAlert>
            </Snackbar>
        </>
    );
}
