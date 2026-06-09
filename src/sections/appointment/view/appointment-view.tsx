import type { AppointmentDetailProps } from 'src/types';

import { useState, useEffect } from 'react';

import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import Snackbar from '@mui/material/Snackbar';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { useAppointment } from 'src/hooks/appointment/use-appointment';

import { fDateTimeUtcIso, fBuildDateTimeInput } from 'src/utils/format-time';

import { Calendar } from 'src/components/calendar';

import AppointmentFormVieww from './appointment-form-view';

// ----------------------------------------------------------------------

export function AppointmentView() {

    const {
        events,
        appointment,
        loadingCalendar,
        loadingForm,
        error,
        success,
        fetchDetail,
        fetchEvents,
        addEvent,
        editEvent,
        deleteEvent,
        resetFormStatesHook
    } = useAppointment();

    // Controle da modal
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [formInitialData, setFormInitialData] = useState<any>(null);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    // Adicionar novo
    const handleAdd = (date: string) => {
        setEditing(false);
        resetFormStates();

        /* Inicializa com valores default */
        setFormInitialData({
            start: fBuildDateTimeInput(date)
        });

        setOpen(true);
    };

    // Editar existente
    const handleEdit = async (id: string) => {
        setEditing(true);
        resetFormStates();
        await fetchDetail(id);
    };

    const handleDragDrop = async (id: string, start: Date, end?: Date) => {
        const data: AppointmentDetailProps = {
            id,
            isDragDrop: true,
            start: fDateTimeUtcIso(start),
            ...(end && { end: fDateTimeUtcIso(end) })
        };

        await editEvent(data);
    };

    // Excluir existente
    const handleDelete = async (id: string) => {
        const result = await deleteEvent(id);

        if (result) {
            setOpen(false);
            setFormInitialData(null);
        }
    };

    const handleSubmit = async (formData: AppointmentDetailProps) => {
        if (editing) {
            await editEvent(formData);
        } else {
            await addEvent(formData);
        }
    };

    const handleCancel = () => {
        setOpen(false);
        resetFormStates();
        setFormInitialData(null);
    };

    const resetFormStates = () => {
        setFormInitialData(null);
        resetFormStatesHook(false);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
        resetFormStatesHook(false)
    };

    useEffect(() => {
        if (success) {
            setOpen(false);
            setFormInitialData(null);
        }
    }, [success]);

    useEffect(() => {
        if (editing && appointment) {
            setFormInitialData(appointment);
            setOpen(true);
        }
    }, [editing, appointment]);

    useEffect(() => {
        if (error) {
            setSnackbarMessage(error);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } else if (success) {
            setSnackbarMessage(success);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        }
    }, [error, success]);

    return (
        <>
            <Paper elevation={3} sx={{ p: 2 }}>
                <Calendar
                    events={events}
                    loading={loadingCalendar}
                    onAddEvent={handleAdd}
                    onEditEvent={handleEdit}
                    onMonthChange={fetchEvents}
                    onDragDropEvent={handleDragDrop}
                />
            </Paper>

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.modal + 1, backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
                open={!!loadingForm && !open}
            >
                <CircularProgress color="primary" />
            </Backdrop>

            <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
                <AppointmentFormVieww
                    appointment={formInitialData}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    onDelete={handleDelete}
                    loading={loadingForm}
                    isEditing={editing}
                />
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbarSeverity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
}
