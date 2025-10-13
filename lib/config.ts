// Environment configuration
export const config = {
    // ComfyUI API configuration
    comfyApiUrl: process.env.NEXT_PUBLIC_COMFY_API_URL || '',

    // Check if using external API (not localhost)
    isExternalApi: process.env.NEXT_PUBLIC_COMFY_API_URL
        && !process.env.NEXT_PUBLIC_COMFY_API_URL.includes('localhost'),

    // Get the base URL for API calls
    getApiBaseUrl: () => {
        return process.env.NEXT_PUBLIC_COMFY_API_URL || window.location.origin;
    },

    // Get WebSocket URL
    getWebSocketUrl: () => {
        const apiUrl = process.env.NEXT_PUBLIC_COMFY_API_URL;
        const isExternal = apiUrl && !apiUrl.includes('localhost');

        if (isExternal) {
            return apiUrl.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws';
        } else {
            return `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
        }
    }
} as const;