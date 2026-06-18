import type { ReactNode } from 'react';
import type { User, LoginRequest } from 'src/types';

import { useMemo, useState, useEffect, createContext } from 'react';

import { buildAndStoreUser } from 'src/utils/auth-helpers';

import i18n from 'src/i18n';
import { registerSessionExpiredHandler } from 'src/services/api';

import { authService } from '../services';
import { authStorage } from '../utils/auth-storage';

// ----------------------------------------------------------------------

export type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    authenticating: boolean;
    signIn: (credentials: LoginRequest) => Promise<void>;
    signOut: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

// ----------------------------------------------------------------------

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [authenticating, setAuthenticating] = useState(false);

    useEffect(() => {
        (async () => {

            const publicPathPrefixes = ['/sign-in', '/forgot-password', '/reset-password', '/public/'];
            if (publicPathPrefixes.some((prefix) => window.location.pathname.startsWith(prefix))) {
                setLoading(false);
                return;
            }

            // Só tenta refresh se já existir uma sessão prévia conhecida.
            // Evita 401 no console para visitantes anônimos da landing.
            if (!authStorage.getUser()) {
                setLoading(false);
                return;
            }

            const token = await authService.bootstrapSession();
            if (!token) {
                setUser(null);
                authStorage.clear();
            }
            else {
                try {
                    const userWithProfile = await buildAndStoreUser(token);
                    setUser(userWithProfile);
                } catch {
                    setUser(null);
                    authStorage.clear();
                }
            }

            setLoading(false);
        })();
    }, []);

    // Refresh falhou no meio da sessão: limpa sessão e volta para /sign-in.
    useEffect(() => {
        registerSessionExpiredHandler(() => {
            authStorage.clear();
            setUser(null);
            if (!window.location.pathname.startsWith('/sign-in')) {
                window.location.href = '/sign-in';
            }
        });
    }, []);

    const signIn = async (credentials: LoginRequest) => {
        setAuthenticating(true);

        try {
            const token = await authService.login(credentials);
            const userWithProfile = await buildAndStoreUser(token);
            setUser(userWithProfile);

        } catch (error) {
            throw typeof error === 'string' ?
                new Error(error) : error instanceof Error ?
                    error : new Error(i18n.t('auth.createError'));
        } finally {
            setAuthenticating(false);
        }
    };

    const signOut = async () => {
        try {
            await authService.logout();
        } catch { /* ignore */ }
        finally {
            authStorage.clear();
            setUser(null);

            // opcional: redirecionar
            window.location.href = '/sign-in';
        }
    };

    const value = useMemo<AuthContextType>(() => ({
        user,
        isAuthenticated: !!user,
        loading,
        authenticating,
        signIn,
        signOut,
    }), [user, loading, authenticating]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
