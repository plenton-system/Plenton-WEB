import type { CalendarEvent } from 'src/components/calendar';
import type { AppointmentEventsProps, AppointmentDetailProps } from 'src/types';

import { useState, useCallback } from 'react';

import { extractApiErrorMessage } from 'src/utils/api-error';

import i18n from 'src/i18n';
import { appointmentService } from 'src/services/appointment/appointmentService';

// ----------------------------------------------------------------------

/**
 * Mapeia um AppointmentDetailProps para CalendarEvent
 */
function mapAppointmentDetailToEvent(detail: AppointmentDetailProps): CalendarEvent {
    return {
        id: detail.id ?? '',
        title: detail.patientName ?? '',
        start: detail.start,
        color: detail.color,
        extendedProps: {
            categoryColor: detail.color,
            description: detail.observation,
            responsibleName: detail.nutritionistName
        }
    };
}

/**
 * Mapeia um AppointmentEventsProps para CalendarEvent
 */
function mapAppointmentToCalendarEvent(event: AppointmentEventsProps): CalendarEvent {
    return {
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        color: event.color,
        extendedProps: {
            categoryColor: event.color,
            description: event.description,
            responsibleName: event.responsible,
        }
    };
}

/**
 * Mapeia uma lista de AppointmentEventsProps para CalendarEvent[]
 */
function mapAppointmentsToCalendarEvents(events: AppointmentEventsProps[]): CalendarEvent[] {
    return events?.map(mapAppointmentToCalendarEvent);
}

interface UseAppointmentResult {
    events: CalendarEvent[];
    loadingCalendar: boolean;
    loadingForm: boolean;
    error: string | null;
    success: string | null;
    appointment: AppointmentDetailProps | null;
    fetchDetail: (id?: string) => Promise<void>;
    fetchEvents: (start: Date, end: Date) => Promise<void>;
    addEvent: (data: Omit<AppointmentDetailProps, 'id'>) => Promise<void>;
    editEvent: (data: AppointmentDetailProps) => Promise<void>;
    deleteEvent: (id: string) => Promise<boolean>;
    resetFormStatesHook: (isLoading: boolean) => void;
}

export function useAppointment(): UseAppointmentResult {
    const [loadingForm, setLoadingForm] = useState(false);
    const [loadingCalendar, setLoadingCalendar] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [events, setEvents] = useState<AppointmentEventsProps[]>([]);
    const [appointment, setAppointment] = useState<AppointmentDetailProps | null>(null);

    const resetFormStatesHook = (isLoading: boolean) => {
        setError(null);
        setSuccess(null);
        setLoadingCalendar(isLoading);
    };

    const fetchEvents = useCallback(async (start: Date, end: Date) => {
        resetFormStatesHook(true);

        try {
            // converte para string ISO (pode ajustar formato para sua API)
            const startIso = start.toISOString();
            const endIso = end.toISOString();
            const data = await appointmentService.getEvents(startIso, endIso);

            setEvents(data);
        } catch (err) {
            setError(extractApiErrorMessage(err, i18n.t('appointment.messages.loadCalendarError')));
        } finally {
            setLoadingCalendar(false);
        }
    }, []);

    const fetchDetail = useCallback(async (id?: string) => {
        if (!id) return;

        setError(null);
        setSuccess(null);
        setLoadingForm(true);

        try {
            const data = await appointmentService.getById(id);
            setAppointment(data);
        } catch (erro) {
            setError(extractApiErrorMessage(erro, i18n.t('appointment.messages.loadError')));
        } finally {
            setLoadingForm(false);
        }
    }, []);

    const addEvent = useCallback(async (data: Omit<AppointmentDetailProps, 'id'>) => {
        resetFormStatesHook(true);

        try {
            const created = await appointmentService.create(data);
            setEvents(prev => [...prev, mapAppointmentDetailToEvent(created)]);
            setSuccess(i18n.t('appointment.messages.createSuccess'));
        } catch (erro) {
            setError(extractApiErrorMessage(erro, i18n.t('appointment.messages.createError')));
        } finally {
            setLoadingCalendar(false);
        }
    }, []);

    const editEvent = useCallback(async (data: AppointmentDetailProps) => {
        resetFormStatesHook(true);

        try {
            if (data?.id) {
                const updated = await appointmentService.update(data.id, data);
                setEvents(prev =>
                    prev.map(event => (event.id === updated.id ? mapAppointmentDetailToEvent(updated) : event))
                );

                setSuccess(i18n.t('appointment.messages.updateSuccess'));
            }
        } catch (erro) {
            setError(extractApiErrorMessage(erro, i18n.t('appointment.messages.updateError')));
        } finally {
            setLoadingCalendar(false);
        }
    }, []);

    const deleteEvent = useCallback(async (id: string): Promise<boolean> => {
        resetFormStatesHook(true);

        try {
            const deleted = await appointmentService.delete(id);

            if (!deleted)
                throw new Error(i18n.t('appointment.messages.deleteError'));

            setEvents(prev => prev.filter(event => event.id !== id));
            setSuccess(i18n.t('appointment.messages.deleteSuccess'));

            return deleted;
        } catch (erro) {
            setError(extractApiErrorMessage(erro, i18n.t('appointment.messages.deleteError')));
            return false;
        } finally {
            setLoadingCalendar(false);
        }
    }, []);

    return {
        events: mapAppointmentsToCalendarEvents(events),
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
    };
}
