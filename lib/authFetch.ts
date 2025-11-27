// Authenticated API client utility - now using axios with interceptors

import { apiClient } from './auth';

// Export the configured axios instance with interceptors
export const authFetch = apiClient;

// Helper functions for common HTTP methods
export const AuthenticatedAPI = {
    get: (url: string) => apiClient.get(url).then(response => response.data),
    post: (url: string, data?: Record<string, unknown>) =>
        apiClient.post(url, data).then(response => response.data),
    put: (url: string, data?: Record<string, unknown>) =>
        apiClient.put(url, data).then(response => response.data),
    delete: (url: string) =>
        apiClient.delete(url).then(response => response.data),
};
