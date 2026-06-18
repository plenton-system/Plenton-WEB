import type { PatientListQuery, AppointmentDetailProps } from "src/types";

import { useState } from 'react';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import CircularProgress from '@mui/material/CircularProgress';

import { useConfirm } from "src/hooks/common/use-confirm";

import { authStorage } from "src/utils/auth-storage";
import { fDateTimeInput, fDateTimeUtcIso } from "src/utils/format-time";
import { enumValueToString, enumStringToValue } from "src/utils/format-enum";

import { Status } from "src/enums/appointment";
import { patientService } from "src/services/patient/patientService";

import { validationSchema } from "../validation";

// ----------------------------------------------------------------------

export interface AppointmentFormViewProps {
    appointment?: AppointmentDetailProps | null;
    onSubmit: (values: AppointmentDetailProps) => void;
    onCancel: () => void;
    onDelete?: (id: string) => void;
    loading?: boolean;
    isEditing?: boolean;
}

// ----------------------------------------------------------------------

export default function AppointmentFormVieww({
    appointment,
    loading,
    isEditing,
    onSubmit,
    onCancel,
    onDelete
}: AppointmentFormViewProps) {
    const { t } = useTranslation();
    const confirm = useConfirm();
    const [patientsLoading, setPatientsLoading] = useState(false);
    const [patients, setPatients] = useState<{ id: string, name: string }[]>([]);

    const APPOINTMENT_STATUS = [
        { value: 'Scheduled', label: t('appointment.status.scheduled') },
        { value: 'Completed', label: t('appointment.status.completed') },
        { value: 'Canceled', label: t('appointment.status.canceled') },
    ];

    const user = authStorage.getUser();

    // Preenche initialValues
    const initialValues = {
        patientId: appointment?.patientId ?? '',
        nutritionistId: user?.profile?.id ?? '',
        color: appointment?.color ?? "#4caf50",
        observation: appointment?.observation ?? '',
        status: enumValueToString(Status, appointment?.status),
        tenantId: user?.tenantId ?? '',
        start: appointment?.start ?
            fDateTimeInput(appointment.start) : '',
    };

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values) => {
            onSubmit({
                ...appointment,
                patientId: values.patientId,
                nutritionistId: user?.profile?.id ?? '',
                color: values.color,
                observation: values.observation,
                status: enumStringToValue(Status, values.status),
                tenantId: user?.tenantId ?? '',
                start: fDateTimeUtcIso(values.start)
            });
        },
    });

    // Busca pacientes on demand
    const handlePatientsFocus = async () => {
        if (patients.length === 0 && !patientsLoading) {
            setPatientsLoading(true);
            try {
                const params: PatientListQuery = {
                    value: '',
                    pageIndex: 0,
                    pageSize: 20,
                    orderByField: 'name',
                    order: 'asc'
                };

                const res = await patientService.getAll(params);
                setPatients(res.items ?? []);
            } catch {
                setPatients([]);
            } finally {
                setPatientsLoading(false);
            }
        }
    };

    const handleDeleteClick = async () => {
        const ok = await confirm({
            title: t('appointment.delete.title'),
            description: t('appointment.delete.description'),
            confirmText: t('actions.delete'),
            cancelText: t('actions.cancel'),
            destructive: true,
        });

        if (!ok) return;

        if (appointment?.id)
            onDelete?.(appointment.id);
    };

    return (
        <>
            <Box sx={{ mt: 1, mr: 0, mb: 5, ml: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ flexGrow: 1 }}>
                    {isEditing ? t('appointment.form.editTitle') : t('appointment.form.newTitle')}
                </Typography>
            </Box>
            <form onSubmit={formik.handleSubmit}>
                <Card sx={{ p: 4 }}>
                    <Stack spacing={3}>
                        {/* Paciente */}
                        <TextField
                            select
                            label={t('appointment.form.patient')}
                            name="patientId"
                            value={formik.values.patientId}
                            onChange={formik.handleChange}
                            onFocus={handlePatientsFocus}
                            onClick={handlePatientsFocus}
                            error={formik.touched.patientId && Boolean(formik.errors.patientId)}
                            helperText={formik.touched.patientId && formik.errors.patientId}
                            disabled={loading || patientsLoading}
                            fullWidth
                        >
                            <MenuItem value="">{t('appointment.form.select')}</MenuItem>
                            {patientsLoading && (
                                <MenuItem value="" disabled>
                                    <CircularProgress size={18} sx={{ mr: 2 }} /> {t('common.loading')}
                                </MenuItem>
                            )}
                            {/* Garante que o paciente selecionado sempre aparece */}
                            {!patients.find(p => p.id === formik.values.patientId) &&
                                formik.values.patientId && (
                                    <MenuItem value={formik.values.patientId}>
                                        {appointment?.patientName || t('appointment.form.selectedPatient')}
                                    </MenuItem>
                                )
                            }
                            {patients.map((p) => (
                                <MenuItem key={p.id} value={p.id}>
                                    {p.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                name="start"
                                label={t('appointment.form.dateTime')}
                                type="datetime-local"
                                value={formik.values.start}
                                onChange={formik.handleChange}
                                error={formik.touched.start && Boolean(formik.errors.start)}
                                helperText={formik.touched.start && formik.errors.start}
                                slotProps={{ inputLabel: { shrink: true } }}
                                fullWidth
                                disabled={loading}
                                sx={{ flex: 1 }}
                            />

                            <TextField
                                select
                                label={t('appointment.form.status')}
                                name="status"
                                value={formik.values.status}
                                onChange={formik.handleChange}
                                error={formik.touched.status && Boolean(formik.errors.status)}
                                helperText={formik.touched.status && formik.errors.status}
                                disabled={loading}
                                fullWidth
                                sx={{ flex: 1 }}
                            >
                                {APPOINTMENT_STATUS.map(option => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        {/* Cor */}
                        <Box>
                            <InputLabel sx={{ mb: 1 }}>{t('appointment.form.color')}</InputLabel>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}>
                                <IconButton
                                    component="span"
                                    sx={{
                                        bgcolor: formik.values.color,
                                        border: '1px solid #ccc',
                                        width: 40,
                                        height: 40,
                                        p: 0,
                                        position: 'relative', // Importante!
                                        '&:hover': {
                                            opacity: 0.85,
                                            bgcolor: formik.values.color,
                                        }
                                    }}
                                    disabled={loading}
                                >
                                    <ColorLensIcon sx={{
                                        color: '#fff',
                                        filter: 'drop-shadow(0 0 2px #0007)'
                                    }} />
                                    <input
                                        id="color-input"
                                        type="color"
                                        name="color"
                                        value={formik.values.color}
                                        onChange={formik.handleChange}
                                        disabled={loading}
                                        style={{
                                            position: 'absolute',
                                            left: 0,
                                            top: 0,
                                            width: '100%',
                                            height: '100%',
                                            opacity: 0,
                                            cursor: 'pointer',
                                            border: 'none',
                                            padding: 0,
                                            margin: 0,
                                        }}
                                        tabIndex={-1}
                                    />
                                </IconButton>
                                <Typography variant="body2" sx={{ ml: 1 }}>{formik.values.color}</Typography>
                            </Box>
                            {formik.touched.color && formik.errors.color && (
                                <Typography color="error" variant="caption">
                                    {formik.errors.color}
                                </Typography>
                            )}
                        </Box>

                        {/* Observação */}
                        <TextField
                            label={t('appointment.form.observation')}
                            name="observation"
                            value={formik.values.observation}
                            onChange={formik.handleChange}
                            fullWidth
                            multiline
                            minRows={2}
                            disabled={loading}
                        />

                        {/* Botões */}
                        <Box sx={{ display: 'flex', gap: 2, mt: 1, justifyContent: 'flex-end' }}>
                            {onDelete && isEditing && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={handleDeleteClick}
                                    disabled={loading}
                                >
                                    {t('actions.delete')}
                                </Button>
                            )}
                            <Button variant="outlined" onClick={onCancel} disabled={loading}>
                                {t('actions.cancel')}
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : t('actions.save')}
                            </Button>
                        </Box>
                    </Stack>
                </Card>
            </form>
        </>
    );
}
