// Authentication hook for state management

'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { User, Session, Client, AuthState, LoginRequest } from '@/types/auth';
import {
    readAuthSession,
    clearAuthSession,
    persistAuthSession,
    isSessionExpired,
    isRefreshTokenExpired,
    AuthSessionData
} from '@/lib/sessionCookie';
import { AuthAPI } from '@/lib/auth';
import { authFetch } from '@/lib/authFetch';

interface AuthContextType {
    // AuthState properties
    user: User | null;
    session: Session | null;
    client: Client | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    // Additional auth methods
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
    clearError: () => void;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        session: null,
        client: null,
        isLoading: true,
        isAuthenticated: false,
    });
    const [error, setError] = useState<string | null>(null);

    // Initialize auth state from session cookie
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const sessionData = readAuthSession();

                if (sessionData) {
                    // Check if session is expired
                    if (isRefreshTokenExpired()) {
                        // Refresh token expired, clear session
                        clearAuthSession();
                        setAuthState((prev: AuthState) => ({ ...prev, isLoading: false }));
                    } else if (isSessionExpired()) {
                        // Access token expired but refresh token valid, attempt refresh
                        handleRefreshToken(sessionData.session.refreshToken);
                    } else {
                        // Valid session found
                        setAuthState({
                            user: sessionData.user,
                            session: sessionData.session,
                            client: sessionData.client,
                            isLoading: false,
                            isAuthenticated: true,
                        });
                    }
                } else {
                    setAuthState((prev: AuthState) => ({ ...prev, isLoading: false }));
                }
            } catch (error) {
                console.error('Error initializing auth state:', error);
                clearAuthSession();
                setAuthState((prev: AuthState) => ({ ...prev, isLoading: false }));
            }
        };

        initializeAuth();
    }, []);

    const handleLogin = useCallback(async (email: string, password: string) => {
        try {
            setError(null);
            setAuthState((prev: AuthState) => ({ ...prev, isLoading: true }));

            const response = await AuthAPI.login(email, password);

            if (response.success && response.data) {
                const { user, session, client } = response.data;

                setAuthState({
                    user,
                    session,
                    client,
                    isLoading: false,
                    isAuthenticated: true,
                });
            } else {
                throw new Error(response.message || 'Échec de la connexion');
            }
        } catch (error) {
            console.error('Login failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Échec de la connexion';
            setError(errorMessage);
            setAuthState((prev: AuthState) => ({
                ...prev,
                isLoading: false,
                isAuthenticated: false,
                user: null,
                session: null,
                client: null
            }));
            throw new Error(errorMessage);
        }
    }, []);

    const handleRefreshToken = useCallback(async (refreshTokenValue?: string) => {
        try {
            const sessionData = readAuthSession();
            const tokenToUse = refreshTokenValue || sessionData?.session.refreshToken;

            if (!tokenToUse) {
                throw new Error('Aucun token de rafraîchissement disponible');
            }

            const response = await AuthAPI.refresh(tokenToUse);

            if (response.success && response.data) {
                const { user, session, client } = response.data;

                setAuthState((prev: AuthState) => ({
                    ...prev,
                    user,
                    session,
                    client,
                }));
            } else {
                throw new Error(response.message || 'Échec du rafraîchissement du token');
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            // If refresh fails, logout user
            await handleLogout();
            throw error;
        }
    }, []);

    const handleLogout = useCallback(async () => {
        try {
            // Call logout API which clears session on server and client
            await AuthAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
            // Even if logout API fails, clear local state
            clearAuthSession();
        } finally {
            // Always clear local state
            setAuthState({
                user: null,
                session: null,
                client: null,
                isLoading: false,
                isAuthenticated: false,
            });
            setError(null);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Auto-refresh token when needed
    useEffect(() => {
        if (!authState.isAuthenticated || !authState.session) return;

        const checkTokenRefresh = () => {
            if (isSessionExpired() && !isRefreshTokenExpired()) {
                handleRefreshToken();
            } else if (isRefreshTokenExpired()) {
                handleLogout();
            }
        };

        // Check every minute
        const interval = setInterval(checkTokenRefresh, 60 * 1000);
        return () => clearInterval(interval);
    }, [authState.isAuthenticated, authState.session, handleRefreshToken, handleLogout]);

    const contextValue: AuthContextType = {
        ...authState,
        error,
        login: handleLogin,
        logout: handleLogout,
        refreshToken: handleRefreshToken,
        clearError,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Hook for getting auth headers for API requests
export function useAuthHeaders() {
    const { session } = useAuth();

    return useCallback(() => {
        if (!session?.token) {
            return {};
        }

        return {
            'Authorization': `Bearer ${session.token}`,
        };
    }, [session]);
}

// Hook for using the authenticated axios instance
export function useAuthenticatedAPI() {
    return authFetch;
}