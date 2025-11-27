// Authentication types

export interface User {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    clientId: string;
    lastLoginAt: string;
}

export interface Session {
    id: string;
    token: string;
    refreshToken: string;
    expiresAt: string;
    refreshExpiresAt: string;
    createdAt: string;
}

export interface Client {
    id: string;
    name: string;
    slug: string;
}

export interface AuthState {
    user: User | null;
    session: Session | null;
    client: Client | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponseData {
    session: Session;
    user: User;
    client: Client;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: AuthResponseData;
}

export interface RefreshRequest {
    refreshToken: string;
}

export interface RefreshResponse {
    success: boolean;
    message: string;
    data: AuthResponseData;
}

export interface LogoutResponse {
    success: boolean;
    message: string;
}

export interface AuthError {
    code: string;
    message: string;
    details?: string;
}
