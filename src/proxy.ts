import { clerkMiddleware } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from '@/libs/I18nRouting';

const intlMiddleware = createMiddleware(routing);

export default clerkMiddleware((_auth, request: NextRequest) => {
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
