import type { JwtPayload } from 'src/types';

import { jwtDecode } from 'jwt-decode';

// Classe estática para utils de JWT.
// Os métodos operam sobre um token passado explicitamente (não há leitura de
// storage): o access token vive em memória (HttpAuthState) e o tenant/payload
// é derivado dele no momento do uso.
export class JwtUtils {

    /**
     * Decode genérico do token informado.
     */
    static decode<T = JwtPayload>(token?: string | null): T | null {
        if (!token) return null;
        try {
            return jwtDecode<T>(token);
        } catch {
            return null;
        }
    }

    /**
     * Retorna o payload decodificado do token JWT.
     */
    static getPayload(token?: string | null): JwtPayload | null {
        return this.decode<JwtPayload>(token);
    }

    /**
     * Retorna o ID do usuário do token JWT.
     */
    static getUserId(token?: string | null): string | null {
        return this.getPayload(token)?.id ?? null;
    }

    /**
     * Retorna o email do usuário do token JWT.
     */
    static getUserEmail(token?: string | null): string | null {
        return this.getPayload(token)?.email ?? null;
    }

    /**
     * Retorna o nome do usuário do token JWT.
     */
    static getUserName(token?: string | null): string | null {
        return this.getPayload(token)?.name ?? null;
    }

    /**
     * Retorna o papel (role) do usuário do token JWT.
     */
    static getUserRole(token?: string | null): string | string[] | null {
        return this.getPayload(token)?.role ?? null;
    }

    /**
     * Retorna o tenantId do token JWT.
     */
    static getTenantId(token?: string | null): string | null {
        return this.getPayload(token)?.tenantId ?? null;
    }

    /**
     * Retorna a data de expiração do token (timestamp unix).
     */
    static getExpiration(token?: string | null): number | null {
        return this.getPayload(token)?.exp ?? null;
    }

    /**
     * Expirado agora? (com tolerância opcional de skew)
     */
    static isExpired(token?: string, skewSeconds = 0): boolean {
        const exp = this.getExpiration(token);
        if (!exp) return true;
        const nowMs = Date.now();
        const skewMs = skewSeconds * 1000;
        return exp * 1000 <= nowMs + skewMs;
    }

    /**
     * Vai expirar em menos de X segundos?
     */
    static willExpireIn(token?: string | null, seconds = 60): boolean {
        const exp = this.getExpiration(token);
        if (!exp) return true;
        const now = Math.floor(Date.now() / 1000);
        return exp - now < seconds;
    }
}
