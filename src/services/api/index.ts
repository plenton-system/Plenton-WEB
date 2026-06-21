import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import axios from 'axios';

import i18n from 'src/i18n';

// ----------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_BASE_URL ?? 'http://localhost:5226';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    withCredentials: true
});

// =============== ADIÇÃO IMPORTANTE (ngrok) ===============
const isNgrok = typeof BASE_URL === 'string' && BASE_URL.includes('ngrok-free.app');
if (isNgrok) {
    // Global (pega até chamadas sem passar pelo interceptor de request)
    api.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';
}

// === estado somente em memória ===
let isRefreshing = false;
let isLoggingOut = false;
let queue: QueueItem[] = [];
let accessToken: string | null = null;
let refreshExecutor: null | (() => Promise<string>) = null;
let sessionExpiredHandler: null | (() => void) = null;

type QueueItem = {
    resolve: (v: any) => void;
    reject: (e: any) => void;
    config: InternalAxiosRequestConfig & { _retry?: boolean };
};

function flushQueue(newToken: string | null, error?: any) {
    const items = [...queue];
    queue = [];
    for (const { resolve, reject, config } of items) {
        if (newToken) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(config));
        } else {
            reject(error);
        }
    }
}

const isAuthRoute = (url?: string) =>
    !!url && (url.includes('/api/auth/refresh') || url.includes('/api/auth/login') || url.includes('/api/auth/logout'));

// === API pública de estado (usada pelo auth.service) ===
export const HttpAuthState = {
    setAccessToken(t: string | null) {
        accessToken = t;
    },
    getAccessToken() {
        return accessToken;
    },
    setLoggingOut(v: boolean) {
        isLoggingOut = v;
    },
    getLoggingOut() {
        return isLoggingOut;
    },
    setRefreshing(v: boolean) {
        isRefreshing = v;
    },
    getRefreshing() {
        return isRefreshing;
    },
    enqueue(p: QueueItem) {
        queue.push(p);
    },
    flushQueue,
};

// === Registra e usa um handler de refresh ===
export function registerRefreshExecutor(fn: () => Promise<string>) {
    refreshExecutor = fn;
}

// === Handler de sessão expirada (refresh falhou no meio da sessão) ===
export function registerSessionExpiredHandler(fn: () => void) {
    sessionExpiredHandler = fn;
}

function handleSessionExpired() {
    // Evita disparo duplicado quando há logout em andamento ou múltiplos 401.
    if (HttpAuthState.getLoggingOut()) return;
    HttpAuthState.setLoggingOut(true);
    HttpAuthState.setAccessToken(null);
    sessionExpiredHandler?.();
}

// === Abort global opcional (para cancelar requisições em voo no logout) ===
let globalAbortController: AbortController | null = null;
export function createRequestSignal() {
    if (!globalAbortController) globalAbortController = new AbortController();
    return globalAbortController.signal;
}
export function abortAllRequests() {
    globalAbortController?.abort();
    globalAbortController = null;
}

// ----------------------------------------------------------------------

/**
 * Interceptor do request.
 */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = HttpAuthState.getAccessToken();

    // Idioma ativo da UI → a API resolve a cultura via Accept-Language (precedência sobre a claim).
    config.headers = config.headers ?? {};
    config.headers['Accept-Language'] = i18n.resolvedLanguage ?? i18n.language ?? 'pt-BR';

    if (isNgrok) {
        (config.headers as any)['ngrok-skip-browser-warning'] = 'true';
    }

    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    // opcional: garantir signal p/ cancelar em massa
    config.signal ??= createRequestSignal();

    return config;
});

/**
 * Interceptor do response.
 */
api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        const status = error.response?.status;
        const original = (error.config ?? {}) as QueueItem['config'];

        if (
            status !== 401 || original._retry || isAuthRoute(original.url) ||
            HttpAuthState.getLoggingOut() || !HttpAuthState.getAccessToken()
        ) {
            return Promise.reject(error);
        }

        original._retry = true;

        if (HttpAuthState.getRefreshing())
            return new Promise((resolve, reject) => HttpAuthState.enqueue({ resolve, reject, config: original }));

        HttpAuthState.setRefreshing(true);

        try {
            if (!refreshExecutor)
                return Promise.reject(error);

            const newToken = await refreshExecutor();
            HttpAuthState.flushQueue(newToken);

            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${newToken}`;

            return api(original);
        } catch (e) {
            HttpAuthState.flushQueue(null, e);
            handleSessionExpired();
            return Promise.reject(e);
        } finally {
            HttpAuthState.setRefreshing(false);
        }
    }
);

export default api;
