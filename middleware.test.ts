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

  it('refreshes and sets only the access-token cookie, with the exact session flags, when the access token is absent but the refresh token succeeds', async () => {
    // The real POST /auth/token/refresh response carries only an
    // access_token — no refresh_token, no user. Mocking anything richer
    // than that is exactly how the undefined-refresh-cookie bug shipped.
    mockedRefreshTokens.mockResolvedValue({ access_token: 'new-access' });
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

    // The regression: the refresh endpoint doesn't rotate the refresh
    // token, so a successful refresh must leave the refresh-token cookie
    // completely untouched — not set, and certainly not set to undefined.
    // `.has()` (not `.get()?.value`) is the correct check here: a buggy
    // `response.cookies.set(REFRESH_TOKEN_COOKIE, undefined, ...)` call
    // still populates the cookie jar with a value of undefined, which
    // `.get()?.value` would not distinguish from "never set".
    expect(response.cookies.has(REFRESH_TOKEN_COOKIE)).toBe(false);
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

    // `.has()`, not `.get()?.value ?? ''`: if the two `response.cookies
    // .delete(...)` calls in middleware.ts were removed entirely, the
    // cookie jar would never have been touched, `response.cookies.get(...)`
    // would return undefined, and `undefined?.value ?? ''` would still
    // equal '' — the assertion would pass for the wrong reason and this
    // test could never fail. `.has()` only becomes true once the response
    // actually carries a Set-Cookie for that name.
    expect(response.cookies.has(ACCESS_TOKEN_COOKIE)).toBe(true);
    expect(response.cookies.has(REFRESH_TOKEN_COOKIE)).toBe(true);

    // A cleared cookie is set with an empty value and an expiry in the
    // past (delete() sets expires: new Date(0)) so the browser deletes it.
    expect(response.cookies.get(ACCESS_TOKEN_COOKIE)).toMatchObject({
      value: '',
      expires: new Date(0),
    });
    expect(response.cookies.get(REFRESH_TOKEN_COOKIE)).toMatchObject({
      value: '',
      expires: new Date(0),
    });
  });
});
