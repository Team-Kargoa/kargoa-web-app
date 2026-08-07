import { cookies } from 'next/headers';
import {
  createSession,
  getAccessToken,
  getRefreshToken,
  destroySession,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
  SESSION_COOKIE_OPTIONS,
} from './session';

jest.mock('next/headers');
const store = { set: jest.fn(), get: jest.fn(), delete: jest.fn() };
(cookies as jest.Mock).mockResolvedValue(store);

beforeEach(() => jest.clearAllMocks());

it('stores both tokens as httpOnly cookies', async () => {
  await createSession({
    access_token: 'a',
    refresh_token: 'r',
    user: {} as never,
  });

  expect(store.set).toHaveBeenCalledWith(
    'access_token',
    'a',
    expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
  );
  expect(store.set).toHaveBeenCalledWith(
    'refresh_token',
    'r',
    expect.objectContaining({ httpOnly: true }),
  );
});

it('reads the access token back', async () => {
  store.get.mockReturnValue({ value: 'a' });
  await expect(getAccessToken()).resolves.toBe('a');
});

it('returns undefined when no cookie is set', async () => {
  store.get.mockReturnValue(undefined);
  await expect(getAccessToken()).resolves.toBeUndefined();
});

it('reads the refresh token back', async () => {
  store.get.mockReturnValue({ value: 'r' });
  await expect(getRefreshToken()).resolves.toBe('r');
  expect(store.get).toHaveBeenCalledWith('refresh_token');
});

it('returns undefined for the refresh token when no cookie is set', async () => {
  store.get.mockReturnValue(undefined);
  await expect(getRefreshToken()).resolves.toBeUndefined();
});

it('clears both cookies on destroy', async () => {
  await destroySession();
  expect(store.delete).toHaveBeenCalledWith('access_token');
  expect(store.delete).toHaveBeenCalledWith('refresh_token');
});

// middleware.ts must refresh an expired access token without drifting from
// the flags/max-ages createSession already uses, so these are exported here
// as the single shared definition rather than duplicated in middleware.ts.
describe('exported cookie configuration (shared with middleware.ts)', () => {
  it('names the cookies access_token and refresh_token', () => {
    expect(ACCESS_TOKEN_COOKIE).toBe('access_token');
    expect(REFRESH_TOKEN_COOKIE).toBe('refresh_token');
  });

  it('sets the access token max age to 15 minutes and the refresh token to 30 days', () => {
    expect(ACCESS_TOKEN_MAX_AGE).toBe(60 * 15);
    expect(REFRESH_TOKEN_MAX_AGE).toBe(60 * 60 * 24 * 30);
  });

  it('exposes the same httpOnly/sameSite/path/secure flags createSession applies', () => {
    expect(SESSION_COOKIE_OPTIONS).toEqual({
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  });
});
