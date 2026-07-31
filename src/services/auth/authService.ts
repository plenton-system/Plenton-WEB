import type {
    Profile,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    ChangePasswordDto,
    ResetPasswordRequest,
    ForgotPasswordRequest,
    ActivatePatientAccountRequest,
} from 'src/types';

import { get, post } from 'src/utils/http-client';
import { authStorage } from 'src/utils/auth-storage';
import { extractApiErrorMessage } from 'src/utils/api-error';

import i18n from 'src/i18n';
import { HttpAuthState, abortAllRequests, registerRefreshExecutor } from 'src/services/api';

// ----------------------------------------------------------------------

let refreshPromise: Promise<string> | null = null;

const performRefresh = async (): Promise<string> => {
    const data = await post<any>('/api/auth/refresh', {}, { withCredentials: true });
    const accessToken: string | undefined =
        data?.accessToken ?? data?.token?.accessToken ?? data?.Token?.AccessToken;

    if (!accessToken)
        throw new Error(i18n.t('auth.errors.refresh'));

    HttpAuthState.setAccessToken(accessToken);
    return accessToken;
};

export const authService = {

    register: async (payload: RegisterRequest): Promise<void> => {
        try {
            await post('/api/auth/register', payload);
        } catch (err) {
            throw new Error(extractApiErrorMessage(err, i18n.t('auth.errors.register')));
        }
    },

    forgotPassword: async (payload: ForgotPasswordRequest): Promise<void> => {
        try {
            await post('/api/auth/forgot-password', payload);
        } catch (err) {
            throw new Error(extractApiErrorMessage(err, i18n.t('auth.forgot.requestError')));
        }
    },

    resetPassword: async (payload: ResetPasswordRequest): Promise<void> => {
        try {
            await post('/api/auth/reset-password', payload);
        } catch (err) {
            throw new Error(extractApiErrorMessage(err, i18n.t('auth.reset.requestError')));
        }
    },

    activatePatientAccount: async (payload: ActivatePatientAccountRequest): Promise<void> => {
        try {
            await post('/api/auth/patient/activate', payload);
        } catch (err) {
            throw new Error(extractApiErrorMessage(err, i18n.t('auth.activate.requestError')));
        }
    },

    login: async (credentials: LoginRequest) => {
        try {
            const data = await post<LoginResponse>('/api/auth/login', credentials);

            if (!data?.accessToken || !data.isSuccess || (data.errors?.length ?? 0) > 0) {
                const msg = data?.errors?.join(', ') || i18n.t('auth.errors.login');
                throw new Error(msg);
            }

            HttpAuthState.setAccessToken(data.accessToken);
            return data.accessToken;
        } catch (err) {
            throw new Error(extractApiErrorMessage(err, i18n.t('auth.errors.invalidCredentials')));
        }
    },

    refresh: (): Promise<string> => {
        refreshPromise ??= performRefresh().finally(() => {
            refreshPromise = null;
        });

        return refreshPromise;
    },

    logout: async () => {
        try {
            HttpAuthState.setLoggingOut(true);
            abortAllRequests();                 // cancela requisições em voo
            await post('/api/auth/logout');     // limpa cookie httpOnly no servidor
        } finally {
            HttpAuthState.setAccessToken(null);
            authStorage.clear();
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
            throw new Error(extractApiErrorMessage(err, i18n.t('profile.password.error')));
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
