import type { PagedResult, RequestOpts, PatientViewProps, PatientListProps, PatientListQuery, PatientDetailProps } from 'src/types';

import { get, put, del, post } from 'src/utils/http-client';

// ----------------------------------------------------------------------

export const patientService = {

    getAll: async (
        params: PatientListQuery,
        opts?: RequestOpts
    ) => {
        const qs = {
            pageIndex: params.pageIndex,
            pageSize: params.pageSize,
            value: params.value,
            orderByField: params.orderByField,
            order: params.order.toUpperCase()
        };

        const response = await get<{ data: PagedResult<PatientListProps> }>(
            '/api/patient/get-all-patients',
            { ...(opts ?? {}), params: qs }
        );
        return response.data;
    },

    getById: async (id: string): Promise<PatientViewProps> => {
        const response = await get(`/api/patient/${id}`);
        return response.data;
    },

    create: async (patientData: Omit<PatientDetailProps, 'id'>): Promise<PatientDetailProps> => {
        const response = await post<{ data: PatientDetailProps }>('/api/patient/create-patient', patientData);
        return response.data;
    },

    update: async (id: string, patientData: Partial<PatientDetailProps>): Promise<PatientDetailProps> => {
        const response = await put<{ data: PatientDetailProps }>(`/api/patient/${id}`, patientData);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await del(`/api/patient/${id}`);
    }

};
