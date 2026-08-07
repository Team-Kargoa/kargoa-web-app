import { cookies } from 'next/headers';
import { createSession, getAccessToken, destroySession } from './session';

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

it('clears both cookies on destroy', async () => {
  await destroySession();
  expect(store.delete).toHaveBeenCalledWith('access_token');
  expect(store.delete).toHaveBeenCalledWith('refresh_token');
});
