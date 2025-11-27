// Middleware for route protection

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for public routes and API routes
    if (
        pathname.startsWith('/api/') ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/static/') ||
        pathname === '/favicon.ico' ||
        pathname.startsWith('/images/')
    ) {
        return NextResponse.next();
    }

    // For client-side routing, we'll let the AuthProvider handle authentication
    // This middleware is mainly for API route protection if needed
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
