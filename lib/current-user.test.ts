import { getCurrentUser } from './current-user';
import { getAccessToken } from './session';
import { getProfile } from './api/auth';
import { ApiError } from './api/client';
import type { UserSummary } from './api/types';

jest.mock('./session', () => ({ getAccessToken: jest.fn() }));
jest.mock('./api/auth', () => ({ getProfile: jest.fn() }));

const mockedGetAccessToken = getAccessToken as jest.Mock;
const mockedGetProfile = getProfile as jest.Mock;

function makeUser(overrides: Partial<UserSummary> = {}): UserSummary {
  return {
    id: 'user-1',
    phone_number: '+237674628817',
    role: 'fleet_owner',
    full_name: 'Admin User',
    profile_photo: null,
    is_active: true,
    date_joined: '2026-08-06T23:18:00.134979Z',
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getCurrentUser', () => {
  it('returns null and never calls the API when there is no access token', async () => {
    mockedGetAccessToken.mockResolvedValue(undefined);

    await expect(getCurrentUser()).resolves.toBeNull();
    expect(mockedGetProfile).not.toHaveBeenCalled();
  });

  it('returns the profile for a signed-in fleet owner', async () => {
    mockedGetAccessToken.mockResolvedValue('a-token');
    const user = makeUser({ role: 'fleet_owner' });
    mockedGetProfile.mockResolvedValue(user);

    await expect(getCurrentUser()).resolves.toEqual(user);
    expect(mockedGetProfile).toHaveBeenCalledWith('a-token');
  });

  it('returns the profile for a signed-in admin', async () => {
    mockedGetAccessToken.mockResolvedValue('a-token');
    const user = makeUser({ role: 'admin' });
    mockedGetProfile.mockResolvedValue(user);

    await expect(getCurrentUser()).resolves.toEqual(user);
  });

  it('treats a customer account as signed out — no dashboard for that role', async () => {
    mockedGetAccessToken.mockResolvedValue('a-token');
    mockedGetProfile.mockResolvedValue(makeUser({ role: 'customer' }));

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it('treats a driver account as signed out — no dashboard for that role', async () => {
    mockedGetAccessToken.mockResolvedValue('a-token');
    mockedGetProfile.mockResolvedValue(makeUser({ role: 'driver' }));

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it('treats an expired or invalid token as signed out instead of throwing', async () => {
    mockedGetAccessToken.mockResolvedValue('a-stale-token');
    mockedGetProfile.mockRejectedValue(
      new ApiError('Token is invalid or expired.', 401),
    );

    await expect(getCurrentUser()).resolves.toBeNull();
  });
});
