import type { PagedResult, RequestOpts, AnamnesisListProps, AnamnesisCreateDto, AnamnesisListQuery, PatientAnamnesisItem, AnamnesisFormViewProps, AnamnesisResponseDetail, AnamnesisSendPublicLinkRequestDto, AnamnesisSendPublicLinkResponseDto, AnamnesisSendPublicEmailRequestDto, AnamnesisSendPublicEmailResponseDto } from 'src/types';

import { get, put, del, post } from 'src/utils/http-client';
import { extractFileNameFromContentDisposition } from 'src/utils/format-file';

import api from 'src/services/api';

export const anamnesisService = {

    getAll: async (
        params: AnamnesisListQuery,
        opts?: RequestOpts
    ) => {
        const qs = {
            pageIndex: params.pageIndex,
            pageSize: params.pageSize,
            value: params.value,
            orderByField: params.orderByField,
            order: params.order.toUpperCase()
        };

        const response = await get<{ data: PagedResult<AnamnesisListProps> }>(
            '/api/anamnesis/get-all-anamnesis',
            { ...(opts ?? {}), params: qs }
        );
        return response.data;
    },

    getById: async (id: string, opts?: RequestOpts): Promise<AnamnesisFormViewProps> => {
        const response = await get<{ data: AnamnesisFormViewProps }>(`/api/anamnesis/${id}`, opts);
        return response.data;
    },

    create: async (dto: Omit<AnamnesisCreateDto, 'id'>, opts?: RequestOpts): Promise<{ id: string }> => {
        const response = await post<{ data: { id: string } }>('/api/anamnesis', dto, opts);
        return response.data;
    },

    update: async (id: string, dto: AnamnesisCreateDto, opts?: RequestOpts): Promise<void> => {
        await put(`/api/anamnesis/${id}`, dto, opts);
    },

    delete: async (id: string, opts?: RequestOpts): Promise<void> => {
        await del(`/api/anamnesis/${id}`, opts);
    },

    sendPublic: async (
        id: string,
        dto: AnamnesisSendPublicLinkRequestDto,
        opts?: RequestOpts
    ): Promise<AnamnesisSendPublicLinkResponseDto> => {
        const response = await post<{ data: AnamnesisSendPublicLinkResponseDto }>(
            `/api/anamnesis/${id}/send-public`,
            dto,
            opts
        );
        return response.data;
    },

    sendPublicEmail: async (
        id: string,
        dto: AnamnesisSendPublicEmailRequestDto,
        opts?: RequestOpts
    ): Promise<AnamnesisSendPublicEmailResponseDto> => {
        const response = await post<{ data: AnamnesisSendPublicEmailResponseDto }>(
            `/api/anamnesis/${id}/send-public-email`,
            dto,
            opts
        );
        return response.data;
    },

    getByPatient: async (
        patientId: string,
        opts?: RequestOpts
    ): Promise<PatientAnamnesisItem[]> => {
        const response = await get<{ data: PatientAnamnesisItem[] }>(
            `/api/anamnesis/by-patient/${patientId}`,
            opts
        );
        return response.data ?? [];
    },

    getResponseById: async (
        responseId: string,
        opts?: RequestOpts
    ): Promise<AnamnesisResponseDetail> => {
        const response = await get<{ data: AnamnesisResponseDetail }>(
            `/api/anamnesis/responses/${responseId}`,
            opts
        );
        return response.data;
    },

    downloadResponsePdf: async (
        responseId: string
    ): Promise<{ blob: Blob; fileName: string }> => {
        const response = await api.get<Blob>(
            `/api/anamnesis/responses/${responseId}/pdf`,
            { responseType: 'blob' }
        );

        const fileName =
            extractFileNameFromContentDisposition(response.headers?.['content-disposition']) ??
            `anamnese-${responseId}.pdf`;

        return { blob: response.data, fileName };
    },

};
