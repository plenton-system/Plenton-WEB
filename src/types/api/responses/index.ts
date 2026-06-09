
// ----------------------------------------------------------------------

/**
 * Propriedades de resposta de login
 */
export type LoginResponse = {
    accessToken: string;
    refreshToken: string;
    errors: string[];
    isSuccess: boolean;
};

// ----------------------------------------------------------------------

/**
 * Propriedades para paginação da tabela.
 */
export interface PagedResult<T> {
    currentPage: number;
    items: T[];
    pageSize?: number;
    totalCount: number;
    totalPages: number;
}