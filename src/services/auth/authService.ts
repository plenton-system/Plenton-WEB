import type { Profile, LoginRequest, LoginResponse, RegisterRequest, ChangePasswordDto, ResetPasswordRequest, ForgotPasswordRequest } from 'src/types';

import { get, post } from 'src/utils/http-client';
import { authStorage } from 'src/utils/auth-storage';
import { extractApiErrorMessage } from 'src/utils/api-error';

import { HttpAuthState, abortAllRequests, registerRefreshExecutor } from 'src/services/api';

// ----------------------------------------------------------------------

export const authService = {

    register: async (payload: RegisterRequest): Promise<void> => {
        try {
            await post('/api/auth/register', payload);
        } catch (err) {
            throw new Error(extractApiErrorMessage(err, 'Não foi possível concluir o cadastro.'));
        }
    },

    forgotPassword: async (payload: ForgotPasswordRequest): Promise<void> => {
        try {
            await post('/api/auth/forgot-password', payload);
        } catch (err) {
            throw new Error(extractApiErrorMessage(err, 'Não foi possível processar a solicitação.'));
        }
    },

    resetPassword: async (payload: ResetPasswordRequest): Promise<void> => {
        try {
            await post('/api/auth/reset-password', payload);
        } catch (err) {
            throw new Error(extractApiErrorMessage(err, 'Não foi possível redefinir a senha.'));
        }
    },

    login: async (credentials: LoginRequest) => {
        try {
            const data = await post<LoginResponse>('/api/auth/login', credentials);

            if (!data?.accessToken || !data.isSuccess || (data.errors?.length ?? 0) > 0) {
                const msg = data?.errors?.join(', ') || 'Falha no login';
                throw new Error(msg);
            }

            HttpAuthState.setAccessToken(data.accessToken);
            return data.accessToken;
        } catch (err) {
            throw new Error(extractApiErrorMessage(err, 'E-mail ou senha inválidos.'));
        }
    },

    refresh: async (): Promise<string> => {
        const data = await post<any>('/api/auth/refresh', {}, { withCredentials: true });
        const accessToken: string | undefined =
            data?.accessToken ?? data?.token?.accessToken ?? data?.Token?.AccessToken;

        if (!accessToken)
            throw new Error('Refresh não retornou accessToken');

        HttpAuthState.setAccessToken(accessToken);
        return accessToken;
    },

    logout: async () => {
        try {
            HttpAuthState.setLoggingOut(true);
            abortAllRequests();                 // cancela requisições em voo
            HttpAuthState.setAccessToken(null); // zera token antes de chamar o backend
            authStorage.clear();
            await post('/api/auth/logout');     // limpa cookie httpOnly no servidor
        } finally {
            HttpAuthState.setLoggingOut(false);
        }
    },

    getUserProfile: async () => {
        const response = await get<{ data: Profile }>('/api/auth/profile');
        return response.data;
    },

    changePassword: async (dto: ChangePasswordDto) => {
        try {
            await post('/api/auth/change-password', dto);
        } catch (err) {
            throw new Error(extractApiErrorMessage(err, 'Não foi possível alterar a senha.'));
        }
    },

    bootstrapSession: async (): Promise<string | null> => {
        try {
            const token = await authService.refresh();
            return token ?? null;
        } catch {
            HttpAuthState.setAccessToken(null);
            authStorage.clear();
            return null;
        }
    },
};

registerRefreshExecutor(authService.refresh);
