import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { refreshTokens } from './lib/api/auth';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  SESSION_COOKIE_OPTIONS,
} from './lib/session';

/**
 * Fixes the session-persistence bug: a 15-minute access token expiring
 * silently signed admins/fleet owners out even though their 30-day refresh
 * token was still good, because nothing ever called refreshTokens(). Server
 * Components (app/layout.tsx, where getCurrentUser() runs) cannot set
 * cookies, so the refresh has to happen here — middleware runs before the
 * request and can write cookies onto the response.
 *
 * This never blocks or redirects: a logged-out (or refresh-failed) visitor
 * must still be able to reach public pages, so every path below ends in
 * NextResponse.next().
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (accessToken) {
    // Still valid (or at least present) — nothing to do.
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    // Genuinely signed out — let the request through untouched.
    return NextResponse.next();
  }

  const response = NextResponse.next();

  try {
    const tokens = await refreshTokens(refreshToken);
    response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
    // POST /auth/token/refresh returns only { access_token } — verified
    // live against the running backend. It does NOT return a
    // refresh_token (the refresh token is not rotated, so the same one
    // stays valid) and does NOT return a user. Do not add a second
    // response.cookies.set() for REFRESH_TOKEN_COOKIE here: the request's
    // existing refresh-token cookie is still correct and already carries
    // its 30-day max-age from sign-in, so touching it on a successful
    // refresh only risks overwriting a valid token with undefined.
  } catch {
    // The refresh token is expired, revoked, or the backend is unreachable.
    // Clear both cookies so the user lands in a clean signed-out state
    // instead of stuck with a dead refresh token forever retried.
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
  }

  return response;
}

export const config = {
  // Runs on every app route; skips static assets, image optimization
  // output, and the favicon so the refresh check isn't wasted on them.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
