/**
 * @jest-environment node
 *
 * middleware.ts is the fix for the session-persistence bug: once the
 * 15-minute access token expires, only the refresh token (valid 30 days)
 * is left, and nothing in the app ever called refreshTokens() with it.
 * Server Components (app/layout.tsx) cannot set cookies, so the refresh
 * has to happen here, in middleware, which runs before the request and
 * can write cookies onto the response.
 */
import { NextRequest } from 'next/server';
import { middleware } from './middleware';
import { refreshTokens } from './lib/api/auth';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from './lib/session';

jest.mock('./lib/api/auth');

const mockedRefreshTokens = refreshTokens as jest.MockedFunction<
  typeof refreshTokens
>;

beforeEach(() => jest.clearAllMocks());

function makeRequest(cookies: Record<string, string>): NextRequest {
  const request = new NextRequest(new URL('http://localhost:3000/admin'));
  for (const [name, value] of Object.entries(cookies)) {
    request.cookies.set(name, value);
  }
  return request;
}

describe('middleware', () => {
  it('lets the request through untouched and never calls the refresh API when an access token is present', async () => {
    const request = makeRequest({ [ACCESS_TOKEN_COOKIE]: 'valid-access' });

    const response = await middleware(request);

    expect(mockedRefreshTokens).not.toHaveBeenCalled();
    // A pass-through NextResponse.next() carries the "proceed" signal and
    // sets no Set-Cookie header — the browser already holds a good access
    // token, so there is nothing to (re)write onto the response.
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.cookies.get(ACCESS_TOKEN_COOKIE)).toBeUndefined();
    expect(response.cookies.get(REFRESH_TOKEN_COOKIE)).toBeUndefined();
  });

  it('lets a fully signed-out request through untouched and never calls the refresh API when neither cookie is present', async () => {
    const request = makeRequest({});

    const response = await middleware(request);

    expect(mockedRefreshTokens).not.toHaveBeenCalled();
    expect(response.cookies.get(ACCESS_TOKEN_COOKIE)).toBeUndefined();
    expect(response.cookies.get(REFRESH_TOKEN_COOKIE)).toBeUndefined();
  });

  it('refreshes and sets both cookies fresh, with the exact session flags, when the access token is absent but the refresh token succeeds', async () => {
    mockedRefreshTokens.mockResolvedValue({
      access_token: 'new-access',
      refresh_token: 'new-refresh',
      user: {} as never,
    });
    const request = makeRequest({ [REFRESH_TOKEN_COOKIE]: 'old-refresh' });

    const response = await middleware(request);

    expect(mockedRefreshTokens).toHaveBeenCalledWith('old-refresh');

    const accessCookie = response.cookies.get(ACCESS_TOKEN_COOKIE);
    expect(accessCookie?.value).toBe('new-access');
    expect(accessCookie).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    const refreshCookie = response.cookies.get(REFRESH_TOKEN_COOKIE);
    expect(refreshCookie?.value).toBe('new-refresh');
    expect(refreshCookie).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  });

  it('clears both cookies but still lets the request proceed when the refresh call fails', async () => {
    mockedRefreshTokens.mockRejectedValue(new Error('refresh token expired'));
    const request = makeRequest({ [REFRESH_TOKEN_COOKIE]: 'dead-refresh' });

    const response = await middleware(request);

    expect(mockedRefreshTokens).toHaveBeenCalledWith('dead-refresh');
    expect(response).toBeDefined();
    // NextResponse.next() always proceeds — never a redirect/block — so a
    // logged-out visitor with a dead refresh token can still reach public
    // pages instead of getting stuck.
    expect(response.headers.get('x-middleware-next')).toBe('1');

    const accessCookie = response.cookies.get(ACCESS_TOKEN_COOKIE);
    const refreshCookie = response.cookies.get(REFRESH_TOKEN_COOKIE);
    // A cleared cookie is set with an empty value and a max-age of 0 (or
    // an equivalent past expiry) so the browser deletes it.
    expect(accessCookie?.value ?? '').toBe('');
    expect(refreshCookie?.value ?? '').toBe('');
  });
});
