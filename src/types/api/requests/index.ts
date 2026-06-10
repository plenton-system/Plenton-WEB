import type { AxiosRequestConfig } from "axios";

// ----------------------------------------------------------------------

/**
 * Propriedades de paginação.
 */
export type PagedRequest = {
    pageIndex: number;
    pageSize: number;
};

// ----------------------------------------------------------------------

/**
 * Propriedades opcionais para os request.
 */
export type RequestOpts = AxiosRequestConfig & {
    signal?: AbortSignal;
};

// ----------------------------------------------------------------------

/**
 * Propriedades da requisição de login
 */
export type LoginRequest = {
    email: string;
    password: string;
};

// ----------------------------------------------------------------------

/**
 * Payload mínimo para cadastro público de nutricionista (sign-up).
 */
export type RegisterRequest = {
    name: string;
    email: string;
    password: string;
    crn?: string | null;
    phone?: string;
    address: {
        street: string;
        number: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
    };
};

// ----------------------------------------------------------------------

/**
 * Payload para iniciar "esqueci minha senha".
 */
export type ForgotPasswordRequest = {
    email: string;
};

/**
 * Payload para concluir a redefinição de senha.
 */
export type ResetPasswordRequest = {
    email: string;
    token: string;
    newPassword: string;
};
