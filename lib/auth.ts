import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
    clearAuthSession,
    getAuthTokens,
    persistAuthSession,
    readAuthSession,
    AuthSessionData,
    UserData,
} from './sessionCookie';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const createClient = () =>
    axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    });

export const apiClient = createClient();

type PendingRequest = (token: string | null) => void;

let isRefreshing = false;
let pendingRequests: PendingRequest[] = [];
let isRedirecting = false;

const enqueue = (callback: PendingRequest) => pendingRequests.push(callback);

const flushQueue = (token: string | null) => {
    pendingRequests.forEach(callback => callback(token));
    pendingRequests = [];
};

const refreshSession = async () => {
    const session = readAuthSession();
    const refreshToken = session?.session.refreshToken;

    if (!refreshToken) {
        throw new Error('Refresh token absent');
    }

    const response = await createClient().post('/auth/refresh', {
        refreshToken,
    });
    const data = response.data?.data;

    if (!data) {
        throw new Error('Refresh payload missing');
    }

    persistAuthSession(data);

    return data.session.token as string;
};

const redirectToLogin = () => {
    if (isRedirecting || typeof window === 'undefined') {
        return;
    }

    isRedirecting = true;
    window.location.replace('/login');
};

const attachAuthorization = (config: InternalAxiosRequestConfig) => {
    const tokens = getAuthTokens();
    const token = tokens?.token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
};

apiClient.interceptors.request.use(attachAuthorization);

apiClient.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const status = error.response?.status;
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (status !== 401 || originalRequest?._retry) {
            if (status === 401) {
                clearAuthSession();
                redirectToLogin();
            }

            const normalized = {
                status: error.response?.status ?? 0,
                message:
                    (error.response?.data as { message?: string })?.message ??
                    error.message,
                data: error.response?.data,
            };

            return Promise.reject(normalized);
        }

        if (originalRequest.url?.includes('/auth/refresh')) {
            clearAuthSession();
            redirectToLogin();
            return Promise.reject(error);
        }

        if (!readAuthSession()) {
            clearAuthSession();
            redirectToLogin();

            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                enqueue(token => {
                    if (!token) {
                        reject(error);
                        return;
                    }

                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    resolve(apiClient(originalRequest));
                });
            });
        }

        isRefreshing = true;

        try {
            const newToken = await refreshSession();
            flushQueue(newToken);

            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            return apiClient(originalRequest);
        } catch (refreshError) {
            flushQueue(null);
            clearAuthSession();
            redirectToLogin();

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

// Auth API methods
export const AuthAPI = {
    async login(email: string, password: string) {
        const response = await createClient().post('/auth/login', {
            email,
            password,
        });
        const data = response.data;

        if (data.success && data.data) {
            persistAuthSession(data.data as AuthSessionData);
        }

        return data;
    },

    async refresh(refreshToken: string) {
        const response = await createClient().post('/auth/refresh', {
            refreshToken,
        });
        const data = response.data;

        if (data.success && data.data) {
            persistAuthSession(data.data as AuthSessionData);
        }

        return data;
    },

    async logout() {
        const tokens = getAuthTokens();

        if (tokens?.token) {
            try {
                await createClient().post(
                    '/auth/logout',
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${tokens.token}`,
                        },
                    }
                );
            } catch (error) {
                console.error('Erreur lors du logout:', error);
            }
        }

        clearAuthSession();

        if (typeof window !== 'undefined') {
            window.location.replace('/login');
        }
    },
};

// Legacy exports for compatibility
export const authConfig = {
    baseUrl: '/api/auth',
    storageKeys: {
        accessToken: 'konama_access_token',
        refreshToken: 'konama_refresh_token',
        user: 'konama_user',
    },
    tokenRefreshBuffer: 5 * 60 * 1000,
} as const;

export class AuthStorage {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static setTokens(..._args: [string, string, number]): void {
        // This method is deprecated, use persistAuthSession instead
        console.warn(
            'AuthStorage.setTokens is deprecated, use persistAuthSession instead'
        );
    }

    static getTokens(): {
        accessToken: string | null;
        refreshToken: string | null;
        expiresAt: number | null;
    } {
        // This method is deprecated, use getAuthTokens instead
        console.warn(
            'AuthStorage.getTokens is deprecated, use getAuthTokens instead'
        );
        const tokens = getAuthTokens();
        return {
            accessToken: tokens?.token || null,
            refreshToken: tokens?.refreshToken || null,
            expiresAt: null,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static setUser(..._args: [Record<string, unknown>]): void {
        // This method is deprecated, user is now stored in session cookie
        console.warn(
            'AuthStorage.setUser is deprecated, user is now stored in session cookie'
        );
    }

    static getUser(): UserData | null {
        const session = readAuthSession();
        return session?.user || null;
    }

    static clearAll(): void {
        clearAuthSession();
    }

    static shouldRefreshToken(): boolean {
        const session = readAuthSession();
        if (!session) return false;

        const now = Date.now();
        const expiresAt = new Date(session.session.expiresAt).getTime();
        return now >= expiresAt - authConfig.tokenRefreshBuffer;
    }

    static isTokenExpired(): boolean {
        const session = readAuthSession();
        if (!session) return true;

        return Date.now() >= new Date(session.session.expiresAt).getTime();
    }
}
