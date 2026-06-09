import type {
    RequestOpts,
    PublicOpenResponse,
    PublicAnamnesisSubmitRequestDto,
    PublicAnamnesisSubmitResponseDto,
    PublicAnamnesisSaveDraftRequestDto,
    PublicAnamnesisSaveDraftResponseDto,
    PublicAnamnesisAcceptConsentRequestDto,
    PublicAnamnesisAcceptConsentResponseDto,
} from 'src/types';

import { get, put, post } from 'src/utils/http-client';

// ----------------------------------------------------------------------

export const publicAnamnesisService = {

    open: async (tenantId: string, token: string, opts?: RequestOpts): Promise<PublicOpenResponse> => {
        const response = await get<{ data: PublicOpenResponse }>(
            `/api/public/${tenantId}/anamnesis/${token}`,
            opts
        );

        return response.data;
    },

    acceptConsent: async (
        tenantId: string,
        token: string,
        dto: PublicAnamnesisAcceptConsentRequestDto,
        opts?: RequestOpts
    ): Promise<PublicAnamnesisAcceptConsentResponseDto> => {
        const response = await post<{ data: PublicAnamnesisAcceptConsentResponseDto }>(
            `/api/public/${tenantId}/anamnesis/${token}/consent`,
            dto,
            opts
        );

        return response.data;
    },

    saveDraft: async (
        tenantId: string,
        token: string,
        dto: PublicAnamnesisSaveDraftRequestDto,
        opts?: RequestOpts
    ): Promise<PublicAnamnesisSaveDraftResponseDto> => {
        const response = await put<{ data: PublicAnamnesisSaveDraftResponseDto }>(
            `/api/public/${tenantId}/anamnesis/${token}/answers`,
            dto,
            opts
        );

        return response.data;
    },

    submit: async (
        tenantId: string,
        token: string,
        dto: PublicAnamnesisSubmitRequestDto,
        opts?: RequestOpts
    ): Promise<PublicAnamnesisSubmitResponseDto> => {
        const response = await post<{ data: PublicAnamnesisSubmitResponseDto }>(
            `/api/public/${tenantId}/anamnesis/${token}/submit`,
            dto,
            opts
        );

        return response.data;
    },

};
