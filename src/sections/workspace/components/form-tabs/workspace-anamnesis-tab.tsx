import type { PatientViewProps, PatientAnamnesisItem, PatientAnamnesisStatus } from 'src/types';

import { useState, useEffect } from 'react';

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

const STATUS_LABEL: Record<PatientAnamnesisStatus, string> = {
    Sent: 'Enviada',
    Submitted: 'Respondida',
    Expired: 'Expirada',
};

const STATUS_COLOR: Record<PatientAnamnesisStatus, 'default' | 'success' | 'warning'> = {
    Sent: 'default',
    Submitted: 'success',
    Expired: 'warning',
};

function formatDate(value?: string | null) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString();
}

function buildSecondary(item: PatientAnamnesisItem) {
    if (item.status === 'Submitted') {
        const submitted = formatDate(item.submittedAtUtc);
        return submitted ? `Respondida em ${submitted}` : 'Respondida';
    }
    if (item.status === 'Expired') {
        const expired = formatDate(item.expiresAtUtc);
        return expired ? `Expirou em ${expired}` : 'Expirou';
    }
    const sent = formatDate(item.createdAtUtc);
    const expiresAt = formatDate(item.expiresAtUtc);
    const base = sent ? `Enviada em ${sent}` : 'Enviada';
    return expiresAt ? `${base} · expira em ${expiresAt}` : base;
}

// ----------------------------------------------------------------------

export function WorkspaceAnamnesisTab({ patientId }: Props) {
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
                            'Paciente sem e-mail/telefone cadastrados. Preencha manualmente para enviar.',
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
                        'Não foi possível carregar os dados do paciente (e-mail/telefone).'
                    ),
                });
            });
        return () => {
            cancelled = true;
        };
    }, [patientId]);

    const handleNotify = (evt: { kind: 'success' | 'error'; message: string }) =>
        setNotify({ open: true, kind: evt.kind, message: evt.message });

    return (
        <>
            <Card variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">Anamnese</Typography>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<Iconify icon="solar:plain-2-bold" />}
                            onClick={() => setOpenSend(true)}
                            disabled={!patientId}
                        >
                            Enviar
                        </Button>
                    </Stack>

                    {loading && <Loading inline message="Carregando anamneses..." />}

                    {!loading && error && (
                        <MuiAlert severity="error" variant="outlined">
                            {error}
                        </MuiAlert>
                    )}

                    {!loading && !error && items.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                            Nenhuma anamnese enviada ainda para este paciente.
                        </Typography>
                    )}

                    {!loading && !error && items.length > 0 && (
                        <List disablePadding>
                            {items.map((item, idx) => {
                                const clickable = item.status === 'Submitted';
                                const chip = (
                                    <Chip
                                        label={STATUS_LABEL[item.status]}
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
                                                    secondary={buildSecondary(item)}
                                                />
                                                {chip}
                                            </ListItemButton>
                                        ) : (
                                            <ListItem disableGutters secondaryAction={chip}>
                                                <ListItemText
                                                    primary={item.title}
                                                    secondary={buildSecondary(item)}
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
