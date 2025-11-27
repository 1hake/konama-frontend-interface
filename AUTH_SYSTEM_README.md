# Authentication System

This document describes the authentication system implemented for the Image Generation Admin application.

## Overview

The authentication system provides secure user login, automatic token refresh, and route protection using JWT tokens from the external Konama authentication service.

## Architecture

### Components

1. **Types** (`/types/auth.ts`)
    - User interface
    - AuthTokens interface
    - AuthState interface
    - Request/Response interfaces

2. **Auth Utilities** (`/lib/auth.ts`)
    - AuthStorage class for token management
    - AuthAPI class for API communication
    - Configuration settings

3. **Auth Hook** (`/hooks/useAuth.ts`)
    - AuthProvider component for context
    - useAuth hook for consuming auth state
    - useAuthHeaders hook for API requests

4. **API Routes** (`/app/api/auth/`)
    - `login/route.ts` - Login endpoint proxy
    - `refresh/route.ts` - Token refresh endpoint proxy
    - `logout/route.ts` - Logout endpoint proxy

5. **UI Components** (`/components/`)
    - `ProtectedRoute.tsx` - Route protection wrapper
    - `UserProfile.tsx` - User profile and logout
    - `AuthenticatedLayout.tsx` - Layout with navigation
    - `Login page` (`/app/login/page.tsx`)

6. **Middleware** (`/middleware.ts`)
    - Server-side route protection

## API Endpoints

The system proxies requests to the external authentication service at `https://client.konama.fuzdi.fr/auth`:

### POST `/api/auth/login`

Login with email and password.

**Request:**

```typescript
{
    email: string;
    password: string;
}
```

**Response:**

```typescript
{
    user: User;
    tokens: AuthTokens;
}
```

### POST `/api/auth/refresh`

Refresh access token using refresh token.

**Request:**

```typescript
{
    refreshToken: string;
}
```

**Response:**

```typescript
{
    tokens: AuthTokens;
}
```

### POST `/api/auth/logout`

Logout and invalidate tokens.

**Request:**

```typescript
{
    refreshToken: string;
}
```

## Usage

### 1. Setup

The authentication is automatically configured in the root layout:

```tsx
// app/layout.tsx
import { AuthProvider } from '@/hooks/useAuth';

export default function RootLayout({ children }) {
    return (
        <html>
            <body>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
```

### 2. Protected Pages

Wrap pages that require authentication:

```tsx
// app/page.tsx
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export default function Page() {
    return <AuthenticatedLayout>{/* Your page content */}</AuthenticatedLayout>;
}
```

### 3. Using Auth State

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
    const { user, isAuthenticated, login, logout, error } = useAuth();

    if (!isAuthenticated) {
        return <div>Please log in</div>;
    }

    return <div>Welcome, {user.name}!</div>;
}
```

### 4. Making Authenticated API Calls

```tsx
import { useAuthHeaders } from '@/hooks/useAuth';

function MyComponent() {
    const getAuthHeaders = useAuthHeaders();

    const fetchData = async () => {
        const response = await fetch('/api/some-endpoint', {
            headers: getAuthHeaders(),
        });
        // Handle response
    };
}
```

### 5. Using the Authenticated API Client

```tsx
import { authFetch } from '@/lib/authFetch';

// GET request with auto-retry on token refresh
const data = await authFetch.get('/api/some-endpoint');

// POST request with auto-retry on token refresh
const result = await authFetch.post('/api/some-endpoint', { data });
```

## Features

### ✅ Implemented

- **User Authentication**: Login with email/password
- **JWT Token Management**: Automatic storage and refresh
- **Route Protection**: Client-side and server-side
- **Auto Token Refresh**: Seamless token renewal
- **Error Handling**: Proper error states and messages
- **Logout**: Secure logout with token invalidation
- **Persistent Sessions**: Tokens survive browser refresh
- **User Profile**: Display user info and logout option
- **Loading States**: Loading indicators during auth operations
- **CORS Support**: Proper cross-origin request handling

### 🔧 Configuration

Environment variables (optional - uses relative paths by default):

```bash
# If using external auth service directly
NEXT_PUBLIC_AUTH_API_URL=https://client.konama.fuzdi.fr/auth
```

### 🔄 Token Refresh Strategy

- Tokens are automatically refreshed 5 minutes before expiry
- Failed API calls trigger immediate refresh attempts
- Failed refresh redirects to login page
- Refresh happens transparently in the background

### 🛡️ Security Features

- Tokens stored in localStorage (can be upgraded to httpOnly cookies)
- Automatic token expiry handling
- CSRF protection through JWT
- Secure logout that invalidates server-side sessions
- No sensitive data in URLs or logs

### 📱 User Experience

- Seamless authentication flow
- Loading states for all auth operations
- Clear error messages
- Remember user sessions
- Graceful handling of network failures
- Mobile-responsive login page

## File Structure

```
├── app/
│   ├── api/auth/
│   │   ├── login/route.ts
│   │   ├── refresh/route.ts
│   │   └── logout/route.ts
│   ├── login/page.tsx
│   └── layout.tsx (with AuthProvider)
├── components/
│   ├── ProtectedRoute.tsx
│   ├── UserProfile.tsx
│   └── AuthenticatedLayout.tsx
├── hooks/
│   └── useAuth.ts
├── lib/
│   ├── auth.ts
│   └── authFetch.ts
├── types/
│   └── auth.ts
└── middleware.ts
```

## Development

To test the authentication system:

1. Start the development server
2. Navigate to any protected page
3. You'll be redirected to `/login`
4. Use valid credentials to login
5. You'll be redirected back to the protected content

## Production Deployment

The authentication system is ready for production with:

- Proper error handling
- Security best practices
- Scalable architecture
- Performance optimizations
