import type { RequestOpts, AppointmentEventsProps, AppointmentDetailProps } from 'src/types';

import { get, put, del, post } from 'src/utils/http-client';

// ----------------------------------------------------------------------

export const appointmentService = {

    getEvents: async (start: string, end: string, opts?: RequestOpts): Promise<AppointmentEventsProps[]> => {
        const response = await get<{ data: AppointmentEventsProps[] }>(
            '/api/appointment/get-events',
            { params: { start, end }, ...opts }
        );
        return response.data;
    },

    getById: async (id: string, opts?: RequestOpts): Promise<AppointmentDetailProps> => {
        const response = await get<{ data: AppointmentDetailProps }>(`/api/appointment/${id}`, opts);
        return response.data;
    },

    create: async (appointment: Omit<AppointmentDetailProps, 'id'>, opts?: RequestOpts): Promise<AppointmentDetailProps> => {
        const response = await post<{ data: AppointmentDetailProps }>(
            '/api/appointment/create-schedule',
            appointment,
            opts
        );
        return response.data;
    },

    update: async (id: string, appointment: AppointmentDetailProps, opts?: RequestOpts): Promise<AppointmentDetailProps> => {
        const response = await put<{ data: AppointmentDetailProps }>(
            `/api/appointment/${id}`,
            appointment,
            opts
        );
        return response.data;
    },

    delete: async (id: string, opts?: RequestOpts): Promise<boolean> => {
        const status = await del(`/api/appointment/${id}`, opts);
        return (status === 204);
    }
};
