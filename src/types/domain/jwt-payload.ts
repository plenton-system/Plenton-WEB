// ----------------------------------------------------------------------

/**
 * Propriedades presentes no Token Jwt.
 */
export type JwtPayload = {
    id: string;
    name: string;
    email: string;
    exp: number;
    tenantId: string;
    role: string | string[];
};
